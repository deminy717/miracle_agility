const auth = require('../../utils/auth.js')
const config = require('../../utils/config.js')
const debug = require('../../utils/debug.js')

Page({
  data: {
    isLogin: false, // 登录状态
    userInfo: null,
    stats: {
      totalCourses: 8,
      completedCourses: 5,
      totalStudyTime: 120,
      certificates: 3
    },
    achievements: [
      {
        id: 1,
        title: '初学者',
        description: '完成第一个课程',
        icon: '🌟',
        unlocked: true,
        date: '2024-01-15'
      },
      {
        id: 2,
        title: '坚持者',
        description: '连续学习7天',
        icon: '🔥',
        unlocked: true,
        date: '2024-01-20'
      },
      {
        id: 3,
        title: '专家',
        description: '完成10个课程',
        icon: '🏆',
        unlocked: false,
        date: null
      }
    ],
    menuItems: [],
    isAdmin: false,
    isDeveloper: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    console.log('个人中心 - 开始加载用户信息')
    
    if (config.isMock()) {
      // Mock模式使用原有逻辑
      const app = getApp()
      if (app.globalData.isLoggedIn && app.globalData.userInfo) {
        console.log('个人中心 - 从全局获取用户信息:', app.globalData.userInfo)
        this.setData({
          isLogin: true,
          userInfo: app.globalData.userInfo
        })
        this.checkUserStatus(app.globalData.userInfo)
        this.initMenuItems()
        return
      }
      
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      
      if (token && userInfo) {
        console.log('个人中心 - 用户已登录:', userInfo)
        this.setData({
          isLogin: true,
          userInfo: userInfo
        })
        this.checkUserStatus(userInfo)
        this.initMenuItems()
      } else {
        console.log('个人中心 - 用户未登录')
        this.setData({
          isLogin: false,
          userInfo: null
        })
      }
    } else {
      // 生产模式，检查认证状态
      if (auth.checkLoginStatus()) {
        const userInfo = auth.getCurrentUser()
        if (userInfo) {
          console.log('个人中心 - 获取到用户信息:', userInfo)
          this.setData({
            isLogin: true,
            userInfo: userInfo
          })
          this.checkUserStatus(userInfo)
          this.initMenuItems()
        } else {
          this.showLoginRequired()
        }
      } else {
        this.showLoginRequired()
      }
    }
  },

  // 显示需要登录的提示
  showLoginRequired() {
    this.setData({
      userInfo: null
    })
    
    wx.showModal({
      title: '需要登录',
      content: '请先登录后再查看个人信息',
      confirmText: '立即登录',
      cancelText: '暂不登录',
      success: (res) => {
        if (res.confirm) {
          this.performLogin()
        }
        // 取消时不跳转，留在当前页面
      }
    })
  },

  // 执行登录
  performLogin() {
    wx.showLoading({ title: '登录中...' })
    
    auth.wxLogin({ withUserInfo: true })
      .then((result) => {
        wx.hideLoading()
        console.log('登录成功:', result)
        
        // 立即更新登录状态
        this.setData({
          isLogin: true,
          userInfo: result.data.userInfo
        })
        
        // 检查用户状态和初始化菜单
        this.checkUserStatus(result.data.userInfo)
        this.initMenuItems()
        
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
        
        // 延迟重新加载用户信息（确保完整性）
        setTimeout(() => {
          this.loadUserInfo()
        }, 500)  // 减少延迟时间
      })
      .catch((error) => {
        wx.hideLoading()
        console.error('登录失败:', error)
        wx.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      })
  },

  // 检查用户状态（管理员或开发者）
  checkUserStatus(userInfo) {
    // 检查管理员状态
    const isAdmin = userInfo.role === 'admin' || userInfo.isAdmin || false
    // 检查开发者状态
    const isDeveloper = userInfo.role === 'developer' || userInfo.isDeveloper || false
    
    this.setData({ 
      isAdmin,
      isDeveloper
    })
    console.log('个人中心 - 用户状态:', { isAdmin, isDeveloper, userInfo })
  },

  // 初始化菜单项
  initMenuItems() {
    const baseMenuItems = [
      {
        id: 3,
        title: '我的收藏',
        icon: '♥',
        path: '/pages/favorite/favorite'
      },
      {
        id: 6,
        title: '设置',
        icon: '◐',
        path: '/pages/settings/settings'
      },
      {
        id: 8,
        title: '关于我们',
        icon: '○',
        path: '/pages/about/about'
      }
    ]

    // 根据用户类型添加特殊菜单项
    if (this.data.isDeveloper) {
      // 开发者用户：显示"开发模式"和"后台管理"
      baseMenuItems.unshift(
        {
          id: 1,
          title: '开发模式',
          icon: '◈',
          path: '/pages/developer-home/developer-home'
        },
        {
          id: 2,
          title: '后台管理',
          icon: '★',
          path: '/pages/admin-home/admin-home'
        }
      )
    } else if (this.data.isAdmin) {
      // 管理员用户：只显示"后台管理"
      baseMenuItems.unshift({
        id: 2,
        title: '后台管理',
        icon: '★',
        path: '/pages/admin-home/admin-home'
      })
    }

    this.setData({ menuItems: baseMenuItems })
  },

  // 编辑个人资料
  onEditProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 查看成就详情
  onAchievementClick(e) {
    const achievementId = e.currentTarget.dataset.id
    const achievement = this.data.achievements.find(item => item.id === achievementId)
    
    if (!achievement.unlocked) {
      wx.showToast({
        title: '成就未解锁',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: achievement.title,
      content: `${achievement.description}\n解锁时间：${achievement.date}`,
      showCancel: false
    })
  },

  // 跳转到文章列表
  goToArticleList() {
    wx.navigateTo({
      url: '/pages/article-list/article-list'
    });
  },

  // 点击菜单项
  onMenuClick(e) {
    const path = e.currentTarget.dataset.path
    
    if (path) {
      wx.navigateTo({
        url: path
      }).catch(() => {
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      })
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '退出中...' })
          
          // 检查是否是Mock模式
          if (config.isMock()) {
            // Mock模式使用原有逻辑
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            
            // 清除全局数据
            const app = getApp()
            if (app && app.globalData) {
              app.globalData.userInfo = null
              app.globalData.isLoggedIn = false
              app.globalData.isAdmin = false
              app.globalData.isDeveloper = false
            }
            
            // 更新页面状态
            this.setData({
              isLogin: false,
              userInfo: null,
              isAdmin: false,
              isDeveloper: false
            })
            
            wx.hideLoading()
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          } else {
            // 生产模式使用认证模块
            auth.logout()
              .then(() => {
                // 更新页面状态
                this.setData({
                  isLogin: false,
                  userInfo: null,
                  isAdmin: false,
                  isDeveloper: false
                })
                
                wx.hideLoading()
                wx.showToast({
                  title: '已退出登录',
                  icon: 'success'
                })
              })
              .catch((error) => {
                wx.hideLoading()
                console.error('退出登录失败:', error)
                
                // 即使退出请求失败，也清除本地数据
                this.setData({
                  isLogin: false,
                  userInfo: null,
                  isAdmin: false,
                  isDeveloper: false
                })
                
                wx.showToast({
                  title: '已退出登录',
                  icon: 'success'
                })
              })
          }
        }
      }
    })
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '犬敏捷俱乐部 - 专业的狗狗训练平台',
      path: '/pages/home/home'
    }
  },

  // 长按头像切换用户模式
  onAvatarLongPress() {
    // Mock模式和生产模式都支持用户类型切换和调试面板
    const currentUserInfo = this.data.userInfo
    const currentRole = currentUserInfo ? (currentUserInfo.role || 'user') : 'user'
    
    // 定义用户类型循环顺序
    const userTypes = ['user', 'admin', 'developer']
    const typeNames = {
      user: '普通用户',
      admin: '管理员',
      developer: '开发者'
    }
    
    // 构建选项列表
    const itemList = [
      ...userTypes.map(type => {
        const name = typeNames[type]
        return type === currentRole ? `${name} (当前)` : name
      }),
      '---',
      '调试面板'
    ]
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const tapIndex = res.tapIndex
        
        if (tapIndex < userTypes.length) {
          // 用户类型切换
          const selectedType = userTypes[tapIndex]
          if (selectedType && selectedType !== currentRole) {
            this.switchToUserType(selectedType)
          }
        } else if (tapIndex === itemList.length - 1) {
          // 显示调试面板
          const debug = require('../../utils/debug')
          debug.showDebugPanel()
        }
      }
    })
  },

  // 切换到指定用户类型
  switchToUserType(userType) {
    const typeNames = {
      user: '普通用户',
      admin: '管理员',
      developer: '开发者'
    }
    
    wx.showModal({
      title: '切换用户模式',
      content: `确定要切换到${typeNames[userType]}模式吗？`,
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          
          // 使用app的切换函数
          if (app.switchUserType && app.switchUserType(userType)) {
            // 重新加载用户信息
            setTimeout(() => {
              this.loadUserInfo()
              wx.showToast({
                title: `已切换为${typeNames[userType]}`,
                icon: 'success',
                duration: 2000
              })
            }, 500)
          } else {
            // 如果app方法不可用，直接修改
            this.forceUserTypeChange(userType)
          }
        }
      }
    })
  },

  // 强制切换用户类型
  forceUserTypeChange(userType) {
    const typeNames = {
      user: '普通用户',
      admin: '管理员',
      developer: '开发者'
    }
    
    // 创建新的用户信息
    const newUserInfo = {
      ...this.data.userInfo,
      role: userType,
      isAdmin: userType === 'admin',
      isDeveloper: userType === 'developer',
      nickname: typeNames[userType],
      level: typeNames[userType]
    }
    
    // 保存到本地存储和全局数据
    wx.setStorageSync('userInfo', newUserInfo)
    const app = getApp()
    app.globalData.userInfo = newUserInfo
    
    // 更新页面数据
    this.setData({ userInfo: newUserInfo })
    this.checkUserStatus(newUserInfo)
    this.initMenuItems()
    
    wx.showToast({
      title: `已切换为${typeNames[userType]}`,
      icon: 'success',
      duration: 2000
    })
    
    console.log('用户类型已切换:', newUserInfo)
  },

  // 微信一键登录（profile页面）
  onWechatLogin() {
    wx.showLoading({ title: '登录中...' })
    console.log('个人中心：开始微信一键登录')
    
    if (config.isMock()) {
      // Mock模式使用模拟登录
      this.mockLogin()
    } else {
      // 生产模式使用真实登录
      auth.wxLogin({ withUserInfo: true })
        .then((result) => {
          wx.hideLoading()
          console.log('个人中心：登录成功', result)
          
          // 立即更新登录状态
          this.setData({
            isLogin: true,
            userInfo: result.data.userInfo
          })
          
          // 检查用户状态和初始化菜单
          this.checkUserStatus(result.data.userInfo)
          this.initMenuItems()
          
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
          
          // 延迟重新加载用户信息（确保完整性）
          setTimeout(() => {
            this.loadUserInfo()
          }, 500)
        })
        .catch((error) => {
          wx.hideLoading()
          console.error('个人中心：登录失败', error)
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
      
      this.setData({
        isLogin: true,
        userInfo: mockUserInfo
      })
      
      // 检查用户状态和初始化菜单
      this.checkUserStatus(mockUserInfo)
      this.initMenuItems()
      
      wx.hideLoading()
      wx.showToast({
        title: '模拟登录成功',
        icon: 'success'
      })
      
      console.log('个人中心：模拟登录成功，用户信息:', mockUserInfo)
    }, 1000)
  },

  // 暂不登录，跳转到主页
  onSkipLogin() {
    wx.switchTab({
      url: '/pages/home/home'
    })
  }
})