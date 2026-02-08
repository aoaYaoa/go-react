import { api } from '../services/api'
import { useScreenSize } from '../contexts/ScreenSizeContext'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })

  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTasks()
      setTasks(data)
    } catch (err) {
      setError('获取任务失败，请检查后端服务是否启动')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newTask = await api.createTask(formData)
      setTasks([...tasks, newTask])
      setFormData({ title: '', description: '' })
      setShowForm(false)
    } catch (err) {
      setError('创建任务失败')
      console.error(err)
    }
  }

  const handleToggle = async (task) => {
    try {
      const updatedTask = await api.toggleTask(task.id)
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)))
    } catch (err) {
      setError('更新任务失败')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id)
      setTasks(tasks.filter((t) => t.id !== id))
    } catch (err) {
      setError('删除任务失败')
      console.error(err)
    }
  }

  const containerClass = isExtraLargeScreen
    ? 'max-w-7xl'
    : isLargeScreen
    ? 'max-w-5xl'
    : 'max-w-4xl'

  const headingClass = isExtraLargeScreen
    ? 'text-6xl'
    : isLargeScreen
    ? 'text-5xl'
    : 'text-4xl'

  const buttonClass = isLargeScreen || isExtraLargeScreen
    ? 'px-10 py-3 text-lg'
    : 'px-6 py-2'

  const inputClass = isLargeScreen || isExtraLargeScreen
    ? 'px-6 py-4 text-lg'
    : 'px-4 py-2'

  const checkboxSize = isLargeScreen || isExtraLargeScreen
    ? 'h-6 w-6'
    : 'h-5 w-5'

  if (loading) {
    return (
      <div className={`text-center ${isLargeScreen || isExtraLargeScreen ? 'py-20' : 'py-12'}`}>
        <div className={`inline-block animate-spin rounded-full border-4 ${
          isLargeScreen || isExtraLargeScreen ? 'h-16 w-16' : 'h-12 w-12'
        } border-b-2`}></div>
        <p className={`mt-4 text-gray-600 ${
          isLargeScreen || isExtraLargeScreen ? 'text-xl' : ''
        }`}>加载中...</p>
      </div>
    )
  }

  return (
    <div className={`${containerClass} mx-auto transition-all duration-300 relative`}>
      {/* 装饰性背景元素 */}
      {(isLargeScreen || isExtraLargeScreen) && (
        <>
          <div className="decorative-circle w-96 h-96 -top-24 -right-48 opacity-30"></div>
          <div className="decorative-circle w-96 h-96 -bottom-24 -left-48 opacity-30"></div>
        </>
      )}

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className={`font-bold text-gray-900 ${headingClass} mb-2`}>任务管理</h1>
          <p className="text-gray-500">
            {tasks.length === 0 ? '暂无任务' : `共 ${tasks.length} 个任务`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl ${buttonClass}`}
        >
          {showForm ? '取消' : '✨ 新建任务'}
        </button>
      </div>

      {error && (
        <div className={`bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 rounded-lg mb-6 relative z-10 ${
          isLargeScreen || isExtraLargeScreen ? 'px-6 py-4 text-lg' : 'px-4 py-3'
        }`}>
          <div className="flex items-center">
            <svg className={`w-6 h-6 mr-3 ${isLargeScreen || isExtraLargeScreen ? 'w-7 h-7' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-xl mb-8 relative z-10 ${
          isLargeScreen || isExtraLargeScreen ? 'p-8' : 'p-6'
        } transition-all duration-300 hover:shadow-2xl`}>
          <div className="mb-6">
            <label className={`block text-gray-700 font-semibold mb-3 ${
              isLargeScreen || isExtraLargeScreen ? 'text-lg' : ''
            }`}>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                标题
              </span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${inputClass}`}
              required
              placeholder="请输入任务标题..."
            />
          </div>
          <div className="mb-6">
            <label className={`block text-gray-700 font-semibold mb-3 ${
              isLargeScreen || isExtraLargeScreen ? 'text-lg' : ''
            }`}>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                描述
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${inputClass}`}
              rows="3"
              placeholder="请输入任务描述..."
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl ${buttonClass}`}
          >
            创建任务
          </button>
        </form>
      )}

      <div className={`space-y-4 ${isLargeScreen || isExtraLargeScreen ? 'space-y-6' : ''} relative z-10`}>
        {tasks.length === 0 ? (
          <div className={`text-center py-16 bg-white rounded-2xl shadow-lg ${
            isLargeScreen || isExtraLargeScreen ? 'py-24 text-xl' : ''
          }`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 ${
              isLargeScreen || isExtraLargeScreen ? 'w-32 h-32' : ''
            }`}>
              <svg className={`text-gray-400 ${
                isLargeScreen || isExtraLargeScreen ? 'w-16 h-16' : 'w-12 h-12'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">暂无任务</p>
            <p className="text-gray-400 text-sm">点击"新建任务"开始吧</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                task.completed ? 'opacity-75 bg-gradient-to-r from-gray-50 to-gray-100' : ''
              } ${isLargeScreen || isExtraLargeScreen ? 'p-8' : 'p-6'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-6 flex-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggle(task)}
                      className={`mt-1 text-blue-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 cursor-pointer appearance-none checked:bg-gradient-to-r checked:from-blue-600 checked:to-blue-700 ${checkboxSize}`}
                      style={{
                        width: isLargeScreen || isExtraLargeScreen ? '1.5rem' : '1.25rem',
                        height: isLargeScreen || isExtraLargeScreen ? '1.5rem' : '1.25rem',
                        border: '2px solid #d1d5db',
                      }}
                    />
                    {task.completed && (
                      <svg className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none ${
                        isLargeScreen || isExtraLargeScreen ? 'w-4 h-4' : 'w-3 h-3'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      } ${isExtraLargeScreen ? 'text-2xl' : isLargeScreen ? 'text-xl' : 'text-xl'} mb-2`}
                    >
                      {task.title}
                    </h3>
                    <p className={`text-gray-600 ${
                      isLargeScreen || isExtraLargeScreen ? 'text-lg' : ''
                    } line-clamp-2`}>{task.description}</p>
                    <div className={`flex items-center gap-4 mt-3 text-gray-400 ${
                      isLargeScreen || isExtraLargeScreen ? 'text-base' : 'text-sm'
                    }`}>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(task.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className={`text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300 rounded-xl flex items-center gap-2 ${
                    isLargeScreen || isExtraLargeScreen ? 'text-lg px-4 py-2' : 'px-3 py-1.5'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Tasks
