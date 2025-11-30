/**
 * CreateProblem - Form to create/edit coding problems (Admin only)
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  X,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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

export default function CreateProblem() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isEditing = !!problemId

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grading_criteria: '',
    max_score: 100,
    difficulty: 'medium',
    tags: [],
    is_published: true
  })
  
  const [tagInput, setTagInput] = useState('')

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang này')
      navigate('/problems')
    }
  }, [user, navigate])

  // Load problem data if editing
  useEffect(() => {
    if (isEditing) {
      fetchProblem()
    }
  }, [problemId])

  const fetchProblem = async () => {
    setIsLoading(true)
    try {
      const data = await problemApi.getProblem(problemId)
      setFormData({
        title: data.title || '',
        description: data.description || '',
        grading_criteria: data.grading_criteria || '',
        max_score: data.max_score || 100,
        difficulty: data.difficulty || 'medium',
        tags: data.tags || [],
        is_published: data.is_published !== false
      })
    } catch (error) {
      toast.error('Không thể tải bài tập')
      navigate('/problems')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả bài tập')
      return
    }
    if (!formData.grading_criteria.trim()) {
      toast.error('Vui lòng nhập tiêu chí chấm điểm')
      return
    }

    setIsSaving(true)
    try {
      if (isEditing) {
        await problemApi.updateProblem(problemId, formData)
        toast.success('Cập nhật bài tập thành công!')
      } else {
        await problemApi.createProblem(formData)
        toast.success('Tạo bài tập thành công!')
      }
      navigate('/problems')
    } catch (error) {
      toast.error(error.message || 'Không thể lưu bài tập')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            {isEditing ? 'Chỉnh sửa bài' : 'Tạo bài mới'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Tiêu đề <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                placeholder="VD: Tìm số lớn nhất trong mảng"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Difficulty & Max Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Độ khó</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v) => handleChange('difficulty', v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_score" className="text-white">
                  Điểm tối đa
                </Label>
                <Input
                  id="max_score"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_score}
                  onChange={(e) => handleChange('max_score', parseInt(e.target.value) || 100)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-white">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tag và nhấn Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button 
                  type="button"
                  onClick={addTag}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-purple-500/20 text-purple-400 pr-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Mô tả bài tập <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết bài tập, yêu cầu đầu vào/đầu ra, ví dụ..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">
                Bạn có thể sử dụng định dạng text với xuống dòng để mô tả rõ ràng hơn
              </p>
            </div>

            {/* Grading Criteria */}
            <div className="space-y-2">
              <Label htmlFor="grading_criteria" className="text-white">
                Tiêu chí chấm điểm <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="grading_criteria"
                placeholder="Mô tả cách AI sẽ chấm điểm bài làm. VD:
- Thuật toán đúng: 40 điểm
- Code sạch, dễ đọc: 20 điểm
- Xử lý edge cases: 20 điểm
- Độ phức tạp tối ưu: 20 điểm"
                value={formData.grading_criteria}
                onChange={(e) => handleChange('grading_criteria', e.target.value)}
                className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">
                AI sẽ dựa vào tiêu chí này để chấm điểm tự động. Hãy mô tả cụ thể các yêu cầu.
              </p>
            </div>

            {/* Published */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Checkbox
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleChange('is_published', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="is_published" className="text-white cursor-pointer">
                  Công khai bài tập
                </Label>
                <p className="text-xs text-gray-500">
                  {formData.is_published 
                    ? 'Học sinh có thể nhìn thấy và nộp bài'
                    : 'Chỉ admin có thể nhìn thấy bài tập này'
                  }
                </p>
              </div>
              {formData.is_published ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/problems')}
                className="text-gray-400 hover:text-white"
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cập nhật' : 'Tạo bài tập'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
