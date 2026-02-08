import type { ColumnsType } from 'antd/es/table'

interface User {
  id: string
  username: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function UserManagement() {
  const [users] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@skytracker.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'add'>('add')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const roleMap: Record<string, { label: string; color: string }> = {
    admin: { label: '管理员', color: 'red' },
    premium: { label: '高级用户', color: 'purple' },
    user: { label: '普通用户', color: 'blue' }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: '正常', color: 'success' },
    disabled: { label: '禁用', color: 'default' }
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleInfo = roleMap[role] || { label: role, color: 'default' }
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="查看"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="删除"
          />
        </Space>
      )
    }
  ]

  const handleView = (user: User) => {
    setEditingUser(user)
    setDrawerMode('view')
    form.setFieldsValue(user)
    setDrawerOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDrawerMode('edit')
    form.setFieldsValue(user)
    setDrawerOpen(true)
  }

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '删除用户',
      content: `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingUser(null)
    setDrawerMode('add')
    form.resetFields()
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingUser ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>用户管理</h1>
            <p>管理系统用户账号和权限</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        </div>
      </div>

      <div className="admin-page-content">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Drawer
        title={
          drawerMode === 'view' 
            ? '查看用户' 
            : drawerMode === 'edit' 
            ? '编辑用户' 
            : '添加用户'
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
        extra={
          drawerMode !== 'view' && (
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleOk}>
                {drawerMode === 'edit' ? '更新' : '添加'}
              </Button>
            </Space>
          )
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={drawerMode === 'view'} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" disabled={drawerMode === 'view'} />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色" disabled={drawerMode === 'view'}>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="premium">高级用户</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态" disabled={drawerMode === 'view'}>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>

          {drawerMode === 'view' && (
            <Form.Item name="createdAt" label="创建时间">
              <Input disabled />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  )
}
