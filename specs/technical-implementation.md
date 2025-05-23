# 技术实现规范

## 技术栈选择

### 前端框架

- **Next.js 14+** - 使用 App Router 架构
  - 充分利用 React Server Components 和 Client Components 的优势
  - 使用 Server Actions 进行数据变更操作
  - 利用 Route Handlers 构建 API 端点

### UI 框架和样式解决方案

- **Tailwind CSS** - 作为主要的样式解决方案
  - 配合 CSS Modules 用于特定组件的样式
  - 使用 @apply 指令组织复杂组件样式
  - 自定义主题配置以匹配设计系统

- **可选的 UI 组件库**
  - 考虑使用 Headless UI 或 Radix UI 作为无样式组件基础
  - 自定义样式以符合设计系统

### 状态管理

- **React Context API** - 用于全局状态管理
  - 为主题切换、用户偏好等创建专用 Context
  - 使用 useReducer 处理复杂状态逻辑

- **React Query / SWR** - 用于服务器状态管理
  - 处理数据获取、缓存和同步
  - 实现乐观更新和错误处理

### 工具库

- **Lucide React** - 用于图标系统
- **React Hook Form** - 用于表单处理和验证
- **Zod** - 用于数据验证和类型安全
- **date-fns** - 用于日期处理
- **Framer Motion** - 用于高级动画效果

## 项目结构

```
/
├── app/                    # Next.js App Router 目录
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── (tools)/            # 工具页面路由组
│   │   ├── [tool]/         # 动态工具路由
│   │   └── ...             # 具体工具页面
│   ├── api/                # API 路由
│   └── globals.css         # 全局样式
├── components/             # 共享组件
│   ├── ui/                 # 基础 UI 组件
│   ├── layout/             # 布局组件
│   ├── tools/              # 工具特定组件
│   └── shared/             # 跨工具共享组件
├── lib/                    # 工具函数和业务逻辑
│   ├── utils/              # 通用工具函数
│   ├── hooks/              # 自定义 React Hooks
│   ├── services/           # 外部服务集成
│   └── constants/          # 常量定义
├── types/                  # TypeScript 类型定义
├── public/                 # 静态资源
│   ├── images/             # 图片资源
│   ├── icons/              # 图标资源
│   └── fonts/              # 字体资源（如果不使用 Next.js 字体优化）
├── styles/                 # 样式相关文件
│   └── theme/              # 主题配置
├── config/                 # 配置文件
│   ├── tools.ts            # 工具配置和元数据
│   └── site.ts             # 网站配置
└── context/                # React Context 定义
    ├── ThemeContext.tsx    # 主题上下文
    └── ToolsContext.tsx    # 工具状态上下文
```

## 组件架构

### 组件分层

1. **核心 UI 组件** - 基础构建块
   - Button, Input, Card, Modal 等
   - 高度可重用，无业务逻辑
   - 遵循设计系统规范

2. **复合组件** - 由多个核心组件组成
   - Navbar, Sidebar, Footer 等
   - 可能包含简单的交互逻辑
   - 仍然相对通用

3. **功能组件** - 特定功能的实现
   - ToolCard, SearchBar, ThemeSwitcher 等
   - 包含特定的业务逻辑
   - 可能使用 Context 或 Hooks

4. **页面组件** - 组织整个页面
   - HomePage, ToolPage 等
   - 组合多个功能组件
   - 处理页面级状态和数据获取

### 组件设计模式

- **组合模式** - 优先使用组合而非继承
  ```jsx
  // 例如，创建可组合的 Card 组件
  <Card>
    <Card.Header>标题</Card.Header>
    <Card.Body>内容</Card.Body>
    <Card.Footer>底部</Card.Footer>
  </Card>
  ```

- **Render Props / Children as Function** - 用于共享逻辑
  ```jsx
  // 例如，创建可复用的 Toggle 组件
  <Toggle>
    {({ isOn, toggle }) => (
      <Button onClick={toggle}>{isOn ? '开' : '关'}</Button>
    )}
  </Toggle>
  ```

