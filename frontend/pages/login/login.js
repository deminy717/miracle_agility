const auth = require('../../utils/auth.js')
const config = require('../../utils/config.js')

Page({
  data: {
    returnUrl: '', // 登录成功后返回的页面
    returnType: '' // 返回类型：tab 或 navigate
  },

  onLoad(options) {
    // 获取返回页面信息
    if (options.returnUrl) {
      this.setData({
        returnUrl: decodeURIComponent(options.returnUrl),
        returnType: options.returnType || 'navigate'
      })
    }
  },

  // 微信一键登录
  onWechatLogin() {
    wx.showLoading({ title: '登录中...' })
    console.log('登录页面：开始微信一键登录')
    
    if (config.isMock()) {
      // Mock模式使用模拟登录
      this.mockLogin()
    } else {
      // 生产模式使用真实登录
      auth.wxLogin({ withUserInfo: true })
        .then((result) => {
          wx.hideLoading()
          console.log('登录页面：登录成功', result)
          
          if (result.isNewUser) {
            wx.showToast({
              title: '欢迎新用户！',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
          }
          
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            this.navigateBack()
          }, 1500)
        })
        .catch((error) => {
          wx.hideLoading()
          console.error('登录页面：登录失败', error)
          wx.showToast({
            title: error.message || '登录失败',
            icon: 'none'
          })
        })
    }
  },

  // 模拟登录成功（仅Mock模式使用）
  mockLogin() {
    setTimeout(() => {
      // 获取全局设置的用户信息
      const app = getApp()
      const mockUserInfo = app.globalData.userInfo || {
        nickname: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
        level: '中级训练师',
        role: 'user',
        isAdmin: false,
        isDeveloper: false
      }

      wx.setStorageSync('token', 'mock_token_123456')
      wx.setStorageSync('userInfo', mockUserInfo)
      
      // 更新全局数据
      if (app && app.globalData) {
        app.globalData.userInfo = mockUserInfo
        app.globalData.isLoggedIn = true
      }
      
      wx.hideLoading()
      wx.showToast({
        title: '模拟登录成功',
        icon: 'success'
      })
      
      console.log('登录页面：模拟登录成功，用户信息:', mockUserInfo)
      
      // 延迟跳转
      setTimeout(() => {
        this.navigateBack()
      }, 1500)
    }, 1000)
  },

  // 跳过登录
  onSkipLogin() {
    // 如果有指定返回页面，则跳转回去；否则跳转到主页
    if (this.data.returnUrl) {
      this.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/home/home'
      })
    }
  },

  // 返回原页面
  navigateBack() {
    const { returnUrl, returnType } = this.data
    
    if (returnUrl) {
      if (returnType === 'tab') {
        wx.switchTab({
          url: returnUrl
        })
      } else {
        wx.redirectTo({
          url: returnUrl
        })
      }
    } else {
      // 默认跳转到主页
      wx.switchTab({
        url: '/pages/home/home'
      })
    }
  }
}) 