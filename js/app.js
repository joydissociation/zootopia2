// 主应用程序 - 管理整个应用的状态和交互
class VirtualZooApp {
    constructor() {
        this.currentTab = 'my-zoo';
        this.currentWeather = null;
        this.userAnimals = [];
        this.userTasks = [];
        this.dataManager = window.dataManager;
        this.isInitialized = false;
        this.currentTheme = 'cute'; // 默认主题
        this.currentVersion = 'desktop'; // 默认版本
        
        this.init();
    }
    
    // 初始化应用
    async init() {
        try {
            // 显示加载指示器
            this.showLoading(true);
            
            // 初始化皮肤切换器
            this.initThemeSwitcher();
            
            // 恢复会话状态
            this.restoreSessionState();
            
            // 初始化数据管理器
            await this.dataManager.initialize();
            
            // 初始化事件监听器
            this.initEventListeners();
            
            // 加载用户数据
            await this.loadUserData();
            
            // 加载今日心情
            await this.loadTodayMood();
            
            // 标记为已初始化
            this.isInitialized = true;
            
            // 隐藏加载指示器
            this.showLoading(false);
            
            console.log('虚拟动物园应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showLoading(false);
            this.showMessage('应用初始化失败，请刷新页面重试', 'error');
        }
    }
    
    // 初始化皮肤切换器
    initThemeSwitcher() {
        // 创建版本切换器HTML
        const versionSwitcher = document.createElement('div');
        versionSwitcher.className = 'version-switcher';
        versionSwitcher.innerHTML = `
            <h4>📱 版本</h4>
            <div class="version-buttons">
                <button class="version-btn desktop active" data-version="desktop">
                    🖥️ 网页版
                </button>
                <button class="version-btn mobile" data-version="mobile">
                    📱 手机版
                </button>
            </div>
        `;
        
        document.body.appendChild(versionSwitcher);
        
        // 绑定版本切换事件
        versionSwitcher.addEventListener('click', (e) => {
            if (e.target.classList.contains('version-btn')) {
                const version = e.target.dataset.version;
                this.switchVersion(version);
            }
        });
        
        // 创建皮肤切换器HTML
        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        themeSwitcher.innerHTML = `
            <h4>🎨 皮肤</h4>
            <div class="theme-buttons">
                <button class="theme-btn cute active" data-theme="cute">
                    🌸 可爱梦幻
                </button>
                <button class="theme-btn retro" data-theme="retro">
                    🕹️ 复古波普
                </button>
                <button class="theme-btn animal-crossing" data-theme="animal-crossing">
                    🍃 动森风格
                </button>
            </div>
        `;
        
        document.body.appendChild(themeSwitcher);
        
        // 绑定切换事件
        themeSwitcher.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-btn')) {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
            }
        });
        
        // 恢复保存的版本和主题
        const savedVersion = localStorage.getItem('zoo_version');
        if (savedVersion && ['desktop', 'mobile'].includes(savedVersion)) {
            this.switchVersion(savedVersion);
        }
        
        const savedTheme = localStorage.getItem('zoo_theme');
        if (savedTheme && ['cute', 'retro', 'animal-crossing'].includes(savedTheme)) {
            this.switchTheme(savedTheme);
        }
    }
    
    // 切换版本
    switchVersion(version) {
        // 移除当前版本类
        document.body.classList.remove('desktop-version', 'mobile-version');
        
        // 添加新版本类
        if (version === 'mobile') {
            document.body.classList.add('mobile-version');
        } else {
            document.body.classList.add('desktop-version');
        }
        
        // 更新按钮状态
        document.querySelectorAll('.version-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-version="${version}"]`).classList.add('active');
        
        // 保存版本设置
        this.currentVersion = version;
        localStorage.setItem('zoo_version', version);
        
        // 显示切换成功消息
        const versionNames = {
            desktop: '网页版',
            mobile: '手机版'
        };
        
        this.showMessage(`已切换到${versionNames[version]}`, 'success');
        
        // 如果切换到手机版，调整一些布局
        if (version === 'mobile') {
            this.adjustMobileLayout();
        }
        
        console.log('版本已切换到:', version);
    }
    
    // 调整手机版布局
    adjustMobileLayout() {
        // 强制重新计算视口高度
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
        
        // 确保模态框在手机版下正确显示
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.padding = '5px';
            modal.style.margin = '0';
        });
        
        // 调整任务列表高度
        const tasksList = document.querySelector('.all-tasks-list');
        if (tasksList) {
            tasksList.style.maxHeight = '200px';
        }
        
        // 调整聊天消息区域高度
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.style.maxHeight = '250px';
        }
        
        // 调整主内容区域滚动
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.overflowY = 'auto';
            mainContent.style.webkitOverflowScrolling = 'touch';
        }
        
        // 防止iOS Safari地址栏影响
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            document.body.style.minHeight = '100vh';
            document.body.style.minHeight = '-webkit-fill-available';
        }
        
        console.log('手机版布局已调整');
    }
    
    // 切换皮肤
    switchTheme(theme) {
        // 移除当前主题类
        document.body.classList.remove('theme-cute', 'theme-retro', 'theme-animal-crossing');
        
        // 添加新主题类
        if (theme !== 'cute') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        // 更新按钮状态
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        // 保存主题设置
        this.currentTheme = theme;
        localStorage.setItem('zoo_theme', theme);
        
        // 显示切换成功消息
        const themeNames = {
            cute: '可爱梦幻',
            retro: '复古波普',
            'animal-crossing': '动森风格'
        };
        
        this.showMessage(`已切换到${themeNames[theme]}皮肤`, 'success');
        
        console.log('皮肤已切换到:', theme);
    }
    
    // 恢复会话状态
    restoreSessionState() {
        const savedTab = sessionStorage.getItem('currentTab');
        if (savedTab && ['my-zoo', 'growth-progress', 'animal-encyclopedia'].includes(savedTab)) {
            this.currentTab = savedTab;
            // 不立即切换，等待DOM完全加载后再切换
            setTimeout(() => {
                this.switchTab(savedTab);
            }, 100);
        }
    }
    
    // 显示消息
    initEventListeners() {
        // 分页导航 - 使用事件委托提高性能和可靠性
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-tab')) {
                    const tabName = e.target.dataset.tab;
                    if (tabName) {
                        this.switchTab(tabName);
                    }
                }
            });
            
            // 键盘导航支持
            mainNav.addEventListener('keydown', (e) => {
                if (e.target.classList.contains('nav-tab')) {
                    let targetTab = null;
                    
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const tabs = Array.from(mainNav.querySelectorAll('.nav-tab'));
                        const currentIndex = tabs.indexOf(e.target);
                        
                        if (e.key === 'ArrowLeft') {
                            targetTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
                        } else {
                            targetTab = tabs[currentIndex + 1] || tabs[0];
                        }
                        
                        if (targetTab) {
                            targetTab.focus();
                            this.switchTab(targetTab.dataset.tab);
                        }
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const tabName = e.target.dataset.tab;
                        if (tabName) {
                            this.switchTab(tabName);
                        }
                    }
                }
            });
        }
        
        // 天气选择
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectWeather(e.target.dataset.weather);
            });
        });
        
        // 添加任务按钮
        document.querySelector('.add-task-btn').addEventListener('click', () => {
            this.showTaskModal();
        });
        
        // 聊天按钮
        document.querySelector('.chat-btn').addEventListener('click', () => {
            this.showChatModal();
        });
        
        // 动物卡片点击事件 - 显示任务列表
        document.addEventListener('click', (e) => {
            const animalCard = e.target.closest('.animal-card');
            if (animalCard && !animalCard.classList.contains('locked')) {
                const animalType = animalCard.dataset.animalType;
                if (animalType) {
                    this.showAnimalTasksModal(animalType);
                }
            }
        });
        
        // 通用聊天输入
        document.getElementById('general-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleGeneralChat();
            }
        });
        
        // 通用聊天按钮
        document.getElementById('general-chat-btn').addEventListener('click', () => {
            this.handleGeneralChat();
        });
        
        // 心情分析按钮
        document.getElementById('analyze-mood-btn').addEventListener('click', () => {
            this.analyzeMoodDescription();
        });
        
        // 心情描述输入框回车键
        document.getElementById('mood-description').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.analyzeMoodDescription();
            }
        });
        
        // 任务表单
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });
        
        // 模态框关闭
        document.querySelectorAll('.cancel-btn, .close-chat-btn, .close-tasks-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });
        
        // 骰子按钮 - 生成随机任务
        document.getElementById('dice-btn').addEventListener('click', () => {
            this.generateRandomTask();
        });
        
        // 任务筛选按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.dataset.filter;
                this.filterTasks(filter);
                
                // 更新按钮状态
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
        
        // 聊天相关事件
        this.initChatEventListeners();
        
        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    // 切换分页
    switchTab(tabName) {
        // 验证分页名称是否有效
        const validTabs = ['my-zoo', 'growth-progress', 'animal-encyclopedia'];
        if (!validTabs.includes(tabName)) {
            console.error('无效的分页名称:', tabName);
            return;
        }
        
        // 更新导航状态和可访问性属性
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });
        
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.setAttribute('aria-selected', 'true');
            targetTab.setAttribute('tabindex', '0');
        }
        
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // 更新当前分页状态
        this.currentTab = tabName;
        
        // 保存分页状态到会话存储
        sessionStorage.setItem('currentTab', tabName);
        
        // 根据分页加载相应数据
        this.loadTabData(tabName);
        
        console.log('切换到分页:', tabName);
    }
    
    // 加载分页数据
    async loadTabData(tabName) {
        switch (tabName) {
            case 'growth-progress':
                await this.loadAllTasksOverview();
                await this.loadGrowthProgress();
                break;
            case 'animal-encyclopedia':
                await this.loadAnimalEncyclopedia();
                break;
        }
    }
    
    // 选择天气心情
    async selectWeather(weather) {
        try {
            // 更新UI状态
            document.querySelectorAll('.weather-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector(`[data-weather="${weather}"]`).classList.add('selected');
            
            this.currentWeather = weather;
            
            // 添加天气背景效果
            this.applyWeatherBackground(weather);
            
            // 保存心情记录
            if (this.dataManager.supabase) {
                await this.dataManager.saveMoodRecord(weather);
            } else {
                // 保存到本地存储
                localStorage.setItem('todayMood', weather);
            }
            
            // 显示心情反馈
            const weatherNames = {
                sunny: '晴朗 ☀️',
                cloudy: '多云 ☁️', 
                rainy: '雨天 🌧️',
                stormy: '暴风雨 ⛈️'
            };
            
            this.showMessage(`今日天气：${weatherNames[weather]}`, 'success');
        } catch (error) {
            console.error('保存心情失败:', error);
            this.showMessage('保存心情失败', 'error');
        }
    }
    
    // 应用天气背景效果
    applyWeatherBackground(weather) {
        // 如果天气没有变化，不显示通知
        const showNotification = this.currentWeather !== weather;
        
        // 移除所有天气背景类
        document.body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-stormy');
        
        // 添加对应的天气背景类
        if (weather) {
            document.body.classList.add(`weather-${weather}`);
        }
        
        // 只在天气真正改变时显示通知
        if (showNotification) {
            this.showWeatherChangeNotification(weather);
        }
    }
    
    // 显示天气变化通知
    showWeatherChangeNotification(weather) {
        const weatherEffects = {
            sunny: {
                emoji: '☀️',
                name: '晴朗',
                description: '阳光洒向大地，温暖而明亮',
                color: '#FFD700'
            },
            cloudy: {
                emoji: '☁️',
                name: '多云',
                description: '云朵悠悠飘过，柔和而宁静',
                color: '#87CEEB'
            },
            rainy: {
                emoji: '🌧️',
                name: '雨天',
                description: '细雨绵绵，滋润着心田',
                color: '#4682B4'
            },
            stormy: {
                emoji: '⛈️',
                name: '暴风雨',
                description: '雷电交加，释放内心的力量',
                color: '#483D8B'
            }
        };
        
        const effect = weatherEffects[weather];
        if (!effect) return;
        
        // 创建天气通知
        const notification = document.createElement('div');
        notification.className = 'weather-notification';
        notification.innerHTML = `
            <div class="weather-notification-icon">${effect.emoji}</div>
            <div class="weather-notification-content">
                <div class="weather-notification-title">天气已变为${effect.name}</div>
                <div class="weather-notification-desc">${effect.description}</div>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.95);
            border: 3px solid ${effect.color};
            border-radius: 20px;
            padding: 20px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            font-family: 'Courier New', monospace;
            text-align: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
            animation: weatherNotificationAppear 3s ease-out forwards;
            pointer-events: none;
        `;
        
        // 添加子元素样式
        const icon = notification.querySelector('.weather-notification-icon');
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 10px;
            filter: drop-shadow(0 0 10px ${effect.color});
            animation: weatherIconBounce 2s ease-in-out infinite;
        `;
        
        const title = notification.querySelector('.weather-notification-title');
        title.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: #2F4F4F;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        
        const desc = notification.querySelector('.weather-notification-desc');
        desc.style.cssText = `
            font-size: 14px;
            color: #696969;
            font-style: italic;
            line-height: 1.4;
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'weatherNotificationDisappear 0.8s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 800);
            }
        }, 3000);
    }
    
    // 加载用户数据
    async loadUserData() {
        try {
            if (this.dataManager.supabase) {
                // 使用真实的数据库数据
                this.userAnimals = await this.dataManager.getUserAnimals() || [];
                this.userTasks = await this.dataManager.getUserTasks() || [];
                
                // 如果没有动物，初始化默认动物
                if (this.userAnimals.length === 0) {
                    await this.dataManager.initializeUserAnimals();
                    this.userAnimals = await this.dataManager.getUserAnimals() || [];
                }
            } else {
                // 使用模拟数据代替数据库调用
                const unlockedAnimals = window.zooConfig.getUnlockedAnimals();
                this.userAnimals = unlockedAnimals.map((animalType, index) => {
                    const animalInfo = window.zooConfig.getAnimalInfo(animalType);
                    return {
                        id: index + 1,
                        name: animalInfo.name,
                        type: animalType,
                        garden_zone: animalInfo.gardenZone,
                        experience_points: Math.floor(Math.random() * 150), // 随机经验值用于测试
                        growth_stage: 1,
                        affection_level: Math.floor(Math.random() * 50)
                    };
                });
                
                this.userTasks = [];
            }
            
            // 更新UI显示
            this.updateAnimalsDisplay();
            this.updateTasksDisplay();
            
        } catch (error) {
            console.error('用户数据加载失败:', error);
            // 降级到模拟数据
            const unlockedAnimals = window.zooConfig.getUnlockedAnimals();
            this.userAnimals = unlockedAnimals.map((animalType, index) => {
                const animalInfo = window.zooConfig.getAnimalInfo(animalType);
                return {
                    id: index + 1,
                    name: animalInfo.name,
                    type: animalType,
                    garden_zone: animalInfo.gardenZone,
                    experience_points: Math.floor(Math.random() * 150),
                    growth_stage: 1,
                    affection_level: Math.floor(Math.random() * 50)
                };
            });
            this.userTasks = [];
            this.updateAnimalsDisplay();
            this.updateTasksDisplay();
        }
    }
    
    // 加载今日心情
    async loadTodayMood() {
        try {
            if (this.dataManager.supabase) {
                // 从数据库获取今日心情
                const moodRecord = await this.dataManager.getTodayMood();
                if (moodRecord) {
                    this.currentWeather = moodRecord.weather_mood;
                    document.querySelector(`[data-weather="${moodRecord.weather_mood}"]`)?.classList.add('selected');
                    // 静默应用天气背景效果（不显示通知）
                    this.applyWeatherBackgroundSilent(moodRecord.weather_mood);
                }
            } else {
                // 从本地存储获取
                const todayMood = localStorage.getItem('todayMood');
                if (todayMood) {
                    this.currentWeather = todayMood;
                    document.querySelector(`[data-weather="${todayMood}"]`)?.classList.add('selected');
                    // 静默应用天气背景效果（不显示通知）
                    this.applyWeatherBackgroundSilent(todayMood);
                }
            }
        } catch (error) {
            console.error('今日心情加载失败:', error);
        }
    }
    
    // 静默应用天气背景效果（不显示通知）
    applyWeatherBackgroundSilent(weather) {
        // 移除所有天气背景类
        document.body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-stormy');
        
        // 添加对应的天气背景类
        if (weather) {
            document.body.classList.add(`weather-${weather}`);
        }
    }
    
    // 更新动物显示
    updateAnimalsDisplay() {
        const container = document.querySelector('.animals-container');
        const allAnimals = window.zooConfig.getAllAnimals();
        
        if (!allAnimals) {
            container.innerHTML = '<p>暂无动物数据</p>';
            return;
        }
        
        container.innerHTML = Object.entries(allAnimals).map(([animalType, animalInfo]) => {
            const isUnlocked = window.zooConfig.isAnimalUnlocked(animalType);
            const userAnimal = this.userAnimals.find(animal => animal.type === animalType);
            
            // 计算成长阶段和任务数量
            let growthStage = '未知';
            let todayTasks = 0;
            let experiencePoints = 0;
            
            if (userAnimal) {
                experiencePoints = userAnimal.experience_points || 0;
                const growthInfo = window.zooConfig.calculateGrowthStage(experiencePoints);
                growthStage = growthInfo.name;
                todayTasks = this.userTasks.filter(task => 
                    (task.animal_id === userAnimal.id || task.animalId === userAnimal.id) && 
                    !(task.is_completed || task.isCompleted) && 
                    !(task.is_deleted || task.isDeleted)
                ).length;
            } else if (isUnlocked) {
                growthStage = '幼崽';
            }
            
            const lockedClass = isUnlocked ? '' : 'locked';
            const displayImage = isUnlocked ? animalInfo.image : 'https://via.placeholder.com/200x200/cccccc/666666?text=?';
            const displayEmoji = animalInfo.emoji;
            const displayName = isUnlocked ? animalInfo.name : '???';
            const displayDescription = isUnlocked ? animalInfo.description : '完成相关任务解锁';
            
            return `
                <div class="animal-card ${lockedClass}" data-animal-type="${animalType}">
                    <div class="animal-image-container">
                        <img src="${displayImage}" alt="${displayName}" class="animal-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div class="animal-emoji-fallback" style="display: none;">${displayEmoji}</div>
                    </div>
                    <div class="animal-info">
                        <h4>${displayName}</h4>
                        <p class="growth-stage">${growthStage}阶段</p>
                        <p class="task-count">今日任务: ${todayTasks}/3</p>
                        <p class="gentle-tip">${displayDescription}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 更新任务显示
    updateTasksDisplay() {
        // 这里可以更新任务相关的UI显示
        // 暂时留空，后续任务管理功能会用到
    }
    
    // 显示任务创建模态框
    showTaskModal() {
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('task-title').focus();
    }
    
    // 创建任务
    async createTask() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const gardenZone = document.getElementById('garden-zone').value;
        
        if (!title || !gardenZone) {
            this.showMessage('请填写任务标题和选择园区', 'error');
            return;
        }
        
        try {
            // 找到对应园区的动物
            const targetAnimal = this.userAnimals.find(animal => 
                animal.garden_zone === gardenZone
            );
            
            const task = {
                title: title,
                description: description,
                gardenZone: gardenZone,
                animalId: targetAnimal ? targetAnimal.id : null,
                experienceReward: 10
            };
            
            if (this.dataManager.supabase) {
                // 保存到数据库
                const savedTask = await this.dataManager.saveTask(task);
                if (savedTask) {
                    this.userTasks.push(savedTask);
                }
            } else {
                // 保存到本地存储
                task.id = Date.now(); // 简单的ID生成
                task.isCompleted = false;
                task.createdAt = new Date().toISOString();
                
                this.userTasks.push(task);
                localStorage.setItem('userTasks', JSON.stringify(this.userTasks));
            }
            
            // 更新显示
            this.updateAnimalsDisplay();
            
            // 清空表单并关闭模态框
            document.getElementById('task-form').reset();
            this.hideAllModals();
            
            this.showMessage('任务创建成功！', 'success');
            
        } catch (error) {
            console.error('创建任务失败:', error);
            this.showMessage('创建任务失败', 'error');
        }
    }
    
    // 加载所有任务总览
    async loadAllTasksOverview() {
        try {
            let allTasks = [];
            
            if (this.dataManager.supabase) {
                // 从数据库获取所有任务（包括已删除的）
                allTasks = await this.dataManager.getAllTasks();
            } else {
                // 从本地存储获取
                allTasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
                
                // 添加已删除的任务（从另一个存储键获取）
                const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
                allTasks = [...allTasks, ...deletedTasks];
            }
            
            // 存储所有任务数据
            this.allTasks = allTasks;
            
            // 更新统计数据
            this.updateTasksStats(allTasks);
            
            // 显示所有任务
            this.displayAllTasks(allTasks);
            
        } catch (error) {
            console.error('加载任务总览失败:', error);
            this.showMessage('加载任务总览失败', 'error');
        }
    }
    
    // 更新任务统计
    updateTasksStats(tasks) {
        const stats = {
            total: tasks.length,
            completed: tasks.filter(task => task.is_completed || task.isCompleted).length,
            pending: tasks.filter(task => !(task.is_completed || task.isCompleted) && !(task.is_deleted || task.isDeleted)).length,
            deleted: tasks.filter(task => task.is_deleted || task.isDeleted).length
        };
        
        document.getElementById('total-tasks').textContent = stats.total;
        document.getElementById('completed-tasks').textContent = stats.completed;
        document.getElementById('pending-tasks').textContent = stats.pending;
        document.getElementById('deleted-tasks').textContent = stats.deleted;
    }
    
    // 显示所有任务
    displayAllTasks(tasks, filter = 'all') {
        const tasksList = document.getElementById('all-tasks-list');
        const emptyMessage = document.getElementById('empty-all-tasks');
        
        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = '';
            emptyMessage.style.display = 'block';
            return;
        }
        
        // 根据筛选条件过滤任务
        let filteredTasks = tasks;
        switch (filter) {
            case 'completed':
                filteredTasks = tasks.filter(task => task.is_completed || task.isCompleted);
                break;
            case 'pending':
                filteredTasks = tasks.filter(task => !(task.is_completed || task.isCompleted) && !(task.is_deleted || task.isDeleted));
                break;
            case 'deleted':
                filteredTasks = tasks.filter(task => task.is_deleted || task.isDeleted);
                break;
            default:
                filteredTasks = tasks;
        }
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-all-tasks"><p>🔍 没有找到符合条件的任务</p></div>';
            emptyMessage.style.display = 'none';
            return;
        }
        
        emptyMessage.style.display = 'none';
        
        // 按创建时间排序（最新的在前）
        filteredTasks.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
        });
        
        tasksList.innerHTML = filteredTasks.map(task => {
            // 获取任务状态
            let statusClass = 'pending';
            let statusText = '进行中';
            
            if (task.is_deleted || task.isDeleted) {
                statusClass = 'deleted';
                statusText = '已删除';
            } else if (task.is_completed || task.isCompleted) {
                statusClass = 'completed';
                statusText = '已完成';
            }
            
            // 获取动物信息
            const animalId = task.animal_id || task.animalId;
            const userAnimal = this.userAnimals.find(animal => animal.id === animalId);
            const animalInfo = userAnimal ? window.zooConfig.getAnimalInfo(userAnimal.type) : null;
            
            // 格式化日期
            const createdDate = new Date(task.created_at || task.createdAt);
            const dateStr = createdDate.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="overview-task-item ${statusClass}">
                    <div class="task-animal-icon">
                        ${animalInfo ? animalInfo.emoji : '🐾'}
                    </div>
                    <div class="overview-task-content">
                        <div class="overview-task-title">${task.title}</div>
                        <div class="overview-task-meta">
                            <span class="task-animal-name">
                                ${animalInfo ? animalInfo.name : '未知动物'}
                            </span>
                            <span class="task-zone-label">
                                ${window.zooConfig.GARDEN_ZONES[task.garden_zone || task.gardenZone] || '未知园区'}
                            </span>
                            <span class="task-date">${dateStr}</span>
                            <span class="task-status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 筛选任务
    filterTasks(filter) {
        if (this.allTasks) {
            this.displayAllTasks(this.allTasks, filter);
        }
    }
    
    // 加载成长进度
    async loadGrowthProgress() {
        const container = document.querySelector('.progress-container');
        
        try {
            // 获取所有用户动物（包括数据库中的）
            let allUserAnimals = [];
            
            if (this.dataManager.supabase) {
                // 从数据库获取所有用户动物
                allUserAnimals = await this.dataManager.getUserAnimals() || [];
            } else {
                // 使用本地数据
                allUserAnimals = this.userAnimals || [];
            }
            
            if (!allUserAnimals || allUserAnimals.length === 0) {
                container.innerHTML = `
                    <div class="empty-progress">
                        <p>🌱 还没有动物朋友</p>
                        <p>完成任务来解锁你的第一个动物伙伴吧！</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = allUserAnimals.map(animal => {
                // 使用配置中的成长阶段计算
                const growthInfo = window.zooConfig.calculateGrowthStage(animal.experience_points || 0);
                const progress = Math.min(growthInfo.progress, 100);
                
                // 获取动物信息
                const animalInfo = window.zooConfig.getAnimalInfo(animal.type);
                const emoji = animalInfo ? animalInfo.emoji : '🐾';
                
                return `
                    <div class="animal-progress">
                        <div class="animal-name">
                            ${emoji} ${animal.name}
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-text">${Math.round(progress)}%</span>
                            <span class="growth-stage">${growthInfo.name}</span>
                        </div>
                        <div class="experience-info">
                            <small>经验值: ${animal.experience_points || 0} / ${growthInfo.nextStageExp || 100}</small>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('加载成长进度失败:', error);
            container.innerHTML = `
                <div class="error-progress">
                    <p>⚠️ 加载进度失败</p>
                    <p>请刷新页面重试</p>
                </div>
            `;
        }
    }
    
    // 加载动物图鉴
    async loadAnimalEncyclopedia() {
        this.updateEncyclopediaDisplay();
    }
    
    // 更新图鉴显示
    updateEncyclopediaDisplay() {
        const container = document.querySelector('.encyclopedia-grid');
        const allAnimals = window.zooConfig.getAllAnimals();
        
        container.innerHTML = Object.entries(allAnimals).map(([animalType, animalInfo]) => {
            const isUnlocked = window.zooConfig.isAnimalUnlocked(animalType);
            const lockedClass = isUnlocked ? '' : 'locked';
            const statusClass = isUnlocked ? 'owned' : 'locked';
            const statusText = isUnlocked ? '已拥有' : '未解锁';
            const displayImage = isUnlocked ? animalInfo.image : 'https://via.placeholder.com/200x200/cccccc/666666?text=?';
            
            return `
                <div class="encyclopedia-card ${lockedClass}" data-animal-type="${animalType}">
                    <div class="encyclopedia-animal-image">
                        <img src="${displayImage}" alt="${animalInfo.name}" class="encyclopedia-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div class="encyclopedia-emoji-fallback" style="display: none;">${animalInfo.emoji}</div>
                    </div>
                    <h4>${animalInfo.name}</h4>
                    <p>${animalInfo.description}</p>
                    <span class="status ${statusClass}">${statusText}</span>
                    ${isUnlocked ? '<button class="view-tarot-btn">查看塔罗牌</button>' : ''}
                </div>
            `;
        }).join('');
        
        // 绑定塔罗牌查看事件
        container.querySelectorAll('.view-tarot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.encyclopedia-card');
                const animalType = card.dataset.animalType;
                this.showCollectedTarotCard(animalType);
            });
        });
    }
    
    // 显示已收集的塔罗牌（回顾模式）
    showCollectedTarotCard(animalType) {
        const animalInfo = window.zooConfig.getAnimalInfo(animalType);
        const tarotInfo = animalInfo.tarotCard;
        
        // 创建塔罗牌容器
        const tarotContainer = document.createElement('div');
        tarotContainer.className = 'tarot-unlock-card tarot-collection-mode';
        
        // 创建塔罗牌
        const tarotCard = document.createElement('div');
        tarotCard.className = 'tarot-card';
        
        // 添加角落装饰
        for (let i = 0; i < 4; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'tarot-corner-decoration';
            tarotCard.appendChild(decoration);
        }
        
        // 添加星星装饰
        const stars = document.createElement('div');
        stars.className = 'tarot-stars';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'tarot-star';
            star.textContent = '✦';
            stars.appendChild(star);
        }
        tarotCard.appendChild(stars);
        
        // 创建卡片内容
        const cardContent = document.createElement('div');
        cardContent.className = 'tarot-card-content';
        
        cardContent.innerHTML = `
            <div class="tarot-card-header">
                <div class="tarot-card-title">${tarotInfo.title}</div>
                <div class="tarot-card-subtitle">${tarotInfo.subtitle}</div>
                <div class="tarot-collection-badge">已收集</div>
            </div>
            
            <div class="tarot-card-animal">
                <div class="tarot-animal-symbol">${animalInfo.emoji}</div>
                <div class="tarot-animal-name">${animalInfo.name}</div>
                <div class="tarot-animal-description">${animalInfo.description}</div>
            </div>
            
            <div class="tarot-card-footer">
                <div class="tarot-card-message">${tarotInfo.message}</div>
                <div class="tarot-card-message" style="font-weight: bold; opacity: 1;">${tarotInfo.blessing}</div>
                <button class="tarot-close-btn">关闭</button>
            </div>
        `;
        
        tarotCard.appendChild(cardContent);
        tarotContainer.appendChild(tarotCard);
        
        // 添加到页面
        document.body.appendChild(tarotContainer);
        
        // 绑定关闭事件
        const closeBtn = tarotContainer.querySelector('.tarot-close-btn');
        const closeTarot = () => {
            tarotContainer.style.animation = 'tarotCardDisappear 0.8s ease-in';
            setTimeout(() => {
                if (tarotContainer.parentNode) {
                    tarotContainer.parentNode.removeChild(tarotContainer);
                }
            }, 800);
        };
        
        closeBtn.addEventListener('click', closeTarot);
        
        // 点击背景关闭
        tarotContainer.addEventListener('click', (e) => {
            if (e.target === tarotContainer) {
                closeTarot();
            }
        });
        
        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeTarot();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // 分析心情描述
    analyzeMoodDescription() {
        const input = document.getElementById('mood-description');
        const description = input.value.trim();
        
        if (!description) {
            this.showMessage('请先描述一下你的心情', 'warning');
            return;
        }
        
        try {
            // 显示分析中状态
            this.showAnalyzingState();
            
            // 延迟执行分析，增加仪式感
            setTimeout(() => {
                // 分析心情
                const weatherType = window.zooConfig.analyzeMoodDescription(description);
                const report = window.zooConfig.generateMoodWeatherReport(description, weatherType);
                
                // 显示分析结果
                this.showMoodAnalysisResult(report);
                
                // 自动选择对应的天气按钮
                this.selectWeatherFromAnalysis(weatherType);
                
                // 清空输入框
                input.value = '';
                
                // 隐藏分析中状态
                this.hideAnalyzingState();
                
            }, 1500); // 1.5秒的分析时间
            
        } catch (error) {
            console.error('心情分析失败:', error);
            this.showMessage('心情分析失败，请重试', 'error');
            this.hideAnalyzingState();
        }
    }
    
    // 显示分析中状态
    showAnalyzingState() {
        const analyzeBtn = document.getElementById('analyze-mood-btn');
        const originalText = analyzeBtn.textContent;
        
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.7';
        analyzeBtn.textContent = '🔍 分析中...';
        
        // 添加分析动画
        analyzeBtn.classList.add('analyzing');
        
        // 存储原始文本
        analyzeBtn.dataset.originalText = originalText;
    }
    
    // 隐藏分析中状态
    hideAnalyzingState() {
        const analyzeBtn = document.getElementById('analyze-mood-btn');
        
        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
        analyzeBtn.textContent = analyzeBtn.dataset.originalText || '🔍 分析心情';
        analyzeBtn.classList.remove('analyzing');
    }
    
    // 显示心情分析结果
    showMoodAnalysisResult(report) {
        const resultContainer = document.getElementById('mood-analysis-result');
        
        resultContainer.innerHTML = `
            <div class="mood-weather-display">
                <div class="mood-weather-icon">${report.weatherEmoji}</div>
                <div class="mood-weather-info">
                    <div class="mood-weather-type">${report.weatherName}</div>
                    <div class="mood-temperature">${report.temperature}°C</div>
                    <div class="mood-description-text">${report.description}</div>
                </div>
            </div>
            <div class="mood-suggestion">
                💡 ${report.suggestion}
            </div>
            <div class="mood-analysis-footer">
                <small>基于你的描述："${report.originalDescription}"</small>
            </div>
        `;
        
        resultContainer.classList.remove('hidden');
        
        // 添加出现动画
        resultContainer.style.animation = 'moodResultAppear 0.8s ease-out';
        
        // 8秒后自动隐藏
        setTimeout(() => {
            resultContainer.style.animation = 'moodResultDisappear 0.5s ease-in';
            setTimeout(() => {
                resultContainer.classList.add('hidden');
                resultContainer.style.animation = '';
            }, 500);
        }, 8000);
    }
    
    // 根据分析结果自动选择天气
    selectWeatherFromAnalysis(weatherType) {
        // 首先移除所有按钮的状态
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.classList.remove('selected', 'analyzed-weather');
        });
        
        const targetBtn = document.querySelector(`[data-weather="${weatherType}"]`);
        if (targetBtn) {
            // 添加分析高亮效果
            targetBtn.classList.add('analyzed-weather');
            
            // 延迟添加选中状态，创建动画效果
            setTimeout(() => {
                targetBtn.classList.add('selected');
                // 应用天气背景效果
                this.applyWeatherBackground(weatherType);
            }, 500);
            
            // 移除分析高亮，保持选中状态
            setTimeout(() => {
                targetBtn.classList.remove('analyzed-weather');
            }, 2500);
            
            // 添加成功反馈
            this.showWeatherAnalysisSuccess(weatherType, targetBtn);
        }
        
        // 保存心情记录
        this.selectWeather(weatherType);
    }
    
    // 显示天气分析成功反馈
    showWeatherAnalysisSuccess(weatherType, buttonElement) {
        // 获取天气信息
        const weatherInfo = window.zooConfig.WEATHER_MOODS[weatherType];
        
        // 创建成功提示
        const successEl = document.createElement('div');
        successEl.className = 'weather-analysis-success';
        successEl.innerHTML = `
            <div class="success-icon">${weatherInfo.emoji}</div>
            <div class="success-text">心情分析完成！</div>
            <div class="success-weather">${weatherInfo.name}</div>
        `;
        
        // 添加样式
        successEl.style.cssText = `
            position: absolute;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(145deg, #98FB98, #90EE90);
            border: 3px solid #32CD32;
            padding: 10px 15px;
            border-radius: 0;
            box-shadow: 3px 3px 0px #228B22;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            color: #006400;
            text-align: center;
            z-index: 1000;
            animation: successPopup 3s ease-out forwards;
            pointer-events: none;
        `;
        
        // 添加到按钮容器
        const weatherSelector = document.querySelector('.weather-selector');
        weatherSelector.style.position = 'relative';
        weatherSelector.appendChild(successEl);
        
        // 3秒后移除
        setTimeout(() => {
            if (successEl.parentNode) {
                successEl.parentNode.removeChild(successEl);
            }
        }, 3000);
    }
    
    // 显示动物任务模态框
    showAnimalTasksModal(animalType) {
        const animalInfo = window.zooConfig.getAnimalInfo(animalType);
        if (!animalInfo) return;
        
        // 设置当前选中的动物
        this.currentSelectedAnimal = animalType;
        
        // 更新模态框标题
        document.getElementById('animal-tasks-title').textContent = 
            `${animalInfo.emoji} ${animalInfo.name}的任务列表`;
        
        // 显示模态框
        document.getElementById('animal-tasks-modal').classList.remove('hidden');
        
        // 加载任务列表
        this.loadAnimalTasks(animalType);
    }
    
    // 加载动物任务列表
    async loadAnimalTasks(animalType) {
        try {
            const userAnimal = this.userAnimals.find(animal => animal.type === animalType);
            if (!userAnimal) return;
            
            // 获取该动物的任务
            let animalTasks = [];
            if (this.dataManager.supabase) {
                // 从数据库获取（排除已删除的）
                animalTasks = await this.dataManager.getAnimalTasks(userAnimal.id);
                animalTasks = animalTasks.filter(task => !task.is_deleted);
            } else {
                // 从本地存储获取（排除已删除的）
                animalTasks = this.userTasks.filter(task => 
                    (task.animalId === userAnimal.id || task.animal_id === userAnimal.id) && !task.isDeleted
                );
            }
            
            // 更新任务列表显示
            this.updateTasksList(animalTasks);
            
        } catch (error) {
            console.error('加载动物任务失败:', error);
            this.showMessage('加载任务失败', 'error');
        }
    }
    
    // 更新任务列表显示
    updateTasksList(tasks) {
        const tasksList = document.getElementById('current-tasks-list');
        const emptyMessage = document.getElementById('empty-tasks-message');
        
        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = '';
            emptyMessage.style.display = 'block';
            return;
        }
        
        emptyMessage.style.display = 'none';
        
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.is_completed || task.isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-zone">${window.zooConfig.GARDEN_ZONES[task.garden_zone || task.gardenZone] || '未知园区'}</span>
                    <span class="task-reward">+${task.experience_reward || task.experienceReward || 10} 经验</span>
                </div>
                <div class="task-actions">
                    ${!(task.is_completed || task.isCompleted) ? `
                        <button class="complete-task-btn" onclick="app.completeTask(${task.id})">
                            ✓ 完成
                        </button>
                    ` : ''}
                    <button class="delete-task-btn" onclick="app.deleteTask(${task.id})">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // 生成随机任务
    async generateRandomTask() {
        if (!this.currentSelectedAnimal) return;
        
        try {
            // 显示骰子滚动动画
            const diceBtn = document.getElementById('dice-btn');
            diceBtn.classList.add('rolling');
            diceBtn.disabled = true;
            
            // 获取动物信息
            const animalInfo = window.zooConfig.getAnimalInfo(this.currentSelectedAnimal);
            const userAnimal = this.userAnimals.find(animal => animal.type === this.currentSelectedAnimal);
            
            if (!animalInfo || !userAnimal) {
                throw new Error('动物信息不存在');
            }
            
            // 生成随机任务
            const taskTitle = window.zooConfig.getRandomSelfCareTask(animalInfo.gardenZone);
            
            const task = {
                title: taskTitle,
                description: `为${animalInfo.name}生成的自我关怀任务`,
                gardenZone: animalInfo.gardenZone,
                animalId: userAnimal.id,
                experienceReward: 15 // 随机生成的任务给更多经验
            };
            
            // 延迟1秒显示结果（等待动画）
            setTimeout(async () => {
                try {
                    let savedTask;
                    
                    if (this.dataManager.supabase) {
                        // 保存到数据库
                        savedTask = await this.dataManager.saveTask(task);
                    } else {
                        // 保存到本地存储
                        task.id = Date.now();
                        task.isCompleted = false;
                        task.createdAt = new Date().toISOString();
                        
                        this.userTasks.push(task);
                        localStorage.setItem('userTasks', JSON.stringify(this.userTasks));
                        savedTask = task;
                    }
                    
                    if (savedTask) {
                        // 重新加载任务列表
                        await this.loadAnimalTasks(this.currentSelectedAnimal);
                        
                        // 显示成功消息
                        this.showMessage(`🎲 为${animalInfo.name}生成了新任务！`, 'success');
                        
                        // 更新动物显示（任务数量）
                        this.updateAnimalsDisplay();
                    }
                    
                } catch (error) {
                    console.error('保存任务失败:', error);
                    this.showMessage('生成任务失败', 'error');
                } finally {
                    // 恢复按钮状态
                    diceBtn.classList.remove('rolling');
                    diceBtn.disabled = false;
                }
            }, 1000);
            
        } catch (error) {
            console.error('生成随机任务失败:', error);
            this.showMessage('生成任务失败', 'error');
            
            // 恢复按钮状态
            const diceBtn = document.getElementById('dice-btn');
            diceBtn.classList.remove('rolling');
            diceBtn.disabled = false;
        }
    }
    
    // 完成任务
    async completeTask(taskId) {
        try {
            if (this.dataManager.supabase) {
                // 使用数据库方法
                const completedTask = await this.dataManager.completeTask(taskId);
                if (completedTask) {
                    this.showMessage(`任务完成！获得 ${completedTask.experience_reward} 经验值`, 'success');
                }
            } else {
                // 本地存储方法
                const taskIndex = this.userTasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    this.userTasks[taskIndex].isCompleted = true;
                    this.userTasks[taskIndex].completedAt = new Date().toISOString();
                    
                    localStorage.setItem('userTasks', JSON.stringify(this.userTasks));
                    
                    // 增加动物经验值
                    const task = this.userTasks[taskIndex];
                    const userAnimal = this.userAnimals.find(animal => 
                        animal.id === task.animalId || animal.id === task.animal_id
                    );
                    
                    if (userAnimal) {
                        userAnimal.experience_points = (userAnimal.experience_points || 0) + (task.experienceReward || 10);
                        localStorage.setItem('userAnimals', JSON.stringify(this.userAnimals));
                    }
                    
                    this.showMessage(`任务完成！获得 ${task.experienceReward || 10} 经验值`, 'success');
                }
            }
            
            // 重新加载任务列表和动物显示
            await this.loadAnimalTasks(this.currentSelectedAnimal);
            this.updateAnimalsDisplay();
            
        } catch (error) {
            console.error('完成任务失败:', error);
            this.showMessage('完成任务失败', 'error');
        }
    }
    
    // 删除任务
    async deleteTask(taskId) {
        if (!confirm('确定要删除这个任务吗？')) return;
        
        try {
            if (this.dataManager.supabase) {
                // 使用数据库方法（软删除）
                await this.dataManager.deleteTask(taskId);
            } else {
                // 本地存储方法（软删除）
                const taskIndex = this.userTasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    // 标记为已删除
                    this.userTasks[taskIndex].isDeleted = true;
                    this.userTasks[taskIndex].deletedAt = new Date().toISOString();
                    
                    localStorage.setItem('userTasks', JSON.stringify(this.userTasks));
                }
            }
            
            // 重新加载任务列表和动物显示
            if (this.currentSelectedAnimal) {
                await this.loadAnimalTasks(this.currentSelectedAnimal);
            }
            this.updateAnimalsDisplay();
            
            // 如果在成长进度页面，也更新任务总览
            if (this.currentTab === 'growth-progress') {
                await this.loadAllTasksOverview();
            }
            
            this.showMessage('任务已删除', 'success');
            
        } catch (error) {
            console.error('删除任务失败:', error);
            this.showMessage('删除任务失败', 'error');
        }
    }
    
    // 隐藏所有模态框
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // 根据类型设置背景色
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
    
    // 显示/隐藏加载指示器
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
    
    // 初始化聊天事件监听器
    initChatEventListeners() {
        // 动物选择按钮
        document.querySelectorAll('.animal-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalType = e.currentTarget.dataset.animal;
                this.selectAnimalForChat(animalType);
            });
        });
        
        // 设置按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showApiConfigPanel();
        });
        
        // 返回聊天按钮
        document.getElementById('back-to-chat-btn').addEventListener('click', () => {
            this.hideApiConfigPanel();
        });
        
        // 聊天输入
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        
        // 发送按钮
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        // 复盘按钮
        document.getElementById('reflection-btn').addEventListener('click', () => {
            this.startReflection();
        });
        
        // 清空聊天按钮
        document.getElementById('clear-chat-btn').addEventListener('click', () => {
            this.clearChatHistory();
        });
        
        // API配置表单
        document.getElementById('api-config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApiConfig();
        });
        
        // 测试API按钮
        document.getElementById('test-api-btn').addEventListener('click', () => {
            this.testApiConnection();
        });
    }
    
    // 选择动物开始聊天
    async selectAnimalForChat(animalType) {
        try {
            // 设置当前聊天动物
            window.chatManager.setCurrentAnimal(animalType);
            
            // 获取动物信息
            const animalInfo = window.zooConfig.getAnimalInfo(animalType);
            
            // 更新聊天标题
            document.getElementById('chat-title').textContent = `${animalInfo.emoji} 和${animalInfo.name}聊聊`;
            
            // 隐藏动物选择，显示聊天界面
            document.querySelector('.animal-selection').classList.add('hidden');
            document.querySelector('.chat-interface').classList.remove('hidden');
            
            // 检查API配置
            const apiConfig = await window.dataManager.getApiConfig();
            if (!apiConfig) {
                this.showApiConfigPanel();
                this.showMessage('请先配置API设置', 'warning');
                return;
            }
            
            // 加载聊天历史
            await this.loadChatHistory(animalType);
            
            // 发送欢迎消息
            this.addChatMessage('animal', `你好！我是${animalInfo.name}，今天感觉怎么样？`);
            
        } catch (error) {
            console.error('选择动物失败:', error);
            this.showMessage('选择动物失败', 'error');
        }
    }
    
    // 发送聊天消息
    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        try {
            // 添加用户消息到界面
            this.addChatMessage('user', message);
            
            // 清空输入框
            input.value = '';
            
            // 显示动物正在输入
            const typingMessage = this.addChatMessage('animal', '正在思考...', true);
            
            // 获取当前动物信息
            const animalInfo = window.chatManager.getCurrentAnimalInfo();
            
            // 发送到AI API
            const response = await window.chatManager.sendMessage(message, animalInfo.personality);
            
            // 移除正在输入的消息
            if (typingMessage) {
                typingMessage.remove();
            }
            
            // 添加AI回复
            const aiMessageEl = this.addChatMessage('animal', response);
            
            // 检查是否包含任务建议
            if (window.chatManager.containsTaskSuggestion(response)) {
                this.addTaskGenerationButton(aiMessageEl, response);
            }
            
            // 保存聊天记录到数据库
            if (window.dataManager.supabase) {
                const currentAnimal = this.userAnimals.find(animal => 
                    animal.type === window.chatManager.currentAnimal
                );
                
                if (currentAnimal) {
                    await window.dataManager.saveChatMessage(currentAnimal.id, message, 'user');
                    await window.dataManager.saveChatMessage(currentAnimal.id, response, 'animal');
                }
            }
            
        } catch (error) {
            console.error('发送消息失败:', error);
            this.showMessage('发送消息失败', 'error');
            
            // 移除正在输入的消息
            const typingMessage = document.querySelector('.typing-indicator');
            if (typingMessage) {
                typingMessage.closest('.message').remove();
            }
        }
    }
    
    // 添加聊天消息到界面
    addChatMessage(sender, message, isTyping = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        
        messageEl.className = `message ${sender}-message`;
        if (isTyping) {
            messageEl.classList.add('typing-indicator');
        }
        
        const senderName = sender === 'user' ? '你' : window.chatManager.getCurrentAnimalInfo()?.name || '动物朋友';
        
        messageEl.innerHTML = `
            <strong>${senderName}:</strong>
            <span>${message}</span>
        `;
        
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageEl;
    }
    
    // 添加任务生成按钮
    addTaskGenerationButton(messageEl, suggestion) {
        const button = document.createElement('button');
        button.className = 'generate-task-btn';
        button.textContent = '生成任务';
        
        button.addEventListener('click', async () => {
            try {
                const currentAnimal = this.userAnimals.find(animal => 
                    animal.type === window.chatManager.currentAnimal
                );
                
                if (currentAnimal) {
                    const task = await window.chatManager.generateTaskFromSuggestion(suggestion, currentAnimal.id);
                    if (task) {
                        button.textContent = '任务已创建 ✓';
                        button.disabled = true;
                        this.updateAnimalsDisplay();
                    }
                }
            } catch (error) {
                console.error('生成任务失败:', error);
                this.showMessage('生成任务失败', 'error');
            }
        });
        
        messageEl.appendChild(button);
    }
    
    // 开始复盘对话
    async startReflection() {
        try {
            const reflection = await window.chatManager.startReflection();
            this.addChatMessage('animal', reflection.message);
        } catch (error) {
            console.error('开始复盘失败:', error);
            this.showMessage('开始复盘失败', 'error');
        }
    }
    
    // 清空聊天历史
    clearChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
        // 发送欢迎消息
        const animalInfo = window.chatManager.getCurrentAnimalInfo();
        if (animalInfo) {
            this.addChatMessage('animal', `聊天记录已清空。我是${animalInfo.name}，有什么想聊的吗？`);
        }
    }
    
    // 加载聊天历史
    async loadChatHistory(animalType) {
        try {
            if (!window.dataManager.supabase) return;
            
            const currentAnimal = this.userAnimals.find(animal => animal.type === animalType);
            if (!currentAnimal) return;
            
            const history = await window.dataManager.getChatHistory(currentAnimal.id, 20);
            
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = '';
            
            history.forEach(record => {
                this.addChatMessage(record.sender, record.message);
            });
            
        } catch (error) {
            console.error('加载聊天历史失败:', error);
        }
    }
    
    // 显示API配置面板
    showApiConfigPanel() {
        document.querySelector('.chat-interface').classList.add('hidden');
        document.querySelector('.animal-selection').classList.add('hidden');
        document.querySelector('.api-config-panel').classList.remove('hidden');
        
        // 加载现有配置
        this.loadApiConfigForm();
    }
    
    // 隐藏API配置面板
    hideApiConfigPanel() {
        document.querySelector('.api-config-panel').classList.add('hidden');
        
        // 根据当前状态显示相应界面
        if (window.chatManager.currentAnimal) {
            document.querySelector('.chat-interface').classList.remove('hidden');
        } else {
            document.querySelector('.animal-selection').classList.remove('hidden');
        }
    }
    
    // 加载API配置表单
    async loadApiConfigForm() {
        try {
            const config = await window.dataManager.getApiConfig();
            
            if (config) {
                document.getElementById('api-url').value = config.apiUrl || '';
                document.getElementById('api-key').value = config.apiKey || '';
                document.getElementById('model-name').value = config.modelName || '';
            }
        } catch (error) {
            console.error('加载API配置失败:', error);
        }
    }
    
    // 保存API配置
    async saveApiConfig() {
        try {
            const config = {
                apiUrl: document.getElementById('api-url').value.trim(),
                apiKey: document.getElementById('api-key').value.trim(),
                modelName: document.getElementById('model-name').value.trim()
            };
            
            if (!config.apiUrl || !config.apiKey || !config.modelName) {
                this.showConfigStatus('请填写所有必需字段', 'error');
                return;
            }
            
            const success = await window.dataManager.saveApiConfig(config);
            
            if (success) {
                this.showConfigStatus('配置保存成功！', 'success');
                setTimeout(() => {
                    this.hideApiConfigPanel();
                }, 1500);
            } else {
                this.showConfigStatus('配置保存失败', 'error');
            }
            
        } catch (error) {
            console.error('保存API配置失败:', error);
            this.showConfigStatus('配置保存失败', 'error');
        }
    }
    
    // 测试API连接
    async testApiConnection() {
        try {
            const config = {
                apiUrl: document.getElementById('api-url').value.trim(),
                apiKey: document.getElementById('api-key').value.trim(),
                modelName: document.getElementById('model-name').value.trim()
            };
            
            if (!config.apiUrl || !config.apiKey || !config.modelName) {
                this.showConfigStatus('请先填写配置信息', 'error');
                return;
            }
            
            this.showConfigStatus('正在测试连接...', 'info');
            
            // 发送测试请求
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.modelName,
                    messages: [
                        {
                            role: "user",
                            content: "Hello"
                        }
                    ],
                    max_tokens: 10
                })
            });
            
            if (response.ok) {
                this.showConfigStatus('连接测试成功！', 'success');
            } else {
                this.showConfigStatus(`连接失败: ${response.status} ${response.statusText}`, 'error');
            }
            
        } catch (error) {
            console.error('API连接测试失败:', error);
            this.showConfigStatus('连接测试失败', 'error');
        }
    }
    
    // 显示配置状态
    showConfigStatus(message, type) {
        const statusEl = document.getElementById('config-status');
        statusEl.textContent = message;
        statusEl.className = `config-status ${type}`;
        statusEl.classList.remove('hidden');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
    
    // 显示聊天模态框
    showChatModal() {
        document.getElementById('chat-modal').classList.remove('hidden');
        
        // 重置界面状态
        document.querySelector('.animal-selection').classList.remove('hidden');
        document.querySelector('.chat-interface').classList.add('hidden');
        document.querySelector('.api-config-panel').classList.add('hidden');
        
        // 更新动物选择列表（只显示已解锁的）
        this.updateChatAnimalSelection();
        
        // 重置聊天管理器状态
        window.chatManager.currentAnimal = null;
    }
    
    // 更新聊天动物选择
    updateChatAnimalSelection() {
        const animalGrid = document.querySelector('.animal-grid');
        const allAnimals = window.zooConfig.getAllAnimals();
        
        animalGrid.innerHTML = Object.entries(allAnimals)
            .filter(([animalType]) => window.zooConfig.isAnimalUnlocked(animalType))
            .map(([animalType, animalInfo]) => `
                <button class="animal-select-btn" data-animal="${animalType}">
                    <div class="animal-avatar">${animalInfo.emoji}</div>
                    <span>${animalInfo.name}</span>
                </button>
            `).join('');
        
        // 重新绑定事件监听器
        document.querySelectorAll('.animal-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animalType = e.currentTarget.dataset.animal;
                this.selectAnimalForChat(animalType);
            });
        });
    }
    
    // 处理通用聊天
    async handleGeneralChat() {
        const input = document.getElementById('general-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        try {
            // 检测消息中是否包含可以解锁动物的关键词
            const detectedAnimal = window.zooConfig.detectAnimalFromMessage(message);
            
            if (detectedAnimal && !window.zooConfig.isAnimalUnlocked(detectedAnimal)) {
                // 解锁新动物
                const isNewUnlock = window.zooConfig.unlockAnimal(detectedAnimal);
                
                if (isNewUnlock) {
                    this.showAnimalUnlockNotification(detectedAnimal);
                    
                    // 更新显示
                    this.updateAnimalsDisplay();
                    this.updateEncyclopediaDisplay();
                    
                    // 保存到数据库
                    if (this.dataManager.supabase) {
                        await this.dataManager.unlockAnimal(detectedAnimal);
                    }
                }
            }
            
            // 生成回复（简单版本，不调用API）
            const response = this.generateSimpleResponse(message, detectedAnimal);
            
            // 显示对话
            this.showGeneralChatResponse(message, response);
            
            // 清空输入框
            input.value = '';
            
        } catch (error) {
            console.error('通用聊天处理失败:', error);
            this.showMessage('聊天处理失败', 'error');
        }
    }
    
    // 生成简单回复
    generateSimpleResponse(message, detectedAnimal) {
        if (detectedAnimal) {
            const animalInfo = window.zooConfig.getAnimalInfo(detectedAnimal);
            const responses = animalInfo.dialogStyle || ['我理解你的感受'];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 通用回复
        const generalResponses = [
            '听起来很有趣呢！',
            '我理解你的想法',
            '每一天都是新的开始',
            '你已经做得很好了',
            '记得照顾好自己哦',
            '有什么需要帮助的吗？'
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    // 显示通用聊天回复
    showGeneralChatResponse(userMessage, response) {
        // 创建临时对话显示
        const chatPreview = document.querySelector('.chat-preview');
        
        // 移除之前的对话
        const existingChat = chatPreview.querySelector('.temp-chat');
        if (existingChat) {
            existingChat.remove();
        }
        
        // 创建新的对话显示
        const tempChat = document.createElement('div');
        tempChat.className = 'temp-chat';
        tempChat.innerHTML = `
            <div class="temp-message user-temp">你: ${userMessage}</div>
            <div class="temp-message animal-temp">动物朋友: ${response}</div>
        `;
        
        // 添加临时样式
        tempChat.style.cssText = `
            margin-top: 15px;
            padding: 15px;
            background: rgba(255,255,255,0.9);
            border: 2px solid #87CEEB;
            border-radius: 0;
        `;
        
        const tempMessages = tempChat.querySelectorAll('.temp-message');
        tempMessages.forEach(msg => {
            msg.style.cssText = `
                margin-bottom: 8px;
                padding: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                border: 1px solid #B0C4DE;
            `;
        });
        
        tempMessages[0].style.background = '#E6E6FA';
        tempMessages[1].style.background = '#F0FFF0';
        
        chatPreview.appendChild(tempChat);
        
        // 3秒后淡出
        setTimeout(() => {
            if (tempChat.parentNode) {
                tempChat.style.transition = 'opacity 0.5s ease';
                tempChat.style.opacity = '0';
                setTimeout(() => {
                    if (tempChat.parentNode) {
                        tempChat.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
    
    // 显示动物解锁通知（塔罗牌样式）
    showAnimalUnlockNotification(animalType) {
        // 检查是否应该显示塔罗牌
        if (!window.zooConfig.shouldShowTarotCard(animalType)) {
            // 如果已经显示过，只显示简单提示
            this.showMessage(`${window.zooConfig.getAnimalInfo(animalType).name}已解锁！`, 'success');
            return;
        }
        
        const animalInfo = window.zooConfig.getAnimalInfo(animalType);
        const tarotInfo = animalInfo.tarotCard;
        
        // 创建塔罗牌容器
        const tarotContainer = document.createElement('div');
        tarotContainer.className = 'tarot-unlock-card';
        
        // 创建塔罗牌
        const tarotCard = document.createElement('div');
        tarotCard.className = 'tarot-card';
        
        // 添加角落装饰
        for (let i = 0; i < 4; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'tarot-corner-decoration';
            tarotCard.appendChild(decoration);
        }
        
        // 添加星星装饰
        const stars = document.createElement('div');
        stars.className = 'tarot-stars';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'tarot-star';
            star.textContent = '✦';
            stars.appendChild(star);
        }
        tarotCard.appendChild(stars);
        
        // 创建卡片内容
        const cardContent = document.createElement('div');
        cardContent.className = 'tarot-card-content';
        
        cardContent.innerHTML = `
            <div class="tarot-card-header">
                <div class="tarot-card-title">${tarotInfo.title}</div>
                <div class="tarot-card-subtitle">${tarotInfo.subtitle}</div>
            </div>
            
            <div class="tarot-card-animal">
                <div class="tarot-animal-symbol">${animalInfo.emoji}</div>
                <div class="tarot-animal-name">${animalInfo.name}</div>
                <div class="tarot-animal-description">${animalInfo.description}</div>
            </div>
            
            <div class="tarot-card-footer">
                <div class="tarot-card-message">${tarotInfo.message}</div>
                <div class="tarot-card-message" style="font-weight: bold; opacity: 1;">${tarotInfo.blessing}</div>
                <button class="tarot-close-btn">收下祝福</button>
            </div>
        `;
        
        tarotCard.appendChild(cardContent);
        tarotContainer.appendChild(tarotCard);
        
        // 添加到页面
        document.body.appendChild(tarotContainer);
        
        // 绑定关闭事件
        const closeBtn = tarotContainer.querySelector('.tarot-close-btn');
        const closeTarot = () => {
            tarotContainer.style.animation = 'tarotCardDisappear 0.8s ease-in';
            setTimeout(() => {
                if (tarotContainer.parentNode) {
                    tarotContainer.parentNode.removeChild(tarotContainer);
                }
            }, 800);
            
            // 标记塔罗牌已显示
            window.zooConfig.markTarotCardShown(animalType);
            
            // 显示简单成功提示
            this.showMessage(`${animalInfo.name}已加入你的动物园！`, 'success');
        };
        
        closeBtn.addEventListener('click', closeTarot);
        
        // 点击背景关闭
        tarotContainer.addEventListener('click', (e) => {
            if (e.target === tarotContainer) {
                closeTarot();
            }
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (tarotContainer.parentNode) {
                closeTarot();
            }
        }, 8000);
    }
}

// 添加聊天消息样式
const chatStyles = `
    .message {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 10px;
        line-height: 1.4;
    }
    
    .user-message {
        background: #e3f2fd;
        margin-left: 20px;
    }
    
    .animal-message {
        background: #f1f8e9;
        margin-right: 20px;
    }
    
    .generate-task-btn {
        display: block;
        margin-top: 8px;
        padding: 5px 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 15px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .generate-task-btn:hover {
        background: #5a67d8;
        transform: translateY(-1px);
    }
    
    .typing {
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = chatStyles;
document.head.appendChild(styleSheet);

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VirtualZooApp();
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});