import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Shield,
  Users,
  Zap,
  Code2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import useAuthStore from '@/stores/authStore'

const baseNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'teacher', 'admin'] },
  { path: '/classes', icon: BookOpen, label: 'Classes', roles: ['student', 'teacher', 'admin'] },
  { path: '/assignments', icon: FileText, label: 'Assignments', roles: ['student', 'teacher', 'admin'] },
  { path: '/problems', icon: Code2, label: 'AI Teacher', roles: ['student', 'teacher', 'admin'] },
  { path: '/schedule', icon: Calendar, label: 'Schedule', roles: ['student', 'teacher', 'admin'] },
]

const adminNavItems = [
  { path: '/admin', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
  { path: '/admin/users', icon: Users, label: 'Manage Users', roles: ['admin'] },
]

const bottomNavItems = [
  { path: '/profile', icon: User, label: 'Profile', roles: ['student', 'teacher', 'admin'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useAuthStore()
  const userRole = user?.role || 'student'

  const navItems = [
    ...baseNavItems.filter(item => item.roles.includes(userRole)),
    ...(userRole === 'admin' ? adminNavItems : []),
  ]

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path))
    
    const linkContent = (
      <NavLink
        to={item.path}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
          isActive
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavBg"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/20"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <item.icon className={cn(
          'relative z-10 w-5 h-5 flex-shrink-0 transition-all duration-300',
          isActive ? 'text-purple-400' : 'group-hover:text-purple-400'
        )} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 font-medium"
          >
            {item.label}
          </motion.span>
        )}
        {isActive && !collapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 ml-auto w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        )}
      </NavLink>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-gray-900 border-gray-800 text-white">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return <div key={item.path}>{linkContent}</div>
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full glass-sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/25">
          <GraduationCap className="w-6 h-6 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 animate-pulse opacity-50 blur-md" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col"
          >
            <span className="font-bold text-xl gradient-text">NLS Studio</span>
            <span className="text-xs text-gray-500">Learning Platform</span>
          </motion.div>
        )}
      </div>

      <div className="px-4">
        <Separator className="bg-white/5" />
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-4">
          <Badge 
            className={cn(
              "capitalize px-3 py-1.5 rounded-lg font-medium text-xs border-0",
              userRole === 'admin' && "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
              userRole === 'teacher' && "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
              userRole === 'student' && "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
            )}
          >
            {userRole === 'admin' && <Shield className="w-3.5 h-3.5 mr-1.5" />}
            {userRole === 'teacher' && <BookOpen className="w-3.5 h-3.5 mr-1.5" />}
            {userRole === 'student' && <GraduationCap className="w-3.5 h-3.5 mr-1.5" />}
            {userRole}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(renderNavItem)}
        
        {userRole === 'admin' && !collapsed && (
          <div className="pt-3">
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/5">
        {/* Profile Link */}
        <div className="mb-3">
          {bottomNavItems.map(renderNavItem)}
        </div>

        {!collapsed && userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-4 rounded-2xl glass-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-semibold text-sm text-white">Pro Features</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Unlock advanced analytics and more
              </p>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25 btn-glow"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Upgrade
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  )
}
