import matplotlib.pyplot as plt
import numpy as np
from dxf_parser import DXFParser
import argparse

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['DejaVu Sans']  # 支持基本拉丁字符
plt.rcParams['axes.unicode_minus'] = False

class DXRRenderer:
    def __init__(self, params):
        self.fig, self.ax = plt.subplots(figsize=(params['figsize'], params['figsize']))
        self.ax.set_aspect('equal')
        self.ax.grid(params['grid'], linestyle='--', alpha=0.5)
        self.ax.set_title('DXF File Rendering')
        # 缩放因子，用于处理大坐标值
        self.scale_factor = params['scale_factor']
        # 坐标偏移，用于将图形居中
        self.x_offset = 0
        self.y_offset = 0
        # 渲染参数
        self.linewidth = params['linewidth']
        self.fontsize = params['fontsize']
        self.ellipse_y_flip = params['ellipse_y_flip']
        self.ellipse_angle_reverse = params['ellipse_angle_reverse']
        self.color = params['color']
    
    def render_line(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props:
            x1 = (float(props['10']) - self.x_offset) / self.scale_factor
            y1 = (float(props['20']) - self.y_offset) / self.scale_factor
            x2 = (float(props['11']) - self.x_offset) / self.scale_factor
            y2 = (float(props['21']) - self.y_offset) / self.scale_factor
            # 只渲染合理长度的线段
            length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            if 0.01 < length < 200:
                self.ax.plot([x1, x2], [y1, y2], color=self.color, linewidth=self.linewidth)
    
    def render_circle(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            # 只渲染合理大小的圆
            if 0.01 < r < 50:  # 避免渲染过大或过小的圆
                circle = plt.Circle((x, y), r, fill=False, edgecolor=self.color, linewidth=self.linewidth)
                self.ax.add_patch(circle)
    
    def render_arc(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props and '50' in props and '51' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            # 只渲染合理大小的圆弧
            if 0.01 < r < 50:
                start_angle = float(props['50'])
                end_angle = float(props['51'])
                
                # 转换角度为弧度，注意DXF中角度是逆时针从X轴开始，matplotlib也是如此
                start_rad = np.deg2rad(start_angle)
                end_rad = np.deg2rad(end_angle)
                
                # 确保角度范围正确
                if end_rad < start_rad:
                    end_rad += 2 * np.pi
                
                # 计算圆弧点
                theta = np.linspace(start_rad, end_rad, 100)
                x_arc = x + r * np.cos(theta)
                y_arc = y + r * np.sin(theta)
                
                self.ax.plot(x_arc, y_arc, color=self.color, linewidth=self.linewidth)
    
    def render_ellipse(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            # 计算椭圆的长轴向量
            major_x = float(props['11']) / self.scale_factor
            major_y = float(props['21']) / self.scale_factor
            
            # Y轴翻转
            if self.ellipse_y_flip:
                major_y = -major_y
            
            major_length = np.sqrt(major_x**2 + major_y**2)
            # 只渲染合理大小的椭圆
            if 0.01 < major_length < 50:
                # 椭圆的偏心率
                ratio = float(props['40'])
                minor_length = major_length * ratio
                
                # 计算椭圆的角度
                angle = np.arctan2(major_y, major_x)
                
                # 角度反向
                if self.ellipse_angle_reverse:
                    angle += np.pi
                
                # 生成椭圆点
                theta = np.linspace(0, 2*np.pi, 100)
                x_ellipse = x + major_length * np.cos(theta) * np.cos(angle) - minor_length * np.sin(theta) * np.sin(angle)
                y_ellipse = y + major_length * np.cos(theta) * np.sin(angle) + minor_length * np.sin(theta) * np.cos(angle)
                
                self.ax.plot(x_ellipse, y_ellipse, color=self.color, linewidth=self.linewidth)
    
    def render_lwpolyline(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props:
            # 简单绘制第一个点
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            self.ax.plot(x, y, 'b.', markersize=1)
    
    def render_mtext(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '1' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            text = props['1']
            # 提取文本内容，去除格式信息
            import re
            text_content = re.sub(r'\\{[^}]+\\}', '', text)
            # 清理文本，去除多余的格式字符
            text_content = re.sub(r'[\\r\\n\\t]+', ' ', text_content)
            text_content = text_content.strip()
            if text_content:
                # 尝试显示文本
                self.ax.text(x, y, text_content, fontsize=self.fontsize, color='r', ha='center', va='center')
    
    def render_entity(self, entity):
        entity_type = entity['type']
        if entity_type == 'LINE':
            self.render_line(entity)
        elif entity_type == 'CIRCLE':
            self.render_circle(entity)
        elif entity_type == 'ARC':
            self.render_arc(entity)
        elif entity_type == 'ELLIPSE':
            self.render_ellipse(entity)
        elif entity_type == 'LWPOLYLINE':
            self.render_lwpolyline(entity)
        elif entity_type == 'MTEXT':
            self.render_mtext(entity)
    
    def render(self, entities, output_file):
        # 计算所有实体的坐标范围
        all_x = []
        all_y = []
        
        for entity in entities:
            props = entity['properties']
            if '10' in props and '20' in props:
                all_x.append(float(props['10']))
                all_y.append(float(props['20']))
            if '11' in props and '21' in props:
                all_x.append(float(props['11']))
                all_y.append(float(props['21']))
        
        # 计算坐标偏移，使图形居中
        if all_x and all_y:
            self.x_offset = (min(all_x) + max(all_x)) / 2
            self.y_offset = (min(all_y) + max(all_y)) / 2
        
        # 按Z轴坐标排序实体，实现深度遮蔽
        def get_entity_z(entity):
            props = entity['properties']
            # 尝试获取Z轴坐标，默认值为0
            if '30' in props:
                return float(props['30'])
            elif '31' in props:
                return float(props['31'])
            else:
                return 0
        
        # 按Z值从大到小排序（先渲染远处的，再渲染近处的）
        sorted_entities = sorted(entities, key=get_entity_z, reverse=True)
        
        # 渲染所有实体
        for entity in sorted_entities:
            self.render_entity(entity)
        
        # 自动调整坐标轴范围
        self.ax.relim()
        self.ax.autoscale_view()
        
        # 保存为图片
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        return f"图形已渲染并保存为 {output_file}"

def main():
    parser = argparse.ArgumentParser(description='DXF渲染参数调整工具')
    
    # 基本参数
    parser.add_argument('dxf_file', help='DXF文件路径')
    parser.add_argument('--output', '-o', default='dxf_render_adjusted.png', help='输出文件路径')
    
    # 渲染参数
    parser.add_argument('--scale-factor', '-s', type=float, default=5000, help='缩放因子')
    parser.add_argument('--linewidth', '-lw', type=float, default=0.2, help='线条宽度')
    parser.add_argument('--fontsize', '-fs', type=float, default=3, help='字体大小')
    parser.add_argument('--figsize', '-f', type=float, default=20, help='图形大小')
    parser.add_argument('--grid', '-g', action='store_true', default=True, help='显示网格')
    parser.add_argument('--no-grid', dest='grid', action='store_false', help='不显示网格')
    
    # 椭圆参数
    parser.add_argument('--ellipse-y-flip', '-eyf', action='store_true', default=True, help='椭圆Y轴翻转')
    parser.add_argument('--no-ellipse-y-flip', dest='ellipse_y_flip', action='store_false', help='不翻转椭圆Y轴')
    parser.add_argument('--ellipse-angle-reverse', '-ear', action='store_true', default=False, help='椭圆角度反向')
    parser.add_argument('--no-ellipse-angle-reverse', dest='ellipse_angle_reverse', action='store_false', help='不反向椭圆角度')
    
    # 颜色参数
    parser.add_argument('--color', '-c', default='b', choices=['b', 'r', 'g', 'k', 'm', 'y'], help='线条颜色')
    
    args = parser.parse_args()
    
    # 构建参数字典
    params = {
        'scale_factor': args.scale_factor,
        'linewidth': args.linewidth,
        'fontsize': args.fontsize,
        'figsize': args.figsize,
        'grid': args.grid,
        'ellipse_y_flip': args.ellipse_y_flip,
        'ellipse_angle_reverse': args.ellipse_angle_reverse,
        'color': args.color
    }
    
    print("当前渲染参数:")
    for key, value in params.items():
        print(f"  {key}: {value}")
    
    try:
        # 解析 DXF 文件
        print(f"\n正在加载DXF文件: {args.dxf_file}")
        dxf_parser = DXFParser()
        dxf_parser.parse(args.dxf_file)
        entities = dxf_parser.get_entities()
        print(f"成功加载 {len(entities)} 个实体")
        
        # 渲染图形
        print("\n正在渲染图形...")
        renderer = DXRRenderer(params)
        result = renderer.render(entities, args.output)
        print(result)
        
    except Exception as e:
        print(f"错误: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())