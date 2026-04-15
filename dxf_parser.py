class DXFParser:
    def __init__(self):
        self.entities = []
        self.header = {}
        self.layers = []
    
    def parse(self, file_path):
        with open(file_path, 'r') as f:
            lines = [line.strip() for line in f if line.strip()]
        
        i = 0
        current_section = None
        current_entity = None
        current_layer = None
        
        while i < len(lines):
            if i + 1 >= len(lines):
                break
            
            code = lines[i]
            value = lines[i + 1]
            
            if code == '0':
                if value == 'SECTION':
                    i += 2
                    section_code = lines[i]
                    section_name = lines[i + 1]
                    current_section = section_name
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
                            header_value_code = lines[i]
                            header_value = lines[i + 1]
                            self.header[header_key] = header_value
                            i += 2
                        continue
                i += 2
            
            if current_entity and (i >= len(lines) or lines[i] == '0'):
                self.entities.append(current_entity)
                current_entity = None
            
            if current_layer and (i >= len(lines) or (lines[i] == '0' and lines[i + 1] in ['LAYER', 'ENDTAB'])):
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
    parser = DXFParser()
    parser.parse('test.dxf')
    parser.print_summary()