- **自定义 Hooks** - 封装和复用状态逻辑
  ```jsx
  // 例如，创建工具特定的 Hook
  function useJsonFormatter(initialJson) {
    // 状态和逻辑
    return { formattedJson, error, format, compress };
  }
  ```

## 数据流设计

### 客户端状态管理

- 使用 React Context 管理全局 UI 状态
- 将状态分割为逻辑相关的小型 Context
- 使用 useReducer 处理复杂状态逻辑

```jsx
// 示例：主题上下文
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 工具状态管理

每个工具可能有自己的状态管理需求：

- **简单工具** - 使用 useState 和 useReducer
- **中等复杂度** - 使用自定义 Hook 封装逻辑
- **复杂工具** - 考虑使用专用 Context 或状态管理库

### 数据持久化

- 使用 localStorage/sessionStorage 保存用户偏好
- 考虑使用 IndexedDB 存储大量数据（如工具历史记录）
- 实现数据导出/导入功能

## 性能优化策略

### 代码分割

- 使用动态导入 (`import()`) 延迟加载组件
- 将大型依赖项拆分为单独的 chunk
- 使用 Next.js 的页面和布局级代码分割

```jsx
// 示例：动态导入大型组件
const CodeEditor = dynamic(() => import('@/components/tools/CodeEditor'), {
  loading: () => <p>加载编辑器...</p>,
  ssr: false // 如果组件依赖浏览器 API
});
```

### 图像优化

- 使用 Next.js Image 组件优化图像
- 为不同设备准备适当大小的图像
- 使用现代图像格式（WebP, AVIF）

```jsx
// 示例：优化的图像组件
<Image
  src="/tool-icon.png"
  alt="工具图标"
  width={64}
  height={64}
  quality={90}
/>
```

### 渲染优化

- 使用 `React.memo()` 避免不必要的重渲染
- 使用 `useMemo()` 和 `useCallback()` 优化计算和回调
- 实现虚拟化列表（如果需要显示大量数据）

```jsx
// 示例：优化列表渲染
const MemoizedToolCard = memo(ToolCard);

function ToolsList({ tools }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map(tool => (
        <MemoizedToolCard key={tool.id} {...tool} />
      ))}
    </div>
  );
}
```

## 响应式实现

### Tailwind 断点策略

使用 Tailwind 的响应式前缀实现断点设计：

- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上
- `xl:` - 1280px 及以上
- `2xl:` - 1536px 及以上

```jsx
// 示例：响应式布局
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* 工具卡片 */}
</div>
```

### 组件响应式行为

- 使用 `useMediaQuery` 钩子处理复杂的响应式逻辑
- 实现组件的不同视图状态（移动端、平板、桌面）

```jsx
// 示例：自定义媒体查询 Hook
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
}

