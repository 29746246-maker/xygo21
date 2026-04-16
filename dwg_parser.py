import os
import subprocess
import tempfile
import ezdxf

class DWGParser:
    def __init__(self):
        self.entities = []
        self.header = {}
        self.layers = []
    
    def _check_dwg2dxf(self):
        """检查是否存在dwg2dxf命令"""
        try:
            result = subprocess.run(['which', 'dwg2dxf'], capture_output=True, text=True)
            return result.returncode == 0
        except Exception:
            return False
    
    def _convert_dwg_to_dxf(self, dwg_path):
        """将DWG文件转换为DXF文件"""
        if not self._check_dwg2dxf():
            raise Exception("dwg2dxf command not found. Please install LibreDWG tools.")
        
        # 创建临时DXF文件
        with tempfile.NamedTemporaryFile(suffix='.dxf', delete=False) as temp_dxf:
            temp_dxf_path = temp_dxf.name
        
        # 执行转换命令
        result = subprocess.run(
            ['dwg2dxf', dwg_path, temp_dxf_path],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            os.unlink(temp_dxf_path)
            raise Exception(f"Failed to convert DWG to DXF: {result.stderr}")
        
        return temp_dxf_path
    
    def parse(self, file_path):
        """解析DWG文件"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # 检查文件扩展名
        ext = os.path.splitext(file_path)[1].lower()
        if ext != '.dwg':
            raise ValueError("Only DWG files are supported")
        
        # 转换DWG为DXF
        try:
            dxf_path = self._convert_dwg_to_dxf(file_path)
            
            # 使用ezdxf解析DXF文件
            doc = ezdxf.readfile(dxf_path)
            
            # 提取实体
            msp = doc.modelspace()
            for entity in msp:
                entity_type = entity.dxftype()
                properties = {}
                
                # 提取实体属性
                if entity_type == 'LINE':
                    properties['10'] = str(entity.dxf.start.x)
                    properties['20'] = str(entity.dxf.start.y)
                    properties['30'] = str(entity.dxf.start.z)
                    properties['11'] = str(entity.dxf.end.x)
                    properties['21'] = str(entity.dxf.end.y)
                    properties['31'] = str(entity.dxf.end.z)
                elif entity_type == 'CIRCLE':
                    properties['10'] = str(entity.dxf.center.x)
                    properties['20'] = str(entity.dxf.center.y)
                    properties['30'] = str(entity.dxf.center.z)
                    properties['40'] = str(entity.dxf.radius)
                elif entity_type == 'ARC':
                    properties['10'] = str(entity.dxf.center.x)
                    properties['20'] = str(entity.dxf.center.y)
                    properties['30'] = str(entity.dxf.center.z)
                    properties['40'] = str(entity.dxf.radius)
                    properties['50'] = str(entity.dxf.start_angle)
                    properties['51'] = str(entity.dxf.end_angle)
                elif entity_type == 'TEXT':
                    properties['10'] = str(entity.dxf.insert.x)
                    properties['20'] = str(entity.dxf.insert.y)
                    properties['30'] = str(entity.dxf.insert.z)
                    properties['1'] = entity.dxf.text
                    properties['40'] = str(entity.dxf.height)
                    properties['50'] = str(entity.dxf.rotation)
                elif entity_type == 'MTEXT':
                    properties['10'] = str(entity.dxf.insert.x)
                    properties['20'] = str(entity.dxf.insert.y)
                    properties['30'] = str(entity.dxf.insert.z)
                    properties['1'] = entity.dxf.text
                    properties['40'] = str(entity.dxf.height)
                elif entity_type == 'LWPOLYLINE':
                    # 处理多段线的顶点
                    x_coords = []
                    y_coords = []
                    z_coords = []
                    for point in entity:
                        x_coords.append(str(point[0]))
                        y_coords.append(str(point[1]))
                        z_coords.append(str(point[2]))
                    properties['10'] = x_coords
                    properties['20'] = y_coords
                    properties['30'] = z_coords
                elif entity_type == 'SPLINE':
                    # 处理样条曲线的控制点
                    x_coords = []
                    y_coords = []
                    z_coords = []
                    for point in entity.control_points:
                        x_coords.append(str(point.x))
                        y_coords.append(str(point.y))
                        z_coords.append(str(point.z))
                    properties['10'] = x_coords
                    properties['20'] = y_coords
                    properties['30'] = z_coords
                
                # 添加图层信息
                if hasattr(entity.dxf, 'layer'):
                    properties['8'] = entity.dxf.layer
                
                self.entities.append({
                    'type': entity_type,
                    'properties': properties
                })
            
            # 提取图层信息
            for layer in doc.layers:
                self.layers.append({
                    'name': layer.dxf.name,
                    'properties': {}
                })
            
            # 提取头部信息
            for key, value in doc.header.items():
                self.header[key] = str(value)
            
        finally:
            # 清理临时文件
            if 'dxf_path' in locals() and os.path.exists(dxf_path):
                os.unlink(dxf_path)
    
    def get_entities(self):
        return self.entities
    
    def get_header(self):
        return self.header
    
    def get_layers(self):
        return self.layers
    
    def print_summary(self):
        print("=== DWG File Summary ===")
        print(f"Header: {self.header}")
        print(f"Layers: {[layer['name'] for layer in self.layers]}")
        print(f"Entities: {len(self.entities)}")
        for entity in self.entities:
            print(f"  - {entity['type']}: {entity['properties']}")
        print("=======================")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dwg'
    parser = DWGParser()
    parser.parse(file_path)
    parser.print_summary()
