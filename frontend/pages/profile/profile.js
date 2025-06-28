const auth = require('../../utils/auth.js')
const config = require('../../utils/config.js')
const debug = require('../../utils/debug.js')
const api = require('../../utils/api.js')

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
        // 生产模式，通过API获取最新用户信息
        if (auth.checkLoginStatus()) {
          this.loadUserInfoFromAPI()
        } else {
          console.log('个人中心：用户未登录，跳转到登录页')
          this.setData({
            isLogin: false,
            userInfo: null
          })
          this.navigateToLogin()
        }
      }
  },

  // 从API加载用户信息
  async loadUserInfoFromAPI() {
    try {
      console.log('个人中心 - 从API获取用户信息')
      const userInfo = await api.getUserInfo()
      console.log('个人中心 - API返回用户信息:', userInfo)
      
      // 更新本地存储
      wx.setStorageSync('userInfo', userInfo)
      
      // 更新全局数据
      const app = getApp()
      if (app && app.globalData) {
        app.globalData.userInfo = userInfo
        app.globalData.isLoggedIn = true
      }
      
      // 更新页面状态
      this.setData({
        isLogin: true,
        userInfo: userInfo
      })
      
      this.checkUserStatus(userInfo)
      this.initMenuItems()
      
    } catch (error) {
      console.error('个人中心 - 获取用户信息失败:', error)
      
      // 如果是认证错误，显示登录提示
      if (error.message && error.message.includes('登录')) {
        this.showLoginRequired()
      } else {
        // 其他错误，使用本地缓存的用户信息
        const cachedUserInfo = auth.getCurrentUser()
        if (cachedUserInfo) {
          console.log('个人中心 - 使用缓存的用户信息:', cachedUserInfo)
          this.setData({
            isLogin: true,
            userInfo: cachedUserInfo
          })
          this.checkUserStatus(cachedUserInfo)
          this.initMenuItems()
        } else {
          console.log('个人中心：获取用户信息失败，跳转到登录页')
          this.setData({
            isLogin: false,
            userInfo: null
          })
          this.navigateToLogin()
        }
      }
    }
  },

  // 跳转到登录页面
  navigateToLogin() {
    const currentUrl = '/pages/profile/profile'
    const returnUrl = encodeURIComponent(currentUrl)
    wx.navigateTo({
      url: `/pages/login/login?returnUrl=${returnUrl}&returnType=tab`
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




})