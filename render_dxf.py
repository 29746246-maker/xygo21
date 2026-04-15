import matplotlib.pyplot as plt
import numpy as np
from dxf_parser import DXFParser

class DXRRenderer:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(10, 10))
        self.ax.set_aspect('equal')
        self.ax.grid(True, linestyle='--', alpha=0.7)
        self.ax.set_title('DXF File Rendering')
    
    def render_line(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props:
            x1 = float(props['10'])
            y1 = float(props['20'])
            x2 = float(props['11'])
            y2 = float(props['21'])
            self.ax.plot([x1, x2], [y1, y2], 'b-', linewidth=0.5)
    
    def render_circle(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props:
            x = float(props['10'])
            y = float(props['20'])
            r = float(props['40'])
            circle = plt.Circle((x, y), r, fill=False, edgecolor='b', linewidth=0.5)
            self.ax.add_patch(circle)
    
    def render_arc(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props and '50' in props and '51' in props:
            x = float(props['10'])
            y = float(props['20'])
            r = float(props['40'])
            start_angle = float(props['50'])
            end_angle = float(props['51'])
            
            # 转换角度为弧度
            start_rad = np.deg2rad(start_angle)
            end_rad = np.deg2rad(end_angle)
            
            # 计算圆弧点
            theta = np.linspace(start_rad, end_rad, 100)
            x_arc = x + r * np.cos(theta)
            y_arc = y + r * np.sin(theta)
            
            self.ax.plot(x_arc, y_arc, 'b-', linewidth=0.5)
    
    def render_ellipse(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props and '40' in props:
            x = float(props['10'])
            y = float(props['20'])
            # 计算椭圆的长轴向量
            major_x = float(props['11'])
            major_y = float(props['21'])
            major_length = np.sqrt(major_x**2 + major_y**2)
            # 椭圆的偏心率
            ratio = float(props['40'])
            minor_length = major_length * ratio
            
            # 计算椭圆的角度
            angle = np.arctan2(major_y, major_x)
            
            # 生成椭圆点
            theta = np.linspace(0, 2*np.pi, 100)
            x_ellipse = x + major_length * np.cos(theta) * np.cos(angle) - minor_length * np.sin(theta) * np.sin(angle)
            y_ellipse = y + major_length * np.cos(theta) * np.sin(angle) + minor_length * np.sin(theta) * np.cos(angle)
            
            self.ax.plot(x_ellipse, y_ellipse, 'b-', linewidth=0.5)
    
    def render_lwpolyline(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props:
            # 简单绘制第一个点
            x = float(props['10'])
            y = float(props['20'])
            self.ax.plot(x, y, 'b.', markersize=2)
    
    def render_mtext(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '1' in props:
            x = float(props['10'])
            y = float(props['20'])
            text = props['1']
            # 提取文本内容，去除格式信息
            import re
            text_content = re.sub(r'\\{[^}]+\\}', '', text)
            self.ax.text(x, y, text_content, fontsize=8, color='r')
    
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
