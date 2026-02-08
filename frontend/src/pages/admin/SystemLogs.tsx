import type { ColumnsType } from 'antd/es/table'

interface SystemLog {
  id: string
  timestamp: string
  level: string
  module: string
  action: string
  user: string
  ip: string
  message: string
}

export default function SystemLogs() {
  const [logs] = useState<SystemLog[]>([
    {
      id: '1',
      timestamp: '2024-02-08 10:30:25',
      level: 'info',
      module: 'user',
      action: 'login',
      user: 'admin',
      ip: '192.168.1.100',
      message: '用户登录成功'
    },
    {
      id: '2',
      timestamp: '2024-02-08 10:28:15',
      level: 'warning',
      module: 'drone',
      action: 'update',
      user: 'operator1',
      ip: '192.168.1.101',
      message: '无人机状态更新：电量低于20%'
    },
    {
      id: '3',
      timestamp: '2024-02-08 10:25:10',
      level: 'error',
      module: 'api',
      action: 'request',
      user: 'system',
      ip: '192.168.1.102',
      message: 'API请求失败：连接超时'
    }
  ])
  const [loading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const levelMap: Record<string, { label: string; color: string }> = {
    debug: { label: 'DEBUG', color: 'default' },
    info: { label: 'INFO', color: 'cyan' },
    warning: { label: 'WARNING', color: 'orange' },
    error: { label: 'ERROR', color: 'red' },
    critical: { label: 'CRITICAL', color: 'red' }
  }

  const columns: ColumnsType<SystemLog> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time: string) => <span className="font-mono text-sm">{time}</span>
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      render: (level: string) => {
        const info = levelMap[level] || { label: level.toUpperCase(), color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-xs">{module}</code>
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip: string) => <span className="font-mono text-sm">{ip}</span>
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message'
    }
  ]

  const handleSearch = (value: string) => {
    console.log('搜索:', value)
  }

  const filteredLogs = selectedLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLevel)

  const infoCount = logs.filter(l => l.level === 'info').length
  const warningCount = logs.filter(l => l.level === 'warning').length
  const errorCount = logs.filter(l => l.level === 'error').length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">系统日志</h1>
        <p className="text-gray-600 mt-1">查看系统运行日志和操作记录</p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Input.Search
          placeholder="搜索日志内容、用户、IP..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ flex: 1 }}
        />

        <Select
          value={selectedLevel}
          onChange={setSelectedLevel}
          style={{ width: 150 }}
          options={[
            { value: 'all', label: '全部级别' },
            { value: 'debug', label: 'DEBUG' },
            { value: 'info', label: 'INFO' },
            { value: 'warning', label: 'WARNING' },
            { value: 'error', label: 'ERROR' },
            { value: 'critical', label: 'CRITICAL' }
          ]}
        />

        <Button icon={<DownloadOutlined />}>
          导出日志
        </Button>
      </div>

      <Alert
        message={
          <Space size="large">
            <span>共 {filteredLogs.length} 条日志记录</span>
            <span>INFO: {infoCount}</span>
            <span>WARNING: {warningCount}</span>
            <span>ERROR: {errorCount}</span>
          </Space>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      <Table
        columns={columns}
        dataSource={filteredLogs}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}
