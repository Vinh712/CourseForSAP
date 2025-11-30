import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  Settings,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreVertical,
  Play,
  File,
  Upload,
  Trash2,
  Edit,
  ClipboardCheck,
  Clock,
  Award,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AssignmentCard from '@/components/AssignmentCard'
import EmptyState from '@/components/EmptyState'
import classApi from '@/api/classApi'
import courseApi from '@/api/courseApi'
import assignmentApi from '@/api/assignmentApi'
import uploadApi from '@/api/uploadApi'
import quizApi from '@/api/quizApi'
import { getInitials, cn } from '@/lib/utils'

export default function ClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [expandedCourses, setExpandedCourses] = useState({})
  const [createCourseDialogOpen, setCreateCourseDialogOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '' })
  
  // Add Module states
  const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false)
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null)
  const [newModule, setNewModule] = useState({ 
    title: '', 
    content: '', 
    content_type: 'text',
    media_url: '',
    duration: 0,
    attachments: []
  })
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef(null)

  // Quiz states
  const [createQuizDialogOpen, setCreateQuizDialogOpen] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    time_limit: 30,
    passing_score: 60,
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0 }]
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classResult, coursesResult, assignmentsResult, quizzesResult] = await Promise.all([
          classApi.getClass(classId),
          courseApi.getClassCourses(classId).catch(() => []),
          assignmentApi.getClassAssignments(classId).catch(() => []),
          quizApi.getByClass(classId).catch(() => [])
        ])

        setClassData(classResult)
        setCourses(coursesResult)
        setAssignments(assignmentsResult)
        setQuizzes(quizzesResult)
      } catch (error) {
        console.error('Failed to load class:', error)
        navigate('/classes')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [classId, navigate])

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData?.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

  const handleCreateCourse = async () => {
    try {
      const course = await courseApi.createCourse(classId, newCourse)
      setCourses([...courses, course])
      setCreateCourseDialogOpen(false)
      setNewCourse({ title: '', description: '' })
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  const openAddModuleDialog = (course) => {
    setSelectedCourseForModule(course)
    setNewModule({ title: '', content: '', content_type: 'text', media_url: '', duration: 0, attachments: [] })
    setAddModuleDialogOpen(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const result = await uploadApi.uploadFile(file)
      setNewModule(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          name: file.name,
          url: result.url,
          type: file.type,
          size: file.size
        }]
      }))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index) => {
    setNewModule(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleAddModule = async () => {
    if (!selectedCourseForModule) return
    try {
      const module = await courseApi.addModule(selectedCourseForModule._id, newModule)
      // Refresh courses to get updated modules
      const updatedCourses = await courseApi.getClassCourses(classId)
      setCourses(updatedCourses)
      setAddModuleDialogOpen(false)
      setNewModule({ title: '', content: '', content_type: 'text', media_url: '', duration: 0, attachments: [] })
      setSelectedCourseForModule(null)
    } catch (error) {
      console.error('Failed to add module:', error)
    }
  }

  // Quiz handlers
  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correct_answer: 0 }]
    }))
  }

  const removeQuestion = (index) => {
    if (newQuiz.questions.length <= 1) return
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const updateQuestion = (index, field, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }))
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      })
    }))
  }

  const handleCreateQuiz = async () => {
    try {
      const quiz = await quizApi.create(classId, newQuiz)
      setQuizzes([...quizzes, quiz])
      setCreateQuizDialogOpen(false)
      setNewQuiz({
        title: '',
        description: '',
        time_limit: 30,
        passing_score: 60,
        questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0 }]
      })
    } catch (error) {
      console.error('Failed to create quiz:', error)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    try {
      await quizApi.delete(quizId)
      setQuizzes(quizzes.filter(q => q._id !== quizId))
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  const handlePublishQuiz = async (quizId, isPublished) => {
    try {
      await quizApi.update(quizId, { is_published: !isPublished })
      setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, is_published: !isPublished } : q))
    } catch (error) {
      console.error('Failed to update quiz:', error)
    }
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

  if (!classData) return null

  const { name, description, code, color, is_teacher, members = [] } = classData

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-gray-400 hover:text-white hover:bg-white/10">
        <Link to="/classes">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classes
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="glass-card border-0 overflow-hidden">
        <div
          className="h-32 relative"
          style={{
            background: `linear-gradient(135deg, ${color}dd, ${color}88)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        <CardContent className="p-6 -mt-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl md:text-4xl font-bold text-white">{name}</h1>
                {is_teacher && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-0">Teacher</Badge>
                )}
              </div>
              {description && (
                <p className="text-gray-400 max-w-2xl">{description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{members.length} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{courses.length} courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>{assignments.length} assignments</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Class Code */}
              <Button
                variant="outline"
                onClick={copyClassCode}
                className="font-mono border-white/10 hover:bg-white/10 text-gray-300"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {code}
              </Button>

              {is_teacher && (
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
          <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">Courses</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">Quizzes</TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">Members</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {is_teacher && (
            <div className="flex justify-end">
              <Dialog open={createCourseDialogOpen} onOpenChange={setCreateCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course module to this class.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-gray-300">Course Title</Label>
                      <Input
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder="e.g., Week 1: Introduction"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Description (optional)</Label>
                      <Textarea
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder="Brief description..."
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateCourseDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCourse} disabled={!newCourse.title.trim()}>
                      Create Course
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course, index) => (
                <Collapsible
                  key={course._id}
                  open={expandedCourses[course._id]}
                  onOpenChange={() => toggleCourse(course._id)}
                >
                  <Card className="glass-card border-0 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="text-base text-white">{course.title}</CardTitle>
                              {course.description && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/10 text-gray-300 border-0">
                              {course.modules?.length || 0} modules
                            </Badge>
                            {expandedCourses[course._id] ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <Separator className="mb-4 bg-white/10" />
                        {course.modules && course.modules.length > 0 ? (
                          <div className="space-y-2">
                            {course.modules.map((module) => (
                              <div
                                key={module.id}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-white/5"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                  {module.content_type === 'video' ? (
                                    <Play className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <File className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-white">{module.title}</p>
                                  {module.duration > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {module.duration} min
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No modules added yet
                          </p>
                        )}
                        {is_teacher && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 w-full text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              openAddModuleDialog(course)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Module
                          </Button>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description={is_teacher ? "Start by adding your first course module." : "No courses have been added to this class yet."}
              action={is_teacher && (
                <Button onClick={() => setCreateCourseDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              )}
            />
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {is_teacher && (
            <div className="flex justify-end">
              <Button size="sm" asChild>
                <Link to={`/classes/${classId}/assignments/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Link>
              </Button>
            </div>
          )}

          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No assignments yet"
              description={is_teacher ? "Create your first assignment for this class." : "No assignments have been posted yet."}
              action={is_teacher && (
                <Button asChild>
                  <Link to={`/classes/${classId}/assignments/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Link>
                </Button>
              )}
            />
          )}
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          {is_teacher && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setCreateQuizDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>
          )}

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <Card key={quiz._id} className="glass-card border-0 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
                          <ClipboardCheck className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-white">{quiz.title}</CardTitle>
                          {quiz.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={quiz.is_published ? 'bg-green-500/20 text-green-400 border-0' : 'bg-white/10 text-gray-400 border-0'}>
                        {quiz.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{quiz.questions?.length || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.time_limit} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{quiz.passing_score}% to pass</span>
                      </div>
                    </div>
                    {is_teacher ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-white/10 hover:bg-white/10 text-gray-300"
                          onClick={() => handlePublishQuiz(quiz._id, quiz.is_published)}
                        >
                          {quiz.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="border-white/10 hover:bg-white/10 text-gray-300"
                        >
                          <Link to={`/quizzes/${quiz._id}/results`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Results
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      quiz.is_published && (
                        <Button size="sm" className="w-full" asChild>
                          <Link to={`/quizzes/${quiz._id}`}>
                            Start Quiz
                          </Link>
                        </Button>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No quizzes yet"
              description={is_teacher ? "Create your first quiz for this class." : "No quizzes have been posted yet."}
              action={is_teacher && (
                <Button onClick={() => setCreateQuizDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              )}
            />
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Class Members ({members.length})</span>
                {is_teacher && (
                  <Button variant="outline" size="sm" onClick={copyClassCode} className="border-white/10 hover:bg-white/10 text-gray-300">
                    <Copy className="w-4 h-4 mr-2" />
                    Share Code
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400">
                        {getInitials(member.name || member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-white">{member.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <Badge className={member.role === 'teacher' ? 'bg-purple-500/20 text-purple-400 border-0' : 'bg-white/10 text-gray-400 border-0'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Module Dialog */}
      <Dialog open={addModuleDialogOpen} onOpenChange={setAddModuleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Add a module to {selectedCourseForModule?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-gray-300">Module Title *</Label>
              <Input
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="e.g., Lesson 1: Introduction"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Content Type</Label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                value={newModule.content_type}
                onChange={(e) => setNewModule({ ...newModule, content_type: e.target.value })}
              >
                <option value="text" className="bg-[#0f1118]">Text/Document</option>
                <option value="video" className="bg-[#0f1118]">Video</option>
                <option value="file" className="bg-[#0f1118]">File Upload</option>
                <option value="link" className="bg-[#0f1118]">External Link</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Content / Description</Label>
              <Textarea
                value={newModule.content}
                onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                placeholder="Module content or description..."
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-gray-300">Media URL (optional)</Label>
              <Input
                value={newModule.media_url}
                onChange={(e) => setNewModule({ ...newModule, media_url: e.target.value })}
                placeholder="https://... (video or file URL)"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Duration (minutes)</Label>
              <Input
                type="number"
                value={newModule.duration}
                onChange={(e) => setNewModule({ ...newModule, duration: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-2"
                min={0}
              />
            </div>

            {/* File Attachments */}
            <div>
              <Label className="text-gray-300">Attachments</Label>
              <div className="mt-2 space-y-2">
                {newModule.attachments.map((att, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                    <File className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm truncate text-gray-300">{att.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="w-full border-white/10 hover:bg-white/10 text-gray-300"
                >
                  {uploadingFile ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModuleDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleAddModule} disabled={!newModule.title.trim()}>
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Quiz Dialog */}
      <Dialog open={createQuizDialogOpen} onOpenChange={setCreateQuizDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create a quiz for your students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-gray-300">Quiz Title *</Label>
                <Input
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder="e.g., Week 1 Quiz"
                  className="mt-2"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Description (optional)</Label>
                <Textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  placeholder="Brief description..."
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-gray-300">Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={newQuiz.time_limit}
                  onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) || 30 })}
                  className="mt-2"
                  min={1}
                />
              </div>
              <div>
                <Label className="text-gray-300">Passing Score (%)</Label>
                <Input
                  type="number"
                  value={newQuiz.passing_score}
                  onChange={(e) => setNewQuiz({ ...newQuiz, passing_score: parseInt(e.target.value) || 60 })}
                  className="mt-2"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base text-white">Questions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="border-white/10 hover:bg-white/10 text-gray-300">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {newQuiz.questions.map((q, qIndex) => (
                <Card key={qIndex} className="p-4 glass-card border-0">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-sm mt-2 text-purple-400">Q{qIndex + 1}.</span>
                      <div className="flex-1">
                        <Input
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Enter question..."
                        />
                      </div>
                      {newQuiz.questions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="pl-6 space-y-2">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correct_answer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Select the correct answer by clicking the radio button
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateQuizDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuiz} 
              disabled={!newQuiz.title.trim() || newQuiz.questions.some(q => !q.question.trim())}
            >
              Create Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
