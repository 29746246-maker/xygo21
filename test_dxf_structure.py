def check_dxf_structure(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f if line.strip()]
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='gbk', errors='ignore') as f:
            lines = [line.strip() for line in f if line.strip()]

    i = 0
    current_section = None
    entity_count = 0

    while i < len(lines):
        if i + 1 >= len(lines):
            break

        code = lines[i].strip()
        value = lines[i + 1].strip()

        if code == '0':
            if value == 'SECTION':
                i += 2
                # 查找 section 名称
                while i < len(lines):
                    if i + 1 >= len(lines):
                        break
                    sec_code = lines[i].strip()
                    sec_value = lines[i + 1].strip()
                    if sec_code == '2':
                        current_section = sec_value
                        print(f"Found section: {current_section}")
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
                    entity_count += 1
                    print(f"Found entity: {value} at position {i}")
                i += 2
        else:
            i += 2

    print(f"Total entities found: {entity_count}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'test.dxf'
    check_dxf_structure(file_path)
