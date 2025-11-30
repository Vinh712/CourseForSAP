import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Users, 
  Award, 
  Loader2, 
  Eye, 
  EyeOff,
  Code2,
  Globe,
  Rocket,
  CheckCircle2,
  Zap,
  Star,
  ArrowRight,
  X,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAuthStore from '@/stores/authStore'
import axiosClient from '@/api/axiosClient'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password
      })

      // Store auth data
      setAuth(response.user, response.token)
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-900/20" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header with Login Button */}
      <header className="relative z-20 flex items-center justify-between p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <GraduationCap className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              NLS STUDIO
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm">Trung tâm Hỗ trợ Học tập</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Đăng nhập
          </Button>
        </motion.div>
      </header>

      {/* Main Landing Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-8 pb-12">
        <div className="max-w-5xl w-full">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Chinh phục <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">IELTS</span> cùng{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NLS STUDIO</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Chào mừng bạn đến với <span className="text-purple-400 font-semibold">NLS STUDIO</span> – Trung tâm hỗ trợ học tập chuyên nghiệp, giúp bạn <span className="text-cyan-400 font-semibold">chinh phục IELTS</span> và phát triển kỹ năng lập trình!
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* IELTS Foundation Course */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform mb-4">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  🚀 IELTS Foundation
                </h3>
                <p className="text-cyan-400 font-semibold mb-3">Từ 0 → 5.0 IELTS</p>
                <div className="space-y-2 text-left w-full">
                  {[
                    'Xây dựng nền tảng vững chắc',
                    'Ngữ pháp & từ vựng cơ bản',
                    'Luyện 4 kỹ năng nghe, nói, đọc, viết',
                    'Phương pháp học hiệu quả'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* IELTS Intermediate Course */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  🎯 IELTS 5.0 - 6.5
                </h3>
                <p className="text-green-400 font-semibold mb-3">Trung cấp → Khá</p>
                <div className="space-y-2 text-left w-full">
                  {[
                    'Chiến lược làm bài hiệu quả',
                    'Mở rộng từ vựng học thuật',
                    'Luyện đề thi thực tế',
                    'Feedback chi tiết từ giảng viên'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* IELTS Advanced Course */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="group p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform mb-4">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  ⭐ IELTS Advanced
                </h3>
                <p className="text-yellow-400 font-semibold mb-3">Band 7.0+ cao cấp</p>
                <div className="space-y-2 text-left w-full">
                  {[
                    'Kỹ thuật đạt điểm cao',
                    'Writing Task 1 & 2 chuyên sâu',
                    'Speaking Part 2, 3 nâng cao',
                    'Mock test & đánh giá 1-1'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* IT Courses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
              <Code2 className="w-6 h-6 text-purple-400" />
              Khóa học Lập trình
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Python Starter */}
              <div className="group p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-green-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 text-center">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform mb-3">
                  <span className="text-xl">🐍</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Python</h4>
                <p className="text-yellow-400 text-xs">Starter</p>
              </div>

              {/* C++ Starter */}
              <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 text-center">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform mb-3">
                  <span className="text-xl font-bold text-white">C++</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">C++</h4>
                <p className="text-blue-400 text-xs">Starter</p>
              </div>

              {/* Java Starter */}
              <div className="group p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 text-center">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform mb-3">
                  <span className="text-xl">☕</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Java</h4>
                <p className="text-orange-400 text-xs">Starter</p>
              </div>

              {/* Full Stack Web */}
              <div className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 text-center">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform mb-3">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Full Stack</h4>
                <p className="text-purple-400 text-xs">Web Developer</p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-green-500/10 border border-cyan-500/20 text-center backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl text-cyan-300 font-bold">🎓 Hỗ trợ học tập toàn diện!</p>
                <p className="text-cyan-200/70">Tư vấn miễn phí - Lộ trình học cá nhân hóa</p>
              </div>
            </div>
            <a 
              href="https://zalo.me/0945438456" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              TƯ VẤN MIỄN PHÍ NGAY
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12 text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span><strong className="text-white">500+</strong> học viên</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span><strong className="text-white">4.9★</strong> đánh giá</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              <span><strong className="text-white">10+</strong> khóa IELTS</span>
            </div>
            <a 
              href="tel:0945438456" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <span className="text-lg">📞</span>
              <span><strong className="text-white">0945-438-456</strong></span>
            </a>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-gray-500 text-sm">
        <p>© 2025 NLS Studio. All rights reserved.</p>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Login Card */}
                <div className="p-8 rounded-3xl bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                  {/* Logo */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                        <GraduationCap className="w-9 h-9 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Chào mừng trở lại!</h2>
                    <p className="text-gray-400 text-sm">
                      Đăng nhập để tiếp tục hành trình học tập
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">!</span>
                        </div>
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Mật khẩu</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl pr-12 focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          Đăng nhập
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Support Info */}
                  <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-gray-400 mb-3">Cần hỗ trợ?</p>
                    <a 
                      href="tel:0945438456" 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm"
                    >
                      <span className="text-lg">📞</span>
                      0945-438-456
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
