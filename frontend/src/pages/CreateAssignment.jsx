import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Upload, FileText, Calendar, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import classApi from '@/api/classApi'
import assignmentApi from '@/api/assignmentApi'
import uploadApi from '@/api/uploadApi'

export default function CreateAssignment() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    points: 100,
    submission_type: 'file',
    is_published: false,
    attachments: []
  })

  useEffect(() => {
    const loadClass = async () => {
      try {
        const data = await classApi.getClass(classId)
        setClassData(data)
        if (!data.is_teacher) {
          navigate(`/classes/${classId}`)
        }
      } catch (error) {
        console.error('Failed to load class:', error)
        navigate('/classes')
      } finally {
        setIsLoading(false)
      }
    }
    loadClass()
  }, [classId, navigate])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const result = await uploadApi.uploadFile(file)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          name: file.name,
          url: result.url,
          type: file.type,
          size: file.size
        }]
      }))
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Upload service unavailable. File will be attached as reference only.')
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          name: file.name,
          url: '#',
          type: file.type,
          size: file.size
        }]
      }))
    } finally {
      setUploadingFile(false)
    }
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (publish = false) => {
    if (!formData.title.trim()) {
      alert('Please enter assignment title')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        ...formData,
        is_published: publish
      }
      
      const assignment = await assignmentApi.createAssignment(classId, data)
      navigate(`/assignments/${assignment._id}`)
    } catch (error) {
      console.error('Failed to create assignment:', error)
      alert('Failed to create assignment. Please try again.')
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Link to={`/classes/${classId}`}>
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Create Assignment
          </h1>
          <p className="text-gray-400">
            Create a new assignment for {classData?.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Assignment Details</CardTitle>
              <CardDescription className="text-gray-500">
                Fill in the details for your assignment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-gray-300">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Assignment title"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the assignment"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
              rows={2}
            />
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-gray-300">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Detailed instructions for students..."
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
              rows={5}
            />
          </div>

          {/* Due Date & Points Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date" className="text-gray-300">Due Date</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20 [color-scheme:dark]"
              />
            </div>
            <div>
              <Label htmlFor="points" className="text-gray-300">Points</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="mt-2 bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                min={0}
              />
            </div>
          </div>

          {/* Submission Type */}
          <div>
            <Label className="text-gray-300">Submission Type</Label>
            <Select
              value={formData.submission_type}
              onValueChange={(value) => setFormData({ ...formData, submission_type: value })}
            >
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="file" className="text-white hover:bg-white/10">File Upload</SelectItem>
                <SelectItem value="text" className="text-white hover:bg-white/10">Text Entry</SelectItem>
                <SelectItem value="link" className="text-white hover:bg-white/10">URL/Link</SelectItem>
                <SelectItem value="none" className="text-white hover:bg-white/10">No Submission (Offline)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-gray-300">Attachments</Label>
            <p className="text-sm text-gray-500 mt-1">
              Add reference materials or resources for students
            </p>
            
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttachment(index)}
                    className="shrink-0 w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                  {uploadingFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
                      <span className="text-sm text-gray-400">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Click to upload or drag and drop
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/classes/${classId}`)}
          disabled={isSubmitting}
          className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting || !formData.title.trim()}
          className="bg-gray-700 text-white hover:bg-gray-600"
        >
          {isSubmitting ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          variant="gradient"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || !formData.title.trim()}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          {isSubmitting ? 'Publishing...' : 'Publish Assignment'}
        </Button>
      </div>
    </motion.div>
  )
}
