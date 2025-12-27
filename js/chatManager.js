// AI聊天管理器 - 处理与外部AI API的通信
class ChatManager {
    constructor() {
        this.config = window.zooConfig;
        this.dataManager = window.dataManager;
        this.currentAnimal = null;
        this.isProcessing = false;
    }
    
    // 获取API配置
    async getApiConfig() {
        return await this.dataManager.getApiConfig();
    }
    
    // 发送消息到AI API
    async sendMessage(message, animalPersonality) {
        if (this.isProcessing) {
            return null;
        }
        
        this.isProcessing = true;
        
        try {
            const apiConfig = await this.getApiConfig();
            
            if (!apiConfig) {
                throw new Error('API配置未找到，请先配置API');
            }
            
            // 构建系统提示词
            const systemPrompt = this.buildSystemPrompt(animalPersonality);
            
            // 构建请求体
            const requestBody = {
                model: apiConfig.modelName,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            };
            
            // 发送请求
            const response = await fetch(apiConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 提取回复内容
            const aiResponse = data.choices?.[0]?.message?.content || '抱歉，我现在无法回应。';
            
            return aiResponse;
            
        } catch (error) {
            console.error('AI API调用失败:', error);
            
            // 返回友好的错误回复
            return this.getFallbackResponse(animalPersonality);
            
        } finally {
            this.isProcessing = false;
        }
    }
    
    // 构建系统提示词
    buildSystemPrompt(animalPersonality) {
        const animalInfo = this.config.getAnimalInfo(this.currentAnimal);
        const animalName = animalInfo ? animalInfo.name : '小动物';
        
        return `你是一只名叫"${animalName}"的虚拟动物，生活在一个温暖的虚拟动物园中。你的性格特征是：${animalPersonality}。

你的职责是：
1. 作为用户的自我关怀伙伴，提供温暖、不焦虑的建议
2. 帮助用户识别和满足自己的情感需求
3. 鼓励用户进行自我关怀活动
4. 在适当时候建议具体的自我关怀任务

回复要求：
- 语气温柔、理解、不评判
- 避免给出过于具体的医疗或心理建议
- 专注于日常的自我关怀和情感支持
- 回复长度控制在100字以内
- 使用简体中文
- 体现你的动物性格特征

如果用户表达了困扰或需要帮助，你可以建议一些简单的自我关怀任务，比如：
- 深呼吸或冥想
- 听喜欢的音乐
- 喝一杯温水或茶
- 整理一下周围的环境
- 给自己写一句鼓励的话
- 做一些轻松的运动

记住，你是一个温暖的陪伴者，不是治疗师。`;
    }
    
    // 获取备用回复（当API调用失败时）
    getFallbackResponse(animalPersonality) {
        const fallbackResponses = [
            '我现在有点累了，但我想告诉你，你今天已经很棒了。',
            '虽然我暂时说不出话，但我的心在陪伴着你。',
            '让我们一起深呼吸一下吧，感受这一刻的平静。',
            '我可能需要休息一下，但请记住要好好照顾自己哦。',
            '即使我暂时安静，我也希望你知道你值得被关爱。'
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // 从AI建议中生成任务
    async generateTaskFromSuggestion(suggestion, animalId) {
        try {
            // 分析建议内容，提取任务信息
            const taskInfo = this.extractTaskFromSuggestion(suggestion);
            
            if (!taskInfo) {
                throw new Error('无法从建议中提取任务信息');
            }
            
            // 创建任务对象
            const task = {
                title: taskInfo.title,
                description: taskInfo.description,
                gardenZone: taskInfo.gardenZone,
                animalId: animalId,
                experienceReward: 15 // AI生成的任务给予更多经验
            };
            
            // 保存任务
            const savedTask = await this.dataManager.saveTask(task);
            
            if (savedTask) {
                this.dataManager.showSuccess('任务已自动创建！');
                return savedTask;
            }
            
            return null;
            
        } catch (error) {
            console.error('任务生成失败:', error);
            this.dataManager.showError('任务生成失败');
            return null;
        }
    }
    
    // 从建议文本中提取任务信息
    extractTaskFromSuggestion(suggestion) {
        // 简单的关键词匹配来确定园区
        const zoneKeywords = {
            'self-care': ['休息', '放松', '冥想', '深呼吸', '温水', '茶', '音乐', '阅读'],
            'emotional': ['情感', '感受', '心情', '日记', '倾诉', '哭泣', '笑容'],
            'physical': ['运动', '散步', '伸展', '锻炼', '身体', '健康', '睡眠'],
            'social': ['朋友', '家人', '社交', '聊天', '陪伴', '分享', '联系']
        };
        
        let detectedZone = 'self-care'; // 默认园区
        
        // 检测园区
        for (const [zone, keywords] of Object.entries(zoneKeywords)) {
            if (keywords.some(keyword => suggestion.includes(keyword))) {
                detectedZone = zone;
                break;
            }
        }
        
        // 生成任务标题和描述
        let title = '自我关怀任务';
        let description = suggestion;
        
        // 尝试提取更具体的任务标题
        if (suggestion.includes('深呼吸')) {
            title = '进行深呼吸练习';
        } else if (suggestion.includes('音乐')) {
            title = '听一首喜欢的音乐';
        } else if (suggestion.includes('散步')) {
            title = '出去散散步';
        } else if (suggestion.includes('整理')) {
            title = '整理周围环境';
        } else if (suggestion.includes('喝水') || suggestion.includes('茶')) {
            title = '喝一杯温暖的饮品';
        } else if (suggestion.includes('写') || suggestion.includes('日记')) {
            title = '写下今天的感受';
        } else {
            // 从建议中提取前20个字符作为标题
            title = suggestion.substring(0, 20) + (suggestion.length > 20 ? '...' : '');
        }
        
        return {
            title: title,
            description: description,
            gardenZone: detectedZone
        };
    }
    
    // 设置当前聊天的动物
    setCurrentAnimal(animalType) {
        this.currentAnimal = animalType;
    }
    
    // 获取当前动物信息
    getCurrentAnimalInfo() {
        return this.config.getAnimalInfo(this.currentAnimal);
    }
    
    // 开始复盘对话
    async startReflection() {
        const reflectionPrompts = [
            '今天最需要被照顾的是哪里？',
            '你今天感受到了什么情绪？',
            '有什么让你感到温暖的时刻吗？',
            '你想对今天的自己说些什么？',
            '明天你希望给自己什么样的关怀？'
        ];
        
        const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
        
        return {
            message: randomPrompt,
            isReflection: true
        };
    }
    
    // 处理复盘回复
    async handleReflectionResponse(userResponse) {
        const encouragingResponses = [
            '谢谢你的分享，你的感受都是珍贵的。',
            '听到你这样说，我感到很温暖。',
            '你已经很好地在关注自己了，这很棒。',
            '每一份感受都值得被温柔对待。',
            '你的诚实让我觉得你很勇敢。'
        ];
        
        const randomResponse = encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
        
        return randomResponse;
    }
    
    // 检查消息是否包含任务建议
    containsTaskSuggestion(message) {
        const taskIndicators = [
            '建议', '可以试试', '不如', '或许', '也许可以', 
            '试着', '尝试', '做一些', '进行', '花点时间'
        ];
        
        return taskIndicators.some(indicator => message.includes(indicator));
    }
}

// 创建全局聊天管理器实例
window.chatManager = new ChatManager();