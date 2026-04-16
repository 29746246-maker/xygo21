# DWG解析与渲染工具

## 简介

本项目提供了DWG文件的解析和渲染功能，使用Python实现。主要包含以下文件：

- `dwg_parser.py` - DWG文件解析器
- `dwg_render.py` - DWG文件渲染器

## 依赖项

### 核心依赖
- Python 3.10+
- ezdxf - 用于解析DXF文件
- matplotlib - 用于渲染图形
- numpy - 用于数学计算

### 外部工具
- dwg2dxf - 用于将DWG文件转换为DXF文件
  - 来自LibreDWG项目：https://www.gnu.org/software/libredwg/

## 安装步骤

### 1. 安装Python依赖

```bash
pip install ezdxf matplotlib numpy
```

### 2. 安装LibreDWG工具

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install libredwg-tools
```

#### CentOS/RHEL
```bash
sudo yum install libredwg-tools
```

#### 从源码编译
```bash
git clone https://github.com/LibreDWG/libredwg
cd libredwg
./autogen.sh
./configure
make
sudo make install
```

## 使用方法

### 1. 解析DWG文件

```python
from dwg_parser import DWGParser

# 创建解析器实例
parser = DWGParser()

# 解析DWG文件
parser.parse('path/to/file.dwg')

# 获取实体
entities = parser.get_entities()

# 获取图层
layers = parser.get_layers()

# 获取头部信息
header = parser.get_header()

# 打印摘要
parser.print_summary()
```

### 2. 渲染DWG文件

```python
from dwg_render import DWGRenderer
from dwg_parser import DWGParser

# 解析DWG文件
parser = DWGParser()
parser.parse('path/to/file.dwg')
entities = parser.get_entities()

# 渲染并保存
renderer = DWGRenderer()
renderer.render(entities)
renderer.save('output.png')

# 或显示
# renderer.show()
```

### 3. 命令行使用

#### 解析DWG文件
```bash
python dwg_parser.py path/to/file.dwg
```

#### 渲染DWG文件
```bash
python dwg_render.py path/to/file.dwg
```

## 支持的实体类型

- LINE - 直线
- CIRCLE - 圆
- ARC - 圆弧
- TEXT - 文本
- MTEXT - 多行文本
- LWPOLYLINE - 轻量级多段线
- SPLINE - 样条曲线

## 功能特点

1. **深度排序** - 按Z轴坐标排序实体，实现正确的遮挡关系
2. **自动视图调整** - 自动调整视图以显示所有实体
3. **详细的实体属性提取** - 提取实体的各种属性
4. **错误处理** - 提供详细的错误信息
5. **临时文件管理** - 自动清理临时文件

## 注意事项

1. 本工具依赖于LibreDWG的dwg2dxf命令，必须先安装LibreDWG工具
2. 对于复杂的DWG文件，解析和渲染可能会比较耗时
3. 某些高级实体类型可能不被完全支持

## 示例

### 解析示例

```bash
python dwg_parser.py test.dwg
```

输出：
```
=== DWG File Summary ===
Header: {'$ACADVER': 'AC1027', '$DWGCODEPAGE': 'ANSI_1252', ...}
Layers: ['0', 'Layer1', 'Layer2']
Entities: 10
  - LINE: {'10': '0.0', '20': '0.0', '30': '0.0', '11': '10.0', '21': '10.0', '31': '0.0', '8': '0'}
  - CIRCLE: {'10': '5.0', '20': '5.0', '30': '0.0', '40': '2.0', '8': 'Layer1'}
  - TEXT: {'10': '1.0', '20': '1.0', '30': '0.0', '1': 'Hello', '40': '1.0', '50': '0.0', '8': '0'}
...
=======================
```

### 渲染示例

```bash
python dwg_render.py test.dwg
```

输出：
```
Rendered DWG file saved to dwg_render.png
```

## 故障排除

### 1. dwg2dxf命令未找到

错误信息：`dwg2dxf command not found. Please install LibreDWG tools.`

解决方案：安装LibreDWG工具，参考安装步骤。

### 2. 无法解析DWG文件

错误信息：`Failed to convert DWG to DXF: ...`

解决方案：检查DWG文件是否有效，或者尝试使用不同版本的LibreDWG。

### 3. 渲染效果不佳

解决方案：调整matplotlib的参数，如线条宽度、字体大小等。

## 许可证

本项目采用MIT许可证。
