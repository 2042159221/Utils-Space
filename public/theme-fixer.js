// theme-fixer.js
// 在控制台输入以下代码可以直接切换主题

// 主题修复脚本
// 用于确保页面加载时正确应用主题

// 立即执行函数，避免污染全局作用域
(function() {
  console.log('Theme fixer script loaded');
  
  // 检查并应用保存的主题
  function applyTheme() {
    // 检查localStorage中保存的主题
    const savedTheme = localStorage.getItem('theme');
    
    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 确定应该使用的主题
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    console.log({
      savedTheme,
      prefersDark,
      shouldUseDark
    });
    
    // 应用主题
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  
  // 立即应用主题
  applyTheme();
  
  // 添加系统主题变化的监听器
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', (e) => {
    // 只在用户没有明确设置主题时响应系统变化
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
  
  // 定期检查是否有不一致的主题设置
  setInterval(() => {
    const savedTheme = localStorage.getItem('theme');
    const hasDarkClass = document.documentElement.classList.contains('dark');
    
    // 如果存储的主题与实际应用的主题不一致，则修复
    if (
      (savedTheme === 'dark' && !hasDarkClass) ||
      (savedTheme === 'light' && hasDarkClass)
    ) {
      console.log('检测到主题不一致，正在修复');
      applyTheme();
    }
  }, 2000);
  
  // 确保暗黑模式切换按钮是可见的
  setTimeout(() => {
    const darkModeButton = document.getElementById('dark-mode-toggle');
    if (darkModeButton) {
      darkModeButton.style.display = 'flex';
      darkModeButton.style.opacity = '1';
    }
  }, 1000);
  
  // 修复可能存在的样式问题
  setTimeout(() => {
    if (document.documentElement.classList.contains('dark')) {
      // 确保所有白色背景元素都有适当的暗色背景
      document.querySelectorAll('.bg-white, .bg-gray-50, .bg-gray-100').forEach(el => {
        el.classList.add('dark:bg-gray-800');
      });
      
      // 确保所有深色文本都有适当的亮色替代
      document.querySelectorAll('.text-gray-900, .text-gray-800, .text-gray-700').forEach(el => {
        el.classList.add('dark:text-gray-100');
      });
    }
  }, 1500);
})();

// 如果以上脚本无效，可以在浏览器控制台中直接执行以下函数
function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log('Switched to light mode');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log('Switched to dark mode');
  }
}

// 在控制台中使用: toggleDarkMode() 