'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  imageSrc: string
  imageAlt: string
}

export default function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  imageSrc,
  imageAlt
}: HeroSectionProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container px-6 py-16 mx-auto sm:py-24 md:px-8 lg:flex lg:items-center lg:gap-12 lg:px-12">
        {/* 左侧文本内容 */}
        <div className="z-10 lg:w-1/2">
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800">
            {subtitle}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl mt-4 text-xl text-gray-600 dark:text-gray-300">
            {description}
          </p>
          
          <div className="flex flex-col gap-4 mt-8 sm:flex-row">
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center px-6 py-3 font-medium text-center text-white transition-transform duration-300 rounded-lg gradient-bg hover:shadow-lg"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {ctaText}
              <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </a>
            
            {secondaryCtaText && secondaryCtaLink && (
              <a
                href={secondaryCtaLink}
                className="px-6 py-3 font-medium text-center text-gray-700 transition-colors duration-300 bg-transparent border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {secondaryCtaText}
              </a>
            )}
          </div>
        </div>
        
        {/* 右侧图片内容 */}
        <div className="relative z-0 mt-12 lg:mt-0 lg:w-1/2">
          <div className="relative w-full h-64 overflow-hidden shadow-2xl sm:h-80 md:h-96 lg:h-[450px] rounded-xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={600}
              height={450}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          {/* 装饰元素 */}
          <div className="absolute w-24 h-24 rounded-full opacity-50 -top-4 -right-4 bg-primary-100 dark:bg-primary-900 blur-3xl"></div>
          <div className="absolute w-32 h-32 rounded-full opacity-50 -bottom-4 -left-4 bg-secondary-100 dark:bg-secondary-900 blur-3xl"></div>
        </div>
      </div>
      
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 z-0 w-full h-full opacity-10">
        <div className="absolute w-64 h-64 rounded-full top-1/4 left-1/4 bg-primary-300 dark:bg-primary-600 blur-3xl"></div>
        <div className="absolute rounded-full bottom-1/4 right-1/4 w-80 h-80 bg-secondary-300 dark:bg-secondary-600 blur-3xl"></div>
      </div>
    </section>
  )
} 