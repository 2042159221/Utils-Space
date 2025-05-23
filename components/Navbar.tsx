'use client'

import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Globe, User, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  toggleSidebar?: () => void
  isSidebarOpen?: boolean
  isDarkMode?: boolean
  toggleDarkMode?: () => void
}

export default function Navbar({ 
  toggleSidebar, 
  isSidebarOpen,
  isDarkMode = false,
  toggleDarkMode
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // 初始检查
    checkIfMobile()
    
    // 添加监听器
    window.addEventListener('resize', checkIfMobile)
    
    // 清理监听器
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])
  
  // 监听滚动位置
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  // 导航链接
  const navLinks = [
    { name: '首页', href: '/' },
    { name: '工具', href: '/tools' },
    { name: '关于', href: '/about' }
  ]
  
  // 处理暗黑模式切换
  const handleDarkModeToggle = () => {
    console.log('Dark mode toggle clicked, isDarkMode:', isDarkMode)
    
    // 直接操作DOM
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        // 当前是暗色模式，切换为亮色模式
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      } else {
        // 当前是亮色模式，切换为暗色模式
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      }
    }
    
    // 调用父组件的toggleDarkMode函数
    if (toggleDarkMode) {
      toggleDarkMode()
    }
  }
  
  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                 z-50 flex items-center justify-between px-4 sm:px-8 transition-all duration-300
                 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center space-x-2 sm:space-x-8">
        {/* 侧边栏切换按钮 */}
        {toggleSidebar && (
          <motion.button 
            className="p-2 mr-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={toggleSidebar}
            whileTap={{ scale: 0.9 }}
          >
            {isSidebarOpen ? 
              <X className="h-5 w-5 text-gray-600 dark:text-gray-500" /> : 
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-500" />
            }
          </motion.button>
        )}
        
        <Link href="/" className="text-xl font-bold gradient-text">AI工具集</Link>
        
        {/* 桌面端导航链接 */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors relative
                        ${pathname === link.href 
                          ? 'text-primary dark:text-primary-400' 
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                        }`}
            >
              {link.name}
              {pathname === link.href && (
                <motion.div 
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary dark:bg-primary-400"
                  layoutId="underline"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
        
        {/* 桌面端搜索框 */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="搜索工具..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                     dark:border-gray-700 bg-gray-50 dark:bg-gray-900 
                     focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      
      {/* 移动端搜索框 */}
      <AnimatePresence>
        {isSearchOpen && isMobile && (
          <motion.div 
            className="absolute top-16 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-md z-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="搜索工具..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                        dark:border-gray-700 bg-gray-50 dark:bg-gray-900 
                        focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* 移动端搜索按钮 */}
        <motion.button 
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          whileTap={{ scale: 0.9 }}
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-500" />
        </motion.button>
        
        <motion.button 
          className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          whileTap={{ scale: 0.9 }}
        >
          <Globe className="h-5 w-5 text-gray-600 dark:text-gray-500" />
        </motion.button>
        
        {/* 暗色模式切换按钮 - 始终显示 */}
        <motion.button 
          id="dark-mode-toggle"
          onClick={handleDarkModeToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
          whileTap={{ scale: 0.9 }}
          aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Sun className="h-5 w-5 text-yellow-500" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.3 }}
              >
                <Moon className="h-5 w-5 text-gray-600" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.button 
          className="gradient-bg text-white px-4 py-2 rounded-lg hidden sm:block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          登录
        </motion.button>
        
        <motion.button 
          className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          whileTap={{ scale: 0.9 }}
        >
          <User className="h-5 w-5 text-gray-600 dark:text-gray-500" />
        </motion.button>
      </div>
    </motion.nav>
  )
} 