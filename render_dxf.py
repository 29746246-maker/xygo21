import matplotlib.pyplot as plt
import numpy as np
from dxf_parser import DXFParser

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['DejaVu Sans']  # 支持基本拉丁字符
plt.rcParams['axes.unicode_minus'] = False

class DXRRenderer:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(20, 20))
        self.ax.set_aspect('equal')
        self.ax.grid(True, linestyle='--', alpha=0.5)
        self.ax.set_title('DXF File Rendering')
        # 缩放因子，用于处理大坐标值
        self.scale_factor = 5000
        # 坐标偏移，用于将图形居中
        self.x_offset = 0
        self.y_offset = 0
    
    def render_line(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props:
            x1 = (float(props['10']) - self.x_offset) / self.scale_factor
            y1 = (float(props['20']) - self.y_offset) / self.scale_factor
            x2 = (float(props['11']) - self.x_offset) / self.scale_factor
            y2 = (float(props['21']) - self.y_offset) / self.scale_factor
            # 只渲染合理长度的线段
            length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            if 0.1 < length < 50:
                self.ax.plot([x1, x2], [y1, y2], 'b-', linewidth=0.3)
    
    def render_circle(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            # 只渲染合理大小的圆
            if 0.1 < r < 10:  # 避免渲染过大或过小的圆
                circle = plt.Circle((x, y), r, fill=False, edgecolor='b', linewidth=0.3)
                self.ax.add_patch(circle)
    
    def render_arc(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props and '50' in props and '51' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            # 只渲染合理大小的圆弧
            if 0.1 < r < 10:
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
                
                self.ax.plot(x_arc, y_arc, 'b-', linewidth=0.3)
    
    def render_ellipse(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            # 计算椭圆的长轴向量
            major_x = float(props['11']) / self.scale_factor
            major_y = float(props['21']) / self.scale_factor
            major_length = np.sqrt(major_x**2 + major_y**2)
            # 只渲染合理大小的椭圆
            if 0.1 < major_length < 10:
                # 椭圆的偏心率
                ratio = float(props['40'])
                minor_length = major_length * ratio
                
                # 计算椭圆的角度
                angle = np.arctan2(major_y, major_x)
                
                # 生成椭圆点
                theta = np.linspace(0, 2*np.pi, 100)
                x_ellipse = x + major_length * np.cos(theta) * np.cos(angle) - minor_length * np.sin(theta) * np.sin(angle)
                y_ellipse = y + major_length * np.cos(theta) * np.sin(angle) + minor_length * np.sin(theta) * np.cos(angle)
                
                self.ax.plot(x_ellipse, y_ellipse, 'b-', linewidth=0.3)
    
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
            # 只显示非中文字符，避免乱码
            text_content = ''.join([c for c in text_content if ord(c) < 128])
            if text_content.strip():
                self.ax.text(x, y, text_content, fontsize=4, color='r')
    
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
    
    def render(self, entities):
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
        
        # 渲染所有实体
        for entity in entities:
            self.render_entity(entity)
        
        # 自动调整坐标轴范围
        self.ax.relim()
        self.ax.autoscale_view()
        
        # 保存为图片和矢量图
        plt.savefig('dxf_render.png', dpi=300, bbox_inches='tight')
        plt.savefig('dxf_render.svg', format='svg', bbox_inches='tight')
        plt.close()
        print("图形已渲染并保存为 dxf_render.png 和 dxf_render.svg")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dxf'
    
    # 解析 DXF 文件
    parser = DXFParser()
    parser.parse(file_path)
    entities = parser.get_entities()
    
    # 渲染图形
    renderer = DXRRenderer()
    renderer.render(entities)
