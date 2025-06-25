// app.js
const config = require('./utils/config.js')

App({
  onLaunch() {
    // 显示当前环境信息
    console.log('='.repeat(50))
    console.log(`🚀 应用启动 - 当前环境: ${config.environment.toUpperCase()}`)
    console.log(`📱 ${config.isDevelopment() ? 'Mock数据模式' : 'API请求模式'}`)
    console.log(`🌐 API地址: ${config.getCurrentConfig().baseUrl || 'Mock数据'}`)
    console.log('='.repeat(50))

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化登录状态（根据环境使用不同策略）
    if (config.isDevelopment()) {
      this.setMockLoginState()
    } else {
      this.checkLogin()
    }
    
    // 获取用户信息
    this.getUserProfile()
  },

  // 设置模拟登录状态（仅用于开发预览）
  setMockLoginState() {
    // 清理旧数据，确保干净状态
    wx.clearStorageSync()
    
    // 设置模拟token
    wx.setStorageSync('token', 'mock_token_for_development')
    
    // 强制设置为开发者用户
    const devUserInfo = {
      id: 1,
      nickname: '开发者',
      avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
      level: '开发者',
      trainedDogs: 3,
      monthlyProgress: 75,
      gender: 1,
      province: '广东',
      city: '深圳',
      role: 'developer',
      isAdmin: false,
      isDeveloper: true,
      phone: '138****8888',
      joinDate: '2024-01-15'
    }
    
    // 保存到本地存储和全局数据
    wx.setStorageSync('userInfo', devUserInfo)
    this.globalData.userInfo = devUserInfo
    this.globalData.isLoggedIn = true
    
    console.log('✅ 开发者模式已强制激活:', devUserInfo)
    
    // 确保数据同步
    setTimeout(() => {
      console.log('验证存储数据:', wx.getStorageSync('userInfo'))
    }, 100)
  },

  // 设置模拟用户类型
  setMockUserType(userType = 'developer') {
    const mockDataModule = require('./utils/mockData.js')
    let mockUserInfo
    
    switch(userType) {
      case 'admin':
        mockUserInfo = mockDataModule.getMockData('/user/info').adminUser || {
          nickname: '管理员',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
          level: '管理员',
          trainedDogs: 3,
          monthlyProgress: 75,
          gender: 1,
          province: '广东',
          city: '深圳',
          role: 'admin',
          isAdmin: true,
          isDeveloper: false
        }
        break
      case 'developer':
        mockUserInfo = mockDataModule.getMockData('/user/info') || {
          nickname: '开发者',
          avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
          level: '开发者',
          trainedDogs: 3,
          monthlyProgress: 75,
          gender: 1,
          province: '广东',
          city: '深圳',
          role: 'developer',
          isAdmin: false,
          isDeveloper: true
        }
        break
      case 'user':
      default:
        mockUserInfo = mockDataModule.getMockData('/user/info').normalUser || {
          nickname: '普通用户',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          level: '中级训练师',
          trainedDogs: 3,
          monthlyProgress: 75,
          gender: 1,
          province: '广东',
          city: '深圳',
          role: 'user',
          isAdmin: false,
          isDeveloper: false
        }
        break
    }
    
    wx.setStorageSync('userInfo', mockUserInfo)
    this.globalData.userInfo = mockUserInfo
    this.globalData.isLoggedIn = true
    
    console.log(`已设置模拟用户类型: ${userType}`, mockUserInfo)
    return mockUserInfo
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token是否有效
      // TODO: 调用API验证token
      console.log('用户已登录')
      this.globalData.isLoggedIn = true
    } else {
      console.log('用户未登录')
      this.globalData.isLoggedIn = false
    }
  },

  // 获取用户信息
  getUserProfile() {
    // 判断是否已经授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              console.log('用户信息：', res.userInfo)
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    version: '1.0.0',
    latestArticles: null,
    config: config, // 将配置对象添加到全局数据中
    editorContent: null, // 富文本编辑器内容
    editorContext: null // 编辑器来源上下文
  },

  // 获取当前环境配置
  getConfig() {
    return config
  },

  // 切换环境（开发时使用）
  switchEnvironment(env) {
    if (env !== 'development' && env !== 'production') {
      console.error('❌ 无效的环境参数，只支持 development 或 production')
      return false
    }
    
    config.environment = env
    console.log(`🔄 环境已切换到: ${env.toUpperCase()}`)
    
    // 显示新的环境信息
    console.log('='.repeat(50))
    console.log(`🚀 环境切换 - 当前环境: ${config.environment.toUpperCase()}`)
    console.log(`📱 ${config.isDevelopment() ? 'Mock数据模式' : 'API请求模式'}`)
    console.log(`🌐 API地址: ${config.getCurrentConfig().baseUrl || 'Mock数据'}`)
    console.log('='.repeat(50))
    
    return true
  },

  // 切换用户类型（开发时使用）
  switchUserType(userType = 'user') {
    if (!['admin', 'developer', 'user'].includes(userType)) {
      console.error('❌ 无效的用户类型，只支持 admin、developer 或 user')
      return false
    }
    
    if (config.isDevelopment()) {
      this.setMockUserType(userType)
      const typeNames = {
        admin: '管理员',
        developer: '开发者',
        user: '普通用户'
      }
      console.log(`👤 用户类型已切换到: ${typeNames[userType]}`)
      return true
    } else {
      console.warn('⚠️ 用户类型切换只在开发环境中可用')
      return false
    }
  },

  // 强制切换为开发者模式
  forceDeveloperMode() {
    // 清理所有数据
    wx.clearStorageSync()
    
    // 创建开发者用户信息
    const devUserInfo = {
      id: 1,
      nickname: '开发者',
      avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
      level: '开发者',
      trainedDogs: 3,
      monthlyProgress: 75,
      gender: 1,
      province: '广东',
      city: '深圳',
      role: 'developer',
      isAdmin: false,
      isDeveloper: true,
      phone: '138****8888',
      joinDate: '2024-01-15'
    }
    
    // 保存数据
    wx.setStorageSync('token', 'mock_token_for_development')
    wx.setStorageSync('userInfo', devUserInfo)
    this.globalData.userInfo = devUserInfo
    this.globalData.isLoggedIn = true
    
    console.log('🔧 已强制切换为开发者模式:', devUserInfo)
    
    // 提示用户刷新页面
    wx.showToast({
      title: '已切换为开发者模式',
      icon: 'success',
      duration: 2000
    })
    
    return devUserInfo
  }
})
