class DXFParser:
    def __init__(self):
        self.entities = []
        self.header = {}
        self.layers = []
    
    def parse(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='gbk', errors='ignore') as f:
                lines = f.readlines()

        i = 0
        current_section = None
        current_entity = None
        current_layer = None

        while i < len(lines):
            if i + 1 >= len(lines):
                break

            code = lines[i].strip()
            if not code:
                i += 1
                continue

            value = lines[i + 1].strip()
            if not value:
                i += 2
                continue

            if code == '0':
                if value == 'SECTION':
                    i += 2
                    # 查找 section 名称
                    while i < len(lines):
                        if i + 1 >= len(lines):
                            break
                        sec_code = lines[i].strip()
                        if not sec_code:
                            i += 1
                            continue
                        sec_value = lines[i + 1].strip()
                        if not sec_value:
                            i += 2
                            continue
                        if sec_code == '2':
                            current_section = sec_value
                            i += 2
                            break
                        i += 2
                elif value == 'ENDSEC':
                    current_section = None
                    i += 2
                elif value == 'EOF':
                    break
                else:
                    if current_section == 'ENTITIES':
                        current_entity = {
                            'type': value,
                            'properties': {}
                        }
                        i += 2
                    elif current_section == 'TABLES' and value == 'TABLE':
                        i += 2
                    elif current_section == 'TABLES' and value == 'LAYER':
                        current_layer = {
                            'name': '',
                            'properties': {}
                        }
                        i += 2
                    elif current_section == 'TABLES' and value == 'ENDTAB':
                        i += 2
                    else:
                        i += 2
            else:
                if current_entity:
                    # 处理 LWPOLYLINE 和 SPLINE 的多个顶点/控制点
                    if code in ['10', '20', '30'] and code in current_entity['properties']:
                        # 如果是重复的坐标代码，将其转换为列表
                        if not isinstance(current_entity['properties'][code], list):
                            current_entity['properties'][code] = [current_entity['properties'][code]]
                        current_entity['properties'][code].append(value)
                    else:
                        current_entity['properties'][code] = value
                elif current_layer:
                    if code == '2':
                        current_layer['name'] = value
                    else:
                        current_layer['properties'][code] = value
                elif current_section == 'HEADER':
                    if code == '9':
                        header_key = value
                        i += 2
                        if i < len(lines):
                            header_value_code = lines[i].strip()
                            if not header_value_code:
                                i += 1
                                continue
                            header_value = lines[i + 1].strip()
                            if not header_value:
                                i += 2
                                continue
                            self.header[header_key] = header_value
                            i += 2
                        continue
                i += 2

            if current_entity and (i >= len(lines) or (i < len(lines) and lines[i].strip() == '0')):
                self.entities.append(current_entity)
                current_entity = None

            if current_layer and (i >= len(lines) or (i < len(lines) and lines[i].strip() == '0' and i + 1 < len(lines) and lines[i + 1].strip() in ['LAYER', 'ENDTAB'])):
                self.layers.append(current_layer)
                current_layer = None
    
    def get_entities(self):
        return self.entities
    
    def get_header(self):
        return self.header
    
    def get_layers(self):
        return self.layers
    
    def print_summary(self):
        print("=== DXF File Summary ===")
        print(f"Header: {self.header}")
        print(f"Layers: {[layer['name'] for layer in self.layers]}")
        print(f"Entities: {len(self.entities)}")
        for entity in self.entities:
            print(f"  - {entity['type']}: {entity['properties']}")
        print("========================")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dxf'
    parser = DXFParser()
    parser.parse(file_path)
    parser.print_summary()