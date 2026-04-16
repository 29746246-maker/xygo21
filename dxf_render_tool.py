import matplotlib.pyplot as plt
import numpy as np
from dxf_parser import DXFParser
import tkinter as tk
from tkinter import ttk, filedialog

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
                self.ax.plot([x1, x2], [y1, y2], self.color, linewidth=self.linewidth)
    
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
                
                self.ax.plot(x_arc, y_arc, self.color, linewidth=self.linewidth)
    
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
                
                self.ax.plot(x_ellipse, y_ellipse, self.color, linewidth=self.linewidth)
    
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

class DXFRenderTool:
    def __init__(self, root):
        self.root = root
        self.root.title("DXF渲染参数调整工具")
        self.root.geometry("600x400")
        
        # 默认参数
        self.default_params = {
            'scale_factor': 5000,
            'linewidth': 0.2,
            'fontsize': 3,
            'figsize': 20,
            'grid': True,
            'ellipse_y_flip': True,
            'ellipse_angle_reverse': False,
            'color': 'b-'
        }
        
        # 当前参数
        self.current_params = self.default_params.copy()
        
        # 当前文件路径
        self.current_file = None
        self.entities = None
        
        # 创建界面
        self.create_widgets()
    
    def create_widgets(self):
        # 文件选择
        file_frame = ttk.LabelFrame(self.root, text="文件选择")
        file_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(file_frame, text="DXF文件:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.file_var = tk.StringVar()
        ttk.Entry(file_frame, textvariable=self.file_var, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(file_frame, text="浏览", command=self.browse_file).grid(row=0, column=2, padx=5, pady=5)
        ttk.Button(file_frame, text="加载文件", command=self.load_file).grid(row=0, column=3, padx=5, pady=5)
        
        # 渲染参数
        params_frame = ttk.LabelFrame(self.root, text="渲染参数")
        params_frame.pack(fill="x", padx=10, pady=5)
        
        # 缩放因子
        ttk.Label(params_frame, text="缩放因子:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.scale_var = tk.StringVar(value=str(self.default_params['scale_factor']))
        ttk.Entry(params_frame, textvariable=self.scale_var, width=10).grid(row=0, column=1, padx=5, pady=5)
        
        # 线条宽度
        ttk.Label(params_frame, text="线条宽度:").grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.linewidth_var = tk.StringVar(value=str(self.default_params['linewidth']))
        ttk.Entry(params_frame, textvariable=self.linewidth_var, width=10).grid(row=0, column=3, padx=5, pady=5)
        
        # 字体大小
        ttk.Label(params_frame, text="字体大小:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.fontsize_var = tk.StringVar(value=str(self.default_params['fontsize']))
        ttk.Entry(params_frame, textvariable=self.fontsize_var, width=10).grid(row=1, column=1, padx=5, pady=5)
        
        # 图形大小
        ttk.Label(params_frame, text="图形大小:").grid(row=1, column=2, padx=5, pady=5, sticky="w")
        self.figsize_var = tk.StringVar(value=str(self.default_params['figsize']))
        ttk.Entry(params_frame, textvariable=self.figsize_var, width=10).grid(row=1, column=3, padx=5, pady=5)
        
        # 网格显示
        ttk.Label(params_frame, text="显示网格:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.grid_var = tk.BooleanVar(value=self.default_params['grid'])
        ttk.Checkbutton(params_frame, variable=self.grid_var).grid(row=2, column=1, padx=5, pady=5)
        
        # 椭圆Y轴翻转
        ttk.Label(params_frame, text="椭圆Y轴翻转:").grid(row=2, column=2, padx=5, pady=5, sticky="w")
        self.ellipse_y_flip_var = tk.BooleanVar(value=self.default_params['ellipse_y_flip'])
        ttk.Checkbutton(params_frame, variable=self.ellipse_y_flip_var).grid(row=2, column=3, padx=5, pady=5)
        
        # 椭圆角度反向
        ttk.Label(params_frame, text="椭圆角度反向:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.ellipse_angle_reverse_var = tk.BooleanVar(value=self.default_params['ellipse_angle_reverse'])
        ttk.Checkbutton(params_frame, variable=self.ellipse_angle_reverse_var).grid(row=3, column=1, padx=5, pady=5)
        
        # 颜色选择
        ttk.Label(params_frame, text="线条颜色:").grid(row=3, column=2, padx=5, pady=5, sticky="w")
        self.color_var = tk.StringVar(value=self.default_params['color'])
        color_options = ['b-', 'r-', 'g-', 'k-', 'm-', 'y-']
        ttk.Combobox(params_frame, textvariable=self.color_var, values=color_options, width=8).grid(row=3, column=3, padx=5, pady=5)
        
        # 渲染按钮
        render_frame = ttk.Frame(self.root)
        render_frame.pack(fill="x", padx=10, pady=10)
        
        ttk.Button(render_frame, text="渲染图形", command=self.render).pack(side="left", padx=5)
        ttk.Button(render_frame, text="重置参数", command=self.reset_params).pack(side="left", padx=5)
        
        # 状态显示
        self.status_var = tk.StringVar(value="请选择并加载DXF文件")
        ttk.Label(self.root, textvariable=self.status_var, relief="sunken", anchor="w").pack(fill="x", padx=10, pady=5)
    
    def browse_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("DXF文件", "*.dxf"), ("所有文件", "*.*")]
        )
        if file_path:
            self.file_var.set(file_path)
    
    def load_file(self):
        file_path = self.file_var.get()
        if not file_path:
            self.status_var.set("请先选择DXF文件")
            return
        
        try:
            # 解析 DXF 文件
            parser = DXFParser()
            parser.parse(file_path)
            self.entities = parser.get_entities()
            self.current_file = file_path
            self.status_var.set(f"成功加载文件: {file_path}，包含 {len(self.entities)} 个实体")
        except Exception as e:
            self.status_var.set(f"加载文件失败: {str(e)}")
    
    def get_current_params(self):
        try:
            params = {
                'scale_factor': float(self.scale_var.get()),
                'linewidth': float(self.linewidth_var.get()),
                'fontsize': float(self.fontsize_var.get()),
                'figsize': float(self.figsize_var.get()),
                'grid': self.grid_var.get(),
                'ellipse_y_flip': self.ellipse_y_flip_var.get(),
                'ellipse_angle_reverse': self.ellipse_angle_reverse_var.get(),
                'color': self.color_var.get()
            }
            return params
        except Exception as e:
            self.status_var.set(f"参数错误: {str(e)}")
            return None
    
    def render(self):
        if not self.entities:
            self.status_var.set("请先加载DXF文件")
            return
        
        params = self.get_current_params()
        if not params:
            return
        
        try:
            # 渲染图形
            renderer = DXRRenderer(params)
            output_file = "dxf_render_adjusted.png"
            result = renderer.render(self.entities, output_file)
            self.status_var.set(result)
        except Exception as e:
            self.status_var.set(f"渲染失败: {str(e)}")
    
    def reset_params(self):
        self.scale_var.set(str(self.default_params['scale_factor']))
        self.linewidth_var.set(str(self.default_params['linewidth']))
        self.fontsize_var.set(str(self.default_params['fontsize']))
        self.figsize_var.set(str(self.default_params['figsize']))
        self.grid_var.set(self.default_params['grid'])
        self.ellipse_y_flip_var.set(self.default_params['ellipse_y_flip'])
        self.ellipse_angle_reverse_var.set(self.default_params['ellipse_angle_reverse'])
        self.color_var.set(self.default_params['color'])
        self.status_var.set("参数已重置为默认值")

if __name__ == "__main__":
    root = tk.Tk()
    app = DXFRenderTool(root)
    root.mainloop()