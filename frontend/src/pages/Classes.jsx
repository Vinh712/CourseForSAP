import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, Grid3X3, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ClassCard from '@/components/ClassCard'
import EmptyState from '@/components/EmptyState'
import { useClassStore } from '@/stores/classStore'

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

export default function Classes() {
  const { classes, fetchClasses, isLoading } = useClassStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'teaching') return matchesSearch && cls.is_teacher
    if (activeTab === 'enrolled') return matchesSearch && !cls.is_teacher
    return matchesSearch
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Classes</h1>
          <p className="text-gray-400 mt-1">
            View classes you are enrolled in or teaching
          </p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400"
              >
                All ({classes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="teaching"
                className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400"
              >
                Teaching ({classes.filter(c => c.is_teacher).length})
              </TabsTrigger>
              <TabsTrigger 
                value="enrolled"
                className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400"
              >
                Enrolled ({classes.filter(c => !c.is_teacher).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
          </div>
        </div>
      ) : filteredClasses.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }
        >
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls._id}
              classData={cls}
              viewMode={viewMode}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? "No classes found" : "No classes yet"}
          description={
            searchQuery
              ? "Try adjusting your search terms"
              : "You haven't been assigned to any classes yet. Please contact your administrator."
          }
        />
      )}
    </motion.div>
  )
}
