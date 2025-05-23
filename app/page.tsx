import { Button } from '../components/ui/button'
import ToolsGrid from './components/ToolsGrid'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import { ChevronRight } from 'lucide-react'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-24">
      {/* 英雄区 */}
      <Suspense fallback={<div className="flex items-center justify-center h-96">加载中...</div>}>
        <HeroSection 
          title="智能工具集"
          subtitle="一站式解决各类问题"
          description="我们提供多种优质在线工具，帮助您高效解决日常问题。从开发辅助到图片处理，专业而简洁的工具集一站式满足您的各类需求。"
          ctaText="立即体验"
          ctaLink="#tools"
        />
      </Suspense>
      
      {/* 工具展示区 */}
      <section id="tools" className="container px-4 py-8 mx-auto sm:px-6 md:px-8 lg:px-10">
        <div className="flex flex-col items-center mb-8 text-center md:mb-16">
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:mb-4 md:text-3xl lg:text-4xl">精选工具</h2>
          <p className="max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-300">
            专业团队打造的实用工具，帮助您解决日常问题
          </p>
        </div>
        
        <Suspense fallback={<div className="flex items-center justify-center h-64">加载工具中...</div>}>
          <ToolsGrid />
        </Suspense>
        
        <div className="flex justify-center mt-8 md:mt-12">
          <Button variant="outline" size="lg" className="group">
            查看全部工具
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
      
      {/* 功能特色区 */}
      <Suspense fallback={<div className="flex items-center justify-center h-64">加载中...</div>}>
        <FeaturesSection />
      </Suspense>
      
      {/* 使用统计与社区反馈 */}
      <section className="container px-4 py-8 mx-auto sm:px-6 md:px-8 lg:px-10">
        <div className="p-6 md:p-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-4 text-center rounded-lg md:p-6 bg-white/50 dark:bg-gray-800/50">
              <div className="mb-2 text-3xl font-bold md:text-4xl text-primary">100+</div>
              <p className="text-gray-600 dark:text-gray-300">优质工具</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center rounded-lg md:p-6 bg-white/50 dark:bg-gray-800/50">
              <div className="mb-2 text-3xl font-bold md:text-4xl text-primary">10万+</div>
              <p className="text-gray-600 dark:text-gray-300">月活跃用户</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center rounded-lg md:p-6 bg-white/50 dark:bg-gray-800/50">
              <div className="mb-2 text-3xl font-bold md:text-4xl text-primary">99%</div>
              <p className="text-gray-600 dark:text-gray-300">用户满意度</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 邮件订阅 */}
      <section className="container px-4 py-8 mx-auto sm:px-6 md:px-8 lg:px-10 mb-8 md:mb-16">
        <div className="p-6 bg-white shadow-sm md:p-8 rounded-xl dark:bg-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-2 text-2xl font-bold md:mb-4 md:text-3xl">获取最新工具更新</h2>
            <p className="mb-4 text-sm text-gray-600 md:mb-6 md:text-base dark:text-gray-300">
              订阅我们的邮件列表，获得最新工具上线通知和使用技巧
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <input
                type="email"
                placeholder="您的邮箱地址"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
              />
              <Button className="px-6 py-3">
                立即订阅
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 