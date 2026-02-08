import { useEffect, useRef } from 'react'

function About() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let requestRef: number
    const handleMouseMove = (e: MouseEvent) => {
      // 节流处理：使用 requestAnimationFrame
      if (requestRef) return
      
      requestRef = requestAnimationFrame(() => {
        if (!bgRef.current) {
            requestRef = 0
            return
        }
        
        const { innerWidth, innerHeight } = window
        const x = (e.clientX / innerWidth - 0.5) * 20
        const y = (e.clientY / innerHeight - 0.5) * 20
        
        bgRef.current.style.transform = `translate(${-x}px, ${-y}px)`
        requestRef = 0
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (requestRef) cancelAnimationFrame(requestRef)
    }
  }, [])

  const techStack = {
    backend: ['Go', 'Gin', 'PostgreSQL', 'JWT', 'WebSocket'],
    frontend: ['React 19', 'TypeScript', 'Vite', 'Tailwind', 'Mars3D', 'Ant Design']
  }

  const features = [
    {
      title: '沉浸式 3D 体验',
      desc: '基于 Mars3D 与 Cesium 打造的影院级地球可视化引擎，还原真实地形与大气环境。',
      gradient: 'from-blue-500/10 to-purple-500/10',
      border: 'border-blue-500/20',
      delay: '0'
    },
    {
      title: '毫秒级实时数据',
      desc: 'WebSocket 全双工通信，确保航班位置、状态数据的实时同步与低延迟展示。',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/20',
      delay: '100'
    },
    {
      title: '多维数据分析',
      desc: '深度整合历史航迹与飞行数据，提供可视化的统计图表与冲突检测分析。',
      gradient: 'from-orange-500/10 to-red-500/10',
      border: 'border-orange-500/20',
      delay: '200'
    }
  ]

  return (
    <div 
      className="relative min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30"
    >
      {/* 动态背景层 */}
      <div 
        ref={bgRef}
        className="fixed inset-0 pointer-events-none transition-transform duration-700 ease-out will-change-transform"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
        
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        
        {/* 头部区域 */}
        <div className="text-center mb-24 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm text-slate-400 text-xs font-mono tracking-wider uppercase mb-8 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Project Roadmap v1.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            关于 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 animate-gradient-x">SkyTracker</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            探索未来的航空数据可视化。为航空爱好者与专业用户打造的<br className="hidden md:block"/>
            高性能、实时、沉浸式追踪平台。
          </p>
        </div>

        {/* Bento Grid 布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          
          {/* 主特性 - 跨两列 */}
          <div className="md:col-span-2 group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">全维感知 · 极致体验</h3>
              <p className="text-slate-400 max-w-lg mb-8">
                不仅是数据展示，更是感官体验。深度集成了 Mars3D 地理信息引擎，支持 3D 地形、动态天气与复杂的空域分析功能。
              </p>
              
              {/* 装饰性UI元素 */}
              <div className="grid grid-cols-3 gap-4 opacity-80">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-blue-400 text-sm font-mono mb-1">FPS</div>
                  <div className="text-2xl font-bold text-white">60+</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-purple-400 text-sm font-mono mb-1">Latency</div>
                  <div className="text-2xl font-bold text-white">~20ms</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-cyan-400 text-sm font-mono mb-1">Obj</div>
                  <div className="text-2xl font-bold text-white">10k+</div>
                </div>
              </div>
            </div>
            
            {/* 背景装饰 */}
            <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* 技术栈概览 */}
          <div className="md:col-span-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">前沿技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {[...techStack.backend, ...techStack.frontend].map((tech, i) => (
                  <span 
                    key={tech} 
                    className="px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors cursor-default"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/50">
               <div className="flex items-center gap-2 text-sm text-slate-500">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 System Status: <span className="text-green-400">Stable</span>
               </div>
            </div>
          </div>

          {/* 次要特性卡片 */}
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1 ${feature.border}`}
            >
              <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                <div className="w-6 h-6 rounded-full bg-white/10" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}

        </div>

        {/* 底部行动区 */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900/30 border border-slate-800/50 px-6 py-12 md:py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-6 relative z-10">准备好探索天空了吗？</h2>
            <div className="flex flex-col md:flex-row justify-center gap-4 relative z-10">
              <a 
                href="https://github.com/your-repo" 
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-slate-950 font-bold hover:bg-blue-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub 仓库
              </a>
              <a 
                href="mailto:contact@skytracker.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-800 text-white font-medium border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                联系我们
              </a>
            </div>
        </div>

      </div>
    </div>
  )
}

export default About
