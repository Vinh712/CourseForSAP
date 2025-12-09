import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import quizApi from '@/api/quizApi'

export default function TakeQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await quizApi.getById(quizId)
        setQuiz(data)
        setTimeLeft(data.time_limit * 60)
      } catch (error) {
        console.error('Failed to load quiz:', error)
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    loadQuiz()
  }, [quizId, navigate])

  useEffect(() => {
    if (!hasStarted || result || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, result, timeLeft])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const answersArray = quiz.questions.map((_, index) => answers[index] ?? -1)
      const data = await quizApi.submit(quizId, answersArray)
      setResult(data)
      
      // Reload quiz data to update can_retake and attempts_used
      const updatedQuiz = await quizApi.getById(quizId)
      setQuiz(updatedQuiz)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [answers, quiz, quizId, isSubmitting])

  const selectAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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

  // Result Screen
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden bg-gray-900/40 backdrop-blur-xl border-white/10">
          <CardHeader className={`${result.passed 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/20' 
            : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-b border-red-500/20'}`}>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                result.passed 
                  ? 'bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
                  : 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              }`}>
                {result.passed ? (
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-400" />
                )}
              </div>
              <div className="text-center">
                <CardTitle className={`text-2xl ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {result.passed ? 'Congratulations!' : 'Keep Trying!'}
                </CardTitle>
                <p className="text-gray-400 mt-1">
                  {result.passed ? 'You passed the quiz!' : 'You did not pass this time.'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${
                result.passed 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-red-400 to-pink-400'
              } bg-clip-text text-transparent`}>
                {result.score}%
              </div>
              <p className="text-gray-500">
                Passing score: {quiz.passing_score}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center bg-white/5 border-white/10">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="font-semibold text-white text-xl">{result.correct_count || 0}</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </Card>
              <Card className="p-4 text-center bg-white/5 border-white/10">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div className="font-semibold text-white text-xl">{quiz.time_limit - Math.floor(timeLeft / 60)} min</div>
                <div className="text-sm text-gray-500">Time Taken</div>
              </Card>
            </div>

            {/* Attempt info */}
            {quiz.max_attempts && (
              <div className="text-center text-sm text-gray-400">
                Lần làm bài: {result.attempt_number || quiz.attempts_used || 1} / {quiz.max_attempts === 0 ? '∞' : quiz.max_attempts}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10" 
                onClick={() => navigate(-1)}
              >
                Back to Class
              </Button>
              {!result.passed && quiz.can_retake !== false && (
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600" 
                  onClick={() => {
                    setResult(null)
                    setAnswers({})
                    setCurrentQuestion(0)
                    setTimeLeft(quiz.time_limit * 60)
                    setHasStarted(false)
                  }}
                >
                  Try Again
                </Button>
              )}
              {!result.passed && quiz.can_retake === false && (
                <div className="flex-1 text-center text-red-400 text-sm py-2">
                  Bạn đã hết lượt làm bài
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Start Screen
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="-ml-2 mb-4 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-gray-400 mt-1">{quiz.description}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="font-semibold text-white">{quiz.time_limit} min</div>
                <div className="text-sm text-gray-500">Time Limit</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div className="font-semibold text-white">{quiz.questions?.length || 0}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="font-semibold text-white">{quiz.passing_score}%</div>
                <div className="text-sm text-gray-500">To Pass</div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-yellow-300">Important Notes</p>
                  <ul className="mt-2 text-yellow-200/70 space-y-1">
                    <li>• You have {quiz.time_limit} minutes to complete this quiz</li>
                    <li>• The quiz will auto-submit when time runs out</li>
                    <li>• You need {quiz.passing_score}% or higher to pass</li>
                    <li>• Make sure you have a stable internet connection</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Attempt info */}
            {quiz.max_attempts !== undefined && (
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-semibold text-white">
                  Lần làm bài: {quiz.attempts_used || 0} / {quiz.max_attempts === 0 ? '∞' : quiz.max_attempts}
                </div>
                {quiz.can_retake === false && (
                  <div className="text-sm text-red-400 mt-1">Bạn đã hết lượt làm bài</div>
                )}
              </div>
            )}

            {/* Submission History */}
            {quiz.all_attempts && quiz.all_attempts.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Lịch sử làm bài
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {quiz.all_attempts.map((attempt, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          attempt.passed 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          #{attempt.attempt || idx + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            Điểm: {attempt.score}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {attempt.completed_at && new Date(attempt.completed_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <Badge className={attempt.passed 
                        ? 'bg-green-500/20 text-green-400 border-0' 
                        : 'bg-red-500/20 text-red-400 border-0'
                      }>
                        {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              variant="gradient" 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              onClick={() => setHasStarted(true)}
              disabled={quiz.can_retake === false}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {quiz.attempts_used > 0 ? 'Làm lại Quiz' : 'Start Quiz'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Quiz Screen
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <p className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono text-lg font-semibold flex items-center gap-2 ${
          timeLeft < 60 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : timeLeft < 300 
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
            : 'bg-white/5 text-white border border-white/10'
        }`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6 bg-gray-900/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6 text-white">
            {currentQuestion + 1}. {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium transition-colors ${
                    answers[currentQuestion] === index
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-500 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={answers[currentQuestion] === index ? 'text-white' : 'text-gray-300'}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          disabled={currentQuestion === 0}
          className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-1">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : answers[index] !== undefined
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            {isSubmitting ? 'Submitting...' : `Submit (${answeredCount}/${quiz.questions.length})`}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={currentQuestion === quiz.questions.length - 1}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
