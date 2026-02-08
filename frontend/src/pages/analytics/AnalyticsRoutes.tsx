const { RangePicker } = DatePicker

interface RouteAnalysis {
  id: string
  departure: string
  arrival: string
  totalFlights: number
  avgDuration: number
  avgDelay: number
  onTimeRate: number
  popularAirline: string
}

const AnalyticsRoutes = () => {
  const [timeRange, setTimeRange] = useState('week')

  const mockData: RouteAnalysis[] = [
    {
      id: '1',
      departure: 'PEK',
      arrival: 'PVG',
      totalFlights: 1234,
      avgDuration: 135,
      avgDelay: 12,
      onTimeRate: 87.5,
      popularAirline: '中国国航'
    }
  ]

  const columns: ColumnsType<RouteAnalysis> = [
    {
      title: '出发',
      dataIndex: 'departure',
      key: 'departure',
      width: 100
    },
    {
      title: '到达',
      dataIndex: 'arrival',
      key: 'arrival',
      width: 100
    },
    {
      title: '航班数',
      dataIndex: 'totalFlights',
      key: 'totalFlights',
      width: 100,
      sorter: (a, b) => a.totalFlights - b.totalFlights
    },
    {
      title: '平均飞行时长(分钟)',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      width: 150
    },
    {
      title: '平均延误(分钟)',
      dataIndex: 'avgDelay',
      key: 'avgDelay',
      width: 150,
      render: (delay: number) => (
        <span className={delay > 15 ? 'text-red-500' : 'text-green-500'}>
          {delay}
        </span>
      )
    },
    {
      title: '准点率',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      width: 100,
      render: (rate: number) => `${rate}%`,
      sorter: (a, b) => a.onTimeRate - b.onTimeRate
    },
    {
      title: '主要航司',
      dataIndex: 'popularAirline',
      key: 'popularAirline',
      width: 120
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">航线分析</h1>
        <p className="text-gray-600">航线运营数据统计</p>
      </div>

      <Card>
        <Space className="mb-4" size="middle">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 150 }}
          >
            <Select.Option value="day">今日</Select.Option>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="year">本年</Select.Option>
          </Select>
          <RangePicker />
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          scroll={{ x: 900 }}
          pagination={{
            total: 100,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <Card title="航线流向图" className="mt-6">
        <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 500 }}>
          <p className="text-gray-500">地图组件 - 显示航线流向和密度</p>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsRoutes
