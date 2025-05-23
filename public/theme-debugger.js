// 调试脚本：检查和输出当前主题状态

function checkTheme() {
  console.log('Theme Debugger Started');
  
  // 检查 HTML 元素的 class
  const html = document.documentElement;
  const hasDarkClass = html.classList.contains('dark');
  console.log('HTML has dark class:', hasDarkClass);
  
  // 检查 localStorage
  const storedTheme = localStorage.getItem('theme');
  console.log('Stored theme in localStorage:', storedTheme);
  
  // 检查系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  console.log('System prefers dark mode:', prefersDark);
  
  // 检查计算样式
  const bodyStyle = window.getComputedStyle(document.body);
  const bodyBgColor = bodyStyle.backgroundColor;
  console.log('Body background color:', bodyBgColor);
  
  // 检查 Tailwind CSS 变量
  const isDarkMode = hasDarkClass || 
                    storedTheme === 'dark' || 
                    (!storedTheme && prefersDark);
  console.log('Should be in dark mode:', isDarkMode);
  
  // 创建调试信息元素
  const debugInfo = document.createElement('div');
  debugInfo.style.position = 'fixed';
  debugInfo.style.left = '10px';
  debugInfo.style.top = '10px';
  debugInfo.style.padding = '10px';
  debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugInfo.style.color = 'white';
  debugInfo.style.fontSize = '12px';
  debugInfo.style.zIndex = '10000';
  debugInfo.style.borderRadius = '4px';
  debugInfo.style.maxWidth = '300px';
  debugInfo.innerHTML = `
    <div style="margin-bottom: 5px; font-weight: bold;">主题调试信息</div>
    <div>HTML 有 dark 类: ${hasDarkClass}</div>
    <div>localStorage 中的主题: ${storedTheme || 'null'}</div>
    <div>系统偏好暗黑模式: ${prefersDark}</div>
    <div>Body 背景色: ${bodyBgColor}</div>
    <div>应该启用暗黑模式: ${isDarkMode}</div>
    <div style="margin-top: 10px;">
      <button id="force-toggle-theme" style="background: #5B6AFF; border: none; color: white; padding: 5px; border-radius: 4px; cursor: pointer;">
        强制切换主题
      </button>
    </div>
  `;
  
  // 添加到文档
  document.body.appendChild(debugInfo);
  
  // 为强制切换按钮添加事件
  document.getElementById('force-toggle-theme').addEventListener('click', function() {
    if (hasDarkClass) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    // 刷新页面查看效果
    location.reload();
  });
}

// 页面加载后执行
window.addEventListener('load', function() {
  // 延迟1秒后执行，确保所有内容已加载完毕
  setTimeout(checkTheme, 1000);
}); 