import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { TooltipProvider } from './ui/tooltip'

export default function AppLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-[#0a0c14]">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Top Navigation */}
          <Topbar />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto scrollbar-thin">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 lg:p-8 max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
