// Supabase配置和初始化
class Config {
    constructor() {
        // Supabase配置 - 需要用户提供实际的URL和密钥
        this.supabaseUrl = 'YOUR_SUPABASE_URL';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        
        // 检查是否已配置Supabase
        this.isSupabaseConfigured = this.checkSupabaseConfig();
        
        // AI API配置存储键
        this.API_CONFIG_KEY = 'zoo_api_config';
        
        // 动物园配置
        this.GARDEN_ZONES = {
            'self-care': '自我关怀园区',
            'physical': '身体健康园区',
            'emotional': '情绪关怀园区',
            'creative': '创造力园区',
            'social': '社交连接园区',
            'organization': '生活整理园区',
            'rest': '休息放松园区'
        };
        
        // 动物配置
        this.ANIMALS = {
            cat: {
                name: '小猫咪',
                emoji: '🐱',
                image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face',
                personality: '温柔、细腻、善于倾听',
                gardenZone: 'self-care',
                description: '代表自我关怀和温柔对待自己',
                unlocked: true, // 默认解锁
                keywords: ['自我关怀', '温柔', '休息', '放松', '安静'],
                tarotCard: {
                    title: 'The Gentle Guardian',
                    subtitle: '温柔守护者',
                    message: '学会温柔地对待自己，是一切关怀的开始',
                    blessing: '愿你在忙碌中记得给自己一些温柔时光'
                }
            },
            deer: {
                name: '小鹿',
                emoji: '🦌',
                image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=200&h=200&fit=crop&crop=face',
                personality: '温柔、安静、优雅',
                gardenZone: 'physical',
                description: '代表身体照顾、运动、饮食、睡眠',
                unlocked: false,
                keywords: ['身体', '健康', '运动', '饮食', '睡眠', '喝水', '锻炼', '瑜伽', '散步', '伸展'],
                dialogStyle: ['记得多喝水哦～', '今天的身体感觉怎么样？', '运动让我们更有活力！'],
                growthStages: {
                    1: '小鹿宝宝，蜷缩着休息',
                    2: '开始站立，在草地上走动', 
                    3: '优雅的鹿，在森林中奔跑'
                },
                tarotCard: {
                    title: 'The Vital Spirit',
                    subtitle: '生命活力',
                    message: '身体是心灵的神殿，值得被精心照料',
                    blessing: '愿你的身体充满活力，每一天都精神焕发'
                }
            },
            fox: {
                name: '小狐狸',
                emoji: '🦊',
                image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop&crop=face',
                personality: '敏感、善解人意、聪慧',
                gardenZone: 'emotional',
                description: '代表情绪表达、心理健康、压力管理',
                unlocked: false,
                keywords: ['情绪', '心情', '压力', '焦虑', '难过', '开心', '冥想', '深呼吸', '倾诉', '心理'],
                dialogStyle: ['今天感觉怎么样？', '所有情绪都值得被看见哦', '让我陪陪你吧'],
                growthStages: {
                    1: '毛茸茸的小狐狸，眼睛亮晶晶',
                    2: '尾巴变蓬松，会做不同表情',
                    3: '聪慧的狐狸，尾巴像围巾一样温暖'
                },
                tarotCard: {
                    title: 'The Emotional Sage',
                    subtitle: '情感智者',
                    message: '每一种情绪都是内心的声音，值得被倾听',
                    blessing: '愿你拥有感受情绪的勇气和处理情绪的智慧'
                }
            },
            parrot: {
                name: '鹦鹉',
                emoji: '🦜',
                image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&crop=face',
                personality: '活泼、好奇、爱表达',
                gardenZone: 'creative',
                description: '代表创作、学习、兴趣爱好',
                unlocked: false,
                keywords: ['创作', '学习', '画画', '写作', '读书', '音乐', '技能', '兴趣', '创意', '艺术'],
                dialogStyle: ['今天想创作什么？', '我学会了一句新话！', '让我们一起探索新事物吧！'],
                growthStages: {
                    1: '灰色小鸟，羽毛还没长全',
                    2: '羽毛开始有颜色，会学说简单的话',
                    3: '五彩斑斓的鹦鹉，会唱歌'
                },
                tarotCard: {
                    title: 'The Creative Muse',
                    subtitle: '创意缪斯',
                    message: '创造力是灵魂的语言，让想象力自由飞翔',
                    blessing: '愿你的创意如彩虹般绚烂，永远保持好奇心'
                }
            },
            penguin: {
                name: '企鹅',
                emoji: '🐧',
                image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=200&h=200&fit=crop&crop=face',
                personality: '友善、温暖、群居',
                gardenZone: 'social',
                description: '代表人际关系、社交互动',
                unlocked: false,
                keywords: ['社交', '朋友', '家人', '聊天', '交流', '帮助', '感谢', '人际关系', '陪伴'],
                dialogStyle: ['今天有想念的人吗？', '记得你不是一个人哦', '要不要联系一下朋友？'],
                growthStages: {
                    1: '一只小企鹅',
                    2: '开始有企鹅朋友出现在旁边',
                    3: '一群企鹅在一起（但主角企鹅会有标识）'
                },
                tarotCard: {
                    title: 'The Social Bond',
                    subtitle: '社交纽带',
                    message: '真正的连接来自心与心的相遇',
                    blessing: '愿你被爱包围，也能将温暖传递给他人'
                }
            },
            beaver: {
                name: '海狸',
                emoji: '🦫',
                image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop&crop=face',
                personality: '勤劳、有条理、踏实',
                gardenZone: 'organization',
                description: '代表空间整理、生活规划、环境优化',
                unlocked: false,
                keywords: ['整理', '收纳', '规划', '清洁', '断舍离', '环境', '家务', '条理', '计划'],
                dialogStyle: ['今天要整理什么呢？', '一点点来，不着急', '整洁的环境让心情更好！'],
                growthStages: {
                    1: '小海狸，旁边有几根树枝',
                    2: '开始搭建小水坝',
                    3: '精致的水坝和小窝'
                },
                tarotCard: {
                    title: 'The Organized Mind',
                    subtitle: '有序之心',
                    message: '外在的整理是内在平静的开始',
                    blessing: '愿你的生活井然有序，内心安宁祥和'
                }
            },
            sloth: {
                name: '树懒',
                emoji: '🦥',
                image: 'https://images.unsplash.com/photo-1539681944768-9d8e5d78e2b3?w=200&h=200&fit=crop&crop=face',
                personality: '慵懒、治愈、佛系',
                gardenZone: 'rest',
                description: '代表休息、放松、什么都不做',
                unlocked: false,
                keywords: ['休息', '放松', '睡觉', '发呆', '泡澡', '游戏', '娱乐', '慢节奏', '放假'],
                dialogStyle: ['累了就休息吧～', '什么都不做也很棒哦', '慢慢来，不用着急'],
                growthStages: {
                    1: '挂在树枝上的小树懒',
                    2: '换了更舒服的姿势',
                    3: '慵懒地躺着，周围有舒适的环境'
                },
                tarotCard: {
                    title: 'The Peaceful Rest',
                    subtitle: '宁静安息',
                    message: '休息不是懒惰，而是为了更好地前行',
                    blessing: '愿你学会放慢脚步，享受当下的宁静'
                }
            }
        };
        
        // Self Care 任务模板 - 按动物类型分类
        this.SELF_CARE_TASKS = {
            'self-care': [
                '给自己泡一杯喜欢的茶或咖啡',
                '花10分钟做深呼吸练习',
                '写下今天的三件好事',
                '给自己一个温暖的拥抱',
                '听一首让你放松的音乐',
                '对镜子里的自己说句鼓励的话',
                '整理一下自己的外表，让自己感觉更好',
                '花5分钟冥想或静坐',
                '给自己买一样小小的礼物',
                '在阳光下坐一会儿',
                '写一封给未来自己的信',
                '做一件让自己开心的小事'
            ],
            'physical': [
                '喝一大杯温水',
                '做10个深蹲或俯卧撑',
                '伸展身体5分钟',
                '到户外走走，呼吸新鲜空气',
                '吃一份健康的水果',
                '做眼保健操，缓解眼部疲劳',
                '早睡30分钟',
                '做一套简单的瑜伽动作',
                '按摩自己的肩膀和脖子',
                '爬楼梯代替坐电梯',
                '准备一份营养均衡的餐食',
                '洗个舒服的热水澡'
            ],
            'emotional': [
                '写下现在的感受，不加评判',
                '给信任的朋友发个消息',
                '看一部治愈的电影或视频',
                '画画或涂鸦表达情绪',
                '大声唱一首喜欢的歌',
                '抱抱毛绒玩具或宠物',
                '在日记里倾诉心情',
                '做几个让自己笑的表情',
                '回忆一个美好的回忆',
                '给自己写一张鼓励小纸条',
                '允许自己哭一会儿，释放情绪',
                '练习感恩，想想值得感谢的事'
            ],
            'creative': [
                '画一幅简单的涂鸦',
                '写一首小诗或几句话',
                '学一个新的手工技巧',
                '拍几张有趣的照片',
                '尝试一个新的菜谱',
                '重新装饰房间的一个角落',
                '学几个新单词或短语',
                '创作一个小故事',
                '设计一个理想中的房间',
                '制作一个简单的手工艺品',
                '尝试一种新的艺术形式',
                '为喜欢的歌曲编舞'
            ],
            'social': [
                '给久未联系的朋友发消息',
                '向家人表达爱意',
                '帮助一个需要帮助的人',
                '加入一个兴趣小组或社区',
                '和邻居打个招呼',
                '给服务人员一个微笑和感谢',
                '分享一个有趣的内容给朋友',
                '主动约朋友见面聊天',
                '参加一个社交活动',
                '给重要的人写一封感谢信',
                '在社交媒体上发布正能量内容',
                '倾听别人的故事'
            ],
            'organization': [
                '整理桌面，清理杂物',
                '制定明天的简单计划',
                '整理一个抽屉或柜子',
                '清理手机里的无用照片',
                '整理书架或衣柜',
                '制作一个待办清单',
                '清洁一个经常使用的物品',
                '整理数字文件夹',
                '断舍离一些不需要的物品',
                '规划下周的时间安排',
                '整理钱包或包包',
                '创建一个舒适的工作空间'
            ],
            'rest': [
                '什么都不做，发呆10分钟',
                '躺在床上听轻音乐',
                '看窗外的风景',
                '玩一个轻松的小游戏',
                '泡个脚，放松身心',
                '午睡20分钟',
                '慢慢品尝一杯茶',
                '看一些有趣的图片或表情包',
                '做一些简单的拼图',
                '在沙发上舒服地窝着',
                '看云朵或星星',
                '享受一个人的安静时光'
            ]
        };
        
        // 天气心情配置
        this.WEATHER_MOODS = {
            sunny: { 
                name: '晴朗', 
                emoji: '☀️', 
                description: '心情愉悦，充满活力',
                tempRange: [20, 28],
                keywords: ['开心', '快乐', '兴奋', '满足', '愉快', '高兴', '喜悦', '舒畅', '轻松', '美好']
            },
            cloudy: { 
                name: '多云', 
                emoji: '☁️', 
                description: '心情平静，有些思考',
                tempRange: [15, 22],
                keywords: ['平静', '思考', '沉思', '安静', '淡然', '普通', '一般', '还好', '无聊', '迷茫']
            },
            rainy: { 
                name: '雨天', 
                emoji: '🌧️', 
                description: '心情低落，需要关怀',
                tempRange: [8, 16],
                keywords: ['难过', '伤心', '沮丧', '失落', '孤独', '疲惫', '累', '烦躁', '郁闷', '不开心']
            },
            stormy: { 
                name: '暴风雨', 
                emoji: '⛈️', 
                description: '情绪激烈，需要宣泄',
                tempRange: [5, 12],
                keywords: ['愤怒', '生气', '焦虑', '紧张', '压力', '崩溃', '烦恼', '痛苦', '绝望', '混乱']
            }
        };
        
        // 成长阶段配置
        this.GROWTH_STAGES = {
            1: { name: '幼崽', minExp: 0, maxExp: 100, progress: 0 },
            2: { name: '少年', minExp: 100, maxExp: 300, progress: 33 },
            3: { name: '青年', minExp: 300, maxExp: 600, progress: 66 },
            4: { name: '成年', minExp: 600, maxExp: 1000, progress: 100 }
        };
        
        // 解锁状态存储
        this.unlockedAnimals = JSON.parse(localStorage.getItem('unlockedAnimals') || '["cat"]');
        this.shownTarotCards = JSON.parse(localStorage.getItem('shownTarotCards') || '[]');
    }
    
