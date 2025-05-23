interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  category: string
}

export default function ToolCard({ title, description, icon, category }: ToolCardProps) {
  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <div className="p-2 gradient-bg rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category}
            </span>
            <button className="gradient-bg text-white px-4 py-2 rounded-lg text-sm">
              使用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 