import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Shield,
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  UserCog,
  ChevronLeft,
  Plus,
  Trash2,
  KeyRound
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import adminApi from '@/api/adminApi'
import { getInitials } from '@/lib/utils'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Create user dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'student' })
  const [creating, setCreating] = useState(false)
  
  // Password reset dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])
  
  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, users])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole)
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }
  
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await adminApi.createUser(newUser)
      setShowCreateDialog(false)
      setNewUser({ email: '', password: '', name: '', role: 'student' })
      loadUsers()
    } catch (error) {
      console.error('Failed to create user:', error)
      alert(error.response?.data?.error || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }
  
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(userId)
      setUsers(users.filter(u => u._id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert(error.response?.data?.error || 'Failed to delete user')
    }
  }
  
  const handleResetPassword = async (userId) => {
    try {
      const result = await adminApi.resetPassword(userId)
      setNewPassword(result.new_password)
      setSelectedUserId(userId)
      setShowPasswordDialog(true)
    } catch (error) {
      console.error('Failed to reset password:', error)
      alert(error.response?.data?.error || 'Failed to reset password')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />
      case 'teacher': return <BookOpen className="w-3 h-3" />
      default: return <GraduationCap className="w-3 h-3" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'border-red-500/30 text-red-400 bg-red-500/10'
      case 'teacher': return 'border-blue-500/30 text-blue-400 bg-blue-500/10'
      default: return 'border-green-500/30 text-green-400 bg-green-500/10'
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Users</h1>
            <p className="text-gray-400 mt-1">
              View and manage user roles and permissions
            </p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user account. They can login with these credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300">Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              The new password has been set. Please share it with the user securely.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-gray-300">New Password</Label>
            <div className="flex gap-2 mt-2">
              <Input value={newPassword} readOnly className="font-mono" />
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(newPassword)} className="border-white/10 hover:bg-white/10 text-gray-300">
                Copy
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPasswordDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/30">
              <GraduationCap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'student').length}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'teacher').length}</p>
              <p className="text-xs text-gray-500">Teachers</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center ring-1 ring-red-500/30">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-400">Click on the role badge to change user permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{user.name || 'Unnamed User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-auto p-0">
                        <Badge 
                          variant="outline" 
                          className={`cursor-pointer ${getRoleColor(user.role)}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'student')}>
                        <GraduationCap className="w-4 h-4 mr-2 text-green-400" />
                        Set as Student
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'teacher')}>
                        <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                        Set as Teacher
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'admin')}>
                        <Shield className="w-4 h-4 mr-2 text-red-400" />
                        Set as Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleResetPassword(user._id)}>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
