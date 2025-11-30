import { motion } from 'framer-motion'
import { Clock, MapPin, BookOpen } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'

export default function ScheduleItem({ event, showDate = false }) {
  const {
    title,
    description,
    date,
    start_time,
    end_time,
    event_type,
    location,
    color = '#8b5cf6',
    class_name
  } = event

  const getEventTypeIcon = () => {
    switch (event_type) {
      case 'class':
        return <BookOpen className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
        {/* Time Column */}
        <div className="w-20 flex-shrink-0 text-right">
          <span className="text-sm font-medium text-white">{formatTime(start_time)}</span>
          <span className="block text-xs text-gray-500">{formatTime(end_time)}</span>
        </div>

        {/* Color Bar */}
        <div
          className="w-1 rounded-full flex-shrink-0 shadow-[0_0_8px_var(--bar-color)]"
          style={{ 
            backgroundColor: color,
            '--bar-color': `${color}50`
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {getEventTypeIcon()}
            </span>
            <h4 className="font-medium text-sm text-white group-hover:text-purple-300 transition-colors truncate">
              {title}
            </h4>
          </div>
          
          {class_name && (
            <p className="text-xs text-gray-500 mb-1">{class_name}</p>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
              {description}
            </p>
          )}

          {location && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
