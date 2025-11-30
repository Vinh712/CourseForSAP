import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  Users,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  ChevronLeft,
  Trash2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import adminApi from '@/api/adminApi'
import { getInitials } from '@/lib/utils'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [users, setUsers] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [changeTeacherDialogOpen, setChangeTeacherDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  
  // New class form
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    teacher_id: '',
    color: '#8b5cf6'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [classesData, usersData] = await Promise.all([
        adminApi.getAllClasses(),
        adminApi.getUsers()
      ])
      
      setClasses(classesData)
      setUsers(usersData)
      setTeachers(usersData.filter(u => u.role === 'teacher' || u.role === 'admin'))
      setStudents(usersData.filter(u => u.role === 'student'))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateClass = async () => {
    try {
      const created = await adminApi.createClass(newClass)
      setClasses([created, ...classes])
      setCreateDialogOpen(false)
      setNewClass({ name: '', description: '', teacher_id: '', color: '#8b5cf6' })
    } catch (error) {
      console.error('Failed to create class:', error)
    }
  }

  const handleAssignStudents = async () => {
    if (!selectedClass || selectedStudents.length === 0) return
    
    try {
      await adminApi.assignStudents(selectedClass._id, selectedStudents)
      
      // Refresh classes
      const updatedClasses = await adminApi.getAllClasses()
      setClasses(updatedClasses)
      
      setAssignDialogOpen(false)
      setSelectedStudents([])
      setSelectedClass(null)
    } catch (error) {
      console.error('Failed to assign students:', error)
    }
  }

  const handleRemoveMember = async (classId, userId) => {
    try {
      await adminApi.removeMember(classId, userId)
      
      // Refresh classes
      const updatedClasses = await adminApi.getAllClasses()
      setClasses(updatedClasses)
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class? All related courses and assignments will also be deleted.')) {
      return
    }
    try {
      await adminApi.deleteClass(classId)
      setClasses(classes.filter(c => c._id !== classId))
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  const openAssignDialog = (cls) => {
    setSelectedClass(cls)
    setSelectedStudents([])
    setAssignDialogOpen(true)
  }

  const openChangeTeacherDialog = (cls) => {
    setSelectedClass(cls)
    setSelectedTeacherId(cls.teacher_id || '')
    setChangeTeacherDialogOpen(true)
  }

  const handleChangeTeacher = async () => {
    if (!selectedClass || !selectedTeacherId) return
    
    try {
      await adminApi.assignTeacher(selectedClass._id, selectedTeacherId)
      
      // Refresh classes
      const updatedClasses = await adminApi.getAllClasses()
      setClasses(updatedClasses)
      
      setChangeTeacherDialogOpen(false)
      setSelectedTeacherId('')
      setSelectedClass(null)
    } catch (error) {
      console.error('Failed to change teacher:', error)
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Classes</h1>
            <p className="text-gray-400 mt-1">
              Create classes and assign teachers and students
            </p>
          </div>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a class and assign a teacher
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-300">Class Name *</Label>
                <Input
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g., Mathematics 101"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Class description..."
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  rows={2}
                />
              </div>
              
              <div>
                <Label className="text-gray-300">Assign Teacher *</Label>
                <Select
                  value={newClass.teacher_id}
                  onValueChange={(value) => setNewClass({ ...newClass, teacher_id: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        <div className="flex items-center gap-2">
                          <span>{teacher.name || teacher.email}</span>
                          <Badge className="bg-white/10 text-gray-300 border-0 text-xs">
                            {teacher.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#ec4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewClass({ ...newClass, color })}
                      className={`w-8 h-8 rounded-lg transition-all ring-offset-[#0f1118] ${
                        newClass.color === color ? 'ring-2 ring-offset-2 ring-white/50 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClass} 
                disabled={!newClass.name.trim() || !newClass.teacher_id}
              >
                Create Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => (
          <motion.div
            key={cls._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <div 
                className="h-3" 
                style={{ backgroundColor: cls.color || '#8b5cf6' }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{cls.name}</CardTitle>
                    <CardDescription className="text-gray-500">Code: {cls.code}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAssignDialog(cls)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Students
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openChangeTeacherDialog(cls)}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Change Teacher
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-400"
                        onClick={() => handleDeleteClass(cls._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{cls.teacher_id ? 1 : 0} teacher</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{cls.students?.length || 0} students</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-medium text-gray-500 mb-2">Members</p>
                  <div className="flex -space-x-2">
                    {[cls.teacher_id, ...(cls.students || [])].filter(Boolean).slice(0, 5).map((memberId, idx) => {
                      const member = users.find(u => u._id === memberId)
                      return (
                        <Avatar key={idx} className="w-8 h-8 border-2 border-[#0f1118]">
                          <AvatarImage src={member?.avatar_url} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {getInitials(member?.name || member?.email || '?')}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })}
                    {(cls.teacher_id ? 1 : 0) + (cls.students?.length || 0) > 5 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-gray-400 border-2 border-[#0f1118]">
                        +{(cls.teacher_id ? 1 : 0) + (cls.students?.length || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No classes found</p>
          </div>
        )}
      </div>

      {/* Assign Students Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Students to {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Select students to add to this class
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {students.map((student) => {
                const isAlreadyInClass = selectedClass?.students?.includes(student._id)
                const isSelected = selectedStudents.includes(student._id)
                
                return (
                  <div
                    key={student._id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isAlreadyInClass 
                        ? 'bg-white/5 opacity-50 border-white/5' 
                        : 'hover:bg-white/5 cursor-pointer border-white/10'
                    } ${isSelected ? 'border-purple-500/50 bg-purple-500/10' : ''}`}
                    onClick={() => {
                      if (isAlreadyInClass) return
                      setSelectedStudents(
                        isSelected 
                          ? selectedStudents.filter(id => id !== student._id)
                          : [...selectedStudents, student._id]
                      )
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {getInitials(student.name || student.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-white">{student.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    {isAlreadyInClass ? (
                      <Badge className="bg-white/10 text-gray-400 border-0">Already added</Badge>
                    ) : (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    )}
                  </div>
                )
              })}
              {students.length === 0 && (
                <p className="text-center text-gray-500 py-4">No students available</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignStudents}
              disabled={selectedStudents.length === 0}
            >
              Add {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Teacher Dialog */}
      <Dialog open={changeTeacherDialogOpen} onOpenChange={setChangeTeacherDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Teacher for {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Select a new teacher for this class
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-gray-300">Select Teacher</Label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    <div className="flex items-center gap-2">
                      <span>{teacher.name || teacher.email}</span>
                      <Badge className="bg-white/10 text-gray-300 border-0 text-xs">
                        {teacher.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeTeacherDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleChangeTeacher}
              disabled={!selectedTeacherId}
            >
              Update Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
