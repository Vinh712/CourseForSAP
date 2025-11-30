import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, MoreVertical, ExternalLink, ArrowRight } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { cn, getInitials } from '@/lib/utils'

export default function ClassCard({ classData, viewMode = 'grid' }) {
  const {
    _id,
    name,
    description,
    code,
    color = '#a855f7',
    cover_image,
    is_teacher,
    member_count = 0,
    courses = [],
    members = []
  } = classData

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={`/classes/${_id}`}>
          <Card className="glass-card border-0 hover:bg-white/10 transition-all duration-300 group">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ring-1"
                style={{ 
                  backgroundColor: `${color}20`,
                  '--tw-ring-color': `${color}40`
                }}
              >
                <BookOpen className="w-6 h-6" style={{ color }} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                    {name}
                  </h3>
                  <Badge className="bg-white/10 text-gray-400 border-0 text-xs">
                    {code}
                  </Badge>
                </div>
                {description && (
                  <p className="text-sm text-gray-500 truncate">
                    {description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{member_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{courses.length || 0}</span>
                  </div>
                </div>

                <Badge 
                  className={cn(
                    "border-0 px-3 py-1",
                    is_teacher 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "bg-blue-500/20 text-blue-400"
                  )}
                >
                  {is_teacher ? 'Teacher' : 'Student'}
                </Badge>

                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card border-0 group overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        {/* Cover Image / Color Header */}
        <div
          className="h-32 relative"
          style={{
            background: cover_image
              ? `url(${cover_image}) center/cover`
              : `linear-gradient(135deg, ${color}40 0%, ${color}10 100%)`
          }}
        >
          {/* Grid Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1118] via-transparent to-transparent" />
          
          {/* Class Code Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/50 backdrop-blur-md text-white border-white/10 text-xs">
              {code}
            </Badge>
          </div>

          {/* More Options */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white border border-white/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/10">
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5">
                  <Link to={`/classes/${_id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge 
              className={cn(
                "border-0 backdrop-blur-md",
                is_teacher 
                  ? "bg-purple-500/30 text-purple-300" 
                  : "bg-blue-500/30 text-blue-300"
              )}
            >
              {is_teacher ? 'Teacher' : 'Student'}
            </Badge>
          </div>

          {/* Color accent */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
          />
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <Link to={`/classes/${_id}`} className="block group/link">
            <h3 className="font-semibold text-lg mb-1 text-white group-hover/link:text-purple-400 transition-colors line-clamp-1">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {description}
              </p>
            )}
          </Link>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <Users className="h-4 w-4 text-purple-400" />
                <span>{member_count}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>{courses.length || 0}</span>
              </div>
            </div>

            {/* Member Avatars */}
            {members && members.length > 0 && (
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((member, i) => (
                  <Avatar key={member._id || i} className="h-7 w-7 border-2 border-[#0f1118] ring-1 ring-white/10">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {getInitials(member.name || member.email)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 3 && (
                  <div className="h-7 w-7 rounded-full bg-white/10 border-2 border-[#0f1118] flex items-center justify-center">
                    <span className="text-xs text-gray-400">+{members.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
