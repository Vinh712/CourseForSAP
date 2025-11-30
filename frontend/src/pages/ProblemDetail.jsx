/**
 * ProblemDetail - View and submit solution for a coding problem
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trophy,
  FileText,
  Users,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import problemApi from '@/api/problemApi'
import useAuthStore from '@/stores/authStore'
import { toast } from 'sonner'

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const difficultyLabels = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó'
}

const languageOptions = [
  { value: 'none', label: 'Không áp dụng (Bài văn/Tiếng Anh)' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'other', label: 'Khác' }
]

export default function ProblemDetail() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [problem, setProblem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [submissionText, setSubmissionText] = useState('')
  const [language, setLanguage] = useState('none')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('problem')

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  const fetchProblem = async () => {
    try {
      const data = await problemApi.getProblem(problemId)
      setProblem(data)

      // Pre-fill with previous submission if exists
      if (data.my_submission) {
        setSubmissionText(data.my_submission.submission_text || '')
        setLanguage(data.my_submission.language || 'none')
      }

      // Fetch all submissions if admin
      if (isAdmin) {
        try {
          const subsData = await problemApi.getProblemSubmissions(problemId)
          setSubmissions(subsData.submissions || [])
        } catch (e) {
          console.error('Failed to fetch submissions:', e)
        }
      }
    } catch (error) {
      toast.error('Không thể tải bài tập')
      console.error('Failed to fetch problem:', error)
      navigate('/problems')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast.error('Vui lòng nhập code của bạn')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await problemApi.submitProblem(problemId, {
        submission_text: submissionText,
        language
      })

      toast.success('Nộp bài thành công!')

      // Update problem with new submission
      setProblem(prev => ({
        ...prev,
        my_submission: result,
        user_submitted: true
      }))

      // Switch to result tab
      setActiveTab('result')
    } catch (error) {
      toast.error(error.message || 'Không thể nộp bài')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 70) return 'text-green-400'
    if (percentage >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!problem) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/problems')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate(`/problems/${problemId}/edit`)}
              className="border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Problem Info */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                <Badge className={`${difficultyColors[problem.difficulty]} border`}>
                  {difficultyLabels[problem.difficulty]}
                </Badge>
                {!problem.is_published && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border">
                    Nháp
                  </Badge>
                )}
              </div>
              {problem.tags?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {problem.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Điểm tối đa: <span className="text-white font-semibold">{problem.max_score}</span></span>
              </div>
              {problem.submission_count > 0 && (
                <div className="flex items-center gap-2 text-gray-400 mt-1">
                  <Users className="w-4 h-4" />
                  <span>{problem.submission_count} lượt nộp</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="problem" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <FileText className="w-4 h-4 mr-2" />
            Đề bài
          </TabsTrigger>
          <TabsTrigger value="submit" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Code2 className="w-4 h-4 mr-2" />
            Nộp bài
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            disabled={!problem.my_submission}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Kết quả
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all-submissions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Users className="w-4 h-4 mr-2" />
              Tất cả bài nộp ({submissions.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Problem Description Tab */}
        <TabsContent value="problem">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Mô tả bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap">{problem.description}</div>
              </div>

              {/* Chỉ admin mới xem được tiêu chí chấm điểm */}
              {isAdmin && problem.grading_criteria && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Tiêu chí chấm điểm (Chỉ Admin)</h3>
                  <div className="text-gray-400 whitespace-pre-wrap bg-white/5 rounded-lg p-4">
                    {problem.grading_criteria}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Tab */}
        <TabsContent value="submit">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                Nộp bài làm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-400">Loại bài:</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {languageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Dán code của bạn vào đây..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="min-h-[400px] font-mono text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  {submissionText.length.toLocaleString()} ký tự
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !submissionText.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang chấm điểm...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Nộp bài
                    </>
                  )}
                </Button>
              </div>

              {problem.my_submission && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Bạn đã nộp bài trước đó. Nộp lại sẽ ghi đè bài nộp cũ.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result">
          {problem.my_submission ? (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {problem.my_submission.status === 'graded' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : problem.my_submission.status === 'grading' || problem.my_submission.status === 'pending' ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  Kết quả chấm điểm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Trạng thái:</span>
                  {problem.my_submission.status === 'graded' ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                      Đã chấm
                    </Badge>
                  ) : problem.my_submission.status === 'grading' ? (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Đang chấm
                    </Badge>
                  ) : problem.my_submission.status === 'pending' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                      <Clock className="w-3 h-3 mr-1" />
                      Chờ chấm
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border">
                      Lỗi
                    </Badge>
                  )}
                </div>

                {/* Score */}
                {problem.my_submission.status === 'graded' && problem.my_submission.score !== null && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">Điểm số:</span>
                    <span className={`text-3xl font-bold ${getScoreColor(problem.my_submission.score, problem.max_score)}`}>
                      {problem.my_submission.score}
                    </span>
                    <span className="text-gray-500 text-lg">/ {problem.max_score}</span>
                  </div>
                )}

                {/* Feedback */}
                {problem.my_submission.feedback && (
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold">Nhận xét từ AI:</h4>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-gray-300 whitespace-pre-wrap">{problem.my_submission.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Submitted code */}
                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Code đã nộp:</h4>
                  <div className="p-4 rounded-lg bg-gray-950 border border-white/10 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {problem.my_submission.submission_text}
                    </pre>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-white/10">
                  {problem.my_submission.submitted_at && (
                    <span>
                      Nộp lúc: {new Date(problem.my_submission.submitted_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                  {problem.my_submission.graded_at && (
                    <span>
                      Chấm lúc: {new Date(problem.my_submission.graded_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Bạn chưa nộp bài cho bài tập này</p>
                <Button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                >
                  Nộp bài ngay
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Submissions Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="all-submissions">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Tất cả bài nộp ({submissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div 
                        key={sub._id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-400">
                                {sub.student_name?.charAt(0) || sub.user?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {sub.student_name || sub.user?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {sub.user?.email || ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {sub.status === 'graded' && sub.score !== null ? (
                              <span className={`text-xl font-bold ${getScoreColor(sub.score, problem.max_score)}`}>
                                {sub.score}/{problem.max_score}
                              </span>
                            ) : (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                                {sub.status === 'grading' ? 'Đang chấm' : sub.status === 'pending' ? 'Chờ chấm' : 'Lỗi'}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(sub.submitted_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {sub.feedback && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-sm text-gray-400 line-clamp-2">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Chưa có bài nộp nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  )
}