    // 获取随机self care任务
    getRandomSelfCareTask(gardenZone) {
        const tasks = this.SELF_CARE_TASKS[gardenZone];
        if (!tasks || tasks.length === 0) {
            return '今天给自己一些温柔的关怀吧 💕';
        }
        
        const randomIndex = Math.floor(Math.random() * tasks.length);
        return tasks[randomIndex];
    }
    
    // 获取动物对应的园区
    getAnimalGardenZone(animalType) {
        const animal = this.ANIMALS[animalType];
        return animal ? animal.gardenZone : 'self-care';
    }
    
    // 检查Supabase配置
    checkSupabaseConfig() {
        return this.supabaseUrl !== 'YOUR_SUPABASE_URL' && 
               this.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY';
    }
    
    // 获取所有动物
    getAllAnimals() {
        return this.ANIMALS;
    }
    
    // 获取动物信息
    getAnimalInfo(animalType) {
        return this.ANIMALS[animalType];
    }
    
    // 检查动物是否解锁
    isAnimalUnlocked(animalType) {
        return this.unlockedAnimals.includes(animalType);
    }
    
    // 获取已解锁的动物
    getUnlockedAnimals() {
        return this.unlockedAnimals;
    }
    
    // 解锁动物
    unlockAnimal(animalType) {
        if (!this.unlockedAnimals.includes(animalType)) {
            this.unlockedAnimals.push(animalType);
            localStorage.setItem('unlockedAnimals', JSON.stringify(this.unlockedAnimals));
            return true; // 返回true表示是新解锁
        }
        return false; // 已经解锁过了
    }
    
