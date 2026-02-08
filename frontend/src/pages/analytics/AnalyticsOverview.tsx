import type { ColumnsType } from 'antd/es/table'

interface RouteData {
  id: string
  route: string
  flights: number
  change: number
}

const AnalyticsOverview = () => {
  const topRoutes: RouteData[] = [
    { id: '1', route: 'PEK-PVG', flights: 1234, change: 5.2 },
    { id: '2', route: 'PVG-CAN', flights: 987, change: -2.1 },
    { id: '3', route: 'PEK-CAN', flights: 856, change: 3.8 }
  ]

  const columns: ColumnsType<RouteData> = [
    {
      title: '航线',
      dataIndex: 'route',
      key: 'route'
    },
    {
      title: '航班数',
      dataIndex: 'flights',
      key: 'flights'
    },
    {
      title: '变化',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
          {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change)}%
        </span>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">数据总览</h1>
        <p className="text-gray-600">航空数据统计分析</p>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="今日航班"
              value={11234}
              suffix="架次"
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均准点率" value={89.3} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃机场" value={328} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="运营航司" value={156} suffix="家" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="热门航线 TOP 10" className="mb-6">
            <Table
              columns={columns}
              dataSource={topRoutes}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="航班趋势" className="mb-6">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 300 }}>
              <p className="text-gray-500">图表组件 - 使用 ECharts 展示趋势</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="全球航班分布热力图">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 400 }}>
              <p className="text-gray-500">地图组件 - 显示全球航班密度</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsOverview
