// 全局配置文件
const config = {
  // 环境配置 - 设置为前端开发模式
  // 'development' - 前端开发环境，使用mock数据
  // 'production' - 后端调试环境，使用真实API
  environment: 'development', // 当前设置为前端开发模式
  
  // API基础URL配置
  apiConfig: {
    development: {
      baseUrl: '', // 开发环境不需要baseUrl，使用mock数据
      timeout: 5000
    },
    production: {
      baseUrl: 'https://your-api-domain.com/api', // 替换为你的后端API地址
      timeout: 10000
    }
  },
  
  // 获取当前环境配置
  getCurrentConfig() {
    return this.apiConfig[this.environment]
  },
  
  // 判断是否为开发环境
  isDevelopment() {
    return this.environment === 'development'
  },
  
  // 判断是否为生产环境
  isProduction() {
    return this.environment === 'production'
  },
  
  // 获取完整的API URL
  getApiUrl(endpoint) {
    if (this.isDevelopment()) {
      return null // 开发环境返回null，表示使用mock数据
    }
    const baseUrl = this.getCurrentConfig().baseUrl
    return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  }
}

module.exports = config