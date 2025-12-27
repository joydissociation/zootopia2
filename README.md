# 虚拟动物园自我关怀应用

## 项目结构

```
front/
├── index.html          # 主HTML文件
├── styles.css          # 样式文件
├── js/
│   ├── config.js       # 配置管理
│   ├── dataManager.js  # 数据管理器
│   ├── chatManager.js  # AI聊天管理器
│   └── app.js          # 主应用程序
└── README.md           # 项目说明
```

## 功能特性

- 三分页界面导航（我的动物园、成长进度、动物图鉴）
- 天气心情选择器
- 动物展示和管理
- 任务创建和管理
- AI聊天功能
- 数据持久化（Supabase）
- 响应式设计

## 配置要求

### Supabase配置
1. 在 `js/config.js` 中设置你的Supabase URL和密钥
2. 创建必要的数据库表（参考design.md中的SQL语句）

### AI API配置
应用首次运行时会提示配置AI API：
- API地址
- API密钥  
- 模型名称

## 部署说明

1. 将所有文件上传到Web服务器
2. 确保Supabase数据库已正确配置
3. 在浏览器中访问index.html

## 技术栈

- HTML5, CSS3, Vanilla JavaScript
- Supabase (PostgreSQL)
- 外部AI API集成

## 浏览器兼容性

支持现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+