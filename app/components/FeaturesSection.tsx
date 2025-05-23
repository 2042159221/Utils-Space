'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Activity, ArrowUpRight, Zap, Smartphone, PenTool, Shield } from 'lucide-react'

const features = [
  {
    icon: <Activity />,
    title: '高效工作流',
    description: '简化您的日常任务，提高工作效率和团队协作能力。'
  },
  {
    icon: <Zap />,
    title: '快速响应',
    description: '利用我们的工具快速响应客户需求和市场变化。'
  },
  {
    icon: <Smartphone />,
    title: '移动优先',
    description: '所有工具均采用响应式设计，确保在任何设备上都有卓越体验。'
  },
  {
    icon: <PenTool />,
    title: '定制解决方案',
    description: '根据您的特定需求定制工具和功能，满足业务独特需求。'
  },
  {
    icon: <Shield />,
    title: '安全保障',
    description: '所有工具都采用最高标准的安全措施，保护您的数据安全。'
  },
  {
    icon: <ArrowUpRight />,
    title: '持续更新',
    description: '我们的团队持续改进工具功能，确保您始终获得最佳体验。'
  }
]

export default function FeaturesSection() {
  const [isMounted, setIsMounted] = useState(false)
  
  // 使用intersection observer检测元素可见性
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 动画变体定义
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        when: "beforeChildren"
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
        damping: 30
      }
    }
  }
  
  const iconVariants = {
    hidden: { scale: 0.6, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    hover: { 
      scale: 1.1,
      color: "#7c3aed", // 紫色
      transition: { 
        type: "spring",
        stiffness: 400, 
        damping: 10 
      }
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <section className="py-12 bg-white dark:bg-gray-900 sm:py-16 lg:py-20">
      <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            强大功能，助您腾飞
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto mt-4 text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            我们提供丰富的工具和功能，满足您的各种需求
          </motion.p>
        </div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              custom={index}
            >
              <div className="flex items-start">
                <motion.div 
                  className="flex items-center justify-center w-12 h-12 text-white rounded-full bg-primary dark:bg-primary-600"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {feature.icon}
                </motion.div>
                <div className="ml-4">
                  <motion.h3 
                    className="text-lg font-medium text-gray-900 dark:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="mt-2 text-base text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </div>
              <motion.div 
                className="absolute bottom-0 left-0 w-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 