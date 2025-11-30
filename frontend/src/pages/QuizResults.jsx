import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import quizApi from '@/api/quizApi'
import { getInitials } from '@/lib/utils'

export default function QuizResults() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizData, resultsData] = await Promise.all([
          quizApi.getById(quizId),
          quizApi.getResults(quizId)
        ])
        setQuiz(quizData)
        setResults(resultsData)
      } catch (error) {
        console.error('Failed to load results:', error)
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [quizId, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!quiz) return null

  const totalSubmissions = results.length
  const passedCount = results.filter(r => r.passed).length
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0
  const avgScore = totalSubmissions > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions)
    : 0
  const highestScore = totalSubmissions > 0 
    ? Math.max(...results.map(r => r.score))
    : 0

  const exportResults = () => {
    const csv = [
      ['Student', 'Email', 'Score', 'Passed', 'Submitted At'].join(','),
      ...results.map(r => [
        r.user?.name || 'Unknown',
        r.user?.email || '',
        `${r.score}%`,
        r.passed ? 'Yes' : 'No',
        new Date(r.completed_at).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title}-results.csv`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className="-ml-2 text-gray-400 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {quiz.title} - Results
          </h1>
          <p className="text-gray-400 mt-1">
            {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportResults} 
          disabled={results.length === 0}
          className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 hover:bg-gray-900/60 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Submissions</p>
                <p className="text-2xl font-bold text-white">{totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 hover:bg-gray-900/60 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pass Rate</p>
                <p className="text-2xl font-bold text-white">{passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 hover:bg-gray-900/60 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-white">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 hover:bg-gray-900/60 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Highest</p>
                <p className="text-2xl font-bold text-white">{highestScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white">Student Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {results.length > 0 ? (
            <div className="divide-y divide-white/5">
              {results
                .sort((a, b) => b.score - a.score)
                .map((result, index) => (
                <div
                  key={result._id}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                    index === 0 
                      ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30' 
                      : index === 1 
                      ? 'bg-gray-400/20 text-gray-300 ring-1 ring-gray-400/30'
                      : index === 2
                      ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                      : 'bg-white/5 text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-white/10">
                    <AvatarImage src={result.user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {getInitials(result.user?.name || result.user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{result.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 truncate">{result.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          result.passed ? 'text-green-400' : 'text-red-400'
                        }`}>{result.score}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            result.passed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>
                    <Badge className={result.passed 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }>
                      {result.passed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Passed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                    <div className="text-sm text-gray-500 w-36 text-right">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(result.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium">No submissions yet</p>
              <p className="text-sm text-gray-500 mt-1">Results will appear here when students complete the quiz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
