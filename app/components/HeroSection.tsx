'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
}

export default function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink
}: HeroSectionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 动画变体定义
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      } 
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    }
  }
  
  if (!isMounted) {
    return (
      <section className="relative pt-10 pb-16 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 sm:py-20 md:py-24">
        <div className="container px-4 mx-auto sm:px-6 md:px-8 lg:px-10">
          <div className="z-10 max-w-2xl mx-auto text-center">
            <div className="w-40 h-6 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="h-10 mb-4 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
            <div className="h-24 mb-6 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
            <div className="w-40 h-12 mx-auto bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="relative pt-10 pb-16 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 sm:py-20 md:py-24">
      <div className="container px-4 mx-auto sm:px-6 md:px-8 lg:px-10">
        {/* 文本内容 */}
        <motion.div 
          className="relative z-10 max-w-2xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full md:mb-4 md:text-sm text-primary dark:text-primary-400 bg-primary/10 dark:bg-gray-800"
            variants={itemVariants}
          >
            {subtitle}
          </motion.span>
          
          <motion.h1 
            className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          
          <motion.p 
            className="max-w-xl mx-auto mt-3 text-base text-gray-600 md:mt-4 md:text-lg lg:text-xl dark:text-gray-300"
            variants={itemVariants}
          >
            {description}
          </motion.p>
          
          <motion.div 
            className="mt-6 md:mt-8"
            variants={itemVariants}
          >
            <a
              href={ctaLink}
              className="inline-flex items-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Button size="lg" className="text-sm bg-primary hover:bg-primary/90 md:text-base">
                {ctaText}
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ChevronRight className="w-4 h-4 ml-2 md:h-5 md:w-5" />
                </motion.div>
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 z-0 w-full h-full">
        <motion.div 
          className="absolute w-48 h-48 rounded-full md:w-64 md:h-64 top-1/4 left-1/4 bg-primary/30 dark:bg-primary/20 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1, 1.05, 1],
            opacity: [0, 0.5, 0.7, 0.6]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute w-64 h-64 rounded-full bottom-1/4 right-1/4 md:w-80 md:h-80 bg-primary/30 dark:bg-primary/20 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.9, 1.1, 1, 1.05],
            opacity: [0, 0.3, 0.6, 0.5]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
      </div>
    </section>
  )
} 