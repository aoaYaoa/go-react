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
}

export default function AirportManagement() {
  const [airports] = useState<Airport[]>([
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
      timezone: 'Asia/Shanghai'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null)
  const [form] = Form.useForm()

  const columns: ColumnsType<Airport> = [
    {
      title: '机场名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Airport) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.city}, {record.country}</div>
        </div>
      )
    },
    {
      title: '代码',
      key: 'codes',
      render: (_: any, record: Airport) => (
        <Space>
          <Tag color="blue">{record.iataCode}</Tag>
          <Tag color="green">{record.icaoCode}</Tag>
        </Space>
      )
    },
    {
      title: '位置',
      key: 'location',
      render: (_: any, record: Airport) => (
        <div className="text-sm">
          <div>{record.latitude.toFixed(4)}°N, {record.longitude.toFixed(4)}°E</div>
          <div className="text-xs text-gray-500">海拔 {record.elevation}m</div>
        </div>
      )
    },
    {
      title: '时区',
      dataIndex: 'timezone',
      key: 'timezone'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Airport) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleEdit = (airport: Airport) => {
    setEditingAirport(airport)
    form.setFieldsValue(airport)
    setDrawerOpen(true)
  }

  const handleDelete = (airport: Airport) => {
    Modal.confirm({
      title: '删除机场',
      content: `确定要删除机场 "${airport.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingAirport(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingAirport ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">机场管理</h1>
          <p className="text-gray-600 mt-1">管理全球机场基础数据</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加机场
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={airports}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingAirport ? '编辑机场' : '添加机场'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={800}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {editingAirport ? '更新' : '添加'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="机场名称"
            rules={[{ required: true, message: '请输入机场名称' }]}
          >
            <Input placeholder="请输入机场名称" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="iataCode"
              label="IATA代码"
              rules={[{ required: true, message: '请输入IATA代码' }]}
            >
              <Input placeholder="三字码，如 PEK" maxLength={3} />
            </Form.Item>

            <Form.Item
              name="icaoCode"
              label="ICAO代码"
              rules={[{ required: true, message: '请输入ICAO代码' }]}
            >
              <Input placeholder="四字码，如 ZBAA" maxLength={4} />
            </Form.Item>

            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请输入城市' }]}
            >
              <Input placeholder="请输入城市" />
            </Form.Item>

            <Form.Item
              name="country"
              label="国家"
              rules={[{ required: true, message: '请输入国家' }]}
            >
              <Input placeholder="请输入国家" />
            </Form.Item>

            <Form.Item
              name="latitude"
              label="纬度"
              rules={[{ required: true, message: '请输入纬度' }]}
            >
              <Input type="number" placeholder="如 40.0799" />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="经度"
              rules={[{ required: true, message: '请输入经度' }]}
            >
              <Input type="number" placeholder="如 116.6031" />
            </Form.Item>

            <Form.Item
              name="elevation"
              label="海拔（米）"
              rules={[{ required: true, message: '请输入海拔' }]}
            >
              <Input type="number" placeholder="请输入海拔" />
            </Form.Item>

            <Form.Item
              name="timezone"
              label="时区"
              rules={[{ required: true, message: '请输入时区' }]}
            >
              <Input placeholder="如 Asia/Shanghai" />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  )
}
