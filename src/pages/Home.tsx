export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-mono text-white mb-6">技术阀门系统图纸</h1>
        <div className="relative overflow-auto">
          <svg width="1200" height="800" className="border border-gray-700">
            {/* 网格背景 */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#444" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            <rect width="100%" height="100%" fill="url(#grid-large)"/>
            
            {/* 主阀门系统 */}
            {/* 左侧阀门组件 */}
            <g transform="translate(100, 100)">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="30" y="10" width="40" height="80" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="45" y="0" width="10" height="10" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="45" y="90" width="10" height="10" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="2" fill="none"/>
            </g>
            
            {/* 右侧主阀门 */}
            <g transform="translate(600, 300)">
              {/* 主阀体 */}
              <circle cx="150" cy="150" r="100" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="150" cy="150" r="80" stroke="white" strokeWidth="1" fill="none"/>
              
              {/* 顶部法兰 */}
              <circle cx="150" cy="50" r="30" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="150" cy="50" r="20" stroke="white" strokeWidth="1" fill="none"/>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <circle 
                  key={i}
                  cx={150 + 30 * Math.cos(angle * Math.PI / 180)}
                  cy={50 + 30 * Math.sin(angle * Math.PI / 180)}
                  r="4" 
                  stroke="white" 
                  strokeWidth="1" 
                  fill="none"
                />
              ))}
              
              {/* 底部阀体 */}
              <rect x="120" y="250" width="60" height="40" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="100" y="290" width="100" height="20" stroke="white" strokeWidth="2" fill="none"/>
              
              {/* 左侧管道 */}
              <rect x="50" y="140" width="100" height="20" stroke="white" strokeWidth="2" fill="none"/>
              
              {/* 右侧管道 */}
              <rect x="250" y="140" width="100" height="20" stroke="white" strokeWidth="2" fill="none"/>
              
              {/* 信号蝶阀 */}
              <g transform="translate(150, 310)">
                <circle cx="0" cy="0" r="15" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M -15 0 L 15 0" stroke="white" strokeWidth="1"/>
                <path d="M 0 -15 L 0 15" stroke="white" strokeWidth="1"/>
              </g>
              
              {/* 控制装置 */}
              <rect x="130" y="130" width="40" height="40" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="140" y="140" width="20" height="20" stroke="white" strokeWidth="1" fill="none"/>
            </g>
            
            {/* 连接管道 */}
            <path d="M 200 150 L 300 150 L 300 300 L 500 300" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M 300 150 L 300 180" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M 280 180 L 320 180" stroke="white" strokeWidth="2" fill="none"/>
            
            {/* 标注线和文字 */}
            <g stroke="#4ade80" strokeWidth="1.5">
              {/* 上腔系统侧 */}
              <path d="M 150 100 L 250 50" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="260" y="50" fill="#4ade80" fontFamily="monospace" fontSize="12">上腔系统侧</text>
              
              {/* 下腔给水侧 */}
              <path d="M 150 200 L 250 250" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="260" y="250" fill="#4ade80" fontFamily="monospace" fontSize="12">下腔给水侧</text>
              
              {/* 余水释放阀 */}
              <path d="M 100 180 L 50 220" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="30" y="220" fill="#4ade80" fontFamily="monospace" fontSize="12">余水释放阀</text>
              
              {/* 控制腔安装电磁阀 */}
              <path d="M 700 100 L 800 50" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="810" y="50" fill="#4ade80" fontFamily="monospace" fontSize="12">控制腔安装电磁阀</text>
              <text x="810" y="65" fill="#4ade80" fontFamily="monospace" fontSize="12">用于自动开启系统</text>
              
              {/* 防复位装置 */}
              <path d="M 550 150 L 450 100" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="430" y="100" fill="#4ade80" fontFamily="monospace" fontSize="12">防复位装置</text>
              
              {/* 压力平衡装置 */}
              <path d="M 600 100 L 500 50" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="480" y="50" fill="#4ade80" fontFamily="monospace" fontSize="12">压力平衡装置</text>
              
              {/* 控制腔压力表 */}
              <path d="M 700 200 L 800 150" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="810" y="150" fill="#4ade80" fontFamily="monospace" fontSize="12">控制腔压力表</text>
              
              {/* 电磁阀 */}
              <path d="M 750 250 L 850 200" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="860" y="200" fill="#4ade80" fontFamily="monospace" fontSize="12">电磁阀</text>
              
              {/* 手动快开阀 */}
              <path d="M 650 250 L 750 200" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="760" y="200" fill="#4ade80" fontFamily="monospace" fontSize="12">手动快开阀</text>
              
              {/* 单向阀 */}
              <path d="M 550 250 L 450 200" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="430" y="200" fill="#4ade80" fontFamily="monospace" fontSize="12">单向阀</text>
              
              {/* 补压阀 */}
              <path d="M 500 300 L 400 350" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="380" y="350" fill="#4ade80" fontFamily="monospace" fontSize="12">补压阀</text>
              
              {/* 防复位装置 */}
              <path d="M 700 300 L 800 350" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="810" y="350" fill="#4ade80" fontFamily="monospace" fontSize="12">防复位装置</text>
              
              {/* 复位阀 */}
              <path d="M 600 350 L 500 400" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="480" y="400" fill="#4ade80" fontFamily="monospace" fontSize="12">复位阀</text>
              <text x="480" y="415" fill="#4ade80" fontFamily="monospace" fontSize="10">(电磁阀关闭)</text>
              
              {/* 给水侧压力表 */}
              <path d="M 650 350 L 750 400" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="760" y="400" fill="#4ade80" fontFamily="monospace" fontSize="12">给水侧压力表</text>
              
              {/* 信号蝶阀 */}
              <path d="M 150 350 L 250 400" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              <text x="260" y="400" fill="#4ade80" fontFamily="monospace" fontSize="12">信号蝶阀</text>
              
              {/* 流动方向 */}
              <path d="M 300 450 L 500 450" stroke="white" strokeWidth="2" fill="none"/>
              <polygon points="500,450 490,445 490,455" fill="white"/>
              <text x="350" y="470" fill="white" fontFamily="monospace" fontSize="12">流动方向</text>
            </g>
            
            {/* 左上角放大视图 */}
            <g transform="translate(300, 50)">
              <rect x="0" y="0" width="150" height="150" stroke="white" strokeWidth="1" fill="none"/>
              <circle cx="75" cy="75" r="50" stroke="white" strokeWidth="2" fill="none"/>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <circle 
                  key={i}
                  cx={75 + 50 * Math.cos(angle * Math.PI / 180)}
                  cy={75 + 50 * Math.sin(angle * Math.PI / 180)}
                  r="4" 
                  stroke="white" 
                  strokeWidth="1" 
                  fill="none"
                />
              ))}
              <circle cx="75" cy="75" r="30" stroke="white" strokeWidth="1" fill="none"/>
              <circle cx="75" cy="75" r="10" stroke="white" strokeWidth="1" fill="none"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}