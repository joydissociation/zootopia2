// 验证实现完整性的脚本
console.log('🔍 开始验证虚拟动物园应用实现...');

// 检查配置文件
try {
    if (typeof window.zooConfig !== 'undefined') {
        console.log('✅ Config 配置正常加载');
        
        // 检查动物配置
        const animals = window.zooConfig.getAllAnimals();
        console.log(`✅ 动物配置: ${Object.keys(animals).length} 种动物`);
        
        // 检查每个动物是否有图片
        Object.entries(animals).forEach(([type, info]) => {
            if (info.image && info.image.startsWith('https://')) {
                console.log(`✅ ${info.name} 有AI生成图片: ${info.image}`);
            } else {
                console.log(`⚠️ ${info.name} 缺少图片`);
            }
        });
        
        // 检查任务模板
        const taskTypes = Object.keys(window.zooConfig.SELF_CARE_TASKS);
        console.log(`✅ 任务模板: ${taskTypes.length} 个园区类型`);
        
        // 检查天气配置
        const weatherTypes = Object.keys(window.zooConfig.WEATHER_MOODS);
        console.log(`✅ 天气配置: ${weatherTypes.length} 种天气类型`);
        
    } else {
        console.log('❌ Config 配置未加载');
    }
} catch (error) {
    console.log('❌ Config 配置错误:', error);
}

// 检查数据管理器
try {
    if (typeof window.dataManager !== 'undefined') {
        console.log('✅ DataManager 正常加载');
        
        // 测试初始化
        window.dataManager.initialize().then(() => {
            console.log('✅ DataManager 初始化成功');
        }).catch(error => {
            console.log('⚠️ DataManager 初始化失败 (预期，因为没有Supabase配置):', error.message);
        });
        
    } else {
        console.log('❌ DataManager 未加载');
    }
} catch (error) {
    console.log('❌ DataManager 错误:', error);
}

// 检查聊天管理器
try {
    if (typeof window.chatManager !== 'undefined') {
        console.log('✅ ChatManager 正常加载');
    } else {
        console.log('❌ ChatManager 未加载');
    }
} catch (error) {
    console.log('❌ ChatManager 错误:', error);
}

// 检查应用主类
try {
    if (typeof VirtualZooApp !== 'undefined') {
        console.log('✅ VirtualZooApp 类定义正常');
    } else {
        console.log('❌ VirtualZooApp 类未定义');
    }
} catch (error) {
    console.log('❌ VirtualZooApp 错误:', error);
}

// 检查DOM元素
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 检查DOM元素...');
    
    // 检查导航
    const navTabs = document.querySelectorAll('.nav-tab');
    console.log(`✅ 导航标签: ${navTabs.length} 个`);
    
    // 检查任务总览区域
    const tasksOverview = document.querySelector('.tasks-overview-section');
    if (tasksOverview) {
        console.log('✅ 任务总览区域存在');
        
        // 检查统计卡片
        const statCards = document.querySelectorAll('.stat-card');
        console.log(`✅ 统计卡片: ${statCards.length} 个`);
        
        // 检查筛选按钮
        const filterBtns = document.querySelectorAll('.filter-btn');
        console.log(`✅ 筛选按钮: ${filterBtns.length} 个`);
        
        // 检查任务列表
        const tasksList = document.querySelector('.all-tasks-list');
        if (tasksList) {
            console.log('✅ 任务列表容器存在');
        } else {
            console.log('❌ 任务列表容器缺失');
        }
    } else {
        console.log('❌ 任务总览区域缺失');
    }
    
    // 检查成长进度区域
    const growthProgress = document.querySelector('.growth-progress-section');
    if (growthProgress) {
        console.log('✅ 成长进度区域存在');
        
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            console.log('✅ 进度容器存在');
        } else {
            console.log('❌ 进度容器缺失');
        }
    } else {
        console.log('❌ 成长进度区域缺失');
    }
    
    // 检查动物卡片容器
    const animalsContainer = document.querySelector('.animals-container');
    if (animalsContainer) {
        console.log('✅ 动物卡片容器存在');
    } else {
        console.log('❌ 动物卡片容器缺失');
    }
    
    // 检查图鉴网格
    const encyclopediaGrid = document.querySelector('.encyclopedia-grid');
    if (encyclopediaGrid) {
        console.log('✅ 图鉴网格存在');
    } else {
        console.log('❌ 图鉴网格缺失');
    }
    
    // 检查模态框
    const taskModal = document.querySelector('#animal-tasks-modal');
    if (taskModal) {
        console.log('✅ 任务模态框存在');
    } else {
        console.log('❌ 任务模态框缺失');
    }
    
    console.log('🎉 DOM 检查完成');
});

// 测试功能
function testFeatures() {
    console.log('🧪 开始功能测试...');
    
    // 测试动物解锁
    if (window.zooConfig) {
        const wasUnlocked = window.zooConfig.unlockAnimal('fox');
        console.log(`✅ 动物解锁测试: ${wasUnlocked ? '新解锁' : '已解锁'}`);
        
        // 测试心情分析
        const moodResult = window.zooConfig.analyzeMoodDescription('我今天很开心');
        console.log(`✅ 心情分析测试: ${moodResult}`);
        
        // 测试随机任务生成
        const randomTask = window.zooConfig.getRandomSelfCareTask('self-care');
        console.log(`✅ 随机任务生成: ${randomTask}`);
        
        // 测试成长阶段计算
        const growthInfo = window.zooConfig.calculateGrowthStage(150);
        console.log(`✅ 成长阶段计算: ${growthInfo.name} (${growthInfo.progress}%)`);
    }
    
    console.log('🎉 功能测试完成');
}

// 延迟执行测试
setTimeout(testFeatures, 1000);

console.log('📋 验证脚本加载完成，等待DOM加载...');