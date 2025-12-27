// 数据管理器 - 处理所有数据库操作
class DataManager {
    constructor() {
        this.config = window.zooConfig;
        this.userId = null;
        this.supabase = null;
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        
        // 监听网络状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // 初始化数据管理器
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // 检查Supabase是否已加载
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase库未加载，使用本地存储模式');
                this.userId = this.config.getUserId();
                this.isInitialized = true;
                return true;
            }

            // 检查配置
            if (!this.config.isSupabaseConfigured) {
                console.warn('Supabase未配置，使用本地存储模式');
                this.userId = this.config.getUserId();
                this.isInitialized = true;
                return true;
            }

            // 创建Supabase客户端
            this.supabase = window.supabase.createClient(
                this.config.supabaseUrl,
                this.config.supabaseKey
            );

            // 获取用户ID
            this.userId = this.config.getUserId();
            
            this.isInitialized = true;
            console.log('DataManager初始化成功');
            return true;

        } catch (error) {
            console.error('DataManager初始化失败:', error);
            // 降级到本地存储模式
            this.userId = this.config.getUserId();
            this.isInitialized = true;
            return true;
        }
    }
    
    // 获取Supabase客户端
    getSupabaseClient() {
        if (!this.supabase) {
            throw new Error('Supabase未配置或未初始化');
        }
        return this.supabase;
    }
    
    // 通用错误处理
    handleError(error, operation) {
        console.error(`数据操作失败 (${operation}):`, error);
        
        // 显示用户友好的错误信息
        this.showError(`操作失败: ${operation}`);
        
        return null;
    }
    
    // 显示错误信息
    showError(message) {
        // 创建临时错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 3000;
            box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // 显示成功信息
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 3000;
            box-shadow: 0 4px 15px rgba(46, 213, 115, 0.3);
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 2000);
    }
    
    // API配置相关方法
    async saveApiConfig(config) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('api_config')
                    .upsert({
                        user_id: this.userId,
                        api_url: config.apiUrl,
                        api_key: config.apiKey,
                        model_name: config.modelName,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                
                // 初始化用户动物
                await this.initializeUserAnimals();
            }
            
            // 同时保存到本地存储
            this.config.saveApiConfig(config);
            
            this.showSuccess('API配置保存成功');
            return true;
        } catch (error) {
            return this.handleError(error, 'API配置保存');
        }
    }
    
    async getApiConfig() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // 先尝试从本地获取
            const localConfig = this.config.getApiConfig();
            if (localConfig) {
                return localConfig;
            }
            
            // 从数据库获取
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('api_config')
                    .select('*')
                    .eq('user_id', this.userId)
                    .single();
                
                if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                    throw error;
                }
                
                if (data) {
                    const config = {
                        apiUrl: data.api_url,
                        apiKey: data.api_key,
                        modelName: data.model_name
                    };
                    
                    // 保存到本地
                    this.config.saveApiConfig(config);
                    return config;
                }
            }
            
            return null;
        } catch (error) {
            return this.handleError(error, 'API配置获取');
        }
    }
    
    // 动物相关方法
    async initializeUserAnimals() {
        try {
            const supabase = this.getSupabaseClient();
            
            // 检查用户是否已有动物
            const { data: existingAnimals } = await supabase
                .from('animals')
                .select('*')
                .eq('user_id', this.userId);
            
            if (existingAnimals && existingAnimals.length > 0) {
                return existingAnimals;
            }
            
            // 获取所有已解锁的动物
            const unlockedAnimals = this.config.getUnlockedAnimals();
            const animalsToCreate = [];
            
            // 为每个已解锁的动物创建记录
            for (const animalType of unlockedAnimals) {
                const animalInfo = this.config.getAnimalInfo(animalType);
                if (animalInfo) {
                    animalsToCreate.push({
                        user_id: this.userId,
                        name: animalInfo.name,
                        type: animalType,
                        personality: animalInfo.personality,
                        garden_zone: animalInfo.gardenZone,
                        experience_points: 0,
                        growth_stage: 1,
                        affection_level: 0
                    });
                }
            }
            
            // 如果没有已解锁的动物，至少创建小猫咪
            if (animalsToCreate.length === 0) {
                const defaultAnimal = this.config.getAnimalInfo('cat');
                animalsToCreate.push({
                    user_id: this.userId,
                    name: defaultAnimal.name,
                    type: 'cat',
                    personality: defaultAnimal.personality,
                    garden_zone: defaultAnimal.gardenZone,
                    experience_points: 0,
                    growth_stage: 1,
                    affection_level: 0
                });
            }
            
            // 批量插入动物记录
            const { data, error } = await supabase
                .from('animals')
                .insert(animalsToCreate)
                .select();
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            return this.handleError(error, '动物初始化');
        }
    }
    
    async getUserAnimals() {
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            return this.handleError(error, '动物数据获取');
        }
    }
    
    async updateAnimalProgress(animalId, experiencePoints) {
        try {
            const supabase = this.getSupabaseClient();
            
            // 计算新的成长阶段
            const growthInfo = this.config.calculateGrowthStage(experiencePoints);
            
            const { data, error } = await supabase
                .from('animals')
                .update({
                    experience_points: experiencePoints,
                    growth_stage: growthInfo.stage,
                    affection_level: Math.floor(growthInfo.progress),
                    updated_at: new Date().toISOString()
                })
                .eq('id', animalId)
                .eq('user_id', this.userId)
                .select();
            
            if (error) throw error;
            
            return data[0];
        } catch (error) {
            return this.handleError(error, '动物进度更新');
        }
    }
    
    // 任务相关方法
    async saveTask(task) {
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    user_id: this.userId,
                    animal_id: task.animalId,
                    title: task.title,
                    description: task.description || '',
                    garden_zone: task.gardenZone,
                    experience_reward: task.experienceReward || 10
                })
                .select();
            
            if (error) throw error;
            
            this.showSuccess('任务创建成功');
            return data[0];
        } catch (error) {
            return this.handleError(error, '任务保存');
        }
    }
    
    async getUserTasks(completed = false) {
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    animals (name, type)
                `)
                .eq('user_id', this.userId)
                .eq('is_completed', completed)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            return this.handleError(error, '任务数据获取');
        }
    }
    
    // 获取特定动物的任务
    async getAnimalTasks(animalId, completed = null) {
        if (!this.supabase) return [];
        
        try {
            const supabase = this.getSupabaseClient();
            
            let query = supabase
                .from('tasks')
                .select('*')
                .eq('user_id', this.userId)
                .eq('animal_id', animalId)
                .order('created_at', { ascending: false });
            
            if (completed !== null) {
                query = query.eq('is_completed', completed);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            return this.handleError(error, '获取动物任务');
        }
    }
    
    // 删除任务（软删除）
    async deleteTask(taskId) {
        if (!this.supabase) return false;
        
        try {
            const supabase = this.getSupabaseClient();
            
            // 软删除：标记为已删除而不是真正删除
            const { error } = await supabase
                .from('tasks')
                .update({ 
                    is_deleted: true,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', taskId)
                .eq('user_id', this.userId);
            
            if (error) throw error;
            
            this.showSuccess('任务已删除');
            return true;
        } catch (error) {
            return this.handleError(error, '删除任务');
        }
    }
    
    // 获取所有任务（包括已删除的）
    async getAllTasks() {
        if (!this.supabase) return [];
        
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    animals (
                        name,
                        type,
                        garden_zone
                    )
                `)
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            return this.handleError(error, '获取所有任务');
        }
    }
    
    async completeTask(taskId) {
        try {
            const supabase = this.getSupabaseClient();
            
            // 获取任务信息
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .eq('user_id', this.userId)
                .single();
            
            if (taskError) throw taskError;
            
            // 标记任务完成
            const { error: updateError } = await supabase
                .from('tasks')
                .update({
                    is_completed: true,
                    completed_at: new Date().toISOString()
                })
                .eq('id', taskId);
            
            if (updateError) throw updateError;
            
            // 更新动物经验值
            if (task.animal_id) {
                const { data: animal } = await supabase
                    .from('animals')
                    .select('experience_points')
                    .eq('id', task.animal_id)
                    .single();
                
                if (animal) {
                    const newExp = animal.experience_points + task.experience_reward;
                    await this.updateAnimalProgress(task.animal_id, newExp);
                }
            }
            
            this.showSuccess(`任务完成！获得 ${task.experience_reward} 经验值`);
            return task;
        } catch (error) {
            return this.handleError(error, '任务完成');
        }
    }
    
    // 聊天记录相关方法
    async saveChatMessage(animalId, message, sender) {
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('chat_history')
                .insert({
                    user_id: this.userId,
                    animal_id: animalId,
                    message: message,
                    sender: sender
                })
                .select();
            
            if (error) throw error;
            
            return data[0];
        } catch (error) {
            return this.handleError(error, '聊天记录保存');
        }
    }
    
    async getChatHistory(animalId, limit = 50) {
        try {
            const supabase = this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('user_id', this.userId)
                .eq('animal_id', animalId)
                .order('created_at', { ascending: true })
                .limit(limit);
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            return this.handleError(error, '聊天记录获取');
        }
    }
    
    // 心情记录相关方法
    async saveMoodRecord(weatherMood) {
        try {
            const supabase = this.getSupabaseClient();
            
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('mood_records')
                .upsert({
                    user_id: this.userId,
                    weather_mood: weatherMood,
                    date: today
                })
                .select();
            
            if (error) throw error;
            
            return data[0];
        } catch (error) {
            return this.handleError(error, '心情记录保存');
        }
    }
    
    async getTodayMood() {
        try {
            const supabase = this.getSupabaseClient();
            
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('mood_records')
                .select('*')
                .eq('user_id', this.userId)
                .eq('date', today)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            return data;
        } catch (error) {
            return this.handleError(error, '今日心情获取');
        }
    }
    
    // 离线数据同步
    async syncOfflineData() {
        // 这里可以实现离线数据同步逻辑
        // 暂时留空，后续可以扩展
        console.log('网络已连接，开始同步离线数据...');
    }
    
    // 解锁动物
    async unlockAnimal(animalType) {
        try {
            const supabase = this.getSupabaseClient();
            
            // 检查是否已经有这个动物
            const { data: existingAnimal } = await supabase
                .from('animals')
                .select('*')
                .eq('user_id', this.userId)
                .eq('type', animalType)
                .single();
            
            if (existingAnimal) {
                return existingAnimal; // 已经存在
            }
            
            // 创建新动物
            const animalInfo = window.zooConfig.getAnimalInfo(animalType);
            const { data, error } = await supabase
                .from('animals')
                .insert({
                    user_id: this.userId,
                    name: animalInfo.name,
                    type: animalType,
                    personality: animalInfo.personality,
                    garden_zone: animalInfo.gardenZone,
                    experience_points: 0,
                    growth_stage: 1,
                    affection_level: 0
                })
                .select();
            
            if (error) throw error;
            
            return data[0];
        } catch (error) {
            return this.handleError(error, '动物解锁');
        }
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();