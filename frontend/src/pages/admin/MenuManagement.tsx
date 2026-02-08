import type { ColumnsType } from 'antd/es/table'

interface Menu {
  id: string
  name: string
  path: string
  icon: string
  parentId: string | null
  sort: number
  visible: boolean
  requiredRole: string | null
}

export default function MenuManagement() {
  const [menus] = useState<Menu[]>([
    {
      id: '1',
      name: '首页',
      path: '/',
      icon: 'home',
      parentId: null,
      sort: 1,
      visible: true,
      requiredRole: null
    },
    {
      id: '2',
      name: '实时追踪',
      path: '/tracking',
      icon: 'tracking',
      parentId: null,
      sort: 2,
      visible: true,
      requiredRole: null
    },
    {
      id: '3',
      name: '实时地图',
      path: '/map',
      icon: 'map',
      parentId: '2',
      sort: 1,
      visible: true,
      requiredRole: null
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [form] = Form.useForm()

  const roleMap: Record<string, { label: string; color: string }> = {
    admin: { label: '管理员', color: 'red' },
    premium: { label: '高级用户', color: 'purple' },
    user: { label: '普通用户', color: 'blue' }
  }

  const columns: ColumnsType<Menu> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Menu) => (
        <div className="flex items-center gap-2">
          {record.parentId && <span className="text-gray-400">└─</span>}
          <span className={record.parentId ? '' : 'font-medium'}>{name}</span>
        </div>
      )
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => <code className="px-2 py-1 bg-gray-100 rounded text-xs">{path}</code>
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      align: 'center'
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      align: 'center'
    },
    {
      title: '所需角色',
      dataIndex: 'requiredRole',
      key: 'requiredRole',
      render: (role: string | null) => {
        if (!role) return <span className="text-gray-400">公开</span>
        const roleInfo = roleMap[role] || { label: role, color: 'default' }
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'visible',
      key: 'visible',
      align: 'center',
      render: (visible: boolean) => (
        <Tag color={visible ? 'success' : 'default'}>{visible ? '显示' : '隐藏'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Menu) => (
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

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    form.setFieldsValue(menu)
    setDrawerOpen(true)
  }

  const handleDelete = (menu: Menu) => {
    Modal.confirm({
      title: '删除菜单',
      content: `确定要删除菜单 "${menu.name}" 吗？如果该菜单有子菜单，子菜单也将被删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingMenu(null)
    form.resetFields()
    form.setFieldsValue({ visible: true, sort: 1 })
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingMenu ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  const parentMenus = menus.filter(m => !m.parentId)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">菜单管理</h1>
          <p className="text-gray-600 mt-1">管理系统导航菜单结构</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加菜单
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={menus}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingMenu ? '编辑菜单' : '添加菜单'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {editingMenu ? '更新' : '添加'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item
            name="path"
            label="菜单路径"
            rules={[{ required: true, message: '请输入菜单路径' }]}
          >
            <Input placeholder="请输入菜单路径" />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标名称" />
          </Form.Item>

          <Form.Item name="parentId" label="父级菜单">
            <Select placeholder="无（顶级菜单）" allowClear>
              {parentMenus.map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序号' }]}
          >
            <Input type="number" placeholder="请输入排序号" />
          </Form.Item>

          <Form.Item name="requiredRole" label="所需角色">
            <Select placeholder="公开（无需登录）" allowClear>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="premium">高级用户</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="visible" label="显示状态" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
