# 性能优化规范

## 性能目标

为了提供出色的用户体验，我们设定以下性能目标：

1. **首次内容绘制 (FCP)**: < 1.0秒
2. **最大内容绘制 (LCP)**: < 2.5秒
3. **首次输入延迟 (FID)**: < 100毫秒
4. **累积布局偏移 (CLS)**: < 0.1
5. **页面加载时间**: < 3秒 (在4G网络条件下)
6. **总体积**: < 500KB (压缩后，不包括图像)

## 加载性能优化

### 代码分割与懒加载

1. **路由级代码分割**
   - 利用 Next.js 的自动代码分割
   - 确保每个工具页面是独立的代码块

2. **组件懒加载**
   - 使用 `dynamic` 导入非关键组件
   - 为大型第三方库实现懒加载

```jsx
// 示例：懒加载复杂组件
const JsonViewer = dynamic(() => import('@/components/tools/JsonViewer'), {
  loading: () => <div className="h-60 w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div>,
  ssr: false // 如果组件依赖浏览器API
});
```

3. **条件导入**
   - 只在需要时导入功能模块
   - 使用条件逻辑延迟加载不立即需要的功能

### 资源优化

1. **图像优化**
   - 使用 Next.js Image 组件自动优化图像
   - 为不同设备提供适当尺寸的图像
   - 使用现代图像格式 (WebP, AVIF)
   - 实现渐进式加载和模糊占位符

```jsx
// 示例：优化的响应式图像
<Image
  src="/hero-image.jpg"
  alt="工具集展示"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={isAboveFold} // 如果在首屏可见
/>
```

2. **字体优化**
   - 使用 `next/font` 自动优化字体加载
   - 实现字体子集化，只加载需要的字符
   - 使用 `font-display: swap` 策略

```jsx
// 示例：优化的字体加载
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

3. **静态资源优化**
   - 压缩所有静态资源 (JS, CSS, SVG)
   - 为静态资源设置长期缓存策略
   - 使用内联关键CSS，延迟加载非关键CSS

### 预加载与预获取

1. **关键资源预加载**
   - 使用 `<link rel="preload">` 预加载关键资源
   - 预加载首屏需要的图像和字体

2. **路由预获取**
   - 利用 Next.js 的自动路由预获取
   - 为可能的用户路径实现自定义预获取策略

```jsx
// 示例：自定义预获取逻辑
import { useRouter } from 'next/router';

function ToolCard({ tool }) {
  const router = useRouter();
  
  const prefetchToolPage = () => {
    router.prefetch(`/tools/${tool.slug}`);
  };
  
  return (
    <div onMouseEnter={prefetchToolPage}>
      {/* 工具卡片内容 */}
    </div>
  );
}
```

## 渲染性能优化

### 组件优化

1. **避免不必要的重渲染**
   - 使用 `React.memo()` 记忆化组件
   - 使用 `useMemo()` 缓存计算结果
   - 使用 `useCallback()` 记忆化回调函数

```jsx
// 示例：优化组件渲染
const MemoizedToolCard = memo(ToolCard);

function ToolsList({ tools, onSelect }) {
  // 记忆化回调函数
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);
  
  // 记忆化派生数据
  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => a.name.localeCompare(b.name));
  }, [tools]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTools.map(tool => (
        <MemoizedToolCard
          key={tool.id}
          {...tool}
          onSelect={() => handleSelect(tool.id)}
        />
      ))}
    </div>
  );
}
```

2. **虚拟化长列表**
   - 对于长列表，使用虚拟滚动技术
   - 考虑使用 `react-window` 或 `react-virtualized`

```jsx
// 示例：虚拟化列表
import { FixedSizeList } from 'react-window';

function VirtualizedToolsList({ tools }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ToolCard {...tools[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={tools.length}
      itemSize={120}
    >
      {Row}
    </FixedSizeList>
  );
}
```

3. **避免布局抖动**
   - 预先定义内容尺寸，避免布局偏移
   - 使用占位符和骨架屏
   - 为图像和媒体元素设置宽高比

### 状态管理优化

1. **状态分割**
   - 将全局状态分割为逻辑相关的小部分
   - 避免不必要的组件订阅全局状态

2. **批量更新**
   - 批量处理状态更新
   - 使用 `useReducer` 处理复杂状态逻辑

```jsx
// 示例：使用 useReducer 批量更新
function toolReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'PROCESS_DATA':
      return { ...state, results: processData(state.data, state.settings) };
    // 其他 action 类型...
    default:
      return state;
  }
}
```

3. **本地状态优先**
   - 尽可能使用组件本地状态
   - 只有必要时才提升状态到全局

## 网络优化

### API 调用优化

1. **数据获取策略**
   - 使用 React Query 或 SWR 进行数据获取和缓存
   - 实现乐观更新以提高感知性能
   - 使用 stale-while-revalidate 策略

```jsx
// 示例：使用 SWR 获取数据
import useSWR from 'swr';

