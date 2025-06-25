Page({
  data: {
    currentEnv: 'development',
    currentUserType: 'developer', // 当前用户类型
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      totalArticles: 0,
      todayActiveUsers: 0
    },
    testResult: ''
  },

  onLoad(options) {
    const app = getApp()
    const config = app.getConfig()
    
    // 获取当前用户类型
    const userInfo = wx.getStorageSync('userInfo') || {}
    const currentUserType = userInfo.isDeveloper ? 'developer' : (userInfo.isAdmin ? 'admin' : 'user')
    
    this.setData({
      currentEnv: config.environment,
      currentUserType: currentUserType
    })
    
    // 加载统计数据
    this.loadStats()
  },

  // 加载统计数据
  loadStats() {
    const api = require('../../utils/api.js')
    
    // 这里可以调用统计API，暂时使用mock数据
    const mockStats = {
      totalUsers: 2588,
      totalCourses: 45,
      totalArticles: 128,
      todayActiveUsers: 342
    }
    
    this.setData({
      stats: mockStats
    })
  },

  // 切换环境
  toggleEnvironment() {
    const app = getApp()
    const currentEnv = this.data.currentEnv
    const newEnv = currentEnv === 'development' ? 'production' : 'development'
    
    wx.showModal({
      title: '切换环境',
      content: `确定要切换到${newEnv === 'development' ? '开发' : '生产'}环境吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = app.switchEnvironment(newEnv)
          if (success) {
            this.setData({
              currentEnv: newEnv,
              testResult: '' // 清空测试结果
            })
            
            wx.showToast({
              title: `已切换到${newEnv === 'development' ? '开发' : '生产'}环境`,
              icon: 'success'
            })
            
            // 重新加载数据
            this.loadStats()
          }
        }
      }
    })
  },

  // 切换用户类型
  toggleUserType() {
    const app = getApp()
    const userTypes = ['user', 'admin', 'developer']
    const currentIndex = userTypes.indexOf(this.data.currentUserType)
    const nextIndex = (currentIndex + 1) % userTypes.length
    const newUserType = userTypes[nextIndex]
    
    const typeNames = {
      user: '普通用户',
      admin: '管理员',
      developer: '开发者'
    }
    
    wx.showModal({
      title: '切换用户类型',
      content: `确定要切换到${typeNames[newUserType]}吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = app.switchUserType(newUserType)
          if (success) {
            this.setData({
              currentUserType: newUserType,
              testResult: '' // 清空测试结果
            })
            
            wx.showToast({
              title: `已切换到${typeNames[newUserType]}`,
              icon: 'success'
            })
            
            // 提示需要重新访问个人中心查看效果
            setTimeout(() => {
              wx.showModal({
                title: '提示',
                content: '用户类型已切换，请到个人中心查看界面变化',
                showCancel: false
              })
            }, 1500)
          }
        }
      }
    })
  },

  // 刷新数据
  refreshData() {
    wx.showLoading({
      title: '刷新中...'
    })
    
    setTimeout(() => {
      this.loadStats()
      wx.hideLoading()
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      })
    }, 1000)
  },

  // 测试用户API
  testUserAPI() {
    const api = require('../../utils/api.js')
    
    wx.showLoading({
      title: '测试中...'
    })
    
    api.getUserInfo()
      .then(result => {
        console.log('用户API测试成功:', result)
        this.setData({
          testResult: `用户API测试成功: ${JSON.stringify(result, null, 2)}`
        })
        wx.showToast({
          title: '测试成功',
          icon: 'success'
        })
      })
      .catch(error => {
        console.error('用户API测试失败:', error)
        this.setData({
          testResult: `用户API测试失败: ${error.message}`
        })
        wx.showToast({
          title: '测试失败',
          icon: 'error'
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  // 测试课程API
  testCourseAPI() {
    const api = require('../../utils/api.js')
    
    wx.showLoading({
      title: '测试中...'
    })
    
    api.getCourseList()
      .then(result => {
        console.log('课程API测试成功:', result)
        this.setData({
          testResult: `课程API测试成功: 获取到${result.length}个课程`
        })
        wx.showToast({
          title: '测试成功',
          icon: 'success'
        })
      })
      .catch(error => {
        console.error('课程API测试失败:', error)
        this.setData({
          testResult: `课程API测试失败: ${error.message}`
        })
        wx.showToast({
          title: '测试失败',
          icon: 'error'
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  // 测试资讯API
  testNewsAPI() {
    const api = require('../../utils/api.js')
    
    wx.showLoading({
      title: '测试中...'
    })
    
    api.getNewsList()
      .then(result => {
        console.log('资讯API测试成功:', result)
        this.setData({
          testResult: `资讯API测试成功: 获取到${result.list ? result.list.length : 0}条资讯`
        })
        wx.showToast({
          title: '测试成功',
          icon: 'success'
        })
      })
      .catch(error => {
        console.error('资讯API测试失败:', error)
        this.setData({
          testResult: `资讯API测试失败: ${error.message}`
        })
        wx.showToast({
          title: '测试失败',
          icon: 'error'
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  // 清空本地存储
  clearStorage() {
    wx.showModal({
      title: '清空存储',
      content: '确定要清空所有本地存储数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '存储已清空',
            icon: 'success'
          })
          
          // 重新初始化
          setTimeout(() => {
            const app = getApp()
            app.setMockLoginState()
            this.loadStats()
          }, 1000)
        }
      }
    })
  },

  // 查看控制台日志
  viewLogs() {
    const logs = wx.getStorageSync('logs') || []
    const logStr = logs.map(timestamp => {
      const date = new Date(timestamp)
      return date.toLocaleString()
    }).join('\n')
    
    wx.showModal({
      title: '应用启动日志',
      content: logStr || '暂无日志',
      showCancel: false
    })
  }
})