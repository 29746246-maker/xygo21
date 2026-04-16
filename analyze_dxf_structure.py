from dxf_parser import DXFParser

# 解析 DXF 文件
file_path = '/workspace/预作用配件lt2000.dxf'
parser = DXFParser()
parser.parse(file_path)

# 获取实体
entities = parser.get_entities()
print(f"总实体数: {len(entities)}")

# 统计不同类型的实体
entity_types = {}
for entity in entities:
    entity_type = entity['type']
    if entity_type not in entity_types:
        entity_types[entity_type] = 0
    entity_types[entity_type] += 1

print("\n实体类型统计:")
for entity_type, count in entity_types.items():
    print(f"{entity_type}: {count}")

# 检查一些关键实体的属性
print("\n检查前几个实体的属性:")
for i, entity in enumerate(entities[:5]):
    print(f"\n实体 {i+1} ({entity['type']}):")
    for key, value in entity['properties'].items():
        print(f"  {key}: {value}")

# 检查是否有特殊实体需要处理
print("\n检查特殊实体:")
for entity in entities:
    if entity['type'] in ['HATCH', 'REGION', 'POLYLINE']:
        print(f"找到 {entity['type']} 实体")
        break
