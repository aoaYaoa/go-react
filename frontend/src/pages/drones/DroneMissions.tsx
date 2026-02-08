import type { ColumnsType } from 'antd/es/table'

interface Mission {
  id: string
  missionName: string
  droneId: string
  missionType: string
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'emergency'
  plannedStartTime: string
  plannedEndTime: string
  progress: number
}

const DroneMissions = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const mockData: Mission[] = [
    {
      id: '1',
      missionName: '物流配送-001',
      droneId: 'DJI-001',
      missionType: 'delivery',
      status: 'in_progress',
      priority: 'high',
      plannedStartTime: '2026-02-08 10:00',
      plannedEndTime: '2026-02-08 11:00',
      progress: 65
    }
  ]

  const statusColors = {
    planned: 'default',
    approved: 'processing',
    in_progress: 'success',
    completed: 'success',
    cancelled: 'error'
  }

  const statusTexts = {
    planned: '计划中',
    approved: '已批准',
    in_progress: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }

  const priorityColors = {
    low: 'default',
    normal: 'blue',
    high: 'orange',
    emergency: 'red'
  }

  const priorityTexts = {
    low: '低',
    normal: '普通',
    high: '高',
    emergency: '紧急'
  }

  const columns: ColumnsType<Mission> = [
    {
      title: '任务名称',
      dataIndex: 'missionName',
      key: 'missionName',
      width: 150
    },
    {
      title: '无人机',
      dataIndex: 'droneId',
      key: 'droneId',
      width: 120
    },
    {
      title: '任务类型',
      dataIndex: 'missionType',
      key: 'missionType',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          delivery: '物流配送',
          inspection: '巡检',
          survey: '测绘',
          photography: '航拍',
          agriculture: '农业植保'
        }
        return typeMap[type] || type
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: Mission['priority']) => (
        <Tag color={priorityColors[priority]}>{priorityTexts[priority]}</Tag>
      )
    },
    {
      title: '计划开始',
      dataIndex: 'plannedStartTime',
      key: 'plannedStartTime',
      width: 150
    },
    {
      title: '计划结束',
      dataIndex: 'plannedEndTime',
      key: 'plannedEndTime',
      width: 150
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress: number) => `${progress}%`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Mission['status']) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'approved' && (
            <Button type="link" icon={<PlayCircleOutlined />} size="small">启动</Button>
          )}
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">任务管理</h1>
        <p className="text-gray-600">规划和管理无人机飞行任务</p>
      </div>

      <Card>
        <Space className="mb-4" size="middle">
          <Input
            placeholder="搜索任务名称"
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
            <Select.Option value="planned">计划中</Select.Option>
            <Select.Option value="approved">已批准</Select.Option>
            <Select.Option value="in_progress">执行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建任务
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
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
        title="创建飞行任务"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="missionName" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="droneId" label="选择无人机" rules={[{ required: true }]}>
            <Select placeholder="请选择无人机">
              <Select.Option value="DJI-001">DJI-001 (Mavic 3)</Select.Option>
              <Select.Option value="DJI-002">DJI-002 (Phantom 4)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="missionType" label="任务类型" rules={[{ required: true }]}>
            <Select placeholder="请选择任务类型">
              <Select.Option value="delivery">物流配送</Select.Option>
              <Select.Option value="inspection">巡检</Select.Option>
              <Select.Option value="survey">测绘</Select.Option>
              <Select.Option value="photography">航拍</Select.Option>
              <Select.Option value="agriculture">农业植保</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select placeholder="请选择优先级">
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="normal">普通</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="emergency">紧急</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="plannedStartTime" label="计划开始时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="plannedEndTime" label="计划结束时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="plannedAltitude" label="计划飞行高度(米)">
            <InputNumber min={0} max={500} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DroneMissions
