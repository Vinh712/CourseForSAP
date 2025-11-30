import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  FileText,
  Shield,
  TrendingUp,
  UserPlus,
  GraduationCap,
  ChevronRight,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import adminApi from '@/api/adminApi'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_admins: 0,
    total_classes: 0,
    total_assignments: 0,
    total_submissions: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers()
        ])

        // Ensure we have valid data
        if (statsData) {
          setStats(statsData)
        }
        if (Array.isArray(usersData)) {
          setRecentUsers(usersData.slice(0, 5))
        }
      } catch (error) {
        console.error('Failed to load admin data:', error)
        setError(error.response?.data?.error || error.message || 'Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/10 blur-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <Shield className="w-16 h-16 text-red-500" />
          <div className="absolute inset-0 w-16 h-16 bg-red-500/20 blur-xl" />
        </div>
        <h2 className="text-xl font-semibold text-red-400">Access Denied</h2>
        <p className="text-gray-500 text-center max-w-md">
          {error}. Only administrators can access this page.
        </p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.total_users, 
      icon: Users, 
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      ring: 'ring-purple-500/30',
      description: 'All registered users'
    },
    { 
      title: 'Students', 
      value: stats.total_students, 
      icon: GraduationCap, 
      gradient: 'from-green-500/20 to-green-500/5',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      ring: 'ring-green-500/30',
      description: 'Enrolled students'
    },
    { 
      title: 'Teachers', 
      value: stats.total_teachers, 
      icon: BookOpen, 
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      ring: 'ring-blue-500/30',
      description: 'Active teachers'
    },
    { 
      title: 'Classes', 
      value: stats.total_classes, 
      icon: FileText, 
      gradient: 'from-orange-500/20 to-orange-500/5',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      ring: 'ring-orange-500/30',
      description: 'Total classes'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center ring-1 ring-red-500/30">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div className="absolute inset-0 w-10 h-10 bg-red-500/20 blur-xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-400 mt-1">
            Manage users, classes, and system settings
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 relative">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} rounded-full blur-3xl group-hover:opacity-70 transition-opacity`} />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center ring-1 ${stat.ring}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-between h-auto py-4 bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Manage Users</p>
                    <p className="text-xs text-gray-500">View and edit user roles</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>

            <Link to="/admin/classes">
              <Button variant="outline" className="w-full justify-between h-auto py-4 bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:ring-blue-500/50 transition-all">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Manage Classes</p>
                    <p className="text-xs text-gray-500">Create classes, assign teachers & students</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>

            <Button variant="outline" className="w-full justify-between h-auto py-4 bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/30 group-hover:ring-green-500/50 transition-all">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">View Reports</p>
                  <p className="text-xs text-gray-500">Analytics and statistics</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Users</CardTitle>
                <CardDescription className="text-gray-400">Newly registered users</CardDescription>
              </div>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium shadow-lg shadow-purple-500/20">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{user.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-0' :
                      user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400 border-0' :
                      'bg-green-500/20 text-green-400 border-0'
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-500">No users yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
