import type { ColumnsType } from 'antd/es/table'

interface Drone {
  id: string
  serialNumber: string
  model: string
  manufacturer: string
  category: string
  weightClass: string
  status: 'active' | 'flying' | 'maintenance' | 'retired'
  batteryLevel: number
  flightTime: number
  lastMaintenance: string
}

const DroneList = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const mockData: Drone[] = [
    {
      id: '1',
      serialNumber: 'DJI-001',
      model: 'Mavic 3',
      manufacturer: 'DJI',
      category: 'consumer',
      weightClass: 'light',
      status: 'active',
      batteryLevel: 85,
      flightTime: 120,
      lastMaintenance: '2026-01-15'
    }
  ]

  const statusColors = {
    active: 'success',
    flying: 'processing',
    maintenance: 'warning',
    retired: 'default'
  }

  const statusTexts = {
    active: '待命',
    flying: '飞行中',
    maintenance: '维护中',
    retired: '已退役'
  }

  const columns: ColumnsType<Drone> = [
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 100
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          consumer: '消费级',
          commercial: '商业级',
          industrial: '工业级'
        }
        return categoryMap[category] || category
      }
    },
    {
      title: '重量等级',
      dataIndex: 'weightClass',
      key: 'weightClass',
      width: 100,
      render: (weightClass: string) => {
        const weightMap: Record<string, string> = {
          micro: '微型',
          light: '轻型',
          small: '小型',
          medium: '中型',
          large: '大型'
        }
        return weightMap[weightClass] || weightClass
      }
    },
    {
      title: '电量',
      dataIndex: 'batteryLevel',
      key: 'batteryLevel',
      width: 100,
      render: (level: number) => (
        <span className={level < 20 ? 'text-red-500' : level < 50 ? 'text-yellow-500' : 'text-green-500'}>
          {level}%
        </span>
      )
    },
    {
      title: '飞行时长(分钟)',
      dataIndex: 'flightTime',
      key: 'flightTime',
      width: 120
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Drone['status']) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: () => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">详情</Button>
          <Button type="link" icon={<EditOutlined />} size="small">编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">删除</Button>
        </Space>
      )
    }
  ]

  const handleAdd = () => {
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      console.log('提交数据:', values)
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">设备管理</h1>
        <p className="text-gray-600">管理无人机设备信息</p>
      </div>

      <Card>
        <Space className="mb-4" size="middle">
          <Input
            placeholder="搜索序列号、型号"
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
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="active">待命</Select.Option>
            <Select.Option value="flying">飞行中</Select.Option>
            <Select.Option value="maintenance">维护中</Select.Option>
            <Select.Option value="retired">已退役</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加设备
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

      <Modal
        title="添加无人机设备"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="serialNumber" label="序列号" rules={[{ required: true }]}>
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item name="model" label="型号" rules={[{ required: true }]}>
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="manufacturer" label="制造商" rules={[{ required: true }]}>
            <Input placeholder="请输入制造商" />
          </Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select placeholder="请选择类别">
              <Select.Option value="consumer">消费级</Select.Option>
              <Select.Option value="commercial">商业级</Select.Option>
              <Select.Option value="industrial">工业级</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="weightClass" label="重量等级" rules={[{ required: true }]}>
            <Select placeholder="请选择重量等级">
              <Select.Option value="micro">微型 (&lt;250g)</Select.Option>
              <Select.Option value="light">轻型 (250g-7kg)</Select.Option>
              <Select.Option value="small">小型 (7kg-25kg)</Select.Option>
              <Select.Option value="medium">中型 (25kg-150kg)</Select.Option>
              <Select.Option value="large">大型 (&gt;150kg)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="maxFlightTime" label="最大飞行时长(分钟)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DroneList
