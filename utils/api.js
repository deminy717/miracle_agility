// 网络请求工具
const config = require('./config.js')
const mockData = require('./mockData.js')

/**
 * 统一的API请求处理函数
 * @param {string} url 请求地址
 * @param {object} data 请求参数
 * @param {string} method 请求方法，默认POST
 * @param {boolean} needAuth 是否需要登录验证
 */
function request(url, data = {}, method = 'POST', needAuth = true) {
  return new Promise((resolve, reject) => {
    // 开发环境使用mock数据
    if (config.isDevelopment()) {
      console.log(`[MOCK] ${method} ${url}`, data)
      const mockResponse = mockData.getMockData(url, data, method)
      
      // 模拟网络延迟
      setTimeout(() => {
        if (mockResponse) {
          resolve(mockResponse)
        } else {
          reject(new Error(`Mock data not found for ${url}`))
        }
      }, 300)
      return
    }
    
    // 生产环境使用真实API
    const apiUrl = config.getApiUrl(url)
    const token = wx.getStorageSync('token')
    
    // 设置请求头
    const header = {
      'content-type': 'application/json'
    }
    
    // 如果需要验证且有token，添加到请求头
    if (needAuth && token) {
      header.auth = token
    }
    
    wx.request({
      url: apiUrl,
      data: data,
      method: method,
      header: header,
      timeout: config.getCurrentConfig().timeout,
      success: (res) => {
        console.log(`[API] ${method} ${apiUrl}`, res.data)
        const { error, body, message } = res.data
        
        if (error === 0) {
          // 请求成功
          resolve(body)
        } else if (error === 401) {
          // 需要登录
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          // 跳转到登录页
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/course/course'
            })
          }, 1500)
          reject(new Error('需要登录'))
        } else if (error === 500) {
          // 系统异常
          wx.showToast({
            title: '系统异常，请稍后重试',
            icon: 'error'
          })
          reject(new Error('系统异常'))
        } else {
          // 业务异常
          wx.showToast({
            title: message || '请求失败',
            icon: 'none'
          })
          reject(new Error(message || '请求失败'))
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err)
        wx.showToast({
          title: '网络连接失败',
          icon: 'error'
        })
        reject(err)
      }
    })
  })
}

// 导出API接口
module.exports = {
  // 用户相关
  login: (code) => request('/user/login', { code }, 'POST', false),
  getUserInfo: () => request('/user/info'),
  updateUserInfo: (userInfo) => request('/user/update', userInfo),
  
  // 课程相关
  getCourseList: () => request('/course/list'),
  getCourseDetail: (courseId) => request('/course/detail', { courseId }),
  getLessonContent: (lessonId) => request('/lesson/content', { lessonId }),
  updateProgress: (lessonId, progress) => request('/lesson/progress', { lessonId, progress }),
  
  // 资讯相关
  getNewsList: (page = 1, limit = 10) => request('/news/list', { page, limit }),
  getNewsDetail: (newsId) => request('/news/detail', { newsId }),
  likeNews: (newsId) => request('/news/like', { newsId }),
  
  // 成就相关
  getAchievements: () => request('/achievement/list'),
  unlockAchievement: (achievementId) => request('/achievement/unlock', { achievementId }),
  
  // 统计相关
  getStudyStats: () => request('/stats/study'),
  
  // 通用请求方法
  request
} 