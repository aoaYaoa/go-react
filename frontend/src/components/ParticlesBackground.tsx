import { CSSProperties } from 'react'

/**
 * 动态流体渐变背景组件
 * 
 * 摒弃具象的图片，使用现代流行的 CSS 动态网格/流体渐变风格。
 * 这种风格更加抽象、高级，且不依赖任何外部资源，加载极快。
 */

interface ParticlesBackgroundProps {
  particleCount?: number
  variant?: 'login' | 'register'
}

function ParticlesBackground({ variant = 'login' }: ParticlesBackgroundProps) {
  
  // 基础样式
  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    overflow: 'hidden',
    background: variant === 'login' ? '#0f172a' : '#1e1b4b', // login: slate-900, register: indigo-950
    transition: 'background 1s ease'
  }

  // 光斑球体通用动画样式
  const blobStyle: CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)', // 高斯模糊产生柔和光晕
    opacity: 0.6,
    animation: 'float 20s infinite ease-in-out alternate'
  }

  // 定义三个不同颜色和位置的光斑
  const blob1: CSSProperties = {
    ...blobStyle,
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: variant === 'login' ? '#4f46e5' : '#c026d3', // login: indigo, register: fuchsia
    animationDuration: '25s'
  }

  const blob2: CSSProperties = {
    ...blobStyle,
    top: '20%',
    right: '-20%',
    width: '60vw',
    height: '60vw',
    background: variant === 'login' ? '#0ea5e9' : '#7c3aed', // login: sky, register: violet
    animationDirection: 'alternate-reverse',
    animationDuration: '30s'
  }

  const blob3: CSSProperties = {
    ...blobStyle,
    bottom: '-20%',
    left: '20%',
    width: '40vw',
    height: '40vw',
    background: variant === 'login' ? '#6366f1' : '#db2777', // login: indigo-light, register: pink
    animationDuration: '22s'
  }

  return (
    <div style={containerStyle}>
       {/* 注入动画关键帧 */}
       <style>
        {`
          @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, 100px) scale(1.1); }
            66% { transform: translate(-50px, 50px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
        `}
      </style>
      <div style={blob1} />
      <div style={blob2} />
      <div style={blob3} />
      
      {/* 叠加一个噪点纹理增加质感 (可选) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        opacity: 0.4,
        pointerEvents: 'none'
      }} />
    </div>
  )
}

export default ParticlesBackground
