

const DroneMap = () => {
  const [mapStyle, setMapStyle] = useState('satellite')
  const [droneFilter, setDroneFilter] = useState('all')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">无人机地图</h1>
        <p className="text-gray-600">实时追踪无人机位置</p>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="在飞无人机" value={45} suffix="架" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="执行任务" value={32} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待命设备" value={128} suffix="架" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="禁飞区" value={15} suffix="个" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space className="mb-4" size="middle">
          <Select
            value={mapStyle}
            onChange={setMapStyle}
            style={{ width: 150 }}
          >
            <Select.Option value="satellite">卫星图</Select.Option>
            <Select.Option value="street">街道图</Select.Option>
            <Select.Option value="terrain">地形图</Select.Option>
          </Select>
          <Select
            value={droneFilter}
            onChange={setDroneFilter}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">全部无人机</Select.Option>
            <Select.Option value="flying">飞行中</Select.Option>
            <Select.Option value="idle">待命</Select.Option>
            <Select.Option value="maintenance">维护中</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button icon={<FullscreenOutlined />}>全屏</Button>
        </Space>

        <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 600 }}>
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">地图组件</p>
            <p className="text-sm">集成 Mars3D 或 Mapbox 显示无人机实时位置</p>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm">飞行中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm">待命</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">维护中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm">禁飞区</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DroneMap
