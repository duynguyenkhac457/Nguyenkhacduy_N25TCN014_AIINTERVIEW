import { useEffect, useMemo, useState } from 'react'
import {
  Bell, Search, Plus, CalendarCheck, ChartNoAxesColumnIncreasing,
  Clock3, Trophy, ArrowUpRight, MoreHorizontal, Sparkles, X,
  BriefcaseBusiness, Trash2, RefreshCw, Send, Bot, UserRound, ArrowLeft, CheckCircle2,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis, BarChart, Bar,
} from 'recharts'
import Sidebar from './components/Sidebar.jsx'
import StatCard from './components/StatCard.jsx'
import { getDashboardStats, getInterviews, createInterview, updateInterview, deleteInterview } from './services/interviewService.js'

const fallbackStats = {
  total_interviews: 12,
  completed_interviews: 8,
  average_score: 82,
  practice_hours: 16,
  weekly_activity: [
    { day: 'Mon', interviews: 2 },
    { day: 'Tue', interviews: 3 },
    { day: 'Wed', interviews: 1 },
    { day: 'Thu', interviews: 4 },
    { day: 'Fri', interviews: 2 },
    { day: 'Sat', interviews: 5 },
    { day: 'Sun', interviews: 3 },
  ],
  score_trend: [
    { month: 'Jan', score: 58 },
    { month: 'Feb', score: 64 },
    { month: 'Mar', score: 69 },
    { month: 'Apr', score: 72 },
    { month: 'May', score: 78 },
    { month: 'Jun', score: 82 },
  ],
}

