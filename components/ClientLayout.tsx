'use client'

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

// 为window添加toggleDarkModeNative属性的类型声明
declare global {
  interface Window {
    toggleDarkModeNative: () => void;
  }
}

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // 监听屏幕尺寸变化
  useEffect(() => {
    // 检查是否为移动设备
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // 在移动设备上默认关闭侧边栏
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
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
  
  // 初始化暗色模式
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 检查localStorage或系统偏好以确定初始主题
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark)
      setIsDarkMode(initialDarkMode)
      
      if (initialDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])
  
  // 监听isDarkMode变化并应用到html元素
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }, [isDarkMode])
  
  // 添加原生JS处理暗黑模式切换的函数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 为window对象添加全局切换函数
      window.toggleDarkModeNative = function() {
        const isDark = document.documentElement.classList.contains('dark')
        if (isDark) {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        } else {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        }
        // 同步更新React状态
        setIsDarkMode(!isDark)
      }
    }
  }, [])
  
  // 切换侧边栏
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  // 关闭侧边栏（用于移动端点击导航后）
  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }
  
  // 切换暗色模式
  const toggleDarkMode = () => {
    console.log('Toggle dark mode in ClientLayout, current:', isDarkMode)
    
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
      
      // 更新状态
      setIsDarkMode(!isDarkMode)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main 
          className={`flex-1 p-4 transition-all duration-300 sm:p-6 md:p-8 overflow-y-auto
                    ${isMobile ? 'w-full' : (isSidebarOpen ? 'md:ml-64' : 'ml-0')}`}
        >
          {children}
          
          {/* 原生JS切换按钮 - 仅用于测试 */}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.toggleDarkModeNative) {
                  window.toggleDarkModeNative()
                }
              }}
              className="p-3 rounded-full shadow-lg bg-primary text-white"
              title="原生JS切换暗黑模式"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
} 