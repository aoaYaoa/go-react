import type { ColumnsType } from 'antd/es/table'

interface Airport {
  id: string
  name: string
  iataCode: string
  icaoCode: string
  city: string
  country: string
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  runways: number
  terminals: number
}

const Airports = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')

  const mockData: Airport[] = [
    {
      id: '1',
      name: '北京首都国际机场',
      iataCode: 'PEK',
      icaoCode: 'ZBAA',
      city: '北京',
      country: '中国',
      latitude: 40.0799,
      longitude: 116.6031,
      elevation: 35,
      timezone: 'Asia/Shanghai',
      runways: 3,
      terminals: 3
    }
  ]

  const columns: ColumnsType<Airport> = [
    {
      title: '机场名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'IATA',
      dataIndex: 'iataCode',
      key: 'iataCode',
      width: 80,
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'ICAO',
      dataIndex: 'icaoCode',
      key: 'icaoCode',
      width: 80,
      render: (code: string) => <Tag color="green">{code}</Tag>
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 120
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100
    },
    {
      title: '经纬度',
      key: 'coordinates',
      width: 180,
      render: (_, record) => (
        <span>
          {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
        </span>
      )
    },
    {
      title: '海拔(米)',
      dataIndex: 'elevation',
      key: 'elevation',
      width: 100
    },
    {
      title: '跑道数',
      dataIndex: 'runways',
      key: 'runways',
      width: 80
    },
    {
      title: '航站楼',
      dataIndex: 'terminals',
      key: 'terminals',
      width: 80
    },
    {
      title: '时区',
      dataIndex: 'timezone',
      key: 'timezone',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: () => (
        <Space>
          <Button type="link" icon={<EnvironmentOutlined />} size="small">
            地图
          </Button>
          <Button type="link" icon={<EyeOutlined />} size="small">
            详情
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">机场信息</h1>
        <p className="text-gray-600">全球机场数据查询</p>
      </div>

      <Card>
        <Space className="mb-4" size="middle">
          <Input
            placeholder="搜索机场名称、代码"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="国家筛选"
            value={countryFilter}
            onChange={setCountryFilter}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">全部国家</Select.Option>
            <Select.Option value="CN">中国</Select.Option>
            <Select.Option value="US">美国</Select.Option>
            <Select.Option value="JP">日本</Select.Option>
          </Select>
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

export default Airports
