from dxf_parser import DXFParser
from collections import Counter

# 解析DXF文件
parser = DXFParser()
parser.parse('/workspace/预作用配件lt2000.dxf')
entities = parser.get_entities()
layers = parser.get_layers()

print('=== DXF文件分析 ===')
print(f'总实体数: {len(entities)}')
print(f'图层数: {len(layers)}')
print('\n图层列表:')
for layer in layers:
    print(f'  - {layer["name"]}')

print('\n实体类型分布:')
types = [e['type'] for e in entities]
counts = Counter(types)
for t, c in counts.most_common():
    print(f'  {t}: {c}')

print('\n详细统计:')
print('MTEXT实体数量:', sum(1 for e in entities if e['type'] == 'MTEXT'))
print('POLYLINE实体数量:', sum(1 for e in entities if e['type'] == 'POLYLINE'))
print('CIRCLE/ARC实体数量:', sum(1 for e in entities if e['type'] in ['CIRCLE', 'ARC']))
print('ELLIPSE实体数量:', sum(1 for e in entities if e['type'] == 'ELLIPSE'))
print('LINE实体数量:', sum(1 for e in entities if e['type'] == 'LINE'))
