def simple_test(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='gbk', errors='ignore') as f:
            lines = f.readlines()

    in_entities = False
    entity_count = 0

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if line == '0' and next_line == 'SECTION':
                print(f"Found SECTION at line {i+1}")
                # 查找 section 名称
                j = i + 2
                while j < len(lines):
                    sec_line = lines[j].strip()
                    if not sec_line:
                        j += 1
                        continue
                    if j + 1 < len(lines):
                        sec_next_line = lines[j + 1].strip()
                        if sec_line == '2':
                            section_name = sec_next_line
                            print(f"Section name: {section_name}")
                            if section_name == 'ENTITIES':
                                in_entities = True
                            else:
                                in_entities = False
                            break
                    j += 1
            elif in_entities and line == '0' and next_line != 'ENDSEC':
                entity_count += 1
                print(f"Found entity {next_line} at line {i+1}")

    print(f"Total entities: {entity_count}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dxf'
    simple_test(file_path)
