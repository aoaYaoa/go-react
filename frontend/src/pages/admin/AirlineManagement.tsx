import type { ColumnsType } from 'antd/es/table'

interface Airline {
  id: string
  name: string
  iataCode: string
  icaoCode: string
  callsign: string
  country: string
  logoUrl: string
}

export default function AirlineManagement() {
  const [airlines] = useState<Airline[]>([
    {
      id: '1',
      name: '中国国际航空',
      iataCode: 'CA',
      icaoCode: 'CCA',
      callsign: 'AIR CHINA',
      country: '中国',
      logoUrl: ''
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null)
  const [form] = Form.useForm()

  const columns: ColumnsType<Airline> = [
    {
      title: '航空公司',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Airline) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} src={record.logoUrl} style={{ backgroundColor: '#f0f0f0' }}>
            {name.substring(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{record.country}</div>
          </div>
        </div>
      )
    },
    {
      title: '代码',
      key: 'codes',
      render: (_: any, record: Airline) => (
        <Space>
          <Tag color="blue">{record.iataCode}</Tag>
          <Tag color="green">{record.icaoCode}</Tag>
        </Space>
      )
    },
    {
      title: '呼号',
      dataIndex: 'callsign',
      key: 'callsign'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Airline) => (
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

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline)
    form.setFieldsValue(airline)
    setDrawerOpen(true)
  }

  const handleDelete = (airline: Airline) => {
    Modal.confirm({
      title: '删除航空公司',
      content: `确定要删除航空公司 "${airline.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingAirline(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingAirline ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">航空公司管理</h1>
          <p className="text-gray-600 mt-1">管理全球航空公司基础数据</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加航空公司
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={airlines}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingAirline ? '编辑航空公司' : '添加航空公司'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {editingAirline ? '更新' : '添加'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="航空公司名称"
            rules={[{ required: true, message: '请输入航空公司名称' }]}
          >
            <Input placeholder="请输入航空公司名称" />
          </Form.Item>

          <Form.Item
            name="iataCode"
            label="IATA代码"
            rules={[{ required: true, message: '请输入IATA代码' }]}
          >
            <Input placeholder="二字码，如 CA" maxLength={2} />
          </Form.Item>

          <Form.Item
            name="icaoCode"
            label="ICAO代码"
            rules={[{ required: true, message: '请输入ICAO代码' }]}
          >
            <Input placeholder="三字码，如 CCA" maxLength={3} />
          </Form.Item>

          <Form.Item
            name="callsign"
            label="呼号"
            rules={[{ required: true, message: '请输入呼号' }]}
          >
            <Input placeholder="请输入呼号" />
          </Form.Item>

          <Form.Item
            name="country"
            label="国家"
            rules={[{ required: true, message: '请输入国家' }]}
          >
            <Input placeholder="请输入国家" />
          </Form.Item>

          <Form.Item name="logoUrl" label="Logo URL">
            <Input placeholder="请输入Logo图片URL" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
