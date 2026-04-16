import matplotlib.pyplot as plt
from dwg_parser import DWGParser

class DWGRenderer:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(10, 8))
        self.ax.set_aspect('equal')
        self.ax.grid(True, linestyle='--', alpha=0.7)
        self.ax.set_title('DWG Rendering')
    
    def render_line(self, entity):
        """渲染直线"""
        props = entity['properties']
        x1 = float(props['10'])
        y1 = float(props['20'])
        x2 = float(props['11'])
        y2 = float(props['21'])
        self.ax.plot([x1, x2], [y1, y2], 'k-', linewidth=0.8)
    
    def render_circle(self, entity):
        """渲染圆"""
        props = entity['properties']
        x = float(props['10'])
        y = float(props['20'])
        radius = float(props['40'])
        circle = plt.Circle((x, y), radius, edgecolor='k', facecolor='none', linewidth=0.8)
        self.ax.add_patch(circle)
    
    def render_arc(self, entity):
        """渲染圆弧"""
        props = entity['properties']
        x = float(props['10'])
        y = float(props['20'])
        radius = float(props['40'])
        start_angle = float(props['50'])
        end_angle = float(props['51'])
        # 计算圆弧的角度范围
        import numpy as np
        theta = np.linspace(np.radians(start_angle), np.radians(end_angle), 100)
        arc_x = x + radius * np.cos(theta)
        arc_y = y + radius * np.sin(theta)
        self.ax.plot(arc_x, arc_y, 'k-', linewidth=0.8)
    
    def render_text(self, entity):
        """渲染文本"""
        props = entity['properties']
        x = float(props['10'])
        y = float(props['20'])
        text = props.get('1', '')
        height = float(props.get('40', 1.0))
        rotation = float(props.get('50', 0.0))
        self.ax.text(x, y, text, fontsize=6, rotation=rotation, ha='left', va='bottom')
    
    def render_lwpolyline(self, entity):
        """渲染多段线"""
        props = entity['properties']
        x_coords = [float(x) for x in props['10']]
        y_coords = [float(y) for y in props['20']]
        self.ax.plot(x_coords, y_coords, 'k-', linewidth=0.8)
    
    def render_spline(self, entity):
        """渲染样条曲线"""
        props = entity['properties']
        x_coords = [float(x) for x in props['10']]
        y_coords = [float(y) for y in props['20']]
        self.ax.plot(x_coords, y_coords, 'k-', linewidth=0.8)
    
    def render(self, entities):
        """渲染所有实体"""
        # 按Z轴坐标排序以实现深度遮挡
        entities.sort(key=lambda e: float(e['properties'].get('30', '0')), reverse=True)
        
        for entity in entities:
            entity_type = entity['type']
            if entity_type == 'LINE':
                self.render_line(entity)
            elif entity_type == 'CIRCLE':
                self.render_circle(entity)
            elif entity_type == 'ARC':
                self.render_arc(entity)
            elif entity_type == 'TEXT' or entity_type == 'MTEXT':
                self.render_text(entity)
            elif entity_type == 'LWPOLYLINE':
                self.render_lwpolyline(entity)
            elif entity_type == 'SPLINE':
                self.render_spline(entity)
    
    def adjust_view(self):
        """调整视图以显示所有实体"""
        if not self.ax.lines and not self.ax.patches:
            return
        
        x_data = []
        y_data = []
        
        # 收集所有线条的坐标
        for line in self.ax.lines:
            x, y = line.get_data()
            x_data.extend(x)
            y_data.extend(y)
        
        # 收集所有补丁的坐标
        for patch in self.ax.patches:
            if isinstance(patch, plt.Circle):
                x, y = patch.center
                r = patch.radius
                x_data.extend([x-r, x+r])
                y_data.extend([y-r, y+r])
        
        if x_data and y_data:
            x_min, x_max = min(x_data), max(x_data)
            y_min, y_max = min(y_data), max(y_data)
            padding = (max(x_max - x_min, y_max - y_min) * 0.1)
            self.ax.set_xlim(x_min - padding, x_max + padding)
            self.ax.set_ylim(y_min - padding, y_max + padding)
    
    def save(self, output_path):
        """保存渲染结果"""
        self.adjust_view()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close(self.fig)
    
    def show(self):
        """显示渲染结果"""
        self.adjust_view()
        plt.show()
        plt.close(self.fig)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dwg'
    
    # 解析DWG文件
    parser = DWGParser()
    parser.parse(file_path)
    entities = parser.get_entities()
    
    # 渲染DWG文件
    renderer = DWGRenderer()
    renderer.render(entities)
    
    # 保存渲染结果
    output_path = 'dwg_render.png'
    renderer.save(output_path)
    print(f"Rendered DWG file saved to {output_path}")
