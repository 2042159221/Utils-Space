# 可访问性标准规范

## 可访问性目标

我们的工具集网站致力于为所有用户提供无障碍的访问体验，包括残障用户。我们的目标是：

1. 符合 **WCAG 2.1 AA 级标准**
2. 确保所有功能可通过键盘完成
3. 支持辅助技术（如屏幕阅读器）
4. 提供包容性的用户体验

## 语义化 HTML

### 文档结构

- 使用正确的 HTML5 语义化元素
  - `<header>`, `<main>`, `<nav>`, `<footer>` 等结构元素
  - `<article>`, `<section>`, `<aside>` 等内容元素
  - `<h1>` 到 `<h6>` 标题层次正确使用

```html
<!-- 示例：语义化页面结构 -->
<header>
  <nav><!-- 导航内容 --></nav>
</header>
<main>
  <h1>工具名称</h1>
  <section>
    <h2>输入区域</h2>
    <!-- 输入控件 -->
  </section>
  <section>
    <h2>输出结果</h2>
    <!-- 输出内容 -->
  </section>
</main>
<footer>
  <!-- 页脚内容 -->
</footer>
```

### 表单和控件

- 为所有表单控件提供关联的 `<label>`
- 使用 `fieldset` 和 `legend` 对相关控件进行分组
- 提供明确的表单验证错误信息

```html
<!-- 示例：可访问的表单控件 -->
<div>
  <label for="json-input">JSON 输入</label>
  <textarea id="json-input" aria-describedby="json-input-help"></textarea>
  <p id="json-input-help">请输入有效的 JSON 数据</p>
</div>

<fieldset>
  <legend>格式化选项</legend>
  <div>
    <input type="radio" id="indent-2" name="indent" value="2" checked>
    <label for="indent-2">2 个空格</label>
  </div>
  <div>
    <input type="radio" id="indent-4" name="indent" value="4">
    <label for="indent-4">4 个空格</label>
  </div>
</fieldset>
```

## ARIA 属性使用

### 角色和状态

- 当 HTML 语义不足时使用适当的 ARIA 角色
- 使用 ARIA 状态和属性传达组件状态
- 遵循 ARIA 设计模式

```jsx
// 示例：使用 ARIA 的选项卡组件
function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### 动态内容更新

- 使用 `aria-live` 区域通知重要的内容变化
- 根据内容重要性选择适当的 `aria-live` 值
- 避免过多的实时区域更新，防止信息过载

```jsx
// 示例：通知操作结果
function JsonFormatter() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');
  
  const formatJson = () => {
    try {
      // 格式化逻辑
      setResult(formattedJson);
      setStatus('JSON 格式化成功');
    } catch (error) {
      setStatus(`格式化失败: ${error.message}`);
    }
  };
  
  return (
    <div>
      {/* 其他组件 */}
      
      <div aria-live="polite" aria-atomic="true">
        {status}
      </div>
      
      {/* 结果显示 */}
    </div>
  );
}
```

## 键盘可访问性

### 焦点管理

- 确保所有交互元素可以接收键盘焦点
- 实现逻辑的焦点顺序，遵循视觉和DOM顺序
- 提供明显的焦点样式

```css
/* 示例：增强的焦点样式 */
:focus {
  outline: 2px solid #5B6AFF;
  outline-offset: 2px;
}

/* 仅针对鼠标用户隐藏焦点轮廓 */
:focus:not(:focus-visible) {
  outline: none;
}

