Page({
  data: {
    userInfo: {},
    isAdmin: false, // 是否为管理员
    isDeveloper: false, // 是否为开发者
    stats: {
      totalCourses: 3,
      completedCourses: 1,
      totalStudyTime: 145,
      certificates: 2,
      points: 680,
      level: '中级训练师'
    },
    achievements: [
      {
        id: 1,
        title: '初学者',
        description: '完成第一门课程',
        icon: '●',
        unlocked: true,
        date: '2024-02-15'
      },
      {
        id: 2,
        title: '进步神速',
        description: '连续7天学习',
        icon: '★',
        unlocked: true,
        date: '2024-02-22'
      },
      {
        id: 3,
        title: '训练高手',
        description: '获得专业认证',
        icon: '◎',
        unlocked: true,
        date: '2024-03-01'
      },
      {
        id: 4,
        title: '完美主义者',
        description: '所有课程100%完成',
        icon: '♦',
        unlocked: false,
        date: null
      }
    ],
    menuItems: []
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    // 首先尝试从全局获取用户信息
    const app = getApp()
    if (app.globalData.isLoggedIn && app.globalData.userInfo) {
      console.log('个人中心：从全局获取用户信息', app.globalData.userInfo)
      this.setData({ 
        userInfo: app.globalData.userInfo
      })
      this.checkUserStatus(app.globalData.userInfo)
      this.initMenuItems()
      return
    }
    
    // 如果全局没有，则从本地存储获取
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      console.log('个人中心：从本地存储获取用户信息', userInfo)
      this.setData({ userInfo })
      this.checkUserStatus(userInfo)
      this.initMenuItems()
    } else {
      console.log('个人中心：未找到用户信息，跳转到课程页')
      // 如果没有用户信息，跳转到登录页
      wx.switchTab({
        url: '/pages/course/course'
      })
    }
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
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          // 跳转到课程页面（会显示登录界面）
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/course/course'
            })
          }, 1000)
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
    const currentUserInfo = this.data.userInfo
    const currentRole = currentUserInfo.role || 'user'
    
    // 定义用户类型循环顺序
    const userTypes = ['user', 'admin', 'developer']
    const typeNames = {
      user: '普通用户',
      admin: '管理员',
      developer: '开发者'
    }
    
    // 构建选项列表
    const itemList = userTypes.map(type => {
      const name = typeNames[type]
      return type === currentRole ? `${name} (当前)` : name
    })
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedType = userTypes[res.tapIndex]
        if (selectedType && selectedType !== currentRole) {
          this.switchToUserType(selectedType)
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
  }
})