import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSessions, getReport } from '../api'

const emotions = [
  { name: 'angry', icon: '😠', borderColor: 'border-red-500', barColor: 'bg-red-500', textColor: 'text-red-400' },
  { name: 'disgusted', icon: '🤢', borderColor: 'border-purple-500', barColor: 'bg-purple-500', textColor: 'text-purple-400' },
  { name: 'fearful', icon: '😨', borderColor: 'border-orange-500', barColor: 'bg-orange-500', textColor: 'text-orange-400' },
  { name: 'happy', icon: '😊', borderColor: 'border-yellow-400', barColor: 'bg-yellow-400', textColor: 'text-yellow-400' },
  { name: 'neutral', icon: '😐', borderColor: 'border-slate-400', barColor: 'bg-slate-400', textColor: 'text-slate-400' },
  { name: 'sad', icon: '😢', borderColor: 'border-blue-500', barColor: 'bg-blue-500', textColor: 'text-blue-400' },
  { name: 'surprised', icon: '😲', borderColor: 'border-pink-500', barColor: 'bg-pink-500', textColor: 'text-pink-400' },
]

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full font-medium">
          {title}
        </span>
      </div>
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-slate-400 text-sm">{subtitle}</div>}
    </div>
  )
}

function EmotionCard({ emotion, percentage = 0 }) {
  const safePercentage = typeof percentage === 'number' 
    ? percentage 
    : parseFloat(percentage) || 0

  return (
    <div className={`bg-slate-800 rounded-2xl p-6 border ${emotion.borderColor} hover:border-opacity-100 border-opacity-50 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl`}>
      <div className="text-5xl mb-4 text-center">{emotion.icon}</div>
      <h3 className="text-white font-bold text-center text-lg mb-3 capitalize">{emotion.name}</h3>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
        <div 
          className={`${emotion.barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(safePercentage, 100)}%` }}
        />
      </div>
      
      <p className="text-slate-400 text-sm text-center">{safePercentage.toFixed(1)}% detected</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSessions(), getReport()])
      .then(([s, r]) => {
        setSessions(s.data.sessions || [])
        setReport(r.data.report || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Facial Expression
            <span className="text-cyan-400"> Recognition</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Advanced AI-powered system for real-time facial expression analysis and speech correction.
            Monitor emotions, improve communication, and enhance your presentation skills.
          </p>
          <button
            onClick={() => navigate('/session')}
            className="bg-accent hover:bg-accent2 text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/25"
          >
            Start Live Session
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">System Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Images"
              value={report?.totalSessions || 0}
              subtitle="Processed"
              icon="🖼️"
            />
            <StatCard
              title="Classes"
              value="7"
              subtitle="Emotions"
              icon="🎭"
            />
            <StatCard
              title="Accuracy"
              value="94.2%"
              subtitle="Average"
              icon="📈"
            />
            <StatCard
              title="Sessions"
              value={sessions.length || 0}
              subtitle="Completed"
              icon="✅"
            />
          </div>
        </div>
      </section>

      {/* Emotions Grid */}
      <section className="py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Detected Emotions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {emotions.map((emotion) => {
              const percentage = Number(report?.expressionPercentages?.[emotion.name]) || 0
              return (
                <EmotionCard
                  key={emotion.name}
                  emotion={emotion}
                  percentage={percentage}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center bg-slate-800 rounded-2xl p-8 md:p-12 border border-slate-700">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Analyze?
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Upload images or start a live session to see real-time facial expression recognition in action.
              Get detailed analytics and improve your emotional intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/session')}
                className="bg-accent hover:bg-accent2 text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/25"
              >
                Start Live Session
              </button>
              <button
                onClick={() => navigate('/report')}
                className="border-2 border-accent text-accent hover:bg-accent hover:text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/10"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
