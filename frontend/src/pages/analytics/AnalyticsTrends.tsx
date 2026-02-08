const AnalyticsTrends = () => {
  const [metric, setMetric] = useState('flights')
  const [period, setPeriod] = useState('month')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">趋势分析</h1>
        <p className="text-gray-600">航空数据趋势预测</p>
      </div>

      <Card className="mb-6">
        <Space size="middle">
          <Select value={metric} onChange={setMetric} style={{ width: 150 }}>
            <Select.Option value="flights">航班数量</Select.Option>
            <Select.Option value="delay">延误率</Select.Option>
            <Select.Option value="ontime">准点率</Select.Option>
            <Select.Option value="passengers">客流量</Select.Option>
          </Select>
          <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
            <Select.Option value="week">按周</Select.Option>
            <Select.Option value="month">按月</Select.Option>
            <Select.Option value="quarter">按季度</Select.Option>
            <Select.Option value="year">按年</Select.Option>
          </Select>
        </Space>
      </Card>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="环比增长"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="同比增长"
              value={9.3}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="预测增长"
              value={-2.8}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="趋势图表" className="mb-6">
        <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 400 }}>
          <p className="text-gray-500">图表组件 - 使用 ECharts 展示时间序列趋势</p>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="季节性分析">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 300 }}>
              <p className="text-gray-500">季节性波动图表</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="预测模型">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: 300 }}>
              <p className="text-gray-500">未来趋势预测图表</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsTrends
