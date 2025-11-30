import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  ArrowRight
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
    <div className="min-h-screen flex bg-[#0a0c14]">
      {/* Left Side - Landing Page Content */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
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

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo & Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  NLS STUDIO
                </h1>
                <p className="text-gray-400 text-sm">Học viện Lập trình & Tiếng Anh</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Từ <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Zero</span> đến{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Full Stack Developer</span>
              </h2>
              <p className="text-xl text-gray-300">
                Chào mừng bạn đến với <span className="text-purple-400 font-semibold">NLS STUDIO</span> – nơi biến bạn từ người mới bắt đầu trở thành <span className="text-cyan-400 font-semibold">Full Stack Web Developer</span> tương lai!
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="space-y-4 mb-8">
              {/* Programming Course */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                      🔥 Nhập môn lập trình & Full Stack Web !!!
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">Bắt đầu từ 0, bạn sẽ:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Nhập môn: C, C++, Python, Java',
                        'HTML, CSS, JavaScript & Framework',
                        'Back-end: Python/Flask, Node.js',
                        'Hoàn thành dự án mini thực tế'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* English Course */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="group p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                      🚀 Tiếng Anh từ 0 lên 6.0 IELTS – Đơn giản!
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">Cùng nâng trình tiếng Anh song song với lập trình:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Từ 0 → 6.0 IELTS hiệu quả',
                        'Chiến lược học tập khoa học',
                        'Thực hành giao tiếp thực tế',
                        'Luyện đề cùng giảng viên'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-yellow-300 font-bold">💡 Ưu đãi đặc biệt!</p>
                  <p className="text-yellow-200/70 text-sm">Học thử miễn phí cho 50 học viên đầu tiên</p>
                </div>
              </div>
              <a 
                href="https://zalo.me/0945438456" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
              >
                <Rocket className="w-5 h-5" />
                ĐĂNG KÝ NGAY
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-between text-sm text-gray-500"
          >
            <p>© 2025 NLS Studio. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                500+ học viên
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                4.9★ đánh giá
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-2/5 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Background for mobile */}
        <div className="lg:hidden absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              NLS STUDIO
            </h1>
            <p className="text-gray-400 text-sm">Học viện Lập trình & Tiếng Anh</p>
          </div>

          {/* Login Card */}
          <div className="p-8 rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
              <p className="text-gray-400">
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
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">Cần hỗ trợ? Liên hệ ngay:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                  <a 
                    href="tel:0945438456" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                  >
                    <span className="text-lg">📞</span>
                    0945-438-456
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden mt-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
            <p className="text-yellow-300 font-medium mb-2">🎁 Học thử MIỄN PHÍ!</p>
            <a 
              href="https://zalo.me/0945438456" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl text-sm"
            >
              <Rocket className="w-4 h-4" />
              ĐĂNG KÝ NGAY
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
