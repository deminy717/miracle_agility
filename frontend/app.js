// app.js
const config = require('./utils/config.js')
const auth = require('./utils/auth.js')
const debug = require('./utils/debug.js')

App({
  onLaunch() {
    console.log('🚀 Miracle Agility 小程序启动')
    console.log(`📱 ${config.isMock() ? 'Mock数据模式' : 'API请求模式'}`)
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 初始化全局数据
    this.initGlobalData()
    
    // 检查是否是Mock模式
    if (config.isMock()) {
      // Mock模式：初始化模拟数据
      this.initMockData()
    } else {
      // 生产模式：检查登录状态
      this.checkAuthStatus()
    }
  },

  // 设置模拟登录状态（仅用于开发预览）
  setMockLoginState() {
    // 只有在真正的开发模式下才设置mock数据
    if (!config.isDevelopment()) {
      console.log('🚫 非开发模式，跳过Mock登录状态设置')
      return
    }
    
    console.log('🔧 开发模式：设置Mock登录状态')
    
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
    editorContext: null, // 编辑器来源上下文
    systemInfo: null,
    isAdmin: false,
    isDeveloper: false
  },

  // 获取当前环境配置
  getConfig() {
    return config
  },

  // 切换环境（开发时使用）
  switchEnvironment(env) {
    if (env !== 'mock' && env !== 'production') {
      console.error('❌ 无效的环境参数，只支持 mock 或 production')
      return false
    }
    
    config.environment = env
    console.log(`🔄 环境已切换到: ${env.toUpperCase()}`)
    
    // 显示新的环境信息
    console.log('='.repeat(50))
    console.log(`🚀 环境切换 - 当前环境: ${config.environment.toUpperCase()}`)
    console.log(`📱 ${config.isMock() ? 'Mock数据模式' : 'API请求模式'}`)
    console.log(`🌐 API地址: ${config.getCurrentConfig().baseUrl || 'Mock数据'}`)
    console.log('='.repeat(50))
    
    return true
  },

  // 切换用户类型（已禁用，用户类型由后端决定）
  switchUserType(userType = 'user') {
    console.warn('⚠️ 用户类型切换功能已禁用，用户权限由后端 isAdmin 字段决定')
    return false
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
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.globalData.systemInfo = systemInfo
      console.log('系统信息获取成功:', systemInfo)
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  },

  // 初始化全局数据
  initGlobalData() {
    this.globalData.isLoggedIn = false
    this.globalData.userInfo = null
    this.globalData.isAdmin = false
    this.globalData.isDeveloper = false
    this.globalData.latestArticles = []
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  // 初始化Mock数据
  initMockData() {
    console.log('🎭 初始化Mock数据模式')
    this.setMockLoginState()
    this.getUserProfile()
    debug.logDebugInfo()
  },

  // 检查认证状态（生产模式）
  checkAuthStatus() {
    console.log('🔐 检查认证状态')
    auth.autoLoginCheck().then((result) => {
      console.log('自动登录检查结果:', result)
      if (result.success) {
        this.globalData.isLoggedIn = true
        const userInfo = auth.getCurrentUser()
        if (userInfo) {
          this.globalData.userInfo = userInfo
          this.globalData.isAdmin = userInfo.isAdmin || false
          this.globalData.isDeveloper = userInfo.isDeveloper || false
        }
      }
    }).catch((error) => {
      console.error('自动登录检查失败:', error)
      // 清除可能存在的无效登录状态
      this.globalData.isLoggedIn = false
      this.globalData.userInfo = null
    })
  }
})
