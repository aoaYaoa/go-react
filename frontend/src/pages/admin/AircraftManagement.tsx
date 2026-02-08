import type { ColumnsType } from 'antd/es/table'

interface Aircraft {
  id: string
  registration: string
  icaoCode: string
  model: string
  manufacturer: string
  yearBuilt: number
  airlineId: string
  airlineName: string
}

export default function AircraftManagement() {
  const [aircraft] = useState<Aircraft[]>([
    {
      id: '1',
      registration: 'B-1234',
      icaoCode: 'B738',
      model: 'Boeing 737-800',
      manufacturer: 'Boeing',
      yearBuilt: 2015,
      airlineId: '1',
      airlineName: '中国国际航空'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null)
  const [form] = Form.useForm()

  const columns: ColumnsType<Aircraft> = [
    {
      title: '注册号',
      dataIndex: 'registration',
      key: 'registration',
      render: (registration: string, record: Aircraft) => (
        <div>
          <div className="font-medium">{registration}</div>
          <div className="text-xs text-gray-500">{record.icaoCode}</div>
        </div>
      )
    },
    {
      title: '机型',
      dataIndex: 'model',
      key: 'model',
      render: (model: string, record: Aircraft) => (
        <div>
          <div>{model}</div>
          <div className="text-xs text-gray-500">{record.manufacturer}</div>
        </div>
      )
    },
    {
      title: '制造年份',
      dataIndex: 'yearBuilt',
      key: 'yearBuilt',
      align: 'center'
    },
    {
      title: '所属航空公司',
      dataIndex: 'airlineName',
      key: 'airlineName'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Aircraft) => (
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

  const handleEdit = (aircraft: Aircraft) => {
    setEditingAircraft(aircraft)
    form.setFieldsValue(aircraft)
    setDrawerOpen(true)
  }

  const handleDelete = (aircraft: Aircraft) => {
    Modal.confirm({
      title: '删除飞机',
      content: `确定要删除飞机 "${aircraft.registration}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingAircraft(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingAircraft ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">飞机管理</h1>
          <p className="text-gray-600 mt-1">管理飞机注册信息和机型数据</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加飞机
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={aircraft}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingAircraft ? '编辑飞机' : '添加飞机'}
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
            name="registration"
            label="注册号"
            rules={[{ required: true, message: '请输入注册号' }]}
          >
            <Input placeholder="如 B-1234" />
          </Form.Item>

          <Form.Item
            name="icaoCode"
            label="ICAO机型代码"
            rules={[{ required: true, message: '请输入ICAO机型代码' }]}
          >
            <Input placeholder="如 B738" />
          </Form.Item>

          <Form.Item
            name="model"
            label="机型名称"
            rules={[{ required: true, message: '请输入机型名称' }]}
          >
            <Input placeholder="如 Boeing 737-800" />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="制造商"
            rules={[{ required: true, message: '请输入制造商' }]}
          >
            <Input placeholder="如 Boeing" />
          </Form.Item>

          <Form.Item
            name="yearBuilt"
            label="制造年份"
            rules={[{ required: true, message: '请输入制造年份' }]}
          >
            <Input type="number" placeholder="如 2015" />
          </Form.Item>

          <Form.Item
            name="airlineId"
            label="所属航空公司"
            rules={[{ required: true, message: '请选择航空公司' }]}
          >
            <Select placeholder="请选择航空公司">
              <Select.Option value="1">中国国际航空</Select.Option>
              <Select.Option value="2">中国东方航空</Select.Option>
              <Select.Option value="3">中国南方航空</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