    // 计算成长阶段
    calculateGrowthStage(experiencePoints) {
        for (let stage = 4; stage >= 1; stage--) {
            const stageInfo = this.GROWTH_STAGES[stage];
            if (experiencePoints >= stageInfo.minExp) {
                const progress = stage === 4 ? 100 : 
                    Math.min(100, ((experiencePoints - stageInfo.minExp) / (stageInfo.maxExp - stageInfo.minExp)) * 100);
                
                return {
                    stage: stage,
                    name: stageInfo.name,
                    progress: Math.round(progress),
                    currentExp: experiencePoints,
                    nextStageExp: stage === 4 ? stageInfo.maxExp : this.GROWTH_STAGES[stage + 1].minExp
                };
            }
        }
        
        // 默认返回第一阶段
        return {
            stage: 1,
            name: this.GROWTH_STAGES[1].name,
            progress: Math.min(100, (experiencePoints / this.GROWTH_STAGES[1].maxExp) * 100),
            currentExp: experiencePoints,
            nextStageExp: this.GROWTH_STAGES[2].minExp
        };
    }
    
    // 从消息中检测动物类型
    detectAnimalFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [animalType, animalInfo] of Object.entries(this.ANIMALS)) {
            // 检查关键词匹配
            for (const keyword of animalInfo.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    return animalType;
                }
            }
            
            // 检查动物名称匹配
            if (lowerMessage.includes(animalInfo.name.toLowerCase()) || 
                lowerMessage.includes(animalInfo.emoji)) {
                return animalType;
            }
        }
        
        return null;
    }
    
    // 分析心情描述
    analyzeMoodDescription(description) {
        const lowerDesc = description.toLowerCase();
        
        // 检查每种天气的关键词
        for (const [weatherType, weatherInfo] of Object.entries(this.WEATHER_MOODS)) {
            for (const keyword of weatherInfo.keywords) {
                if (lowerDesc.includes(keyword.toLowerCase())) {
                    return weatherType;
                }
            }
        }
        
        // 默认返回晴朗
        return 'sunny';
    }
    
    // 生成心情天气报告
    generateMoodWeatherReport(description, weatherType) {
        const weatherInfo = this.WEATHER_MOODS[weatherType];
        const temperature = Math.floor(Math.random() * (weatherInfo.tempRange[1] - weatherInfo.tempRange[0] + 1)) + weatherInfo.tempRange[0];
        
        const suggestions = {
            sunny: [
                '保持这份美好的心情，做些让自己开心的事情吧！',
                '今天是个好日子，不妨出去走走，感受阳光的温暖。',
                '心情这么好，可以尝试一些新的活动或挑战。'
            ],
            cloudy: [
                '平静的心情也很珍贵，可以用这个时间思考和规划。',
                '不妨读本书或听听音乐，享受这份宁静。',
                '适合做一些需要专注的事情，比如整理或学习。'
            ],
            rainy: [
                '每个人都会有低落的时候，给自己一些温柔和耐心。',
                '可以尝试和信任的朋友聊聊，或者做些让自己舒服的事。',
                '记住这只是暂时的，明天又是新的一天。'
            ],
            stormy: [
                '强烈的情绪需要被看见和理解，不要压抑自己。',
                '可以通过运动、写作或其他方式来释放这些情绪。',
                '如果感觉太难受，记得寻求专业帮助或朋友支持。'
            ]
        };
        
        const suggestionList = suggestions[weatherType];
        const randomSuggestion = suggestionList[Math.floor(Math.random() * suggestionList.length)];
        
        return {
            weatherType: weatherType,
            weatherName: weatherInfo.name,
            weatherEmoji: weatherInfo.emoji,
            temperature: temperature,
            description: weatherInfo.description,
            suggestion: randomSuggestion,
            originalDescription: description
        };
    }
    
    // 检查是否应该显示塔罗牌
    shouldShowTarotCard(animalType) {
        return !this.shownTarotCards.includes(animalType);
    }
    
    // 标记塔罗牌已显示
    markTarotCardShown(animalType) {
        if (!this.shownTarotCards.includes(animalType)) {
            this.shownTarotCards.push(animalType);
            localStorage.setItem('shownTarotCards', JSON.stringify(this.shownTarotCards));
        }
    }
    
    // 获取用户ID
    getUserId() {
        let userId = localStorage.getItem('zoo_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('zoo_user_id', userId);
        }
        return userId;
    }
    
    // 保存API配置到本地存储
    saveApiConfig(config) {
        localStorage.setItem(this.API_CONFIG_KEY, JSON.stringify(config));
    }
    
    // 获取API配置从本地存储
    getApiConfig() {
        const configStr = localStorage.getItem(this.API_CONFIG_KEY);
        return configStr ? JSON.parse(configStr) : null;
    }
}

// 创建全局配置实例
window.zooConfig = new Config();