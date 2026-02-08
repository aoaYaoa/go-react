import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

// -----------------------------------------------------------------------------
// 创意风格的 Bento Grid 首页
// "Commander Console" 风格：模拟未来航空指挥中心的仪表盘
// -----------------------------------------------------------------------------

function Home() {
  const { t } = useTranslation()
  // 鼠标移动视差效果
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let requestRef: number
    const handleMouseMove = (e: MouseEvent) => {
       if (requestRef) return
      
      requestRef = requestAnimationFrame(() => {
        if (!bgRef.current) {
             requestRef = 0
             return
        }
        const { innerWidth, innerHeight } = window
        const x = (e.clientX / innerWidth - 0.5) * 20
        const y = (e.clientY / innerHeight - 0.5) * 20
        bgRef.current.style.transform = `perspective(1000px) rotateX(20deg) translateY(${y * 2}px) translateX(${x * 2}px)`
        requestRef = 0
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
        window.removeEventListener('mousemove', handleMouseMove) 
        if(requestRef) cancelAnimationFrame(requestRef)
    }
  }, [])
// ...
  // 通用卡片样式
  const baseCardClass = "relative group overflow-hidden rounded-3xl backdrop-blur-xl border shadow-2xl transition-all duration-500 hover:scale-[1.01]"

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
      
      {/* 动态光影背景 (Aurora Effect) - 提亮整体色调 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* 网格背景 */}
      <div 
           ref={bgRef}
           className="absolute inset-0 z-0 pointer-events-none opacity-30 will-change-transform"
           style={{
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }}
      />

      {/* 核心内容区：Bento Grid 布局 */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 md:gap-6 md:h-[800px]">

        {/* 1. Brand / Hero Section (占据左上 2x2) */}
        {/* 1. Brand / Hero Section (占据左上 2x2) */}
        <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-900/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative">
          
          {/* Animated decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Glowing Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 text-blue-400 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-xs font-mono tracking-[0.2em] uppercase border border-blue-500/30 px-2 py-0.5 rounded">System Online</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-none">
              Sky<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-300">Tracker</span>
            </h1>
            
            <p className="text-lg text-blue-100/70 max-w-md leading-relaxed mb-8">
              {t('home.hero.subtitle', '下一代全球航空网络监测系统。实时追踪航班动态，管理无人机机群，洞察每一万英尺的数据价值。')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 border-t border-white/10 pt-6">
                <div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Coverage</div>
                </div>
                 <div>
                    <div className="text-2xl font-bold text-white">2.4TB</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Data / Day</div>
                </div>
                 <div>
                    <div className="text-2xl font-bold text-white">50ms</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Latency</div>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 relative z-10">
            <Link to="/map" className="flex-1 min-w-[140px] px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center group border border-blue-400/20">
              <span>{t('home.startTracking', '启动追踪')}</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link to="/about" className="flex-1 min-w-[140px] px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all backdrop-blur-sm border border-white/10 flex items-center justify-center hover:border-white/30">
              {t('home.learnMore', '了解更多')}
            </Link>
          </div>
        </div>

        {/* 2. Map / Real-time Tracking (占据右上 2x1) */}
        <Link to="/map" className={`${baseCardClass} md:col-span-2 md:row-span-1 p-6 flex flex-col justify-between bg-gradient-to-br from-emerald-600/10 to-slate-900/50 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/20`}>
          {/* 动态波浪线条 */}
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-30 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,50 Q100,20 200,50 T400,50" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2">
              <animate attributeName="d" values="M0,50 Q100,20 200,50 T400,50;M0,50 Q100,80 200,50 T400,50;M0,50 Q100,20 200,50 T400,50" dur="4s" repeatCount="indefinite" />
            </path>
            <path d="M0,60 Q100,30 200,60 T400,60" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5">
              <animate attributeName="d" values="M0,60 Q100,30 200,60 T400,60;M0,60 Q100,90 200,60 T400,60;M0,60 Q100,30 200,60 T400,60" dur="5s" repeatCount="indefinite" />
            </path>
          </svg>
          {/* Radar Background Effect */}
          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] animate-pulse" />
             <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite] [mask-image:linear-gradient(transparent,black)]" />
             <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 border border-emerald-500/20 rounded-full" />
          </div>
          
          {/* Holographic Map Visual (Fills the upper space) */}
          <div className="absolute inset-x-0 top-0 h-[70%] z-0 pointer-events-none p-6">
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
               {/* Grid Lines */}
               <path d="M0,90 H400 M200,0 V180" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" />
               <path d="M50,0 V180 M350,0 V180 M0,45 H400 M0,135 H400" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="0.5" />
               
               {/* Abstract World Map Dots */}
               <g className="fill-emerald-400/30">
                 <circle cx="50" cy="60" r="1.5" />
                 <circle cx="80" cy="40" r="1.5" />
                 <circle cx="120" cy="80" r="1.5" />
                 <circle cx="160" cy="50" r="1.5" />
                 <circle cx="280" cy="70" r="1.5" />
                 <circle cx="320" cy="50" r="1.5" />
                 <circle cx="360" cy="80" r="1.5" />
               </g>

               {/* Flight Paths */}
               <path d="M50,60 Q100,-10 160,50" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5">
                   <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="3s" repeatCount="indefinite" />
               </path>
               <path d="M160,50 Q220,110 280,70" fill="none" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.5">
                   <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="4s" repeatCount="indefinite" />
               </path>
                <path d="M280,70 Q320,20 360,80" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5">
                   <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="3.5s" repeatCount="indefinite" />
               </path>
               
               {/* Pulse Dots */}
               <circle cx="160" cy="50" r="2" className="fill-emerald-400 animate-ping" />
               <circle cx="280" cy="70" r="2" className="fill-emerald-400 animate-ping" style={{animationDelay: '1s'}} />
            </svg>
          </div>

          <div className="relative z-10 flex justify-between items-start h-full pointer-events-none">
             {/* Top Left Status Badge */}
             <div className="flex items-center space-x-2 bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-full px-3 py-1 mt-[-4px]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-mono tracking-wider">LIVE SATELLITE</span>
             </div>
             
             {/* Top Right Stats (Moved from bottom) */}
             <div className="text-right hidden md:block mt-[-4px]">
               <div className="text-3xl font-mono font-bold text-emerald-400">14,205</div>
               <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest">Active Flights</div>
             </div>
          </div>

          <div className="relative z-10 mt-auto">
             <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors flex items-center">
                 {t('home.features.tracking.title', '全球实况地图')}
                 <svg className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </h3>
             <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">3D 地球视图 / 实时高度 / 速度遥测</p>
          </div>
        </Link>
        
         {/* 3. Drone Management (占据右侧中间 1x1) */}
         <Link to="/drones/map" className={`${baseCardClass} md:col-span-1 md:row-span-1 p-6 bg-gradient-to-br from-orange-600/10 to-slate-900/50 border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/20`}>
           {/* 动态波浪线条 */}
           <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none" viewBox="0 0 100 100">
             <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="rgba(249, 115, 22, 0.6)" strokeWidth="1.5">
               <animate attributeName="d" values="M10,50 Q30,30 50,50 T90,50;M10,50 Q30,70 50,50 T90,50;M10,50 Q30,30 50,50 T90,50" dur="3s" repeatCount="indefinite" />
             </path>
             <path d="M10,60 Q30,40 50,60 T90,60" fill="none" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="1">
               <animate attributeName="d" values="M10,60 Q30,40 50,60 T90,60;M10,60 Q30,80 50,60 T90,60;M10,60 Q30,40 50,60 T90,60" dur="4s" repeatCount="indefinite" />
             </path>
           </svg>
           <div className="absolute top-4 right-4 flex space-x-1">
              {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i===1?'bg-orange-500':'bg-orange-500/30'}`} />)}
           </div>
          <div className="h-full flex flex-col justify-between">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
            </div>
            <div>
              <div className="flex items-baseline space-x-2 mb-1">
                 <h3 className="text-xl font-bold text-white">{t('home.features.drone.title', '无人机管控')}</h3>
                 <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">LIVE</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>在线设备</span>
                  <span className="text-white font-mono">24</span>
                </div>
                 <div className="flex justify-between text-xs text-gray-400">
                  <span>执行任务</span>
                  <span className="text-white font-mono">8</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 4. Analytics (占据右侧中间 1x1) */}
        <Link to="/analytics/overview" className={`${baseCardClass} md:col-span-1 md:row-span-1 p-6 bg-gradient-to-br from-purple-600/10 to-slate-900/50 border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/20`}>
           {/* 动态波浪线条 */}
           <svg className="absolute top-0 left-0 w-full h-20 opacity-25 pointer-events-none" viewBox="0 0 200 50" preserveAspectRatio="none">
             <path d="M0,25 Q50,10 100,25 T200,25" fill="none" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1.5">
               <animate attributeName="d" values="M0,25 Q50,10 100,25 T200,25;M0,25 Q50,40 100,25 T200,25;M0,25 Q50,10 100,25 T200,25" dur="3.5s" repeatCount="indefinite" />
             </path>
           </svg>
           {/* Mini Bar Chart */}
           <div className="absolute bottom-6 right-6 flex items-end space-x-1 h-8 opacity-50 group-hover:opacity-80 transition-opacity">
              {[40, 70, 45, 90, 60].map((h, i) => (
                <div key={i} className="w-1.5 bg-purple-500 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
           </div>

          <div className="h-full flex flex-col justify-between">
             <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{t('home.features.analytics.title', '数据洞察')}</h3>
              <p className="text-xs text-gray-400">上周流量 +12.5%</p>
            </div>
          </div>
        </Link>
        
        {/* 5. Airport Info (占据右下 2x1) */}
        <Link to="/airports" className={`${baseCardClass} md:col-span-2 md:row-span-1 p-6 flex flex-row items-center justify-between bg-gradient-to-br from-cyan-600/10 to-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/20`}>
          {/* 动态波浪线条 */}
          <svg className="absolute bottom-0 left-0 w-full h-16 opacity-30 pointer-events-none" viewBox="0 0 400 50" preserveAspectRatio="none">
            <path d="M0,25 Q100,10 200,25 T400,25" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5">
              <animate attributeName="d" values="M0,25 Q100,10 200,25 T400,25;M0,25 Q100,40 200,25 T400,25;M0,25 Q100,10 200,25 T400,25" dur="4.5s" repeatCount="indefinite" />
            </path>
          </svg>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{t('home.features.airport.title', '数字机场')}</h3>
            <div className="space-y-1.5 opacity-80">
              <div className="flex items-center text-xs text-gray-300 font-mono">
                <span className="w-8 text-slate-400">PEK</span>
                <div className="w-16 h-1 bg-slate-700 mx-2 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-slate-400" />
                </div>
                <span>98%</span>
              </div>
              <div className="flex items-center text-xs text-gray-300 font-mono">
                <span className="w-8 text-slate-400">SHA</span>
                 <div className="w-16 h-1 bg-slate-700 mx-2 rounded-full overflow-hidden">
                   <div className="w-1/2 h-full bg-slate-400" />
                </div>
                <span>45%</span>
              </div>
            </div>
          </div>
           <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center text-slate-300 group-hover:rotate-12 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
        </Link>

        {/* 6. Community (占据左下 1x1 -> 2x1 for better balance or keep 1x1 but richer) */}
        <Link to="/community/posts" className={`${baseCardClass} md:col-span-1 md:row-span-1 p-6 flex flex-col justify-between bg-gradient-to-br from-pink-600/10 to-slate-900/50 border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/20`}>
           <div className="absolute top-0 right-0 p-4 opacity-40 group-hover:opacity-60 transition-opacity">
             <svg className="w-20 h-20 text-pink-500 animate-[heartbeat_4s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
             </svg>
             {/* 心跳光晕效果 */}
             <svg className="w-20 h-20 text-pink-400 absolute top-4 left-4 animate-[heartbeat-glow_4s_ease-in-out_infinite] opacity-50" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
             </svg>
           </div>
           
           <style>{`
             @keyframes heartbeat {
               0%, 100% {
                 transform: scale(1);
               }
               2% {
                 transform: scale(0.98);
               }
               4% {
                 transform: scale(1.06);
               }
               6% {
                 transform: scale(1.01);
               }
               8% {
                 transform: scale(1.08);
               }
               10% {
                 transform: scale(1);
               }
             }
             
             @keyframes heartbeat-glow {
               0%, 100% {
                 transform: scale(1);
                 opacity: 0.3;
               }
               2% {
                 transform: scale(0.98);
                 opacity: 0.25;
               }
               4% {
                 transform: scale(1.1);
                 opacity: 0.45;
               }
               6% {
                 transform: scale(1.03);
                 opacity: 0.32;
               }
               8% {
                 transform: scale(1.15);
                 opacity: 0.5;
               }
               10% {
                 transform: scale(1);
                 opacity: 0.3;
               }
             }
           `}</style>
           
           <div>
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{t('home.features.community.title', '飞行社区')}</h3>
              <p className="text-xs text-gray-400">热门话题: #极光追逐</p>
           </div>
           
           <div className="relative z-10 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gray-700 border border-gray-800 flex items-center justify-center text-[9px] text-gray-300 ring-2 ring-[#0f172a]">U{i}</div>
                    ))}
                </div>
                <span className="text-[10px] text-gray-500">+128 在线</span>
             </div>
           </div>
        </Link>
 
        {/* 7. Profile / Personal (占据左下 1x1) */}
         <Link to="/profile" className={`${baseCardClass} md:col-span-1 md:row-span-1 p-6 bg-gradient-to-br from-violet-600/20 to-purple-900/40 border-violet-500/30 hover:border-violet-500/50 hover:shadow-violet-500/20`}>
           <div className="flex flex-col h-full justify-between">
             <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-violet-500/30 flex items-center justify-center border border-violet-400/30 text-violet-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="px-2 py-1 rounded bg-violet-500/20 text-[10px] text-violet-300 font-mono">PILOT</div>
             </div>
             
             <div>
                <h3 className="text-lg font-bold text-white mb-1">{t('home.features.personal.title', '飞行日志')}</h3>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full w-[65%]" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                    <span>LV.12 进阶机长</span>
                    <span>65%</span>
                </div>
             </div>
           </div>
        </Link>

      </div>
      
      {/* 底部装饰：模拟状态栏 */}
      <div className="absolute bottom-4 left-8 right-8 flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest opacity-60">
        <div>SYS_STATUS: NOMINAL</div>
        <div>GRID: ACTIVE</div>
        <div>VER: v0.1.0-ALPHA</div>
      </div>
    </div>
  )
}

export default Home
