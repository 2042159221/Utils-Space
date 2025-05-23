'use client'

import { useState, useEffect } from 'react'
import { 
  Code, 
  Image, 
  FileText, 
  Calculator,
  ChevronDown,
  ChevronRight,
  Zap,
  File,
  Settings,
  Key,
  BarChart
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const categories = [
  {
    name: '格式化',
    icon: Code,
    tools: [
      { name: 'JSON 格式化', path: '/tools/json-formatter' },
      { name: 'SQL 美化器', path: '/tools/sql-formatter' },
      { name: 'HTML 美化器', path: '/tools/html-formatter' }
    ]
  },
  {
    name: '编解码',
    icon: Zap,
    tools: [
      { name: 'Base64 编解码', path: '/tools/base64' },
      { name: 'URL 编解码', path: '/tools/url-encoder' },
      { name: 'HTML 转义工具', path: '/tools/html-escape' }
    ]
  },
  {
    name: '编辑器',
    icon: File,
    tools: [
      { name: 'Markdown 编辑器', path: '/tools/markdown' },
      { name: '富文本编辑器', path: '/tools/rich-text' }
    ]
  },
  {
    name: '安全工具',
    icon: Key,
    tools: [
      { name: '密码生成器', path: '/tools/password-generator' },
      { name: 'Hash 计算器', path: '/tools/hash-calculator' }
    ]
  },
  {
    name: '转换器',
    icon: Settings,
    tools: [
      { name: '图片压缩器', path: '/tools/image-compressor' },
      { name: '文件格式转换', path: '/tools/file-converter' }
    ]
  },
  {
    name: '统计工具',
    icon: BarChart,
    tools: [
      { name: '文本统计', path: '/tools/text-stats' },
      { name: '字符计数器', path: '/tools/char-counter' }
    ]
  }
]

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("格式化")
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  
  // 监听屏幕尺寸变化
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
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
  
  // 获取当前路径对应的类别
  useEffect(() => {
    const currentTool = pathname?.split('/').pop()
    if (currentTool) {
      const category = categories.find(cat => 
        cat.tools.some(tool => tool.path.includes(currentTool))
      )
      if (category) {
        setExpandedCategory(category.name)
      }
    }
  }, [pathname])
  
  const sidebarVariants = {
    open: { 
      x: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: { 
      x: "-100%",
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }
  
  const itemVariants = {
    open: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: { 
      opacity: 0, 
      x: -20,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  }
  
  return (
    <>
      <motion.aside 
        className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] 
                 bg-white dark:bg-gray-800 border-r border-gray-200 
                 dark:border-gray-700 p-4 z-30 overflow-y-auto
                 ${!isOpen && !isMobile && 'hidden'}`}
        variants={sidebarVariants}
        initial={false}
        animate={isMobile ? (isOpen ? "open" : "closed") : "open"}
      >
        <motion.nav 
          className="space-y-2"
          variants={itemVariants}
        >
          {categories.map((category) => (
            <motion.div 
              key={category.name}
              variants={itemVariants}
            >
              <motion.button
                onClick={() => setExpandedCategory(
                  expandedCategory === category.name ? null : category.name
                )}
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <category.icon className="w-5 h-5 text-primary dark:text-primary-400" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategory === category.name ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-600" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {expandedCategory === category.name && (
                  <motion.div 
                    className="mt-1 ml-6 space-y-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className={`flex items-center py-1 px-2 rounded-md transition-colors
                                 ${pathname === tool.path 
                                   ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400' 
                                   : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-400'
                                 }`}
                        onClick={isMobile ? onClose : undefined}
                      >
                        <ChevronRight className="w-3 h-3 mr-1 text-current" />
                        <span className="text-sm">{tool.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.nav>
      </motion.aside>
      
      {/* 移动端遮罩层 */}
      {isMobile && isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
    </>
  )
} 