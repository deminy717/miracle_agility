/**
 * 调试和环境切换工具
 * 用于开发阶段快速切换前端环境和测试功能
 */

const config = require('./config.js')
const auth = require('./auth.js')

/**
 * 切换环境到生产模式（使用真实API）
 */
function switchToProduction() {
  config.environment = 'production'
  console.log('🔄 已切换到生产环境')
  console.log('🌐 使用真实API模式')
  console.log('📡 API地址:', config.getCurrentConfig().baseUrl)
  
  // 清除Mock模式的模拟数据
  auth.clearLoginInfo()
  
  // 验证配置有效性
  const currentConfig = config.getCurrentConfig()
  if (!currentConfig || !currentConfig.baseUrl) {
    wx.showModal({
      title: '配置错误',
      content: '生产环境配置无效，请检查 utils/config.js 中的 baseUrl 设置',
      showCancel: false
    })
    return null
  }
  
  wx.showToast({
    title: '已切换到生产环境',
    icon: 'success',
    duration: 2000
  })
  
  return currentConfig
}

/**
 * 切换环境到Mock模式（使用Mock数据）
 */
function switchToMock() {
  config.environment = 'mock'
  console.log('🔄 已切换到Mock环境')
  console.log('📱 使用Mock数据模式')
  
  // 清除生产环境的登录信息
  auth.clearLoginInfo()
  
  wx.showToast({
    title: '已切换到Mock模式',
    icon: 'success',
    duration: 2000
  })
  
  return config.getCurrentConfig()
}

/**
 * 兼容旧方法名
 */
function switchToDevelopment() {
  return switchToMock()
}

/**
 * 获取当前环境状态
 */
function getCurrentEnvironment() {
  const currentConfig = config.getCurrentConfig()
  const status = {
    environment: config.environment,
    isMock: config.isMock(),
    isProduction: config.isProduction(),
    description: config.getEnvironmentDescription(),
    baseUrl: currentConfig.baseUrl || 'Mock数据模式',
    timeout: currentConfig.timeout,
    loginStatus: auth.checkLoginStatus(),
    userInfo: auth.getCurrentUser()
  }
  
  console.log('🔍 当前环境状态:', status)
  return status
}

/**
 * 测试后端连接
 */
function testBackendConnection() {
  if (config.isMock()) {
    wx.showModal({
      title: '提示',
      content: '当前是Mock模式，请先切换到生产环境',
      showCancel: false
    })
    return
  }
  
  wx.showLoading({ title: '测试连接中...' })
  
  // 测试用户信息接口（不需要认证的接口）
  wx.request({
    url: `${config.getCurrentConfig().baseUrl}/api/user/test`,
    method: 'GET',
    success: (res) => {
      wx.hideLoading()
      if (res.statusCode === 200) {
        wx.showToast({
          title: '后端连接正常',
          icon: 'success'
        })
        console.log('✅ 后端健康检查成功:', res.data)
      } else {
        wx.showToast({
          title: '后端响应异常',
          icon: 'error'
        })
        console.error('❌ 后端健康检查失败:', res)
      }
    },
    fail: (error) => {
      wx.hideLoading()
      wx.showToast({
        title: '无法连接后端',
        icon: 'error'
      })
      console.error('❌ 后端连接失败:', error)
    }
  })
}

/**
 * 显示调试面板
 */
function showDebugPanel() {
  const currentEnv = getCurrentEnvironment()
  const envStatus = config.isMock() ? 'Mock模式 (本地数据)' : '生产环境 (真实API)'
  const loginStatus = currentEnv.loginStatus ? '已登录' : '未登录'
  const userName = currentEnv.userInfo ? currentEnv.userInfo.nickname : '无'
  
  const content = `环境: ${envStatus}
API: ${currentEnv.baseUrl}
登录: ${loginStatus}
用户: ${userName}`

  wx.showActionSheet({
    itemList: [
      config.isMock() ? '切换到生产环境' : '切换到Mock模式',
      '测试后端连接',
      '快速登录测试',
      '查看详细信息'
    ],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          // 切换环境
          if (config.isMock()) {
            switchToProduction()
          } else {
            switchToMock()
          }
          break
        case 1:
          // 测试连接
          testBackendConnection()
          break
        case 2:
          // 快速登录测试
          quickLoginTest()
          break
        case 3:
          // 查看详细信息
          wx.showModal({
            title: '调试信息',
            content: content,
            showCancel: false
          })
          break
      }
    }
  })
}

/**
 * 快速登录测试
 */
function quickLoginTest() {
  if (config.isMock()) {
    wx.showModal({
      title: '提示',
      content: '请先切换到生产环境进行登录测试',
      showCancel: false
    })
    return
  }
  
  wx.showLoading({ title: '测试登录中...' })
  
  auth.wxLogin({ withUserInfo: true })
    .then((result) => {
      wx.hideLoading()
      console.log('✅ 登录测试成功:', result)
      wx.showToast({
        title: '登录测试成功',
        icon: 'success'
      })
    })
    .catch((error) => {
      wx.hideLoading()
      console.error('❌ 登录测试失败:', error)
      wx.showToast({
        title: '登录测试失败',
        icon: 'error'
      })
    })
}

/**
 * 控制台输出调试信息
 */
function logDebugInfo() {
  console.log('='.repeat(50))
  console.log('🛠️  Miracle Agility 调试信息')
  console.log('='.repeat(50))
  
  const envStatus = getCurrentEnvironment()
  console.table(envStatus)
  
  // 输出具体的配置信息
  console.log('\n🔧 详细配置信息:')
  console.log('- 当前环境:', config.environment)
  console.log('- isMock():', config.isMock())
  console.log('- isProduction():', config.isProduction())
  console.log('- getCurrentConfig():', config.getCurrentConfig())
  
  console.log('\n📋 可用的调试命令:')
  console.log('- switchToProduction() : 切换到生产环境')
  console.log('- switchToMock() : 切换到Mock模式') 
  console.log('- testBackendConnection() : 测试后端连接')
  console.log('- quickLoginTest() : 快速登录测试')
  console.log('- showDebugPanel() : 显示调试面板')
  console.log('- getCurrentEnvironment() : 获取环境状态')
  
  console.log('='.repeat(50))
}

// 在全局暴露调试函数（仅开发环境）
if (typeof global !== 'undefined') {
  global.switchToProduction = switchToProduction
  global.switchToMock = switchToMock
  global.switchToDevelopment = switchToDevelopment // 兼容旧方法名
  global.testBackendConnection = testBackendConnection
  global.quickLoginTest = quickLoginTest
  global.showDebugPanel = showDebugPanel
  global.getCurrentEnvironment = getCurrentEnvironment
  global.logDebugInfo = logDebugInfo
}

module.exports = {
  switchToProduction,
  switchToMock,
  switchToDevelopment, // 兼容旧方法名
  getCurrentEnvironment,
  testBackendConnection,
  quickLoginTest,
  showDebugPanel,
  logDebugInfo
} 