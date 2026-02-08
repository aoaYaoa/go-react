import type { ColumnsType } from 'antd/es/table'

interface Operator {
  id: string
  name: string
  operatorType: string
  email: string
  phone: string
  licenseNumber: string
  licenseExpiry: string
  totalDrones: number
  status: string
}

export default function OperatorManagement() {
  const [operators] = useState<Operator[]>([
    {
      id: '1',
      name: '测试运营商',
      operatorType: 'company',
      email: 'operator@example.com',
      phone: '13800138000',
      licenseNumber: 'OP-2024-001',
      licenseExpiry: '2025-12-31',
      totalDrones: 5,
      status: 'active'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [form] = Form.useForm()

  const operatorTypeMap: Record<string, { label: string; color: string }> = {
    individual: { label: '个人', color: 'cyan' },
    company: { label: '企业', color: 'blue' },
    government: { label: '政府', color: 'orange' }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: '正常', color: 'success' },
    suspended: { label: '暂停', color: 'warning' },
    revoked: { label: '吊销', color: 'error' }
  }

  const columns: ColumnsType<Operator> = [
    {
      title: '运营商名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Operator) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'operatorType',
      key: 'operatorType',
      render: (type: string) => {
        const info = operatorTypeMap[type] || { label: type, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '许可证',
      key: 'license',
      render: (_: any, record: Operator) => (
        <div>
          <div className="text-sm">{record.licenseNumber}</div>
          <div className="text-xs text-gray-500">有效期至 {record.licenseExpiry}</div>
        </div>
      )
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '无人机数量',
      dataIndex: 'totalDrones',
      key: 'totalDrones',
      align: 'center',
      render: (count: number) => <Tag color="blue">{count}</Tag>
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
      title: '操作',
      key: 'action',
      render: (_: any, record: Operator) => (
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

  const handleEdit = (operator: Operator) => {
    setEditingOperator(operator)
    form.setFieldsValue(operator)
    setDrawerOpen(true)
  }

  const handleDelete = (operator: Operator) => {
    Modal.confirm({
      title: '删除运营商',
      content: `确定要删除运营商 "${operator.name}" 吗？删除后该运营商下的所有无人机将失去关联。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingOperator(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active' })
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingOperator ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运营商管理</h1>
          <p className="text-gray-600 mt-1">管理无人机运营商资质和信息</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加运营商
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={operators}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingOperator ? '编辑运营商' : '添加运营商'}
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
              name="name"
              label="运营商名称"
              rules={[{ required: true, message: '请输入运营商名称' }]}
            >
              <Input placeholder="请输入运营商名称" />
            </Form.Item>

            <Form.Item
              name="operatorType"
              label="运营商类型"
              rules={[{ required: true, message: '请选择运营商类型' }]}
            >
              <Select placeholder="请选择运营商类型">
                <Select.Option value="individual">个人</Select.Option>
                <Select.Option value="company">企业</Select.Option>
                <Select.Option value="government">政府</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="联系电话"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>

            <Form.Item
              name="licenseNumber"
              label="许可证号"
              rules={[{ required: true, message: '请输入许可证号' }]}
            >
              <Input placeholder="请输入许可证号" />
            </Form.Item>

            <Form.Item
              name="licenseExpiry"
              label="许可证到期日期"
              rules={[{ required: true, message: '请选择到期日期' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="suspended">暂停</Select.Option>
                <Select.Option value="revoked">吊销</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} placeholder="请输入地址" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
