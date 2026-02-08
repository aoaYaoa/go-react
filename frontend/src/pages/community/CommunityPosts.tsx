interface Post {
  id: string
  title: string
  content: string
  author: string
  avatar: string
  createdAt: string
  likes: number
  comments: number
  views: number
  tags: string[]
  flightNumber?: string
}

const CommunityPosts = () => {
  const [searchText, setSearchText] = useState('')

  const mockData: Post[] = [
    {
      id: '1',
      title: '今天体验了国航的新航线',
      content: '从北京飞上海，服务很好，准点起飞准点到达...',
      author: '航空爱好者',
      avatar: '',
      createdAt: '2026-02-08 10:00',
      likes: 128,
      comments: 45,
      views: 1234,
      tags: ['飞行体验', '国航'],
      flightNumber: 'CA1234'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">飞行分享</h1>
          <p className="text-gray-600">分享你的飞行体验</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          发布帖子
        </Button>
      </div>

      <Card className="mb-6">
        <Input
          placeholder="搜索帖子"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
        />
      </Card>

      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`
        }}
        dataSource={mockData}
        renderItem={(item) => (
          <Card className="mb-4 hover:shadow-lg transition-shadow cursor-pointer">
            <List.Item
              key={item.id}
              actions={[
                <Space key="like">
                  <LikeOutlined />
                  {item.likes}
                </Space>,
                <Space key="comment">
                  <CommentOutlined />
                  {item.comments}
                </Space>,
                <Space key="view">
                  <EyeOutlined />
                  {item.views}
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size={48}>{item.author[0]}</Avatar>}
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{item.title}</span>
                    {item.flightNumber && (
                      <Tag color="blue">{item.flightNumber}</Tag>
                    )}
                  </div>
                }
                description={
                  <Space direction="vertical" size="small" className="w-full">
                    <Space>
                      <span>{item.author}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{item.createdAt}</span>
                    </Space>
                  </Space>
                }
              />
              <div className="mt-2 mb-3 text-gray-700">{item.content}</div>
              <Space>
                {item.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </List.Item>
          </Card>
        )}
      />
    </div>
  )
}

export default CommunityPosts
