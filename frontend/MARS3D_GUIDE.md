# Mars3D 集成指南

## 一、Mars3D 简介

Mars3D 是基于 Cesium 进行二次封装的三维地球框架，专为国内开发者设计。

### 优势
- 中文文档和 API
- 开箱即用的功能
- 支持国内地图服务（天地图、高德、百度）
- 丰富的示例代码
- 活跃的社区支持

### 官方资源
- 官网: http://mars3d.cn/
- 文档: http://mars3d.cn/doc.html
- 示例: http://mars3d.cn/example.html
- GitHub: https://github.com/marsgis/mars3d

---

## 二、安装配置

### 1. 安装依赖

```bash
cd frontend

# 安装 Mars3D
npm install mars3d

# 安装类型定义（如果有）
npm install @types/mars3d -D
```

### 2. Vite 配置

更新 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Mars3D 需要的配置
  optimizeDeps: {
    include: ['mars3d']
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'mars3d': ['mars3d']
        }
      }
    }
  }
})
```

### 3. 引入样式

在 `src/main.tsx` 中引入 Mars3D 样式:

```typescript
import 'mars3d/mars3d.css'
```

---

## 三、基础组件开发

### 1. 创建 Map3D 组件

`src/components/Map3D/index.tsx`:

```typescript
import { useEffect, useRef } from 'react'
import * as mars3d from 'mars3d'

interface Map3DProps {
  onMapReady?: (map: mars3d.Map) => void
  options?: mars3d.MapOptions
}

function Map3D({ onMapReady, options }: Map3DProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mars3d.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // 默认配置
    const defaultOptions: mars3d.MapOptions = {
      scene: {
        center: { lat: 30.054604, lng: 108.885436, alt: 17036414, heading: 0, pitch: -90 },
        showSun: true,
        showMoon: true,
        showSkyBox: true,
        showSkyAtmosphere: true,
        fog: true,
        fxaa: true,
        globe: {
          depthTestAgainstTerrain: false,
          baseColor: '#546a53',
          showGroundAtmosphere: true,
          enableLighting: false
        }
      },
      control: {
        baseLayerPicker: true,
        sceneModePicker: true,
        vrButton: false,
        fullscreenButton: true,
        navigationHelpButton: true,
        animation: false,
        timeline: false,
        infoBox: false,
        geocoder: false,
        homeButton: true,
        selectionIndicator: false,
        creditContainer: undefined
      },
      terrain: {
        url: 'http://data.mars3d.cn/terrain',
        show: true
      },
      basemaps: [
        {
          name: '天地图影像',
          icon: 'img/basemaps/tdt_img.png',
          type: 'tdt',
          layer: 'img_d',
          show: true
        },
        {
          name: '天地图电子',
          icon: 'img/basemaps/tdt_vec.png',
          type: 'tdt',
          layer: 'vec_d'
        },
        {
          name: '高德影像',
          icon: 'img/basemaps/gaode_img.png',
          type: 'gaode',
          layer: 'img_d'
        }
      ],
      ...options
    }

    // 创建地图
    const map = new mars3d.Map(mapContainerRef.current, defaultOptions)
    mapRef.current = map

    // 地图加载完成回调
    map.on(mars3d.EventType.load, () => {
      console.log('Mars3D 地图加载完成')
      onMapReady?.(map)
    })

    // 清理函数
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full"
      style={{ position: 'relative' }}
    />
  )
}

export default Map3D
```

### 2. 创建地图页面

`src/pages/Map.tsx`:

```typescript
import { useState } from 'react'
import * as mars3d from 'mars3d'
import Map3D from '../components/Map3D'

function MapPage() {
  const [map, setMap] = useState<mars3d.Map | null>(null)

  const handleMapReady = (mapInstance: mars3d.Map) => {
    setMap(mapInstance)
    console.log('地图实例已准备好:', mapInstance)
    
    // 可以在这里添加图层、标注等
  }

  return (
    <div className="h-screen w-full">
      <Map3D onMapReady={handleMapReady} />
    </div>
  )
}

export default MapPage
```

---

## 四、常用功能示例

### 1. 添加点标注

```typescript
// 添加机场标注
const addAirportMarker = (map: mars3d.Map, airport: Airport) => {
  const graphic = new mars3d.graphic.BillboardEntity({
    position: [airport.longitude, airport.latitude, 0],
    style: {
      image: '/icons/airport.png',
      scale: 1,
      horizontalOrigin: mars3d.HorizontalOrigin.CENTER,
      verticalOrigin: mars3d.VerticalOrigin.BOTTOM,
      label: {
        text: airport.name,
        font_size: 18,
        color: '#ffffff',
        outline: true,
        outlineColor: '#000000',
        outlineWidth: 2,
        horizontalOrigin: mars3d.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.VerticalOrigin.BOTTOM,
        pixelOffsetY: -50
      }
    },
    attr: airport
  })

  // 添加点击事件
  graphic.on(mars3d.EventType.click, (event: any) => {
    console.log('点击了机场:', event.graphic.attr)
  })

  map.graphicLayer.addGraphic(graphic)
  return graphic
}
```

### 2. 添加飞行航线

```typescript
// 绘制航线
const addFlightPath = (map: mars3d.Map, path: [number, number][]) => {
  const graphic = new mars3d.graphic.PolylineEntity({
    positions: path,
    style: {
      width: 3,
      color: '#00ff00',
      opacity: 0.8,
      clampToGround: false
    }
  })

  map.graphicLayer.addGraphic(graphic)
  return graphic
}
```

### 3. 添加飞机模型

```typescript
// 添加飞机3D模型
const addAircraftModel = (
  map: mars3d.Map, 
  position: [number, number, number],
  heading: number
) => {
  const graphic = new mars3d.graphic.ModelEntity({
    position: position,
    style: {
      url: '/models/aircraft.glb',
      scale: 100,
      minimumPixelSize: 50,
      heading: heading,
      pitch: 0,
      roll: 0
    }
  })

  map.graphicLayer.addGraphic(graphic)
  return graphic
}
```

### 4. 飞行动画

```typescript
// 飞机沿航线飞行动画
const animateAircraft = (
  map: mars3d.Map,
  graphic: mars3d.graphic.ModelEntity,
  path: [number, number, number][],
  duration: number
) => {
  // 创建路径
  const property = new mars3d.graphic.PathProperty({
    positions: path,
    duration: duration,
    loop: false
  })

  // 绑定到模型
  graphic.position = property

  // 开始动画
  property.start()
}
```

### 5. 测量工具

```typescript
// 距离测量
const measureDistance = (map: mars3d.Map) => {
  map.graphicLayer.startDraw({
    type: 'polyline',
    style: {
      color: '#ffff00',
      width: 3
    },
    success: (graphic: any) => {
      const distance = graphic.distance
      console.log('测量距离:', distance, '米')
    }
  })
}

