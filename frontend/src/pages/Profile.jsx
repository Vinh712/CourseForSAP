import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  BookOpen,
  Award,
  Calendar,
  Clock,
  GraduationCap,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import uploadApi from '@/api/uploadApi'
import { useAuthStore } from '@/stores/authStore'
import { getInitials, formatDate } from '@/lib/utils'

export default function Profile() {
  const { user, isLoading: authLoading, updateProfile: updateAuthProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar_url: '',
    role: 'student'
  })
  const [stats, setStats] = useState({
    classesEnrolled: 0,
    assignmentsCompleted: 0,
    totalHours: 0,
    streak: 0
  })

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar_url: user.avatar_url || '',
        role: user.role || 'student'
      })
      if (user.stats) {
        setStats(user.stats)
      }
    }
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const result = await uploadApi.uploadImage(file)
      setProfile({ ...profile, avatar_url: result.url })
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await updateAuthProfile({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        avatar_url: profile.avatar_url
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !user) {
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
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <Card className="glass-card border-0 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 sm:h-48 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <CardContent className="relative pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 sm:left-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-[#0f1118] shadow-2xl ring-2 ring-purple-500/20">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 sm:pt-12 sm:pl-44">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.name || 'User'}</h1>
                <p className="text-gray-400">{profile.email}</p>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                className={isEditing ? "border-white/10 hover:bg-white/10" : ""}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </>
                ) : (
                  'Edit Profile'
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="capitalize bg-purple-500/20 text-purple-400 border-0">
                <GraduationCap className="w-3 h-3 mr-1" />
                {profile.role}
              </Badge>
              {profile.location && (
                <Badge className="bg-white/10 text-gray-300 border-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  {profile.location}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0 text-center p-4 group hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-purple-500/30">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.classesEnrolled}</p>
            <p className="text-sm text-gray-500">Classes Enrolled</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0 text-center p-4 group hover:shadow-lg hover:shadow-green-500/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-green-500/30">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.assignmentsCompleted}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-0 text-center p-4 group hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-blue-500/30">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalHours}</p>
            <p className="text-sm text-gray-500">Hours Logged</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-0 text-center p-4 group hover:shadow-lg hover:shadow-orange-500/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-orange-500/30">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.streak}</p>
            <p className="text-sm text-gray-500">Day Streak</p>
          </Card>
        </motion.div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 w-full justify-start">
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-gray-400">
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal details here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-white/5 opacity-60"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed here
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 hover:bg-white/10 text-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-400">
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive updates about assignments and classes
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Enabled
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="font-medium text-white">Assignment Reminders</p>
                  <p className="text-sm text-gray-500">
                    Get reminded before assignment due dates
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Enabled
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">Weekly Summary</p>
                  <p className="text-sm text-gray-500">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:bg-white/5">
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Info */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Account Created</p>
              <p className="font-medium text-white">{formatDate(user?.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Role</p>
              <p className="font-medium text-white capitalize">{user?.role || 'student'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
