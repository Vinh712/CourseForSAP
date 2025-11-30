import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ScheduleItem from '@/components/ScheduleItem'
import EmptyState from '@/components/EmptyState'
import scheduleApi from '@/api/scheduleApi'
import classApi from '@/api/classApi'
import { cn } from '@/lib/utils'

const eventColors = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
]

const eventTypes = [
  { name: 'Class', value: 'class' },
  { name: 'Assignment', value: 'assignment' },
  { name: 'Exam', value: 'exam' },
  { name: 'Meeting', value: 'meeting' },
  { name: 'Other', value: 'other' },
]

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '10:00',
    event_type: 'class',
    location: '',
    color: '#8b5cf6'
  })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, classesData] = await Promise.all([
          scheduleApi.getSchedule({
            start_date: format(weekStart, 'yyyy-MM-dd'),
            end_date: format(weekEnd, 'yyyy-MM-dd')
          }).catch(() => []),
          classApi.getClasses().catch(() => [])
        ])

        setEvents(eventsData)
        setClasses(classesData)
      } catch (error) {
        console.error('Failed to load schedule:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentDate])

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleCreateEvent = async () => {
    try {
      const event = await scheduleApi.createEvent(newEvent)
      setEvents([...events, event])
      setCreateDialogOpen(false)
      setNewEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
        event_type: 'class',
        location: '',
        color: '#8b5cf6'
      })
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return isSameDay(eventDate, day)
    })
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule</h1>
          <p className="text-gray-400 mt-1">
            Manage your classes and events
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-300">Event Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Math Class"
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Event Type</Label>
                  <Select
                    value={newEvent.event_type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Start Time</Label>
                  <Input
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">End Time</Label>
                  <Input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Location (optional)</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="e.g., Room 101"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-gray-300">Color</Label>
                <div className="flex gap-2 mt-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all ring-offset-[#0f1118]",
                        newEvent.color === color.value && "ring-2 ring-offset-2 ring-white/50 scale-110"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Description (optional)</Label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add notes..."
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title.trim()}>
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Navigation */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white">
              {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday} className="border-white/10 hover:bg-white/10 text-gray-300">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="text-gray-400 hover:text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextWeek} className="text-gray-400 hover:text-white hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[150px] md:min-h-[200px] rounded-xl border p-2 md:p-3 transition-all",
                    isCurrentDay 
                      ? "bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/5" 
                      : "border-white/5 hover:border-white/10",
                    "hover:bg-white/5 cursor-pointer"
                  )}
                  onClick={() => {
                    setSelectedDate(day)
                    setNewEvent({ ...newEvent, date: format(day, 'yyyy-MM-dd') })
                    setCreateDialogOpen(true)
                  }}
                >
                  {/* Day Header */}
                  <div className="text-center mb-2">
                    <p className="text-xs text-gray-500 uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isCurrentDay 
                        ? "w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center" 
                        : "text-gray-300"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        className="text-xs p-1.5 rounded-lg truncate backdrop-blur-sm"
                        style={{
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `2px solid ${event.color}`
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-medium">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const todayEvents = events.filter(event => isSameDay(new Date(event.date), new Date()))
            if (todayEvents.length > 0) {
              return (
                <div className="space-y-1">
                  {todayEvents
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((event) => (
                      <ScheduleItem key={event._id} event={event} />
                    ))}
                </div>
              )
            }
            return (
              <EmptyState
                icon={CalendarIcon}
                title="No events today"
                description="Your schedule is clear for today."
                className="py-8"
              />
            )
          })()}
        </CardContent>
      </Card>
    </motion.div>
  )
}
