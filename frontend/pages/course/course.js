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
        console.log('课程页面：用户未登录，跳转到登录页')
        this.setData({
          isLogin: false,
          userInfo: null
        })
        this.navigateToLogin()
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
        console.log('课程页面：用户未登录（生产模式），跳转到登录页')
        this.setData({
          isLogin: false,
          userInfo: null
        })
        this.navigateToLogin()
      }
    }
  },



  // 加载课程列表
  async loadCourseList() {
    try {
      wx.showLoading({
        title: '加载中...'
      })
      
      console.log('开始加载我的课程列表')
      const courseData = await api.getMyCourses()
      console.log('获取到我的课程数据:', courseData)
      
      // 显示用户注册的课程，转换数据格式以匹配页面显示
      const courseList = courseData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || course.desc,
        image: course.cover || course.coverImage,
        progress: course.progress || 0,
        totalLessons: course.chapterCount || course.lessons || 0,
        completedLessons: Math.floor((course.chapterCount || course.lessons || 0) * (course.progress || 0) / 100),
        status: course.progress === 100 ? 'completed' : 'learning',
        level: course.level || course.difficulty || 'L1'
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

  // 显示兑换授权码模态框
  showRedeemModal() {
    wx.showModal({
      title: '兑换授权码',
      placeholderText: '请输入8位授权码',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const code = res.content.trim().toUpperCase()
          if (code.length === 8) {
            this.redeemAccessCode(code)
          } else {
            wx.showToast({
              title: '请输入8位授权码',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 兑换授权码
  async redeemAccessCode(code) {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '兑换中...' })

    try {
      // api.request() 成功时直接返回响应数据，不是完整的响应对象
      const result = await api.request('/api/courses/access-codes/redeem', {
        code: code
      }, 'POST')

      // 如果到达这里，说明请求成功了
        wx.hideLoading()
        
        wx.showModal({
          title: '兑换成功！',
          content: `恭喜您成功兑换课程！\n\n是否立即查看课程？`,
          confirmText: '立即查看',
          cancelText: '稍后查看',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: `/pages/course-detail/course-detail?id=${result.courseId}`
              })
            } else {
              // 刷新课程列表以显示新课程
              this.loadCourseList()
            }
          }
        })
    } catch (error) {
      wx.hideLoading()
      console.error('兑换授权码失败:', error)
      
      let errorMessage = '兑换失败'
      if (error.message) {
        if (error.message.includes('授权码不存在')) {
          errorMessage = '授权码不存在，请检查后重试'
        } else if (error.message.includes('已使用')) {
          errorMessage = '授权码已被使用'
        } else if (error.message.includes('已过期')) {
          errorMessage = '授权码已过期'
        } else if (error.message.includes('已注册')) {
          errorMessage = '您已经注册了该课程'
        } else {
          errorMessage = error.message
        }
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
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
  },

  // 跳转到登录页面
  navigateToLogin() {
    const currentUrl = '/pages/course/course'
    const returnUrl = encodeURIComponent(currentUrl)
    wx.navigateTo({
      url: `/pages/login/login?returnUrl=${returnUrl}&returnType=tab`
    })
  }
}) 