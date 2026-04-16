from dxf_parser import DXFParser

# 解析 DXF 文件
file_path = '/workspace/预作用配件lt2000.dxf'
parser = DXFParser()
parser.parse(file_path)

# 获取实体
entities = parser.get_entities()

# 查找文字实体
text_entities = [e for e in entities if e['type'] in ['TEXT', 'MTEXT']]
print(f"找到 {len(text_entities)} 个文字实体")

# 检查前几个文字实体的属性
print("\n检查前几个文字实体的属性:")
for i, entity in enumerate(text_entities[:5]):
    print(f"\n文字实体 {i+1} ({entity['type']}):")
    for key, value in entity['properties'].items():
        print(f"  {key}: {value}")

# 检查文字内容
print("\n检查文字内容:")
for i, entity in enumerate(text_entities[:10]):
    if '1' in entity['properties']:
        text_content = entity['properties']['1']
        print(f"\n文字 {i+1} ({entity['type']}):")
        print(f"  原始内容: {text_content}")
        # 尝试解码
        try:
            decoded_content = text_content.encode('latin1').decode('gbk')
            print(f"  GBK解码: {decoded_content}")
        except:
            try:
                decoded_content = text_content.encode('latin1').decode('utf-8')
                print(f"  UTF-8解码: {decoded_content}")
            except:
                print(f"  无法解码")
