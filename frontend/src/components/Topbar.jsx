import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import { getInitials } from '@/lib/utils'
import useAuthStore from '@/stores/authStore'

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <Input
              type="search"
              placeholder="Search classes, assignments..."
              className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/10 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl relative text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-medium shadow-lg shadow-purple-500/30">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-card border-white/10 rounded-2xl p-0 overflow-hidden">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-white font-semibold">Notifications</span>
                <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:text-purple-300 hover:bg-transparent">
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 focus:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <span className="font-medium text-sm text-white">New Assignment</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-4">
                    "Calculus Homework" is due tomorrow
                  </p>
                  <span className="text-xs text-gray-500 pl-4">2 hours ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 focus:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="font-medium text-sm text-white">Class Update</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-4">
                    New material added to "Web Development"
                  </p>
                  <span className="text-xs text-gray-500 pl-4">5 hours ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="font-medium text-sm text-white">Grade Posted</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-4">
                    Your "History Essay" has been graded
                  </p>
                  <span className="text-xs text-gray-500 pl-4">1 day ago</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="relative">
                  <Avatar className="h-9 w-9 ring-2 ring-purple-500/30">
                    <AvatarImage src={user?.avatar_url} alt={user?.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                      {getInitials(user?.name || user?.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1118]" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-white">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user?.role || 'Student'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 rounded-2xl p-2">
              <DropdownMenuLabel className="text-gray-400 font-normal text-xs px-2">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
