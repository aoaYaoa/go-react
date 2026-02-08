import type { ColumnsType } from 'antd/es/table'

interface Role {
  id: string
  name: string
  code: string
  description: string
  userCount: number
  createdAt: string
}

export default function RoleManagement() {
  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: '管理员',
      code: 'admin',
      description: '系统管理员，拥有所有权限',
      userCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: '高级用户',
      code: 'premium',
      description: '付费用户，享有高级功能',
      userCount: 15,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: '普通用户',
      code: 'user',
      description: '免费用户，基础功能',
      userCount: 128,
      createdAt: '2024-01-01'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.code}</div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      align: 'center',
      render: (count: number) => <Tag color="blue">{count}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<SafetyOutlined />}
            onClick={() => message.info('权限配置功能开发中')}
          >
            权限
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            disabled={record.code === 'admin'}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue(role)
    setDrawerOpen(true)
  }

  const handleDelete = (role: Role) => {
    Modal.confirm({
      title: '删除角色',
      content: `确定要删除角色 "${role.name}" 吗？删除后该角色下的用户将失去相应权限。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingRole ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">角色管理</h1>
          <p className="text-gray-600 mt-1">管理系统角色和权限配置</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingRole ? '编辑角色' : '添加角色'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {editingRole ? '更新' : '添加'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="请输入角色代码（英文）" disabled={!!editingRole} />
          </Form.Item>

          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
