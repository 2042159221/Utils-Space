'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface ToolCardProps {
  title: string
  description: string
  icon: string | React.ReactNode
  category: string
  link: string
  categoryColor?: string
}

export default function ToolCard({ 
  title, 
  description, 
  icon, 
  category, 
  link, 
  categoryColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}: ToolCardProps) {
  return (
    <motion.div 
      className="h-full overflow-hidden group"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link href={link} className="block h-full">
        <div className="h-full p-5 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl group-hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <motion.div 
              className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-lg rounded-lg bg-primary/10 dark:bg-primary/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {typeof icon === 'string' ? icon : icon}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate md:text-lg dark:text-white">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2 dark:text-gray-300">
                {description}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                  {category}
                </span>
                <motion.span 
                  className="text-sm font-medium text-primary flex items-center"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  使用 <span className="ml-1">&rarr;</span>
                </motion.span>
              </div>
            </div>
          </div>
          <motion.div 
            className="w-full h-0.5 bg-primary/60 mt-4 scale-x-0 origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  )
} 