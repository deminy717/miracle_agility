// 全局配置文件
const config = {
  // 环境配置
  // 'mock' - 模拟数据模式，使用本地mock数据
  // 'production' - 生产模式，使用真实API
  environment: 'production', // 当前环境
  
  // API基础URL配置
  apiConfig: {
    mock: {
      baseUrl: '', // Mock模式不需要baseUrl，使用本地数据
      timeout: 5000,
      description: 'Mock数据模式'
    },
    production: {
      baseUrl: 'http://localhost:8080', // 生产环境API地址
      timeout: 10000,
      description: '生产环境API'
    }
  },
  
  // 获取当前环境配置
  getCurrentConfig() {
    return this.apiConfig[this.environment]
  },
  
  // 判断是否为Mock模式
  isMock() {
    return this.environment === 'mock'
  },
  
  // 判断是否为生产模式
  isProduction() {
    return this.environment === 'production'
  },
  
  // 兼容旧方法名
  isDevelopment() {
    return this.isMock()
  },
  
  // 获取完整的API URL
  getApiUrl(endpoint) {
    if (this.isMock()) {
      return null // Mock模式返回null，表示使用mock数据
    }
    const baseUrl = this.getCurrentConfig().baseUrl
    return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  },
  
  // 获取环境描述
  getEnvironmentDescription() {
    const currentConfig = this.getCurrentConfig()
    return currentConfig ? currentConfig.description : '未知环境'
  }
}

module.exports = config