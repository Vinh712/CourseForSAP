import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { cn, formatDate, getRelativeTime } from '@/lib/utils'

export default function AssignmentCard({ assignment, compact = false }) {
  const {
    _id,
    title,
    description,
    due_date,
    points,
    class_name,
    class_color = '#a855f7',
    submitted,
    submission
  } = assignment

  const dueDate = due_date ? new Date(due_date) : null
  const isOverdue = dueDate && new Date() > dueDate && !submitted
  const isDueSoon = dueDate && !isOverdue && (dueDate - new Date()) < 24 * 60 * 60 * 1000

  const getStatusBadge = () => {
    if (submitted) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
        </Badge>
      )
    }
    if (isOverdue) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-0">
          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
        </Badge>
      )
    }
    if (isDueSoon) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
          <Clock className="h-3 w-3 mr-1" /> Due Soon
        </Badge>
      )
    }
    return (
      <Badge className="bg-white/10 text-gray-400 border-0">
        <Clock className="h-3 w-3 mr-1" /> Pending
      </Badge>
    )
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to={`/assignments/${_id}`}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-white/10"
        >
          <div
            className="w-1.5 h-10 rounded-full"
            style={{ backgroundColor: class_color }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-white group-hover:text-purple-400 transition-colors truncate">
              {title}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {class_name} • {getRelativeTime(due_date)}
            </p>
          </div>
          {getStatusBadge()}
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
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
      <Card className={cn(
        "glass-card border-0 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300",
        isOverdue && !submitted && "ring-1 ring-red-500/30"
      )}>
        {/* Color Accent */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${class_color}, transparent)`
          }}
        />
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <Link
                to={`/assignments/${_id}`}
                className="block group"
              >
                <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                  {title}
                </h3>
              </Link>
              {class_name && (
                <p className="text-sm text-gray-500">{class_name}</p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{dueDate ? formatDate(dueDate) : 'No due date'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>{points} pts</span>
              </div>
            </div>

            {submission && submission.grade !== undefined && (
              <Badge className="bg-green-500/20 text-green-400 border-0">
                {submission.grade}/{points}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
