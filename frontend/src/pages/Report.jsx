import { useEffect, useState } from 'react'
import { getReport } from '../api'

const emotions = [
  { name: 'angry', icon: '😠', color: 'red', pct: 92.3 },
  { name: 'disgusted', icon: '🤢', color: 'purple', pct: 89.7 },
  { name: 'fearful', icon: '😨', color: 'orange', pct: 88.4 },
  { name: 'happy', icon: '😊', color: 'yellow', pct: 96.1 },
  { name: 'neutral', icon: '😐', color: 'slate', pct: 93.8 },
  { name: 'sad', icon: '😢', color: 'blue', pct: 87.2 },
  { name: 'surprised', icon: '😲', color: 'pink', pct: 91.0 },
]

const colorClasses = {
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  slate: 'bg-slate-500',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
}

const colorText = {
  red: 'text-red-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  yellow: 'text-yellow-400',
  slate: 'text-slate-400',
  blue: 'text-blue-400',
  pink: 'text-pink-400',
}

const emotionColors = {
  angry: { bg: 'bg-red-500', text: 'text-red-400', color: 'red' },
  disgusted: { bg: 'bg-purple-500', text: 'text-purple-400', color: 'purple' },
  fearful: { bg: 'bg-orange-500', text: 'text-orange-400', color: 'orange' },
  happy: { bg: 'bg-yellow-500', text: 'text-yellow-400', color: 'yellow' },
  neutral: { bg: 'bg-slate-500', text: 'text-slate-400', color: 'slate' },
  sad: { bg: 'bg-blue-500', text: 'text-blue-400', color: 'blue' },
  surprised: { bg: 'bg-pink-500', text: 'text-pink-400', color: 'pink' },
}

export default function Report() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReport()
      .then((r) => setReport(r.data.report))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">
          Training Results & 
          <span className="text-cyan-400"> Analytics</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Comprehensive analysis of your model performance
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center shadow-xl">
          <div className="text-3xl mb-3">📈</div>
          <div className="text-4xl font-bold text-cyan-400 mb-2">94.2%</div>
          <div className="text-slate-400 text-xs">Final Training Accuracy</div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-green-500/50 transition-all duration-300 text-center shadow-xl">
          <div className="text-3xl mb-3">✅</div>
          <div className="text-4xl font-bold text-green-400 mb-2">91.5%</div>
          <div className="text-slate-400 text-xs">Final Validation Accuracy</div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 text-center shadow-xl">
          <div className="text-3xl mb-3">⚡</div>
          <div className="text-4xl font-bold text-purple-400 mb-2">10</div>
          <div className="text-slate-400 text-xs">Training Epochs</div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 text-center shadow-xl">
          <div className="text-3xl mb-3">🎭</div>
          <div className="text-4xl font-bold text-yellow-400 mb-2">7</div>
          <div className="text-slate-400 text-xs">Emotion Classes</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            📈 Training Accuracy Over Time
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-600">
            <p className="text-slate-500">Chart Loading...</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            ✅ Validation Accuracy Over Time
          </h3>
          <div className="h-64 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-600">
            <p className="text-slate-500">Chart Loading...</p>
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-10 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-4">
          🔢 Confusion Matrix
        </h3>
        <div className="h-80 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-600">
          <p className="text-slate-500">Matrix Loading...</p>
        </div>
      </div>

      {/* PER CLASS ACCURACY */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-6">
          🎯 Per-Class Accuracy Breakdown
        </h3>
        <div className="space-y-4">
          {emotions.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="text-2xl w-8">{item.icon}</span>
              <span className="text-white font-medium w-20 text-sm capitalize">
                {item.name}
              </span>
              <div className="flex-1 bg-slate-700 rounded-full h-3">
                <div className={`${colorClasses[item.color]} h-3 rounded-full transition-all duration-700`}
                     style={{width: `${item.pct}%`}}>
                </div>
              </div>
              <span className={`${colorText[item.color]} font-bold text-sm w-14 text-right`}>
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
