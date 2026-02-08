import { useEffect, useRef, useState } from 'react'
import { Card, Space, Button, message } from 'antd'

/**
 * 地图页面
 * 展示 3D 地球和天地图图层
 */
function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    // 延迟初始化，确保之前的实例有时间销毁
    const initTimer = setTimeout(() => {
        if (!isMounted) return
        if (mapRef.current) return // 防止重复初始化

        import('mars3d').then((mars3d) => {
            if (!isMounted || !mapContainerRef.current) return

            // 如果已有实例（极端情况），先销毁
            if (mapRef.current) {
                mapRef.current.destroy()
                mapRef.current = null
            }

            console.log('开始初始化地图...')
            
            const TDT_TOKEN = '6f824845e03e82cf0e679e704a44c5a3'
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapOptions: any = {
                scene: {
                center: { lat: 39.9, lng: 116.4, alt: 500000, heading: 0, pitch: -60 },
                contextOptions: {
                    webgl: {
                        preserveDrawingBuffer: false,
                        failIfMajorPerformanceCaveat: false
                    }
                }
                },
                control: {
                    baseLayerPicker: false, // ... (keeping existing clean options)
                    sceneModePicker: false,
                    navigationHelpButton: false,
                    animation: false,
                    timeline: false,
                    fullscreenButton: false,
                    vrButton: false,
                    homeButton: false,
                    geocoder: false,
                    infoBox: false,
                    selectionIndicator: false,
                    creditContainer: undefined
                },
                basemaps: [
                {
                    name: '天地图影像',
                    type: 'group',
                    layers: [
                    { name: '底图', type: 'tdt', layer: 'img_d', key: [TDT_TOKEN] },
                    { name: '注记', type: 'tdt', layer: 'img_z', key: [TDT_TOKEN] }
                    ],
                    show: true
                }
                ],
                terrain: false
            }

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const map = new mars3d.Map(mapContainerRef.current as any, mapOptions)
                
                if (!isMounted) {
                    console.warn('组件已卸载，立即销毁新创建的地图实例')
                    map.destroy()
                    return
                }

                mapRef.current = map

                // UI 清理
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const viewer = map.viewer as any
                if (viewer?.cesiumWidget?.creditContainer) {
                    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none'
                }
                
                // 地图加载完成事件
                map.on(mars3d.EventType.load, () => {
                    if (!isMounted) return
                    setIsMapReady(true)
                    console.log('Mars3D 地图加载成功')
                })

            } catch (error) {
                console.error('地图初始化严重错误:', error)
                message.error('地图启动失败，请刷新页面重试')
            }
        }).catch(err => {
            console.error('Mars3D 模块加载失败:', err)
        })
    }, 100) // 100ms 延迟

    return () => {
        isMounted = false
        clearTimeout(initTimer)
        if (mapRef.current) {
            console.log('清理地图实例...')
            try {
                mapRef.current.destroy()
            } catch (e) {
                console.error('销毁地图实例出错:', e)
            }
            mapRef.current = null
            setIsMapReady(false)
        }
    }
  }, [])

  // 飞行到指定位置
  const flyToLocation = (lat: number, lng: number, alt: number, name: string) => {
    if (!mapRef.current) return
    
    mapRef.current.flyToPoint({
      lat,
      lng,
      alt,
      heading: 0,
      pitch: -45,
      duration: 2
    })
    
    message.info(`飞行到 ${name}`)
  }

  return (
    <div className="h-full w-full relative">
      {/* 地图容器 */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* 左侧控制面板 */}
      <Card
        className="absolute left-4 top-4 z-10 w-80"
        title="地图控制"
        size="small"
      >
        <Space orientation="vertical" className="w-full">
          <div className="text-sm text-gray-600">
            {isMapReady ? (
              <span className="text-green-600">地图已就绪</span>
            ) : (
              <span className="text-orange-600">地图加载中...</span>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">快速定位</div>
            <Space orientation="vertical" className="w-full">
              <Button
                block
                onClick={() => flyToLocation(39.9042, 116.4074, 100000, '北京')}
                disabled={!isMapReady}
              >
                北京
              </Button>
              <Button
                block
                onClick={() => flyToLocation(31.2304, 121.4737, 100000, '上海')}
                disabled={!isMapReady}
              >
                上海
              </Button>
              <Button
                block
                onClick={() => flyToLocation(22.5431, 114.0579, 100000, '深圳')}
                disabled={!isMapReady}
              >
                深圳
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default MapPage
