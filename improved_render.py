import matplotlib.pyplot as plt
import numpy as np
from dxf_parser import DXFParser
import re
from matplotlib.font_manager import FontProperties

# 设置中文支持
plt.rcParams['font.sans-serif'] = ['WenQuanYi Micro Hei', 'WenQuanYi Zen Hei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 创建字体属性对象，直接指定字体文件路径
chinese_font = FontProperties(fname='/usr/share/fonts/truetype/wqy/wqy-microhei.ttc')

class ImprovedDXRRenderer:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(24, 18))  # 调整画布大小以更接近原始图片
        self.ax.set_aspect('equal')
        # 添加网格背景，更接近原始图片的效果
        self.ax.grid(True, linestyle='-', alpha=0.3, color='gray')
        self.ax.set_facecolor('#f0f0f0')  # 设置背景色
        self.ax.set_title('DXF File Rendering')
        self.scale_factor = 4000  # 调整缩放因子
        self.x_offset = 0
        self.y_offset = 0
    
    def get_entity_color(self, entity):
        props = entity['properties']
        color_code = props.get('62')
        if color_code:
            color_code = int(color_code)
            # AutoCAD颜色映射
            color_map = {
                1: 'red',
                2: 'yellow',
                3: 'green',
                4: 'cyan',
                5: 'blue',
                6: 'magenta',
                7: 'black',
                8: 'darkgray',
                9: 'lightgray',
                256: 'blue',  # ByLayer default
            }
            return color_map.get(color_code, 'blue')
        return 'blue'
    
    def render_line(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props:
            x1 = (float(props['10']) - self.x_offset) / self.scale_factor
            y1 = (float(props['20']) - self.y_offset) / self.scale_factor
            x2 = (float(props['11']) - self.x_offset) / self.scale_factor
            y2 = (float(props['21']) - self.y_offset) / self.scale_factor
            
            length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            if 0.01 < length < 200:
                color = self.get_entity_color(entity)
                # 增加线条宽度以更接近原始图片
                self.ax.plot([x1, x2], [y1, y2], color=color, linewidth=0.5)
    
    def render_circle(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            
            if 0.01 < r < 50:
                color = self.get_entity_color(entity)
                circle = plt.Circle((x, y), r, fill=False, edgecolor=color, linewidth=0.5)
                self.ax.add_patch(circle)
    
    def render_arc(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '40' in props and '50' in props and '51' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            r = float(props['40']) / self.scale_factor
            
            if 0.01 < r < 50:
                start_angle = float(props['50'])
                end_angle = float(props['51'])
                
                start_rad = np.deg2rad(start_angle)
                end_rad = np.deg2rad(end_angle)
                
                if end_rad < start_rad:
                    end_rad += 2 * np.pi
                
                theta = np.linspace(start_rad, end_rad, 100)
                x_arc = x + r * np.cos(theta)
                y_arc = y + r * np.sin(theta)
                
                color = self.get_entity_color(entity)
                self.ax.plot(x_arc, y_arc, color=color, linewidth=0.5)
    
    def render_ellipse(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '11' in props and '21' in props and '40' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            
            major_x = float(props['11']) / self.scale_factor
            major_y = float(props['21']) / self.scale_factor
            major_length = np.sqrt(major_x**2 + major_y**2)
            
            if 0.01 < major_length < 50:
                ratio = float(props['40'])
                minor_length = major_length * ratio
                
                angle = np.arctan2(major_y, major_x)
                
                theta = np.linspace(0, 2*np.pi, 100)
                x_ellipse = x + major_length * np.cos(theta) * np.cos(angle) - minor_length * np.sin(theta) * np.sin(angle)
                y_ellipse = y + major_length * np.cos(theta) * np.sin(angle) + minor_length * np.sin(theta) * np.cos(angle)
                
                color = self.get_entity_color(entity)
                self.ax.plot(x_ellipse, y_ellipse, color=color, linewidth=0.5)
    
    def render_polyline(self, entity, entities):
        props = entity['properties']
        if '66' in props and props['66'] == '1':
            entity_handle = props.get('5')
            vertices = []
            collecting_vertices = False
            
            for e in entities:
                e_props = e['properties']
                if e['type'] == 'VERTEX' and e_props.get('330') == entity_handle:
                    if '10' in e_props and '20' in e_props:
                        x = (float(e_props['10']) - self.x_offset) / self.scale_factor
                        y = (float(e_props['20']) - self.y_offset) / self.scale_factor
                        vertices.append((x, y))
                elif e['type'] == 'SEQEND' and e_props.get('330') == entity_handle:
                    break
            
            if len(vertices) >= 2:
                xs, ys = zip(*vertices)
                color = self.get_entity_color(entity)
                self.ax.plot(xs, ys, color=color, linewidth=0.5)
    
    def render_lwpolyline(self, entity):
        props = entity['properties']
        if '90' in props and '10' in props and '20' in props:
            vertex_count = int(props['90'])
            if vertex_count >= 2:
                # 收集所有顶点
                vertices = []
                
                # 处理坐标数据
                x_coords = props['10']
                y_coords = props['20']
                
                # 确保坐标是列表形式
                if not isinstance(x_coords, list):
                    x_coords = [x_coords]
                if not isinstance(y_coords, list):
                    y_coords = [y_coords]
                
                # 确保坐标数量匹配
                min_len = min(len(x_coords), len(y_coords))
                for j in range(min_len):
                    x = (float(x_coords[j]) - self.x_offset) / self.scale_factor
                    y = (float(y_coords[j]) - self.y_offset) / self.scale_factor
                    vertices.append((x, y))
                
                if len(vertices) >= 2:
                    xs, ys = zip(*vertices)
                    color = self.get_entity_color(entity)
                    self.ax.plot(xs, ys, color=color, linewidth=0.5)
    
    def render_spline(self, entity):
        props = entity['properties']
        if '72' in props and '10' in props and '20' in props:
            control_point_count = int(props['72'])
            if control_point_count >= 2:
                # 收集控制点
                control_points = []
                
                # 处理坐标数据
                x_coords = props['10']
                y_coords = props['20']
                
                # 确保坐标是列表形式
                if not isinstance(x_coords, list):
                    x_coords = [x_coords]
                if not isinstance(y_coords, list):
                    y_coords = [y_coords]
                
                # 确保坐标数量匹配
                min_len = min(len(x_coords), len(y_coords))
                for j in range(min_len):
                    x = (float(x_coords[j]) - self.x_offset) / self.scale_factor
                    y = (float(y_coords[j]) - self.y_offset) / self.scale_factor
                    control_points.append((x, y))
                
                if len(control_points) >= 2:
                    # 绘制样条曲线（简化为折线）
                    xs, ys = zip(*control_points)
                    color = self.get_entity_color(entity)
                    self.ax.plot(xs, ys, color=color, linewidth=0.5)
    
    def render_text(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '1' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            text = props['1']
            
            # 提取文字内容
            text_content = re.sub(r'\\[fFHhPpQqWwAaCcDdLlOoUuKkXxTtSs]([^;]*;)?', '', text)
            text_content = re.sub(r'\\{[^}]*\\}', '', text_content)
            text_content = text_content.replace(';', '').strip()
            
            if text_content:
                # 使用字体属性对象渲染中文文本
                self.ax.text(x, y, text_content, fontsize=6, color='red', 
                            ha='center', va='center', fontproperties=chinese_font)
    
    def render_mtext(self, entity):
        props = entity['properties']
        if '10' in props and '20' in props and '1' in props:
            x = (float(props['10']) - self.x_offset) / self.scale_factor
            y = (float(props['20']) - self.y_offset) / self.scale_factor
            text = props['1']
            
            # 提取文字内容
            text_content = re.sub(r'\\f[^;]+;', '', text)
            text_content = re.sub(r'\\[PpQqWwAaCcDdLlOoUuKkXxTtSs][^;]*;?', '', text_content)
            text_content = text_content.replace('{', '').replace('}', '').strip()
            
            if text_content:
                # 使用字体属性对象渲染中文文本
                self.ax.text(x, y, text_content, fontsize=6, color='red', 
                            ha='center', va='center', fontproperties=chinese_font)
    
    def render_entity(self, entity, all_entities):
        entity_type = entity['type']
        if entity_type == 'LINE':
            self.render_line(entity)
        elif entity_type == 'CIRCLE':
            self.render_circle(entity)
        elif entity_type == 'ARC':
            self.render_arc(entity)
        elif entity_type == 'ELLIPSE':
            self.render_ellipse(entity)
        elif entity_type == 'POLYLINE':
            self.render_polyline(entity, all_entities)
        elif entity_type == 'LWPOLYLINE':
            self.render_lwpolyline(entity)
        elif entity_type == 'SPLINE':
            self.render_spline(entity)
        elif entity_type == 'TEXT':
            self.render_text(entity)
        elif entity_type == 'MTEXT':
            self.render_mtext(entity)
    
    def render(self, entities, output_file):
        all_x = []
        all_y = []
        
        for entity in entities:
            props = entity['properties']
            if '10' in props and '20' in props:
                # 处理坐标数据，无论是单个值还是列表
                x_value = props['10']
                y_value = props['20']
                
                if isinstance(x_value, list):
                    for x in x_value:
                        all_x.append(float(x))
                else:
                    all_x.append(float(x_value))
                
                if isinstance(y_value, list):
                    for y in y_value:
                        all_y.append(float(y))
                else:
                    all_y.append(float(y_value))
            
            if '11' in props and '21' in props:
                # 处理第二个点的坐标（如果有）
                x1_value = props['11']
                y1_value = props['21']
                
                if isinstance(x1_value, list):
                    for x in x1_value:
                        all_x.append(float(x))
                else:
                    all_x.append(float(x1_value))
                
                if isinstance(y1_value, list):
                    for y in y1_value:
                        all_y.append(float(y))
                else:
                    all_y.append(float(y1_value))
        
        if all_x and all_y:
            self.x_offset = (min(all_x) + max(all_x)) / 2
            self.y_offset = (min(all_y) + max(all_y)) / 2
        
        for entity in entities:
            self.render_entity(entity, entities)
        
        self.ax.relim()
        self.ax.autoscale_view()
        
        # 确保保持等比例显示
        self.ax.set_aspect('equal', adjustable='datalim')
        
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.savefig(output_file.replace('.png', '.svg'), format='svg', bbox_inches='tight')
        plt.close()
        print(f"图形已渲染并保存为 {output_file} 和 {output_file.replace('.png', '.svg')}")

if __name__ == "__main__":
    file_path = '/workspace/预作用配件lt2000.dxf'
    
    parser = DXFParser()
    parser.parse(file_path)
    entities = parser.get_entities()
    
    print(f"加载了 {len(entities)} 个实体")
    
    renderer = ImprovedDXRRenderer()
    renderer.render(entities, 'improved_render.png')