// 面积测量
const measureArea = (map: mars3d.Map) => {
  map.graphicLayer.startDraw({
    type: 'polygon',
    style: {
      color: '#00ffff',
      opacity: 0.5
    },
    success: (graphic: any) => {
      const area = graphic.area
      console.log('测量面积:', area, '平方米')
    }
  })
}
```

---

## 五、性能优化

### 1. 图层管理

```typescript
// 创建分组图层
const createLayerGroup = (map: mars3d.Map) => {
  // 机场图层
  const airportLayer = new mars3d.layer.GraphicLayer({
    name: '机场',
    pid: 100
  })
  map.addLayer(airportLayer)

  // 航班图层
  const flightLayer = new mars3d.layer.GraphicLayer({
    name: '航班',
    pid: 101
  })
  map.addLayer(flightLayer)

  // 无人机图层
  const droneLayer = new mars3d.layer.GraphicLayer({
    name: '无人机',
    pid: 102
  })
  map.addLayer(droneLayer)

  return { airportLayer, flightLayer, droneLayer }
}
```

### 2. 聚合显示

```typescript
// 点聚合（大量标注时使用）
const createClusterLayer = (map: mars3d.Map) => {
  const clusterLayer = new mars3d.layer.GraphicLayer({
    clustering: {
      enabled: true,
      pixelRange: 50,
      minimumClusterSize: 3
    }
  })
  map.addLayer(clusterLayer)
  return clusterLayer
}
```

### 3. LOD 控制

```typescript
// 根据视角距离显示不同详细程度
const addLODGraphic = (map: mars3d.Map, position: [number, number]) => {
  const graphic = new mars3d.graphic.BillboardEntity({
    position: position,
    style: {
      image: '/icons/marker.png',
      distanceDisplayCondition: new mars3d.DistanceDisplayCondition(0, 100000)
    }
  })
  map.graphicLayer.addGraphic(graphic)
}
```

---

## 六、类型定义

创建 `src/types/mars3d.d.ts`:

```typescript
declare module 'mars3d' {
  export interface MapOptions {
    scene?: any
    control?: any
    terrain?: any
    basemaps?: any[]
    layers?: any[]
  }

  export class Map {
    constructor(container: HTMLElement, options: MapOptions)
    on(type: string, callback: Function): void
    off(type: string, callback: Function): void
    destroy(): void
    graphicLayer: any
    addLayer(layer: any): void
    removeLayer(layer: any): void
    flyTo(options: any): void
  }

  export namespace graphic {
    export class BillboardEntity {
      constructor(options: any)
      position: any
      on(type: string, callback: Function): void
    }

    export class ModelEntity {
      constructor(options: any)
      position: any
    }

    export class PolylineEntity {
      constructor(options: any)
    }

    export class PathProperty {
      constructor(options: any)
      start(): void
      stop(): void
    }
  }

  export namespace layer {
    export class GraphicLayer {
      constructor(options?: any)
      addGraphic(graphic: any): void
      removeGraphic(graphic: any): void
      clear(): void
      startDraw(options: any): void
    }
  }

  export enum EventType {
    load = 'load',
    click = 'click',
    dblClick = 'dblClick',
    mouseMove = 'mouseMove'
  }

  export enum HorizontalOrigin {
    CENTER = 0,
    LEFT = 1,
    RIGHT = 2
  }

  export enum VerticalOrigin {
    CENTER = 0,
    BOTTOM = 1,
    TOP = 2
  }

  export class DistanceDisplayCondition {
    constructor(near: number, far: number)
  }
}
```

---

## 七、注意事项

### 1. 许可证
- Mars3D 基础版免费
- 商业使用需要购买授权
- 详见: http://mars3d.cn/doc.html#buy

### 2. 资源加载
- 地形数据、影像数据需要配置正确的服务地址
- 可以使用 Mars3D 提供的测试服务
- 生产环境建议自建服务

### 3. 性能考虑
- 大量标注使用聚合
- 合理使用 LOD
- 及时清理不需要的图层
- 避免频繁创建销毁对象

### 4. 浏览器兼容性
- 推荐使用 Chrome、Edge、Firefox 最新版
- 需要 WebGL 支持
- 移动端性能可能受限

---

## 八、参考资源

- [Mars3D 官方文档](http://mars3d.cn/doc.html)
- [Mars3D API 文档](http://mars3d.cn/api/)
- [Mars3D 示例中心](http://mars3d.cn/example.html)
- [Mars3D GitHub](https://github.com/marsgis/mars3d)
- [Cesium 官方文档](https://cesium.com/docs/)
