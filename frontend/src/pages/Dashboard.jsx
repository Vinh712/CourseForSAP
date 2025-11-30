import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import ClassCard from '@/components/ClassCard'
import AssignmentCard from '@/components/AssignmentCard'
import ScheduleItem from '@/components/ScheduleItem'
import EmptyState from '@/components/EmptyState'
import classApi from '@/api/classApi'
import assignmentApi from '@/api/assignmentApi'
import scheduleApi from '@/api/scheduleApi'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Dashboard() {
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [schedule, setSchedule] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, assignmentsData, scheduleData] = await Promise.all([
          classApi.getClasses().catch(() => []),
          assignmentApi.getUpcomingAssignments().catch(() => []),
          scheduleApi.getTodaySchedule().catch(() => [])
        ])

        setClasses(classesData)
        setAssignments(assignmentsData)
        setSchedule(scheduleData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25 btn-glow"
          asChild
        >
          <Link to="/classes">
            <Plus className="w-4 h-4 mr-2" />
            New Class
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-400">Total Classes</p>
                <p className="text-3xl font-bold mt-1 text-white">{classes.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-400">Pending Tasks</p>
                <p className="text-3xl font-bold mt-1 text-white">
                  {assignments.filter(a => !a.submitted).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-400">Today's Events</p>
                <p className="text-3xl font-bold mt-1 text-white">{schedule.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center ring-1 ring-cyan-500/30">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-3xl font-bold mt-1 text-white">87%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/30">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assignments & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  Upcoming Assignments
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white hover:bg-white/5">
                  <Link to="/assignments">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-2">
                    {assignments.slice(0, 5).map(assignment => (
                      <AssignmentCard key={assignment._id} assignment={assignment} compact />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No upcoming assignments"
                    description="You're all caught up! Check back later for new assignments."
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  Today's Schedule
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white hover:bg-white/5">
                  <Link to="/schedule">
                    View Calendar <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {schedule.length > 0 ? (
                  <div className="space-y-1">
                    {schedule.map(event => (
                      <ScheduleItem key={event._id} event={event} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No events today"
                    description="Your schedule is clear for today."
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Classes */}
        <motion.div variants={itemVariants}>
          <Card className="h-fit glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-400" />
                </div>
                Your Classes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white hover:bg-white/5">
                <Link to="/classes">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="space-y-3">
                  {classes.slice(0, 4).map(cls => (
                    <Link
                      key={cls._id}
                      to={`/classes/${cls._id}`}
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center ring-1"
                          style={{ 
                            backgroundColor: `${cls.color}20`,
                            '--tw-ring-color': `${cls.color}40`
                          }}
                        >
                          <BookOpen
                            className="w-5 h-5"
                            style={{ color: cls.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white group-hover:text-purple-400 transition-colors truncate">
                            {cls.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {cls.member_count} members
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No classes yet"
                  description="Join or create your first class to get started."
                  action={
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                      asChild
                    >
                      <Link to="/classes">Get Started</Link>
                    </Button>
                  }
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card className="mt-6 glass-card border-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-white">Quick Tip</h4>
                  <p className="text-sm text-gray-400">
                    Stay organized by checking your schedule every morning and planning your tasks for the day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
