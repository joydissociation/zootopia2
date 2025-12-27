// 导航功能验证测试
// 验证任务2.1的完成情况

class NavigationValidator {
    constructor() {
        this.results = [];
    }

    // 验证HTML结构
    validateHTMLStructure() {
        const nav = document.querySelector('.main-nav');
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        // 检查导航容器
        this.addResult('导航容器存在', !!nav, nav ? '找到主导航容器' : '缺少主导航容器');

        // 检查分页数量
        this.addResult('分页数量正确', tabs.length === 3, `找到${tabs.length}个分页按钮，期望3个`);

        // 检查内容区域数量
        this.addResult('内容区域数量正确', contents.length === 3, `找到${contents.length}个内容区域，期望3个`);

        // 检查分页名称
        const expectedTabs = ['my-zoo', 'growth-progress', 'animal-encyclopedia'];
        const actualTabs = Array.from(tabs).map(tab => tab.dataset.tab);
        const tabsMatch = expectedTabs.every(tab => actualTabs.includes(tab));
        this.addResult('分页名称正确', tabsMatch, tabsMatch ? '所有分页名称匹配' : '分页名称不匹配');

        return this.results.filter(r => r.category === 'HTML结构');
    }

    // 验证CSS样式
    validateCSSStyles() {
        const activeTab = document.querySelector('.nav-tab.active');
        const activeContent = document.querySelector('.tab-content.active');

        // 检查活跃分页样式
        this.addResult('活跃分页样式', !!activeTab, activeTab ? '找到活跃分页' : '没有活跃分页');

        // 检查活跃内容样式
        this.addResult('活跃内容样式', !!activeContent, activeContent ? '找到活跃内容' : '没有活跃内容');

        // 检查只有一个活跃分页
        const activeTabs = document.querySelectorAll('.nav-tab.active');
        const activeContents = document.querySelectorAll('.tab-content.active');
        
        this.addResult('唯一活跃分页', activeTabs.length === 1, `活跃分页数量: ${activeTabs.length}，期望1个`);
        this.addResult('唯一活跃内容', activeContents.length === 1, `活跃内容数量: ${activeContents.length}，期望1个`);

        return this.results.filter(r => r.category === 'CSS样式');
    }

    // 验证JavaScript功能
    validateJavaScriptFunctionality() {
        // 检查应用实例
        const appExists = typeof window.app !== 'undefined';
        this.addResult('应用实例存在', appExists, appExists ? '应用实例已创建' : '应用实例不存在');

        // 检查切换方法
        if (appExists) {
            const hasSwitchTab = typeof window.app.switchTab === 'function';
            this.addResult('切换方法存在', hasSwitchTab, hasSwitchTab ? 'switchTab方法存在' : 'switchTab方法不存在');
        }

        // 检查会话存储功能
        try {
            sessionStorage.setItem('test-nav', 'test');
            const canStore = sessionStorage.getItem('test-nav') === 'test';
            sessionStorage.removeItem('test-nav');
            this.addResult('会话存储功能', canStore, canStore ? '会话存储正常' : '会话存储异常');
        } catch (error) {
            this.addResult('会话存储功能', false, '会话存储不可用: ' + error.message);
        }

        return this.results.filter(r => r.category === 'JavaScript功能');
    }

    // 验证可访问性
    validateAccessibility() {
        const nav = document.querySelector('.main-nav');
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        // 检查ARIA属性
        const hasTabList = nav && nav.getAttribute('role') === 'tablist';
        this.addResult('导航ARIA角色', hasTabList, hasTabList ? '导航有正确的tablist角色' : '导航缺少tablist角色');

        // 检查分页ARIA属性
        const tabsHaveRole = Array.from(tabs).every(tab => tab.getAttribute('role') === 'tab');
        this.addResult('分页ARIA角色', tabsHaveRole, tabsHaveRole ? '所有分页有正确的tab角色' : '分页缺少tab角色');

        // 检查内容ARIA属性
        const contentsHaveRole = Array.from(contents).every(content => content.getAttribute('role') === 'tabpanel');
        this.addResult('内容ARIA角色', contentsHaveRole, contentsHaveRole ? '所有内容有正确的tabpanel角色' : '内容缺少tabpanel角色');

        return this.results.filter(r => r.category === '可访问性');
    }

    // 添加测试结果
    addResult(name, passed, message, category = '通用') {
        this.results.push({
            name,
            passed,
            message,
            category,
            timestamp: new Date().toISOString()
        });
    }

    // 运行所有验证
    runAllValidations() {
        this.results = [];
        
        this.validateHTMLStructure();
        this.validateCSSStyles();
        this.validateJavaScriptFunctionality();
        this.validateAccessibility();

        return this.results;
    }

    // 生成报告
    generateReport() {
        const results = this.runAllValidations();
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        
        return {
            summary: {
                total,
                passed,
                failed: total - passed,
                percentage: Math.round((passed / total) * 100)
            },
            results,
            categories: this.groupByCategory(results)
        };
    }

    // 按类别分组结果
    groupByCategory(results) {
        return results.reduce((groups, result) => {
            const category = result.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(result);
            return groups;
        }, {});
    }
}

// 导出验证器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationValidator;
} else {
    window.NavigationValidator = NavigationValidator;
}