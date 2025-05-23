'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ToolCard from './ToolCard'
import { Loader2 } from 'lucide-react'

// 工具数据
const tools = [
  {
    title: 'JSON 格式化',
    description: '快速美化和压缩 JSON 数据，支持语法高亮和错误检测',
    icon: '🔍',
    category: 'formatter',
    link: '/tools/json-formatter'
  },
  {
    title: 'Base64 编解码',
    description: '轻松转换文本和文件与 Base64 格式，支持批量处理',
    icon: '🔄',
    category: 'encoder',
    link: '/tools/base64'
  },
  {
    title: 'URL 编解码',
    description: '快速转换 URL 安全字符串，支持批量处理和参数分析',
    icon: '🔗',
    category: 'encoder',
    link: '/tools/url-encoder'
  },
  {
    title: 'Markdown 编辑器',
    description: '所见即所得的 Markdown 编辑器，支持语法高亮和实时预览',
    icon: '📝',
    category: 'editor',
    link: '/tools/markdown'
  },
  {
    title: 'SQL 美化器',
    description: '自动格式化 SQL 查询语句，提高可读性和易维护性',
    icon: '💾',
    category: 'formatter',
    link: '/tools/sql-formatter'
  },
  {
    title: 'HTML 转义工具',
    description: '快速转换 HTML 特殊字符，确保网页内容安全显示',
    icon: '🛡️',
    category: 'encoder',
    link: '/tools/html-escape'
  },
  {
    title: '密码生成器',
    description: '创建高强度、定制化的随机密码，增强账户安全',
    icon: '🔐',
    category: 'security',
    link: '/tools/password-generator'
  },
  {
    title: '图片压缩器',
    description: '优化图片大小而不损失视觉质量，支持多种格式',
    icon: '🖼️',
    category: 'converter',
    link: '/tools/image-compressor'
  }
]

// 类别颜色映射
const categoryColors = {
  formatter: 'bg-blue-500 dark:bg-blue-600',
  encoder: 'bg-green-500 dark:bg-green-600',
  editor: 'bg-purple-500 dark:bg-purple-600',
  security: 'bg-red-500 dark:bg-red-600',
  converter: 'bg-amber-500 dark:bg-amber-600'
}

export default function ToolsGrid() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // 使用intersection observer检测元素可见性
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })
  
  useEffect(() => {
    setIsMounted(true)
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // 获取所有分类列表
  const categories = [
    { id: 'all', name: '全部' },
    ...Array.from(new Set(tools.map(tool => tool.category)))
      .map(category => ({
        id: category,
        name: category === 'formatter' ? '格式化' 
             : category === 'encoder' ? '编解码'
             : category === 'editor' ? '编辑器'
             : category === 'security' ? '安全工具'
             : '转换器'
      }))
  ]

  // 根据分类筛选工具
  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory)
  
  // 动画变体定义
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }
  
  const filterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }
  
  if (!isMounted) {
    return null
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 sm:py-16 lg:py-20">
      <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            实用工具集合
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600 dark:text-gray-300">
            各种便捷工具助您高效完成工作
          </p>
        </motion.div>
        
        {/* 分类过滤器 */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mt-8 md:gap-4"
          variants={filterVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`px-4 py-2 text-sm font-medium rounded-full md:text-base transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              variants={itemVariants}
              custom={index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ToolCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                category={tool.category}
                categoryColor={categoryColors[tool.category as keyof typeof categoryColors]}
                link={tool.link}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 