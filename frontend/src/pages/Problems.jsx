/**
 * Problems - List all coding problems (AI-graded)
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EmptyState from '@/components/EmptyState'
import problemApi from '@/api/problemApi'
import useAuthStore from '@/stores/authStore'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

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

export default function Problems() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [problemToDelete, setProblemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProblems()
  }, [])

  useEffect(() => {
    filterProblems()
  }, [problems, searchQuery, difficultyFilter, statusFilter])

  const fetchProblems = async () => {
    try {
      const data = await problemApi.getProblems()
      setProblems(data)
    } catch (error) {
      toast.error('Không thể tải danh sách bài tập')
      console.error('Failed to fetch problems:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProblems = () => {
    let result = [...problems]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      )
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(p => p.difficulty === difficultyFilter)
    }

    // Status filter
    if (statusFilter === 'submitted') {
      result = result.filter(p => p.user_submitted)
    } else if (statusFilter === 'not-submitted') {
      result = result.filter(p => !p.user_submitted)
    }

    setFilteredProblems(result)
  }

  const handleDelete = async () => {
    if (!problemToDelete) return

    setIsDeleting(true)
    try {
      await problemApi.deleteProblem(problemToDelete._id)
      toast.success('Đã xoá bài tập thành công')
      setProblems(problems.filter(p => p._id !== problemToDelete._id))
    } catch (error) {
      toast.error('Không thể xoá bài tập')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProblemToDelete(null)
    }
  }

  const getSubmissionStatus = (problem) => {
    if (!problem.user_submitted) return null
    const status = problem.user_submission?.status
    const score = problem.user_submission?.score

    if (status === 'graded') {
      const percentage = (score / problem.max_score) * 100
      if (percentage >= 70) return { icon: CheckCircle, color: 'text-green-400', label: `${score}/${problem.max_score}` }
      if (percentage >= 40) return { icon: AlertCircle, color: 'text-yellow-400', label: `${score}/${problem.max_score}` }
      return { icon: AlertCircle, color: 'text-red-400', label: `${score}/${problem.max_score}` }
    }
    if (status === 'grading' || status === 'pending') {
      return { icon: Clock, color: 'text-blue-400', label: 'Đang chấm...' }
    }
    if (status === 'error') {
      return { icon: AlertCircle, color: 'text-red-400', label: 'Lỗi' }
    }
    return null
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            AI Teacher
          </h1>
          <p className="text-gray-400 mt-1">
            Giải bài tập và được AI chấm điểm tự động
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => navigate('/problems/create')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo bài mới
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="all">Tất cả độ khó</SelectItem>
            <SelectItem value="easy">Dễ</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="hard">Khó</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="submitted">Đã nộp</SelectItem>
            <SelectItem value="not-submitted">Chưa nộp</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{problems.length}</p>
              <p className="text-xs text-gray-400">Tổng bài tập</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {problems.filter(p => p.user_submitted && p.user_submission?.status === 'graded').length}
              </p>
              <p className="text-xs text-gray-400">Đã hoàn thành</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {problems.filter(p => !p.user_submitted).length}
              </p>
              <p className="text-xs text-gray-400">Chưa làm</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {problems.filter(p => {
                  const sub = p.user_submission
                  return sub?.status === 'graded' && (sub.score / p.max_score) >= 0.7
                }).length}
              </p>
              <p className="text-xs text-gray-400">Điểm cao (≥70%)</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Problem List */}
      {filteredProblems.length > 0 ? (
        <motion.div variants={containerVariants} className="space-y-3">
          {filteredProblems.map((problem) => {
            const status = getSubmissionStatus(problem)

            return (
              <motion.div key={problem._id} variants={itemVariants}>
                <Card 
                  className="glass-card border-0 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => navigate(`/problems/${problem._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status indicator */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          status ? 'bg-white/10' : 'bg-purple-500/20'
                        }`}>
                          {status ? (
                            <status.icon className={`w-5 h-5 ${status.color}`} />
                          ) : (
                            <Code2 className="w-5 h-5 text-purple-400" />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                              {problem.title}
                            </h3>
                            <Badge className={`${difficultyColors[problem.difficulty]} border text-xs`}>
                              {difficultyLabels[problem.difficulty]}
                            </Badge>
                            {!problem.is_published && isAdmin && (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border text-xs">
                                Nháp
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                            <span>Điểm tối đa: {problem.max_score}</span>
                            {problem.submission_count > 0 && (
                              <span>• {problem.submission_count} lượt nộp</span>
                            )}
                            {status && <span>• {status.label}</span>}
                          </div>
                          {problem.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {problem.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="bg-white/5 text-gray-400 text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white hover:bg-white/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/problems/${problem._id}/edit`)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                setProblemToDelete(problem)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Code2}
            title="Chưa có bài nào"
            description={searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all' 
              ? "Thử thay đổi bộ lọc để tìm bài khác" 
              : "Chưa có bài nào được tạo"
            }
            action={isAdmin && (
              <Button 
                onClick={() => navigate('/problems/create')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài đầu tiên
              </Button>
            )}
          />
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Xác nhận xoá</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xoá bài tập "{problemToDelete?.title}"? 
              Tất cả bài nộp của học sinh cũng sẽ bị xoá. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Đang xoá...' : 'Xoá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
