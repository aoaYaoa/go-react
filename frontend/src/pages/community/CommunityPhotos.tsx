interface Photo {
  id: string
  url: string
  title: string
  author: string
  aircraft: string
  location: string
  date: string
  likes: number
  tags: string[]
}

const CommunityPhotos = () => {
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')

  const mockData: Photo[] = [
    {
      id: '1',
      url: 'https://via.placeholder.com/400x300',
      title: '国航 B737 降落瞬间',
      author: '航拍爱好者',
      aircraft: 'B737-800',
      location: '北京首都机场',
      date: '2026-02-08',
      likes: 256,
      tags: ['降落', '国航', 'B737']
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/400x300',
      title: '日落时分的A380',
      author: '摄影师小王',
      aircraft: 'A380',
      location: '上海浦东机场',
      date: '2026-02-07',
      likes: 189,
      tags: ['日落', 'A380', '浦东']
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">照片库</h1>
          <p className="text-gray-600">分享精彩的航空摄影作品</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          上传照片
        </Button>
      </div>

      <Card className="mb-6">
        <Space size="middle" className="w-full">
          <Input
            placeholder="搜索照片"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="takeoff">起飞</Select.Option>
            <Select.Option value="landing">降落</Select.Option>
            <Select.Option value="cruise">巡航</Select.Option>
            <Select.Option value="ground">地面</Select.Option>
          </Select>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {mockData.map((photo) => (
          <Col key={photo.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <Image
                  alt={photo.title}
                  src={photo.url}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={photo.title}
                description={
                  <Space direction="vertical" size="small" className="w-full">
                    <div className="text-gray-600 text-sm">
                      <div>{photo.author}</div>
                      <div>{photo.aircraft}</div>
                      <div>{photo.location}</div>
                      <div>{photo.date}</div>
                    </div>
                    <Space>
                      <Button
                        type="text"
                        icon={<HeartOutlined />}
                        size="small"
                      >
                        {photo.likes}
                      </Button>
                    </Space>
                    <Space wrap>
                      {photo.tags.map((tag) => (
                        <Tag key={tag} color="blue" className="text-xs">
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default CommunityPhotos
