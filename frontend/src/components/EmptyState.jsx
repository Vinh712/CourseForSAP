import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl",
        "bg-white/5 border border-dashed border-white/10",
        className
      )}
    >
      {Icon && (
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center ring-1 ring-purple-500/20">
            <Icon className="w-8 h-8 text-gray-500" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-purple-500/10 blur-xl" />
        </div>
      )}
      
      <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action}
    </motion.div>
  )
}
