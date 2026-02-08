import type { ColumnsType } from 'antd/es/table'

interface Drone {
  id: string
  serialNumber: string
  model: string
  manufacturer: string
  category: string
  weightClass: string
  status: string
  operatorName: string
}

export default function DroneManagement() {
  const [drones] = useState<Drone[]>([
    {
      id: '1',
      serialNumber: 'DJI-001',
      model: 'Mavic 3',
      manufacturer: 'DJI',
      category: 'commercial',
      weightClass: 'light',
      status: 'active',
      operatorName: '测试运营商'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null)
  const [form] = Form.useForm()

  const categoryMap: Record<string, { label: string; color: string }> = {
    consumer: { label: '消费级', color: 'cyan' },
    commercial: { label: '商业级', color: 'blue' },
    industrial: { label: '工业级', color: 'orange' },
    military: { label: '军用', color: 'red' }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: '正常', color: 'success' },
    maintenance: { label: '维护中', color: 'warning' },
    retired: { label: '已退役', color: 'default' },
    lost: { label: '丢失', color: 'error' }
  }

  const columns: ColumnsType<Drone> = [
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (sn: string, record: Drone) => (
        <div>
          <div className="font-medium">{sn}</div>
          <div className="text-xs text-gray-500">{record.model}</div>
        </div>
      )
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const info = categoryMap[category] || { label: category, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '重量等级',
      dataIndex: 'weightClass',
      key: 'weightClass',
      render: (wc: string) => {
        const map: Record<string, string> = {
          micro: '微型',
          light: '轻型',
          small: '小型',
          medium: '中型',
          large: '大型'
        }
        return map[wc] || wc
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '运营商',
      dataIndex: 'operatorName',
      key: 'operatorName'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Drone) => (
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

  const handleEdit = (drone: Drone) => {
    setEditingDrone(drone)
    form.setFieldsValue(drone)
    setDrawerOpen(true)
  }

  const handleDelete = (drone: Drone) => {
    Modal.confirm({
      title: '删除无人机',
      content: `确定要删除无人机 "${drone.serialNumber}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingDrone(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingDrone ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">无人机管理</h1>
          <p className="text-gray-600 mt-1">管理无人机设备注册和基础信息</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加无人机
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={drones}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingDrone ? '编辑无人机' : '添加无人机'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={800}
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
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="serialNumber"
              label="序列号"
              rules={[{ required: true, message: '请输入序列号' }]}
            >
              <Input placeholder="请输入序列号" />
            </Form.Item>

            <Form.Item
              name="model"
              label="型号"
              rules={[{ required: true, message: '请输入型号' }]}
            >
              <Input placeholder="如 Mavic 3" />
            </Form.Item>

            <Form.Item
              name="manufacturer"
              label="制造商"
              rules={[{ required: true, message: '请输入制造商' }]}
            >
              <Input placeholder="如 DJI" />
            </Form.Item>

            <Form.Item
              name="category"
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Select placeholder="请选择类型">
                <Select.Option value="consumer">消费级</Select.Option>
                <Select.Option value="commercial">商业级</Select.Option>
                <Select.Option value="industrial">工业级</Select.Option>
                <Select.Option value="military">军用</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weightClass"
              label="重量等级"
              rules={[{ required: true, message: '请选择重量等级' }]}
            >
              <Select placeholder="请选择重量等级">
                <Select.Option value="micro">微型(&lt;250g)</Select.Option>
                <Select.Option value="light">轻型(250g-7kg)</Select.Option>
                <Select.Option value="small">小型(7kg-25kg)</Select.Option>
                <Select.Option value="medium">中型(25kg-150kg)</Select.Option>
                <Select.Option value="large">大型(&gt;150kg)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="maintenance">维护中</Select.Option>
                <Select.Option value="retired">已退役</Select.Option>
                <Select.Option value="lost">丢失</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
