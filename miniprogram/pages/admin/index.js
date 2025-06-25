const request = require('../../api/request')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isAdminLoggedIn: false,
    loginLoading: false,
    loginForm: {
      username: '',
      password: ''
    },
    adminInfo: null,
    statistics: {
      totalArticles: 0,
      totalVideos: 0,
      totalCourses: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否已经有管理员token
    this.checkAdminAuth()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isAdminLoggedIn) {
      this.loadStatistics()
    }
  },

  /**
   * 检查管理员认证状态
   */
  async checkAdminAuth() {
    const adminToken = wx.getStorageSync('adminToken')
    if (!adminToken) {
      return
    }

    try {
      const result = await request.get('/admin/current', {}, {
        'Admin-Token': adminToken
      })
      
      this.setData({
        isAdminLoggedIn: true,
        adminInfo: result
      })
      
      await this.loadStatistics()
    } catch (error) {
      console.error('管理员认证检查失败:', error)
      wx.removeStorageSync('adminToken')
    }
  },

  /**
   * 用户名输入
   */
  onUsernameInput(e) {
    this.setData({
      'loginForm.username': e.detail.value
    })
  },

  /**
   * 密码输入
   */
  onPasswordInput(e) {
    this.setData({
      'loginForm.password': e.detail.value
    })
  },

  /**
   * 管理员登录
   */
  async adminLogin() {
    const { username, password } = this.data.loginForm
    
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
      return
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    this.setData({ loginLoading: true })

    try {
      const result = await request.post('/admin/login', {
        username: username.trim(),
        password: password.trim()
      })

      // 保存管理员token
      wx.setStorageSync('adminToken', result.token)
      
      this.setData({
        isAdminLoggedIn: true,
        adminInfo: result.admin,
        loginLoading: false,
        loginForm: { username: '', password: '' }
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      await this.loadStatistics()

    } catch (error) {
      console.error('管理员登录失败:', error)
      this.setData({ loginLoading: false })
      
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 管理员退出登录
   */
  async adminLogout() {
    const result = await wx.showModal({
      title: '确认退出',
      content: '确定要退出管理后台吗？'
    })

    if (!result.confirm) {
      return
    }

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (adminToken) {
        await request.post('/admin/logout', {}, {
          'Admin-Token': adminToken
        })
      }
    } catch (error) {
      console.error('退出登录失败:', error)
    }

    // 清除本地存储
    wx.removeStorageSync('adminToken')
    
    this.setData({
      isAdminLoggedIn: false,
      adminInfo: null,
      statistics: {
        totalArticles: 0,
        totalVideos: 0,
        totalCourses: 0
      }
    })

    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    try {
      const adminToken = wx.getStorageSync('adminToken')
      const result = await request.get('/admin/content/statistics', {}, {
        'Admin-Token': adminToken
      })
      
      this.setData({
        statistics: result
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  /**
   * 导航到文章管理
   */
  navigateToArticleManage() {
    wx.navigateTo({
      url: '/pages/admin/article/list'
    })
  },

  /**
   * 导航到视频管理
   */
  navigateToVideoManage() {
    wx.navigateTo({
      url: '/pages/admin/video/list'
    })
  },

  /**
   * 导航到课程管理
   */
  navigateToCourseManage() {
    wx.navigateTo({
      url: '/pages/admin/course/list'
    })
  },

  /**
   * 导航到文件上传
   */
  navigateToFileUpload() {
    wx.navigateTo({
      url: '/pages/admin/upload/index'
    })
  },

  /**
   * 创建文章
   */
  createArticle() {
    wx.navigateTo({
      url: '/pages/admin/article/create'
    })
  },

  /**
   * 创建视频
   */
  createVideo() {
    wx.navigateTo({
      url: '/pages/admin/video/create'
    })
  },

  /**
   * 创建课程
   */
  createCourse() {
    wx.navigateTo({
      url: '/pages/admin/course/create'
    })
  }
}) 