from dxf_parser import DXFParser

# 解析 DXF 文件
file_path = '/workspace/预作用配件lt2000.dxf'
parser = DXFParser()
parser.parse(file_path)

# 获取实体
entities = parser.get_entities()

# 检查 LWPOLYLINE 实体
print("检查 LWPOLYLINE 实体:")
lwpolylines = [e for e in entities if e['type'] == 'LWPOLYLINE']
if lwpolylines:
    print(f"找到 {len(lwpolylines)} 个 LWPOLYLINE 实体")
    for i, entity in enumerate(lwpolylines[:2]):
        print(f"\nLWPOLYLINE {i+1} 属性:")
        for key, value in entity['properties'].items():
            print(f"  {key}: {value}")

# 检查 SPLINE 实体
print("\n检查 SPLINE 实体:")
splines = [e for e in entities if e['type'] == 'SPLINE']
if splines:
    print(f"找到 {len(splines)} 个 SPLINE 实体")
    for i, entity in enumerate(splines[:2]):
        print(f"\nSPLINE {i+1} 属性:")
        for key, value in entity['properties'].items():
            print(f"  {key}: {value}")

# 检查 HATCH 实体
print("\n检查 HATCH 实体:")
hatches = [e for e in entities if e['type'] == 'HATCH']
if hatches:
    print(f"找到 {len(hatches)} 个 HATCH 实体")
    for i, entity in enumerate(hatches[:2]):
        print(f"\nHATCH {i+1} 属性:")
        for key, value in entity['properties'].items():
            print(f"  {key}: {value}")
