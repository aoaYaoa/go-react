import type { ColumnsType } from 'antd/es/table'

interface NoFlyZone {
  id: string
  name: string
  zoneType: string
  restrictionLevel: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  isPermanent: boolean
  status: string
}

export default function NoFlyZoneManagement() {
  const [zones] = useState<NoFlyZone[]>([
    {
      id: '1',
      name: '首都机场禁飞区',
      zoneType: 'airport',
      restrictionLevel: 'prohibited',
      centerLatitude: 40.0799,
      centerLongitude: 116.6031,
      radius: 5000,
      isPermanent: true,
      status: 'active'
    }
  ])
  const [loading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<NoFlyZone | null>(null)
  const [form] = Form.useForm()

  const zoneTypeMap: Record<string, { label: string; color: string }> = {
    airport: { label: '机场', color: 'blue' },
    military: { label: '军事', color: 'red' },
    government: { label: '政府', color: 'orange' },
    prison: { label: '监狱', color: 'red' },
    power_plant: { label: '电厂', color: 'orange' },
    event: { label: '活动', color: 'cyan' }
  }

  const restrictionLevelMap: Record<string, { label: string; color: string }> = {
    prohibited: { label: '禁飞', color: 'error' },
    restricted: { label: '限飞', color: 'warning' },
    warning: { label: '警告', color: 'default' }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: '生效中', color: 'success' },
    inactive: { label: '已失效', color: 'default' }
  }

  const columns: ColumnsType<NoFlyZone> = [
    {
      title: '禁飞区名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: NoFlyZone) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            {record.centerLatitude.toFixed(4)}°N, {record.centerLongitude.toFixed(4)}°E
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'zoneType',
      key: 'zoneType',
      render: (type: string) => {
        const info = zoneTypeMap[type] || { label: type, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '限制等级',
      dataIndex: 'restrictionLevel',
      key: 'restrictionLevel',
      render: (level: string) => {
        const info = restrictionLevelMap[level] || { label: level, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '半径',
      dataIndex: 'radius',
      key: 'radius',
      align: 'center',
      render: (radius: number) => `${radius}m`
    },
    {
      title: '时效',
      dataIndex: 'isPermanent',
      key: 'isPermanent',
      align: 'center',
      render: (isPermanent: boolean) => (
        <Tag color={isPermanent ? 'blue' : 'orange'}>{isPermanent ? '永久' : '临时'}</Tag>
      )
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
      render: (_: any, record: NoFlyZone) => (
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

  const handleEdit = (zone: NoFlyZone) => {
    setEditingZone(zone)
    form.setFieldsValue(zone)
    setDrawerOpen(true)
  }

  const handleDelete = (zone: NoFlyZone) => {
    Modal.confirm({
      title: '删除禁飞区',
      content: `确定要删除禁飞区 "${zone.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      }
    })
  }

  const handleAdd = () => {
    setEditingZone(null)
    form.resetFields()
    form.setFieldsValue({ isPermanent: true, status: 'active' })
    setDrawerOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingZone ? '更新成功' : '添加成功')
      setDrawerOpen(false)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">禁飞区管理</h1>
          <p className="text-gray-600 mt-1">管理无人机禁飞区和限飞区域</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加禁飞区
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={zones}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={editingZone ? '编辑禁飞区' : '添加禁飞区'}
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
          <Form.Item
            name="name"
            label="禁飞区名称"
            rules={[{ required: true, message: '请输入禁飞区名称' }]}
          >
            <Input placeholder="请输入禁飞区名称" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="zoneType"
              label="区域类型"
              rules={[{ required: true, message: '请选择区域类型' }]}
            >
              <Select placeholder="请选择区域类型">
                <Select.Option value="airport">机场</Select.Option>
                <Select.Option value="military">军事</Select.Option>
                <Select.Option value="government">政府</Select.Option>
                <Select.Option value="prison">监狱</Select.Option>
                <Select.Option value="power_plant">电厂</Select.Option>
                <Select.Option value="event">活动</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="restrictionLevel"
              label="限制等级"
              rules={[{ required: true, message: '请选择限制等级' }]}
            >
              <Select placeholder="请选择限制等级">
                <Select.Option value="prohibited">禁飞</Select.Option>
                <Select.Option value="restricted">限飞</Select.Option>
                <Select.Option value="warning">警告</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="centerLatitude"
              label="中心纬度"
              rules={[{ required: true, message: '请输入中心纬度' }]}
            >
              <Input type="number" placeholder="如 40.0799" />
            </Form.Item>

            <Form.Item
              name="centerLongitude"
              label="中心经度"
              rules={[{ required: true, message: '请输入中心经度' }]}
            >
              <Input type="number" placeholder="如 116.6031" />
            </Form.Item>

            <Form.Item
              name="radius"
              label="半径(米)"
              rules={[{ required: true, message: '请输入半径' }]}
            >
              <Input type="number" placeholder="请输入半径" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">生效中</Select.Option>
                <Select.Option value="inactive">已失效</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="isPermanent" label="时效类型" valuePropName="checked">
            <Switch checkedChildren="永久" unCheckedChildren="临时" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入禁飞区描述" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