// 使用
const isMobile = useMediaQuery('(max-width: 639px)');
```

## 可访问性实现

### 基础可访问性

- 正确的语义 HTML 结构
- 适当的 ARIA 属性
- 键盘导航支持
- 足够的颜色对比度

```jsx
// 示例：可访问的按钮组件
function Button({ children, onClick, disabled, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || undefined}
      className="px-4 py-2 bg-primary text-white rounded-md"
    >
      {children}
    </button>
  );
}
```

### 高级可访问性

- 实现焦点管理
- 添加屏幕阅读器公告
- 支持减少动画
- 实现跳过导航链接

## 测试策略

### 单元测试

- 使用 Jest 和 React Testing Library
- 测试核心组件和工具函数
- 模拟外部依赖和 API

```jsx
// 示例：按钮组件测试
test('按钮点击时调用回调函数', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>点击我</Button>);
  fireEvent.click(screen.getByText('点击我'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 集成测试

- 测试组件组合和页面功能
- 验证数据流和状态管理
- 测试用户流程

### 端到端测试

- 使用 Cypress 或 Playwright
- 测试关键用户流程
- 验证不同设备和浏览器的兼容性

## 部署和监控

### 构建优化

- 启用代码压缩和 Tree Shaking
- 优化依赖项大小
- 实现渐进式加载策略

### 监控

- 实现错误跟踪（如 Sentry）
- 添加性能监控
- 收集用户使用数据（遵循隐私规定）

## 开发最佳实践

### 代码风格

- 使用 ESLint 和 Prettier 保持代码一致性
- 遵循函数式组件和 Hooks 模式
- 采用一致的命名约定

### TypeScript 使用

- 为所有组件和函数定义类型
- 使用接口描述数据结构
- 避免过度使用 `any` 类型

```tsx
// 示例：带类型的组件
interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  onClick?: () => void;
}

function ToolCard({ title, description, icon, category, onClick }: ToolCardProps) {
  // 组件实现
}
```

### 文档

- 为组件添加 JSDoc 注释
- 创建组件使用示例
- 维护开发指南和贡献规则

### SVG图标系统实现

- **SVG图标组件化**：创建统一的SVG图标组件系统
  ```jsx
  // components/ui/Icon.tsx
  import { SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    name: string;
    size?: 'sm' | 'md' | 'lg';
  }
  
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  export function Icon({ name, size = 'md', ...props }: IconProps) {
    // 动态导入SVG图标
    const IconComponent = require(`@/public/icons/${name}.svg`).default;
    
    return (
      <IconComponent
        width={sizeMap[size]}
        height={sizeMap[size]}
        aria-hidden="true"
        focusable="false"
        {...props}
      />
    );
  }
  ```

- **SVG动效实现**：使用CSS或SMIL为SVG图标添加动画效果
  ```css
  /* 示例：SVG图标悬停动画 */
  .icon-hover {
    transition: transform 0.2s ease-in-out;
  }
  
  .icon-hover:hover {
    transform: scale(1.1);
  }
  ```

- **按需优化**：使用SVGR和webpack配置实现SVG的按需导入和优化
  ```js
  // next.config.js
  module.exports = {
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      });
      return config;
    },
  };
  ```

## 苹果设计美学实现策略

### 微交互与动效系统

- **基于动作的动效**：响应用户操作的自然动效
  ```jsx
  // 示例：点击波纹效果组件
  function RippleEffect({ children, ...props }) {
    const [ripples, setRipples] = useState([]);
    
    const createRipple = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRipples([...ripples, { x, y, id: Date.now() }]);
      setTimeout(() => {
        setRipples(ripples => ripples.slice(1));
      }, 1000);
    };
    
    return (
      <div className="relative overflow-hidden" onClick={createRipple} {...props}>
        {children}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
            }}
          />
        ))}
      </div>
    );
  }
  ```

### 材质与深度实现

- **精确阴影系统**：实现与苹果设计一致的阴影层次
  ```js
  // tailwind.config.js 中的阴影配置
  module.exports = {
    theme: {
      extend: {
        boxShadow: {
          'apple-sm': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
          'apple-md': '0 4px 8px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
          'apple-lg': '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)',
          'apple-focus': '0 0 0 4px rgba(0,125,250,0.3)',
        },
      },
    },
  };
  ```

- **磨砂玻璃效果**：实现iOS风格的磨砂玻璃效果
  ```jsx
  // 示例：磨砂玻璃组件
  function FrostedGlass({ children, intensity = 'medium', ...props }) {
    const intensityMap = {
      light: 'backdrop-blur-sm bg-white/30 dark:bg-black/30',
      medium: 'backdrop-blur-md bg-white/50 dark:bg-black/50',
      strong: 'backdrop-blur-lg bg-white/70 dark:bg-black/70',
    };
    
    return (
      <div className={`${intensityMap[intensity]} rounded-xl ${props.className || ''}`} {...props}>
        {children}
      </div>
    );
  }
  ```