function ToolData({ toolId }) {
  const { data, error } = useSWR(`/api/tools/${toolId}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000 // 1分钟内不重复请求
  });
  
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <LoadingSkeleton />;
  
  return <ToolDisplay data={data} />;
}
```

2. **请求批处理与合并**
   - 合并多个API请求
   - 实现批处理请求机制
   - 使用 GraphQL 减少请求数量 (如果适用)

3. **缓存策略**
   - 实现多级缓存策略
   - 使用浏览器缓存、内存缓存和持久化缓存
   - 定义合理的缓存失效策略

### 数据传输优化

1. **数据压缩**
   - 启用 Gzip 或 Brotli 压缩
   - 最小化传输的数据量
   - 使用紧凑的数据格式

2. **增量加载**
   - 实现数据分页或无限滚动
   - 使用游标分页而非偏移分页
   - 只请求当前视图所需的数据

```jsx
// 示例：实现无限滚动
function InfiniteToolsList() {
  const { data, error, size, setSize } = useSWRInfinite(
    (index) => `/api/tools?page=${index + 1}&limit=10`,
    fetcher
  );
  
  const tools = data ? data.flat() : [];
  const isLoadingMore = size > 0 && typeof data[size - 1] === 'undefined';
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10);
  
  return (
    <div>
      {tools.map(tool => <ToolCard key={tool.id} {...tool} />)}
      
      <button
        onClick={() => setSize(size + 1)}
        disabled={isLoadingMore || isReachingEnd}
      >
        {isLoadingMore ? '加载中...' : isReachingEnd ? '没有更多了' : '加载更多'}
      </button>
    </div>
  );
}
```

## 工具特定优化

### 文本处理工具优化

1. **增量处理**
   - 对大文本实现增量处理
   - 使用 Web Workers 处理复杂计算
   - 显示处理进度

```jsx
// 示例：使用 Web Worker 处理大型 JSON
function JsonFormatter() {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formatJson = (jsonString) => {
    setIsProcessing(true);
    
    const worker = new Worker('/workers/json-formatter.js');
    
    worker.onmessage = (e) => {
      setResult(e.data);
      setIsProcessing(false);
      worker.terminate();
    };
    
    worker.postMessage(jsonString);
  };
  
  // 组件其余部分
}
```

2. **节流和防抖**
   - 对实时更新的操作使用节流或防抖
   - 避免频繁重新渲染和计算

```jsx
// 示例：使用防抖处理实时输入
import { debounce } from 'lodash-es';

function SearchTools() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      const data = await fetchSearchResults(searchQuery);
      setResults(data);
    }, 300),
    []
  );
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  // 组件其余部分
}
```

### 图像处理工具优化

1. **渐进式处理**
   - 先显示低质量预览
   - 在后台处理高质量图像
   - 使用 Canvas 进行客户端图像处理

2. **图像尺寸限制**
   - 限制上传图像的最大尺寸
   - 在上传前进行客户端压缩
   - 提供合理的默认设置

## 监控与分析

### 性能监测

1. **核心 Web 指标监控**
   - 实现 Web Vitals 监控
   - 收集真实用户指标 (RUM)
   - 设置性能预算警报

```jsx
// 示例：监控 Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

function reportWebVitals({ name, delta, id }) {
  // 发送到分析服务
  sendToAnalytics({
    metric: name,
    value: delta,
    id
  });
}

getCLS(reportWebVitals);
getFID(reportWebVitals);
getLCP(reportWebVitals);
```

2. **错误监控**
   - 实现全局错误边界
   - 捕获和报告前端错误
   - 监控 API 调用失败

### 性能审计

1. **自动化性能测试**
   - 集成 Lighthouse CI
   - 在 CI/CD 流程中运行性能测试
   - 设置性能回归警报

2. **定期性能审查**
   - 定期进行手动性能审查
   - 使用 Chrome DevTools 分析性能瓶颈
   - 优先解决影响用户体验的问题

## 持续优化策略

1. **渐进式增强**
   - 确保基本功能在所有环境中可用
   - 在支持的浏览器中添加高级功能
   - 优雅降级处理不支持的功能

2. **性能预算**
   - 设置明确的性能预算
   - 在开发过程中监控性能指标
   - 阻止违反性能预算的变更

3. **用户体验优先**
   - 优先优化用户感知性能
   - 关注交互响应速度
   - 提供适当的加载状态和反馈 