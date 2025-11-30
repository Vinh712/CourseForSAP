import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, FileText, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AssignmentCard from '@/components/AssignmentCard'
import EmptyState from '@/components/EmptyState'
import assignmentApi from '@/api/assignmentApi'
import classApi from '@/api/classApi'

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

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [sortBy, setSortBy] = useState('due_date')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all classes first
        const classesData = await classApi.getClasses()
        setClasses(classesData)

        // Get all assignments from each class
        const allAssignments = []
        for (const cls of classesData) {
          try {
            const classAssignments = await assignmentApi.getClassAssignments(cls._id)
            allAssignments.push(...classAssignments.map(a => ({
              ...a,
              class_name: cls.name,
              class_color: cls.color
            })))
          } catch (e) {
            console.error(`Failed to load assignments for class ${cls._id}`)
          }
        }

        setAssignments(allAssignments)
      } catch (error) {
        console.error('Failed to load assignments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = classFilter === 'all' || assignment.class_id === classFilter
    
    let matchesStatus = true
    if (statusFilter === 'pending') matchesStatus = !assignment.submitted
    if (statusFilter === 'submitted') matchesStatus = assignment.submitted
    if (statusFilter === 'overdue') {
      const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
      matchesStatus = dueDate && new Date() > dueDate && !assignment.submitted
    }

    return matchesSearch && matchesClass && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'due_date') {
      const dateA = a.due_date ? new Date(a.due_date) : new Date(9999, 11, 31)
      const dateB = b.due_date ? new Date(b.due_date) : new Date(9999, 11, 31)
      return dateA - dateB
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  const pendingCount = assignments.filter(a => !a.submitted).length
  const submittedCount = assignments.filter(a => a.submitted).length
  const overdueCount = assignments.filter(a => {
    const dueDate = a.due_date ? new Date(a.due_date) : null
    return dueDate && new Date() > dueDate && !a.submitted
  }).length

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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Assignments</h1>
        <p className="text-gray-400 mt-1">
          Track and manage all your assignments
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="pl-10"
          />
        </div>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Status Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger 
              value="all" 
              className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400"
            >
              All ({assignments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="rounded-lg data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 text-gray-400"
            >
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger 
              value="submitted"
              className="rounded-lg data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400"
            >
              Submitted ({submittedCount})
            </TabsTrigger>
            <TabsTrigger 
              value="overdue" 
              className="rounded-lg data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"
            >
              Overdue ({overdueCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Assignments Grid */}
      {filteredAssignments.length > 0 ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title={searchQuery || classFilter !== 'all' || statusFilter !== 'all'
            ? "No assignments found"
            : "No assignments yet"
          }
          description={
            searchQuery || classFilter !== 'all' || statusFilter !== 'all'
              ? "Try adjusting your filters"
              : "You don't have any assignments. Check back later or join more classes."
          }
        />
      )}
    </motion.div>
  )
}
