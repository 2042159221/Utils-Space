// 在页面加载完成后注入暗黑模式切换按钮
document.addEventListener('DOMContentLoaded', function() {
  console.log('Injecting dark mode toggle button');
  
  // 创建按钮容器
  const toggleContainer = document.createElement('div');
  toggleContainer.style.position = 'fixed';
  toggleContainer.style.right = '20px';
  toggleContainer.style.bottom = '20px';
  toggleContainer.style.zIndex = '9999';
  
  // 创建切换按钮
  const toggleButton = document.createElement('button');
  toggleButton.id = 'native-dark-mode-toggle';
  toggleButton.style.width = '50px';
  toggleButton.style.height = '50px';
  toggleButton.style.borderRadius = '50%';
  toggleButton.style.border = 'none';
  toggleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.fontSize = '24px';
  toggleButton.style.display = 'flex';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.justifyContent = 'center';
  toggleButton.style.transition = 'all 0.3s ease';
  
  // 设置按钮初始状态
  const isDark = document.documentElement.classList.contains('dark');
  toggleButton.textContent = isDark ? '☀️' : '🌙';
  toggleButton.style.backgroundColor = isDark ? '#4c5ad9' : '#5B6AFF';
  toggleButton.style.color = 'white';
  
  // 点击事件
  toggleButton.addEventListener('click', function() {
    console.log('Native dark mode toggle clicked');
    
    // 判断当前主题
    const isDark = document.documentElement.classList.contains('dark');
    console.log('Current theme is dark:', isDark);
    
    // 切换主题
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      this.textContent = '🌙';
      this.style.backgroundColor = '#5B6AFF';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.textContent = '☀️';
      this.style.backgroundColor = '#4c5ad9';
    }
    
    console.log('Theme toggled, isDark now:', !isDark);
  });
  
  // 将按钮添加到容器，再将容器添加到页面
  toggleContainer.appendChild(toggleButton);
  document.body.appendChild(toggleContainer);
  
  console.log('Dark mode toggle button injected');
});

// 5秒后检查是否已注入，如果没有则重试
setTimeout(function() {
  if (!document.getElementById('native-dark-mode-toggle')) {
    console.log('Retrying injection...');
    
    // 创建按钮容器
    const toggleContainer = document.createElement('div');
    toggleContainer.style.position = 'fixed';
    toggleContainer.style.right = '20px';
    toggleContainer.style.bottom = '20px';
    toggleContainer.style.zIndex = '9999';
    
    // 创建切换按钮
    const toggleButton = document.createElement('button');
    toggleButton.id = 'native-dark-mode-toggle';
    toggleButton.style.width = '50px';
    toggleButton.style.height = '50px';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.border = 'none';
    toggleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '24px';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.transition = 'all 0.3s ease';
    
    // 设置按钮初始状态
    const isDark = document.documentElement.classList.contains('dark');
    toggleButton.textContent = isDark ? '☀️' : '🌙';
    toggleButton.style.backgroundColor = isDark ? '#4c5ad9' : '#5B6AFF';
    toggleButton.style.color = 'white';
    
    // 点击事件
    toggleButton.addEventListener('click', function() {
      // 判断当前主题
      const isDark = document.documentElement.classList.contains('dark');
      
      // 切换主题
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.textContent = '🌙';
        this.style.backgroundColor = '#5B6AFF';
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.textContent = '☀️';
        this.style.backgroundColor = '#4c5ad9';
      }
    });
    
    // 将按钮添加到容器，再将容器添加到页面
    toggleContainer.appendChild(toggleButton);
    document.body.appendChild(toggleContainer);
  }
}, 5000); 