/* 针对键盘用户显示焦点轮廓 */
:focus-visible {
  outline: 2px solid #5B6AFF;
  outline-offset: 2px;
}
```

### 键盘交互

- 支持标准键盘操作模式
- 为复杂组件实现键盘快捷键
- 提供键盘操作指南

```jsx
// 示例：支持键盘操作的下拉菜单
function Dropdown({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setFocusIndex((prev) => Math.min(prev + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (isOpen && focusIndex >= 0) {
          onSelect(options[focusIndex]);
          setIsOpen(false);
          setFocusIndex(-1);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusIndex(-1);
        break;
      default:
        break;
    }
  };
  
  // 组件其余部分
}
```

### 键盘陷阱

- 避免键盘陷阱，确保用户可以使用键盘离开任何组件
- 为模态对话框实现正确的焦点陷阱
- 使用 `inert` 属性或等效技术防止背景内容获取焦点

```jsx
// 示例：可访问的模态对话框
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  useEffect(() => {
    if (isOpen) {
      // 保存之前的焦点元素
      const previousFocus = document.activeElement;
      
      // 焦点移到模态框
      modalRef.current?.focus();
      
      // 关闭时恢复焦点
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(focusableElementsString);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
```

## 颜色和对比度

### 颜色对比度

- 文本和背景之间保持足够的对比度
  - 普通文本至少 4.5:1
  - 大文本（18pt 或 14pt 加粗）至少 3:1
  - 用户界面组件和图形对象至少 3:1
- 使用对比度检查工具验证所有颜色组合

### 颜色使用

- 不仅依靠颜色传达信息
- 为所有使用颜色表示的信息提供替代方式（如图标、文本）
- 支持高对比度模式

```jsx
// 示例：不仅依靠颜色传达状态
function StatusIndicator({ status }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'success':
        return { 
          color: 'green', 
          icon: <CheckIcon />, 
          label: '成功' 
        };
      case 'warning':
        return { 
          color: 'orange', 
          icon: <WarningIcon />, 
          label: '警告' 
        };
      case 'error':
        return { 
          color: 'red', 
          icon: <ErrorIcon />, 
          label: '错误' 
        };
      default:
        return { 
          color: 'gray', 
          icon: <InfoIcon />, 
          label: '信息' 
        };
    }
  };
  
  const { color, icon, label } = getStatusInfo();
  
  return (
    <div className="status" style={{ color }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
```

## 文本和排版

### 文本大小和间距

- 使用相对单位（如 rem, em）而非绝对单位（如 px）
- 确保文本可以放大至少 200% 而不丢失内容或功能
- 提供足够的行高（至少 1.5）和段落间距

```css
/* 示例：可访问的文本样式 */
body {
  font-size: 1rem; /* 基础字体大小 */
  line-height: 1.5; /* 行高 */
}

p {
  margin-bottom: 1.5rem; /* 段落间距 */
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.2; /* 标题行高可以稍紧凑 */
}
```

### 文本可读性

- 使用清晰易读的字体
- 避免全部使用大写字母
- 确保文本内容简洁明了
- 提供复杂内容的简化版本或解释

## 多媒体内容

### 图像和图标

- 为所有图像提供有意义的替代文本
- 对于装饰性图像，使用空的 alt 属性（`alt=""`）
- 确保图标有适当的标签或替代文本

```jsx
// 示例：可访问的图像和图标
function ToolHeader({ tool }) {
  return (
    <header>
      <img 
        src={tool.iconUrl} 
        alt={`${tool.name} 图标`} 
        width="48" 
        height="48" 
      />
      
      <h1>{tool.name}</h1>
      
      <button aria-label="收藏工具">
        <StarIcon aria-hidden="true" />
      </button>
    </header>
  );
}
```

### 音频和视频

- 为视频提供字幕
- 为音频内容提供文字记录
- 提供媒体播放器的可访问控件

## 响应式和移动可访问性

### 触摸目标大小

- 确保触摸目标足够大（至少 44×44 像素）
- 提供足够的触摸目标间距，防止误触
- 支持不同的输入方式（触摸、鼠标、键盘）

```css
/* 示例：适当大小的触摸目标 */
.button, .link, .interactive-element {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 16px;
}

/* 确保足够的间距 */
.button + .button {
  margin-left: 8px;
}
```

### 响应式设计

- 确保在所有设备上内容可访问
- 避免固定大小的容器导致内容溢出
- 支持不同的屏幕方向（横向和纵向）

```css
/* 示例：响应式容器 */
.tool-container {
  width: 100%;
  max-width: 1200px;
  padding: 16px;
  overflow-x: auto; /* 确保内容不会被截断 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tool-container {
    padding: 12px;
  }
}
```

## 辅助功能

### 跳过导航

- 提供"跳到主内容"链接
- 确保链接在获得焦点时可见
- 将用户直接带到主内容区域

```jsx
// 示例：跳过导航链接
function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        跳到主内容
      </a>
      
      <header>{/* 导航栏内容 */}</header>
      
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      
      <footer>{/* 页脚内容 */}</footer>
    </>
  );
}

// 相关CSS
const styles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px;
    background: #5B6AFF;
    color: white;
    z-index: 100;
    transition: top 0.2s;
  }
  
  .skip-link:focus {
    top: 0;
  }
`;
```

### 减少动画

- 尊重用户的减少动画偏好设置
- 提供关闭动画的选项
- 避免闪烁内容和自动播放动画

```css
/* 示例：尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

```jsx
// 示例：动画控制组件
function AnimationSettings() {
  const [reduceMotion, setReduceMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    if (reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        减少动画
      </label>
    </div>
  );
}
```

## 测试和验证

### 自动化测试

- 使用辅助功能测试工具（如 axe-core, jest-axe）
- 在 CI/CD 流程中集成可访问性测试
- 设置可访问性违规警报

```jsx
// 示例：使用 jest-axe 进行可访问性测试
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

test('Button组件没有可访问性违规', async () => {
  const { container } = render(<Button>点击我</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 手动测试

- 使用屏幕阅读器测试（如 NVDA, VoiceOver）
- 进行键盘导航测试
- 在不同设备和浏览器上测试

### 用户测试

- 与残障用户一起进行用户测试
- 收集和响应可访问性反馈
- 持续改进可访问性体验

## 文档和培训

### 可访问性声明

- 提供网站的可访问性声明
- 说明符合的标准和已知问题
- 提供反馈和支持渠道

### 开发者指南

- 为开发团队提供可访问性最佳实践指南
- 创建可访问组件的示例库
- 定期进行可访问性培训

## 持续改进

- 定期进行可访问性审核
- 跟踪和解决可访问性问题
- 随着标准的发展更新实践 