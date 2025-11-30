import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  Download,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import assignmentApi from '@/api/assignmentApi'
import uploadApi from '@/api/uploadApi'
import { formatDate, formatDateTime, getRelativeTime, getInitials } from '@/lib/utils'

export default function AssignmentDetail() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [submissionContent, setSubmissionContent] = useState('')
  const [submissionFiles, setSubmissionFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const data = await assignmentApi.getAssignment(assignmentId)
        setAssignment(data)
        
        if (data.my_submission) {
          setSubmissionContent(data.my_submission.content || '')
        }
      } catch (error) {
        console.error('Failed to load assignment:', error)
        navigate('/assignments')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssignment()
  }, [assignmentId, navigate])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      try {
        const result = await uploadApi.uploadDocument(file, 'submissions')
        setSubmissionFiles(prev => [...prev, {
          url: result.url,
          filename: file.name,
          public_id: result.public_id
        }])
      } catch (error) {
        console.error('Failed to upload file:', error)
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await assignmentApi.submitAssignment(assignmentId, {
        content: submissionContent,
        attachments: submissionFiles
      })

      const data = await assignmentApi.getAssignment(assignmentId)
      setAssignment(data)
    } catch (error) {
      console.error('Failed to submit assignment:', error)
    } finally {
      setIsSubmitting(false)
    }
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

  if (!assignment) return null

  const {
    title,
    description,
    instructions,
    due_date,
    points,
    class_name,
    is_teacher,
    my_submission,
    submissions = [],
    attachments = []
  } = assignment

  const dueDate = due_date ? new Date(due_date) : null
  const isOverdue = dueDate && new Date() > dueDate && !my_submission
  const isDueSoon = dueDate && !isOverdue && (dueDate - new Date()) < 24 * 60 * 60 * 1000

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        asChild 
        className="-ml-2 text-gray-400 hover:text-white hover:bg-white/10"
      >
        <Link to="/assignments">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-400 mt-1">{class_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {my_submission ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Submitted
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="w-4 h-4 mr-1" />
                Overdue
              </Badge>
            ) : isDueSoon ? (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Clock className="w-4 h-4 mr-1" />
                Due Soon
              </Badge>
            ) : (
              <Badge className="bg-white/10 text-gray-300 border-white/10">
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Due: {dueDate ? formatDateTime(dueDate) : 'No due date'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{points} points</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {description && (
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg text-white">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="whitespace-pre-wrap text-gray-300">{description}</p>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {instructions && (
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg text-white">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="whitespace-pre-wrap text-gray-300">{instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg text-white">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="flex-1 truncate text-gray-300">{file.filename}</span>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher View: All Submissions */}
          {is_teacher && submissions.length > 0 && (
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg text-white">
                  Submissions ({submissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="ring-2 ring-white/10">
                            <AvatarImage src={sub.user_avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                              {getInitials(sub.user_name || sub.user_email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{sub.user_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(sub.submitted_at)}
                            </p>
                          </div>
                        </div>
                        <Badge className={sub.status === 'graded' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-white/10 text-gray-300 border-white/10'
                        }>
                          {sub.status}
                        </Badge>
                      </div>
                      {sub.content && (
                        <p className="text-sm text-gray-300 mb-3">{sub.content}</p>
                      )}
                      {sub.grade !== undefined && (
                        <div className="text-sm text-gray-400">
                          <strong className="text-white">Grade:</strong> 
                          <span className="text-green-400 ml-1">{sub.grade}/{points}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Submit Work */}
        {!is_teacher && (
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg text-white">Your Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Submission Status */}
                {my_submission && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Submitted
                    </div>
                    <p className="text-sm text-gray-400">
                      {formatDateTime(my_submission.submitted_at)}
                    </p>
                    {my_submission.grade !== undefined && (
                      <div className="mt-2 pt-2 border-t border-green-500/20">
                        <span className="font-medium text-gray-300">Grade: </span>
                        <span className="text-green-400 font-semibold">
                          {my_submission.grade}/{points}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Form */}
                <div className="space-y-3">
                  <Textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Add your answer or notes here..."
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                  />

                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Attach Files
                    </Button>
                  </div>

                  {/* Uploaded Files */}
                  {submissionFiles.length > 0 && (
                    <div className="space-y-2">
                      {submissionFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        >
                          <Paperclip className="w-4 h-4 text-purple-400" />
                          <span className="flex-1 truncate text-gray-300">{file.filename}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!submissionContent && submissionFiles.length === 0)}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {my_submission ? 'Resubmit' : 'Submit'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  )
}
