// 暗黑模式修复脚本
// 该脚本用于确保暗黑模式下所有文本元素都可见

document.addEventListener('DOMContentLoaded', function() {
  console.log('Dark mode fixer loaded');
  
  // 立即运行一次修复
  fixDarkMode();
  
  // 监听暗黑模式切换
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class' && 
          mutation.target === document.documentElement) {
        console.log('HTML class changed, checking if dark mode needs fixing');
        fixDarkMode();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // 页面完全加载后再次运行修复（确保动态内容也被处理）
  window.addEventListener('load', function() {
    setTimeout(fixDarkMode, 500);
  });
  
  // 页面滚动时检查新出现的元素
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(fixDarkMode, 200);
  });
});

// 修复暗黑模式下的可见性问题
function fixDarkMode() {
  // 检查是否处于暗黑模式
  const isDarkMode = document.documentElement.classList.contains('dark');
  if (!isDarkMode) return;
  
  console.log('Fixing dark mode visibility issues');
  
  // 修复具有浅色背景的元素
  const elementsWithLightBg = document.querySelectorAll(
    '.bg-white, .bg-gray-50, .bg-gray-100, [class*="bg-white/"]'
  );
  
  elementsWithLightBg.forEach(element => {
    // 只应用样式，而不改变类名
    element.style.backgroundColor = '#1f2937'; // gray-800
    
    // 查找内部文本节点并确保它们可见
    const textElements = element.querySelectorAll(
      'p, span, h1, h2, h3, h4, h5, h6, div, a, button, label, input, textarea'
    );
    
    textElements.forEach(textEl => {
      // 获取计算样式
      const style = window.getComputedStyle(textEl);
      const color = style.color;
      const bgColor = style.backgroundColor;
      
      // 检查文本颜色是否较深（可能在暗黑模式下不可见）
      if (isColorDark(color) && !isColorTransparent(color)) {
        textEl.style.color = '#f3f4f6'; // gray-100
      }
      
      // 如果背景色是浅色，修改为深色
      if (!isColorTransparent(bgColor) && !isColorDark(bgColor)) {
        textEl.style.backgroundColor = '#374151'; // gray-700
      }
    });
  });
  
  // 修复特定类名的文本颜色
  const darkTextElements = document.querySelectorAll(
    '.text-gray-900, .text-gray-800, .text-gray-700, .text-black, .text-dark'
  );
  
  darkTextElements.forEach(element => {
    element.style.color = '#f3f4f6'; // gray-100
  });
  
  // 修复输入框和表单元素
  const formElements = document.querySelectorAll('input, textarea, select');
  formElements.forEach(element => {
    element.style.backgroundColor = '#374151'; // gray-700
    element.style.color = '#f3f4f6'; // gray-100
    element.style.borderColor = '#4b5563'; // gray-600
  });
  
  // 修复SVG图标颜色 - 针对特定类的SVG图标
  const svgIcons = document.querySelectorAll('svg.text-gray-600, svg.text-gray-700, svg.text-gray-800, svg.text-gray-900');
  svgIcons.forEach(icon => {
    icon.style.color = '#9ca3af'; // gray-400
  });
  
  // 专门修复X图标和其他导航图标
  fixSpecificIcons();
  
  // 一个简单的函数来检测颜色是否为深色
  // 这是一个简化版，实际应用中可能需要更复杂的算法
  function isColorDark(color) {
    // 提取RGB值
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i);
    if (!rgbMatch) return false; // 不是RGB/RGBA格式
    
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    
    // 计算亮度 (基于ITU-R BT.709)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    
    // 亮度小于0.5认为是深色
    return luminance < 0.5;
  }
  
  // 检查颜色是否透明
  function isColorTransparent(color) {
    if (color === 'transparent') return true;
    
    // 检查RGBA的alpha值
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
    if (rgbaMatch && rgbaMatch[4] !== undefined) {
      return parseFloat(rgbaMatch[4]) < 0.1; // alpha小于0.1认为是透明的
    }
    
    return false;
  }
}

// 修复特定图标的颜色
function fixSpecificIcons() {
  // 修复X图标
  document.querySelectorAll('.lucide-x').forEach(icon => {
    icon.style.color = '#6b7280'; // gray-500 - 更暗的色调
    
    // 确保图标的路径元素也具有正确的颜色
    const paths = icon.querySelectorAll('path');
    paths.forEach(path => {
      path.setAttribute('stroke', '#6b7280');
    });
  });
  
  // 修复其他导航图标
  const navIcons = document.querySelectorAll(
    '.lucide-menu, .lucide-search, .lucide-user, .lucide-globe, .lucide-settings'
  );
  
  navIcons.forEach(icon => {
    icon.style.color = '#6b7280'; // gray-500
    
    // 确保图标的路径元素也具有正确的颜色
    const paths = icon.querySelectorAll('path');
    paths.forEach(path => {
      path.setAttribute('stroke', '#6b7280');
    });
  });
  
  // 针对特定的dark:text-gray-300类图标
  document.querySelectorAll('[class*="dark:text-gray-300"]').forEach(element => {
    if (element.tagName.toLowerCase() === 'svg') {
      element.style.color = '#9ca3af'; // 稍暗的灰色 (gray-400)
      
      // 调整内部路径
      const paths = element.querySelectorAll('path, circle, rect, line');
      paths.forEach(path => {
        if (path.hasAttribute('stroke')) {
          path.setAttribute('stroke', '#9ca3af');
        }
        if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
          path.setAttribute('fill', '#9ca3af');
        }
      });
    }
  });
} 