import { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react'

interface MapContextType {
  map: any | null
  mapContainer: HTMLDivElement | null
  isMapReady: boolean
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const useMap = () => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}

interface MapProviderProps {
  children: ReactNode
}

export function MapProvider({ children }: MapProviderProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // 动态导入 mars3d
    import('mars3d').then((mars3d) => {
      if (!mapContainerRef.current) return

      // 最简化的地图配置 - 只使用在线地图服务
      const mapOptions = {
        scene: {
          center: { lat: 30.0, lng: 120.0, alt: 15000000, heading: 0, pitch: -90 }
        },
        basemaps: [
          {
            name: '在线地图',
            type: 'xyz',
            url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            show: true
          }
        ]
      }

      try {
        // 创建地图实例
        const map = new mars3d.Map(mapContainerRef.current, mapOptions)
        mapRef.current = map

        // 地图加载完成
        map.on(mars3d.EventType.load, () => {
          console.log('地图加载成功')
          setIsMapReady(true)
        })

      } catch (error) {
        console.error('地图初始化失败:', error)
      }
    }).catch(error => {
      console.error('Mars3D 加载失败:', error)
    })

    // 清理函数
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.destroy()
        } catch (e) {
          console.error('地图销毁失败:', e)
        }
        mapRef.current = null
        setIsMapReady(false)
      }
    }
  }, [])

  return (
    <MapContext.Provider
      value={{
        map: mapRef.current,
        mapContainer: mapContainerRef.current,
        isMapReady
      }}
    >
      <div className="relative w-full h-full">
        {/* 地图容器 */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        />
        {/* 子组件内容层 */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="pointer-events-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </MapContext.Provider>
  )
}
