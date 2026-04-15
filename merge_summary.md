此次合并添加了完整的DXF文件解析和渲染功能，包括解析器、渲染器和测试工具，实现了对DXF文件的结构分析和图形可视化。这些新文件共同构成了一个DXF文件处理工具集，支持解析不同类型的实体并将其渲染为图片。
| 文件 | 变更 |
|------|---------|
| dxf_parser.py | - 新增DXFParser类，实现了完整的DXF文件解析功能，支持解析header、layers和entities<br>- 提供了get_entities()、get_header()、get_layers()等方法获取解析结果<br>- 实现了print_summary()方法打印文件摘要信息 |
| render_dxf.py | - 新增DXRRenderer类，实现了DXF文件的图形渲染功能<br>- 支持渲染LINE、CIRCLE、ARC、ELLIPSE、LWPOLYLINE和MTEXT等实体类型<br>- 使用matplotlib库生成图形并保存为dxf_render.png文件 |
| simple_test.py | - 新增simple_test函数，实现了简单的DXF文件结构测试功能<br>- 能够检测文件中的SECTION和ENTITIES，并统计实体数量 |
| test_dxf_structure.py | - 新增check_dxf_structure函数，实现了更详细的DXF文件结构检查功能<br>- 能够识别不同的section，并统计ENTITIES section中的实体数量 |