import type { ColumnsType } from 'antd/es/table'

interface Flight {
  id: string
  flightNumber: string
  airline: string
  aircraft: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled'
  altitude: number
  speed: number
}

const Flights = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const mockData: Flight[] = [
    {
      id: '1',
      flightNumber: 'CA1234',
      airline: '中国国航',
      aircraft: 'B737-800',
      departure: 'PEK',
      arrival: 'PVG',
      departureTime: '2026-02-08 10:00',
      arrivalTime: '2026-02-08 12:30',
      status: 'departed',
      altitude: 10000,
      speed: 850
    }
  ]

  const statusColors = {
    scheduled: 'default',
    boarding: 'processing',
    departed: 'success',
    arrived: 'success',
    delayed: 'warning',
    cancelled: 'error'
  }

  const statusTexts = {
    scheduled: '计划中',
    boarding: '登机中',
    departed: '已起飞',
    arrived: '已到达',
    delayed: '延误',
    cancelled: '取消'
  }

  const columns: ColumnsType<Flight> = [
    {
      title: '航班号',
      dataIndex: 'flightNumber',
      key: 'flightNumber',
      width: 120
    },
    {
      title: '航空公司',
      dataIndex: 'airline',
      key: 'airline',
      width: 120
    },
    {
      title: '机型',
      dataIndex: 'aircraft',
      key: 'aircraft',
      width: 100
    },
    {
      title: '出发',
      dataIndex: 'departure',
      key: 'departure',
      width: 80
    },
    {
      title: '到达',
      dataIndex: 'arrival',
      key: 'arrival',
      width: 80
    },
    {
      title: '计划起飞',
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: 150
    },
    {
      title: '计划到达',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: 150
    },
    {
      title: '高度(米)',
      dataIndex: 'altitude',
      key: 'altitude',
      width: 100,
      render: (altitude: number) => altitude.toLocaleString()
    },
    {
      title: '速度(km/h)',
      dataIndex: 'speed',
      key: 'speed',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Flight['status']) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="small">
          追踪
        </Button>
      )
    }
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">航班列表</h1>
        <p className="text-gray-600">实时查看全球航班动态</p>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="在飞航班" value={1234} suffix="架" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日起飞" value={5678} suffix="架次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日到达" value={5432} suffix="架次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="延误航班" value={123} suffix="架" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space className="mb-4" size="middle">
          <Input
            placeholder="搜索航班号、机场"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="scheduled">计划中</Select.Option>
            <Select.Option value="boarding">登机中</Select.Option>
            <Select.Option value="departed">已起飞</Select.Option>
            <Select.Option value="arrived">已到达</Select.Option>
            <Select.Option value="delayed">延误</Select.Option>
            <Select.Option value="cancelled">取消</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: 100,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
    </div>
  )
}

export default Flights
