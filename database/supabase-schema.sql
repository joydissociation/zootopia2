-- 虚拟动物园自我关怀应用 - Supabase PostgreSQL 数据库表结构

-- 1. API配置表 (存储用户的API配置信息)
CREATE TABLE api_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 动物数据表
CREATE TABLE animals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES api_config(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 动物类型 (cat, dog, rabbit等)
    personality TEXT NOT NULL, -- 性格特征描述
    garden_zone TEXT NOT NULL, -- 所属园区 (self-care, emotional, physical, social)
    experience_points INTEGER DEFAULT 0,
    growth_stage INTEGER DEFAULT 1, -- 1-5成长阶段
    affection_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 任务数据表
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES api_config(user_id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    garden_zone TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    experience_reward INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 聊天记录表
CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES api_config(user_id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'animal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 心情记录表
CREATE TABLE mood_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES api_config(user_id) ON DELETE CASCADE,
    weather_mood TEXT NOT NULL CHECK (weather_mood IN ('sunny', 'cloudy', 'rainy', 'stormy')),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date) -- 每天只能有一条心情记录
);

-- 6. 用户会话表 (用于跟踪用户状态)
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES api_config(user_id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_animals_user_id ON animals(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_animal_id ON tasks(animal_id);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_animal_id ON chat_history(animal_id);
CREATE INDEX idx_mood_records_user_id ON mood_records(user_id);
CREATE INDEX idx_mood_records_date ON mood_records(date);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_api_config_updated_at BEFORE UPDATE ON api_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认动物数据的函数
CREATE OR REPLACE FUNCTION initialize_user_animals(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO animals (user_id, name, type, personality, garden_zone, experience_points, growth_stage, affection_level)
    VALUES 
        (p_user_id, '小猫咪', 'cat', '温柔、敏感、喜欢安静的环境，善于倾听和给予安慰', 'self-care', 0, 1, 0),
        (p_user_id, '小狗狗', 'dog', '忠诚、活泼、充满正能量，擅长鼓励和陪伴', 'emotional', 0, 1, 0),
        (p_user_id, '小兔子', 'rabbit', '平静、专注、善于思考，帮助用户保持内心平衡', 'physical', 0, 1, 0);
END;
$$ LANGUAGE plpgsql;

-- 行级安全策略 (RLS) - 确保用户只能访问自己的数据
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 (这些策略需要根据你的认证方式调整)
-- 注意：实际使用时需要根据Supabase的auth.uid()来设置策略

-- 示例策略 (需要根据实际认证方式调整)
-- CREATE POLICY "Users can only access their own data" ON api_config FOR ALL USING (user_id = auth.uid());
-- CREATE POLICY "Users can only access their own animals" ON animals FOR ALL USING (user_id = auth.uid());
-- CREATE POLICY "Users can only access their own tasks" ON tasks FOR ALL USING (user_id = auth.uid());
-- CREATE POLICY "Users can only access their own chat history" ON chat_history FOR ALL USING (user_id = auth.uid());
-- CREATE POLICY "Users can only access their own mood records" ON mood_records FOR ALL USING (user_id = auth.uid());
-- CREATE POLICY "Users can only access their own sessions" ON user_sessions FOR ALL USING (user_id = auth.uid());

-- 创建视图以简化查询
CREATE VIEW user_dashboard AS
SELECT 
    a.user_id,
    a.name as animal_name,
    a.type as animal_type,
    a.experience_points,
    a.growth_stage,
    a.affection_level,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.is_completed = true THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.is_completed = false THEN 1 END) as pending_tasks
FROM animals a
LEFT JOIN tasks t ON a.id = t.animal_id
GROUP BY a.id, a.user_id, a.name, a.type, a.experience_points, a.growth_stage, a.affection_level;

-- 注释说明
COMMENT ON TABLE api_config IS '存储用户的AI API配置信息';
COMMENT ON TABLE animals IS '用户的虚拟动物数据';
COMMENT ON TABLE tasks IS '用户的自我关怀任务';
COMMENT ON TABLE chat_history IS '用户与动物的聊天记录';
COMMENT ON TABLE mood_records IS '用户的每日心情记录';
COMMENT ON TABLE user_sessions IS '用户会话管理';