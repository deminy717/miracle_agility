const api = require('../../utils/api')
const auth = require('../../utils/auth')
const config = require('../../utils/config')

Page({
  data: {
    isLogin: false, // 登录状态
    userInfo: null,
    courseList: []
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    console.log('config isMock', config.isMock())
    if (config.isMock()) {
      // Mock模式使用原有逻辑
      const app = getApp()
      if (app.globalData.isLoggedIn && app.globalData.userInfo) {
        console.log('课程页面：从全局获取登录状态:', app.globalData.userInfo)
        this.setData({
          isLogin: true,
          userInfo: app.globalData.userInfo
        })
        this.loadCourseList()
        return
      }
      
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      
      console.log('课程页面：检查登录状态:', { token, userInfo })
      
      if (token && userInfo) {
        console.log('课程页面：用户已登录')
        this.setData({
          isLogin: true,
          userInfo: userInfo
        })
        this.loadCourseList()
      } else {
        console.log('课程页面：用户未登录')
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
          console.log('课程页面：获取到用户信息', userInfo)
          this.setData({
            isLogin: true,
            userInfo: userInfo
          })
          this.loadCourseList()
        } else {
          this.setData({
            isLogin: false,
            userInfo: null
          })
        }
      } else {
        this.setData({
          isLogin: false,
          userInfo: null
        })
      }
    }
  },

  // 微信一键登录
  onWechatLogin() {
    wx.showLoading({ title: '登录中...' })
    console.log('课程页面：开始微信一键登录')
    if (config.isMock()) {
      // Mock模式使用模拟登录
      this.mockLogin()
    } else {
      // 生产模式使用真实登录
      auth.wxLogin({ withUserInfo: true })
        .then((result) => {
          wx.hideLoading()
          console.log('课程页面：登录成功', result)
          
          // 立即更新登录状态
          this.setData({
            isLogin: true,
            userInfo: result.data.userInfo
          })
          
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
          
          // 立即加载课程列表
          this.loadCourseList()
          
          // 延迟重新检查登录状态（确保完整性）
          setTimeout(() => {
            this.checkLoginStatus()
          }, 500)
        })
        .catch((error) => {
          wx.hideLoading()
          console.error('课程页面：登录失败', error)
          wx.showToast({
            title: error.message || '登录失败',
            icon: 'none'
          })
        })
    }
  },

  // 模拟登录成功（仅开发模式使用）
  mockLogin() {
    setTimeout(() => {
      // 获取全局设置的用户信息
      const app = getApp()
      const mockUserInfo = app.globalData.userInfo || {
        nickname: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
        level: '中级训练师',
        trainedDogs: 3,
        monthlyProgress: 75
      }

      wx.setStorageSync('token', 'mock_token_123456')
      wx.setStorageSync('userInfo', mockUserInfo)
      
      this.setData({
        isLogin: true,
        userInfo: mockUserInfo
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '模拟登录成功',
        icon: 'success'
      })
      
      console.log('课程页面：模拟登录成功，用户信息:', mockUserInfo)
      this.loadCourseList()
    }, 1000)
  },

  // 加载课程列表
  async loadCourseList() {
    try {
      wx.showLoading({
        title: '加载中...'
      })
      
      console.log('开始加载课程列表')
      const courseData = await api.getCourseList()
      console.log('获取到课程数据:', courseData)
      
      // 只显示用户已注册的课程（有权限访问的课程）
      const enrolledCourses = courseData.filter(course => course.isEnrolled)
      
      // 转换数据格式以匹配页面显示
      const courseList = enrolledCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.cover,
        progress: course.progress,
        totalLessons: course.lessons,
        completedLessons: Math.floor(course.lessons * course.progress / 100),
        status: course.progress === 100 ? 'completed' : 'progress',
        level: course.difficulty
      }))
      
      this.setData({
        courseList: courseList
      })
      
      console.log('课程列表加载完成:', courseList)
      
    } catch (error) {
      console.error('加载课程列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 点击课程卡片
  onCourseClick(e) {
    const courseId = e.currentTarget.dataset.id
    
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '退出中...' })
          
          if (config.isMock()) {
            // Mock模式清除存储
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
              userInfo: null
            })
            
            wx.hideLoading()
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          } else {
            // 生产模式使用认证系统退出
            auth.logout()
              .then(() => {
                // 更新页面状态
                this.setData({
                  isLogin: false,
                  userInfo: null
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
                  userInfo: null
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
  }
}) 