const fallbackInterviews = [
  { id: 1, title: 'Frontend Developer', company: 'Tech Company', level: 'Junior', status: 'completed', score: 86, created_at: '2026-11-08' },
  { id: 2, title: 'Python Developer', company: 'AI Solutions', level: 'Middle', status: 'in_progress', score: null, created_at: '2026-11-07' },
  { id: 3, title: 'UI/UX Designer', company: 'Creative Studio', level: 'Junior', status: 'completed', score: 78, created_at: '2026-11-05' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function App() {
  const [stats, setStats] = useState(fallbackStats)
  const [interviews, setInterviews] = useState(fallbackInterviews)
  const [apiConnected, setApiConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: 'Frontend Developer', company: '', level: 'Intern', question_count: 10 })
  const [submitting, setSubmitting] = useState(false)
  const [activeInterview, setActiveInterview] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatAnswer, setChatAnswer] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [chatCompleted, setChatCompleted] = useState(false)

  const questionBank = [
    'Hãy giới thiệu đôi nét về bản thân và kinh nghiệm liên quan đến vị trí này.',
    'Vì sao bạn lựa chọn ứng tuyển vào vị trí này?',
    'Bạn hãy mô tả một dự án mà bạn tự hào nhất và vai trò của bạn trong dự án đó.',
    'Khi gặp một vấn đề khó trong công việc, bạn thường phân tích và giải quyết như thế nào?',
    'Bạn hiểu gì về những kỹ năng quan trọng nhất đối với vị trí đang ứng tuyển?',
    'Hãy kể về một lần bạn làm việc nhóm và cách bạn xử lý bất đồng ý kiến.',
    'Điểm mạnh nào giúp bạn phù hợp với công việc này?',
    'Bạn thường cập nhật kiến thức và công nghệ mới bằng cách nào?',
    'Hãy chia sẻ một sai lầm bạn từng mắc phải và bài học rút ra.',
    'Mục tiêu nghề nghiệp của bạn trong 2 đến 3 năm tới là gì?',
    'Bạn sẽ ưu tiên xử lý công việc ra sao khi có nhiều nhiệm vụ cùng hạn chót?',
    'Bạn mong đợi điều gì ở môi trường và đội ngũ làm việc?',
    'Hãy giải thích cách bạn kiểm tra chất lượng công việc trước khi bàn giao.',
    'Bạn sẽ làm gì nếu yêu cầu công việc chưa rõ ràng?',
    'Một thành tựu nào thể hiện rõ nhất năng lực của bạn?',
    'Bạn tiếp nhận phản hồi tiêu cực như thế nào?',
    'Hãy mô tả cách bạn học một kỹ năng hoàn toàn mới.',
    'Điều gì khiến bạn khác biệt so với các ứng viên khác?',
    'Bạn có thể đóng góp giá trị gì cho công ty trong 90 ngày đầu?',
    'Bạn có câu hỏi nào muốn đặt cho nhà tuyển dụng không?',
  ]

  async function loadData() {
    setLoading(true)
    try {
      const [dashboard, list] = await Promise.all([getDashboardStats(), getInterviews()])
      setStats(dashboard)
      setInterviews(list)
      setApiConnected(true)
    } catch {
      setApiConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const completed = useMemo(
    () => interviews.filter((item) => item.status === 'completed').length,
    [interviews],
  )

  async function handleCreate(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const created = await createInterview(form)
      const started = await updateInterview(created.id, { status: 'in_progress' })
      setInterviews((current) => [started, ...current.filter((item) => item.id !== created.id)])
      const session = { ...form, id: created.id, question_count: Number(form.question_count) }
      setActiveInterview(session)
      setQuestionIndex(0)
      setChatAnswer('')
      setChatCompleted(false)
      setChatMessages([
        { role: 'assistant', text: `Xin chào! Mình là AI Interview. Hôm nay chúng ta sẽ luyện phỏng vấn vị trí ${form.title} ở cấp độ ${form.level}. Bạn hãy trả lời tự nhiên và cụ thể nhé.`, time: new Date() },
        { role: 'assistant', text: `Câu hỏi 1: ${questionBank[0]}`, time: new Date() },
      ])
      setShowModal(false)
      setForm({ title: 'Frontend Developer', company: '', level: 'Intern', question_count: 10 })
      await loadData()
    } catch {
      alert('Không thể tạo phỏng vấn. Hãy kiểm tra Backend và kết nối MySQL.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendAnswer(event) {
    event.preventDefault()
    const answer = chatAnswer.trim()
    if (!answer || chatCompleted || !activeInterview) return
    const nextMessages = [...chatMessages, { role: 'user', text: answer, time: new Date() }]
    const nextIndex = questionIndex + 1
    if (nextIndex >= activeInterview.question_count) {
      nextMessages.push({ role: 'assistant', text: 'Cảm ơn bạn đã hoàn thành buổi luyện tập! Bạn đã trả lời tất cả câu hỏi. Hãy xem lại câu trả lời và tiếp tục luyện tập để cải thiện nhé.', time: new Date() })
      setChatCompleted(true)
      try {
        await updateInterview(activeInterview.id, { status: 'completed' })
        await loadData()
      } catch {
        alert('Buổi phỏng vấn đã kết thúc trên giao diện nhưng chưa cập nhật được trạng thái lên máy chủ.')
      }
    } else {
      nextMessages.push({ role: 'assistant', text: `Câu hỏi ${nextIndex + 1}: ${questionBank[nextIndex % questionBank.length]}`, time: new Date() })
    }
    setChatMessages(nextMessages)
    setQuestionIndex(nextIndex)
    setChatAnswer('')
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa buổi phỏng vấn này?')) return
    try {
      await deleteInterview(id)
      setInterviews((current) => current.filter((item) => item.id !== id))
      await loadData()
    } catch {
      alert('Không thể xóa phỏng vấn. Hãy kiểm tra kết nối Backend.')
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {activeInterview ? (
          <section className="chat-page">
            <header className="chat-topbar">
              <button className="chat-back" onClick={() => setActiveInterview(null)}><ArrowLeft size={17} /> Dashboard</button>
              <div className="chat-session-title"><span className="chat-ai-mark"><Bot size={19} /></span><div><strong>AI Interview Room</strong><small>{activeInterview.title} · {activeInterview.level}</small></div></div>
              <span className="chat-live"><i /> Đang luyện tập</span>
            </header>
            <div className="chat-content">
              <div className="chat-intro"><p className="eyebrow">YOUR PRACTICE SESSION</p><h1>Phòng phỏng vấn</h1><p>Trả lời từng câu hỏi để hoàn thành buổi luyện tập của bạn.</p></div>
              <div className="question-progress-card">
                <div className="progress-copy"><div><span>TIẾN ĐỘ CÂU HỎI</span><strong>{Math.min(questionIndex + (chatCompleted ? 0 : 1), activeInterview.question_count)}<small> / {activeInterview.question_count}</small></strong></div><span>{Math.round((questionIndex / activeInterview.question_count) * 100)}% hoàn thành</span></div>
                <div className="progress-track"><span style={{ width: `${Math.min((questionIndex / activeInterview.question_count) * 100, 100)}%` }} /></div>
                <div className="progress-steps"><span>Câu hỏi {Math.min(questionIndex + 1, activeInterview.question_count)} / {activeInterview.question_count}</span><span>{activeInterview.level} · {activeInterview.title}</span></div>
              </div>
              <div className="chat-window">
                <div className="chat-window-heading"><div><strong>Cuộc trò chuyện</strong><span>AI sẽ lần lượt đưa ra câu hỏi phỏng vấn</span></div><span className="secure-label"><CheckCircle2 size={14} /> Phiên luyện tập</span></div>
                <div className="chat-messages">
                  {chatMessages.map((message, index) => (
                    <div className={`chat-message-row ${message.role}`} key={`${index}-${message.role}`}>
                      <div className="chat-message-avatar">{message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={17} />}</div>
                      <div className="chat-message-body"><span className="chat-sender">{message.role === 'assistant' ? 'AI Interview' : 'Bạn'}</span><div className={`chat-bubble ${message.role}`}>{message.text}</div><small>{message.time?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small></div>
                    </div>
                  ))}
                  {chatCompleted && <div className="chat-complete"><CheckCircle2 size={22} /><div><strong>Hoàn thành buổi phỏng vấn!</strong><span>Bạn đã trả lời {activeInterview.question_count} câu hỏi.</span></div></div>}
                </div>
                <form className="chat-composer" onSubmit={handleSendAnswer}>
                  <textarea value={chatAnswer} onChange={(event) => setChatAnswer(event.target.value)} placeholder={chatCompleted ? 'Buổi phỏng vấn đã kết thúc.' : 'Nhập câu trả lời của bạn tại đây...'} disabled={chatCompleted} rows="2" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendAnswer(event) } }} />
                  <div className="composer-footer"><span>Nhấn Enter để gửi · Shift + Enter để xuống dòng</span><button type="submit" className="primary-button" disabled={!chatAnswer.trim() || chatCompleted}><Send size={15} /> Gửi câu trả lời</button></div>
                </form>
              </div>
            </div>
          </section>
        ) : (
        <>
        <header className="topbar">
          <div className="breadcrumb"><span>Pages</span><b>/</b><strong>Dashboard</strong></div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={17} /><input placeholder="Search anything..." /></div>
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="avatar small">NA</div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Welcome back, Nguyen Anh <span>👋</span></h1>
            <p className="subheading">Here’s what’s happening with your interview preparation.</p>
          </div>
          <div className="heading-actions">
            <span className={`connection ${apiConnected ? 'online' : 'offline'}`}>
              <span />{apiConnected ? 'API Connected' : 'Demo data'}
            </span>
            <button className="secondary-button" onClick={loadData}><RefreshCw size={16} /> Refresh</button>
            <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> New Interview</button>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon={CalendarCheck} title="Total Interviews" value={stats.total_interviews ?? interviews.length} note={`${completed} completed`} tone="blue" />
          <StatCard icon={Trophy} title="Average Score" value={`${stats.average_score ?? 0}%`} note="Across completed interviews" tone="purple" />
          <StatCard icon={Clock3} title="Practice Hours" value={`${stats.practice_hours ?? 0}h`} note="Time invested in practice" tone="orange" />
          <StatCard icon={ChartNoAxesColumnIncreasing} title="Completion Rate" value={`${stats.total_interviews ? Math.round((completed / stats.total_interviews) * 100) : 0}%`} note="Keep up the momentum" tone="green" />
        </section>

        <section className="charts-grid">
          <article className="panel score-panel">
            <div className="panel-heading">
              <div><h2>Performance Overview</h2><p>Your interview score progress</p></div>
              <button className="more-button"><MoreHorizontal size={20} /></button>
            </div>
            <div className="chart-legend"><span><i className="legend-dot purple-dot" />Score</span><span className="trend-label"><ArrowUpRight size={15} /> Improving</span></div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.score_trend || fallbackStats.score_trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7566e8" stopOpacity={0.24} /><stop offset="95%" stopColor="#7566e8" stopOpacity={0.01} /></linearGradient></defs>
                  <CartesianGrid stroke="#edf0f6" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#98a0b3', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#98a0b3', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#7566e8" strokeWidth={3} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-heading">
              <div><h2>Weekly Activity</h2><p>Your practice this week</p></div>
              <button className="more-button"><MoreHorizontal size={20} /></button>
            </div>
            <div className="activity-total"><strong>{(stats.weekly_activity || fallbackStats.weekly_activity).reduce((sum, item) => sum + item.interviews, 0)}</strong><span>sessions</span></div>
            <div className="activity-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weekly_activity || fallbackStats.weekly_activity} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#edf0f6" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#98a0b3', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a0b3', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="interviews" fill="#a49af4" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="panel interviews-panel">
          <div className="panel-heading">
            <div><h2>Recent Interviews</h2><p>Track your latest interview sessions</p></div>
            <button className="text-button">View all <ArrowUpRight size={16} /></button>
          </div>
          {loading ? <div className="empty-state">Loading interview data...</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>INTERVIEW</th><th>LEVEL</th><th>QUESTIONS</th><th>DATE</th><th>STATUS</th><th>SCORE</th><th /></tr></thead>
                <tbody>
                  {interviews.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td><div className="interview-title"><div className="job-icon"><BriefcaseBusiness size={18} /></div><div><strong>{item.title}</strong><span>{item.company || 'Personal practice'}</span></div></div></td>
                      <td>{item.level}</td>
                      <td>{item.question_count ?? 10}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td><span className={`status ${item.status}`}>{item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'In progress' : 'Scheduled'}</span></td>
                      <td>{item.score == null ? '—' : <strong>{item.score}%</strong>}</td>
                      <td><button className="delete-button" title="Delete interview" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                  {interviews.length === 0 && <tr><td colSpan="7" className="empty-state">Chưa có buổi phỏng vấn nào. Hãy tạo buổi đầu tiên!</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ai-banner">
          <div className="ai-banner-icon"><Sparkles size={24} /></div>
          <div><h3>Ready to level up your interview skills?</h3><p>Start a new AI-powered practice session and get personalized feedback.</p></div>
          <button className="banner-button" onClick={() => setShowModal(true)}>Start practicing <ArrowUpRight size={16} /></button>
        </section>
        </>
        )}
      </main>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowModal(false)}>
          <form className="modal setup-modal" onSubmit={handleCreate}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">AI INTERVIEW SETUP</p>
                <h2>Thiết lập buổi phỏng vấn</h2>
                <p>Chọn thông tin phù hợp trước khi bắt đầu luyện tập.</p>
              </div>
              <button type="button" className="icon-button" aria-label="Đóng" onClick={() => setShowModal(false)}><X size={19} /></button>
            </div>

            <div className="setup-step"><span>01</span><div><strong>Vị trí ứng tuyển</strong><small>Bạn muốn luyện phỏng vấn cho công việc nào?</small></div></div>
            <label>Vị trí công việc
              <select required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Fullstack Developer</option>
                <option>Java Developer</option>
                <option>Python Developer</option>
                <option>Software Engineer</option>
                <option>UI/UX Designer</option>
                <option>Data Analyst</option>
                <option>QA Tester</option>
                <option>Product Manager</option>
              </select>
            </label>

            <div className="setup-step"><span>02</span><div><strong>Cấp độ của bạn</strong><small>Chọn mức độ kinh nghiệm hiện tại.</small></div></div>
            <div className="level-options">
              {['Intern', 'Fresher', 'Junior', 'Middle', 'Senior'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`level-option ${form.level === level ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, level })}
                  aria-pressed={form.level === level}
                >
                  <span>{level}</span>
                  {form.level === level && <span className="level-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="setup-step"><span>03</span><div><strong>Số lượng câu hỏi</strong><small>Chọn độ dài cho buổi luyện tập.</small></div></div>
            <div className="question-options">
              {[3, 5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`question-option ${Number(form.question_count) === count ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, question_count: count })}
                  aria-pressed={Number(form.question_count) === count}
                >
                  <strong>{count}</strong><span>câu hỏi</span>
                </button>
              ))}
            </div>

            <label className="company-field">Công ty ứng tuyển <span>(không bắt buộc)</span>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Ví dụ: Google, FPT..." />
            </label>

            <div className="setup-summary">
              <Sparkles size={17} />
              <span>Bạn sẽ thực hiện <strong>{form.question_count} câu hỏi</strong> cho vị trí <strong>{form.title}</strong> ở cấp độ <strong>{form.level}</strong>.</span>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Hủy</button>
              <button disabled={submitting} className="primary-button" type="submit">{submitting ? 'Đang tạo...' : 'Bắt đầu phỏng vấn'} <ArrowUpRight size={16} /></button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
