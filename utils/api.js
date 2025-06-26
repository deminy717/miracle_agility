// 网络请求工具
const config = require('./config.js')
const mockData = require('./mockData.js')
const auth = require('./auth.js')

/**
 * 统一的API请求处理函数
 * @param {string} url 请求地址
 * @param {object} data 请求参数
 * @param {string} method 请求方法，默认POST
 * @param {boolean} needAuth 是否需要登录验证
 */
function request(url, data = {}, method = 'POST', needAuth = true) {
  return new Promise((resolve, reject) => {
    // Mock模式使用mock数据
    if (config.isMock()) {
      console.log(`[MOCK] ${method} ${url}`, data)
      const mockResponse = mockData.getMockData(url, data, method)
      
      // 模拟网络延迟
      setTimeout(() => {
        if (mockResponse !== null && mockResponse !== undefined) {
          console.log(`[MOCK] 响应:`, mockResponse)
          resolve(mockResponse)
        } else {
          console.error(`[MOCK] 未找到数据: ${url}`)
          console.log('[MOCK] 可用的课程路径:', Object.keys(mockData.course))
          reject(new Error(`Mock data not found for ${url}`))
        }
      }, 300)
      return
    }
    
    // 生产环境使用真实API
    const baseUrl = config.getCurrentConfig().baseUrl
    const apiUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    
    console.log(`[API] 请求URL: ${apiUrl}`)
    
    // 设置请求头
    const header = {
      'content-type': 'application/json'
    }
    
    // 如果需要认证，添加JWT token到请求头
    if (needAuth) {
      const accessToken = auth.getAccessToken()
      if (accessToken) {
        header['Authorization'] = `Bearer ${accessToken}`
      } else {
        reject(new Error('未登录或登录已过期'))
        return
      }
    }
    
    wx.request({
      url: apiUrl,
      data: data,
      method: method,
      header: header,
      timeout: config.getCurrentConfig().timeout,
      success: (res) => {
        console.log(`[API] ${method} ${apiUrl} 响应:`, res)
        
        // 处理HTTP状态码
        if (res.statusCode !== 200) {
          if (res.statusCode === 401) {
            // token过期，尝试刷新
            auth.refreshAccessToken().then(() => {
              // 刷新成功，重新请求
              request(url, data, method, needAuth).then(resolve).catch(reject)
            }).catch(() => {
              // 刷新失败，跳转登录
              auth.logout()
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              })
              reject(new Error('登录已过期'))
            })
            return
          } else {
            console.error(`[API] HTTP错误 ${res.statusCode}:`, res.data)
            const error = new Error(`HTTP ${res.statusCode}`)
            error.statusCode = res.statusCode
            error.data = res.data
            reject(error)
            return
          }
        }
        
        // 处理响应数据 - 适配后端的响应格式 {code: 200, message: "", data: {}}
        const { code, message, data: responseData } = res.data
        
        if (code === 200) {
          // 请求成功
          resolve(responseData)
        } else if (code === 401) {
          // token过期，尝试刷新
          auth.refreshAccessToken().then(() => {
            // 刷新成功，重新请求
            request(url, data, method, needAuth).then(resolve).catch(reject)
          }).catch(() => {
            // 刷新失败，跳转登录
            auth.logout()
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            })
            reject(new Error('登录已过期'))
          })
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
          title: '网络连接失败，请检查网络设置',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 导出API接口
module.exports = {
  // 用户相关
  login: (code) => request('/api/user/login', { code }, 'POST', false),
  wxLogin: (loginData) => request('/api/user/wx-login', loginData, 'POST', false),
  refreshToken: (refreshToken) => request('/api/user/refresh-token', { refreshToken }, 'POST', false),
  getUserInfo: () => request('/api/user/info', {}, 'GET'),
  updateUserInfo: (userInfo) => request('/api/user/update', userInfo, 'PUT'),
  logout: () => request('/api/user/logout', {}, 'POST'),
  
  // 课程相关
  getCourseList: () => request('/api/course/list', {}, 'GET'),
  getCourseDetail: (courseId) => request('/api/course/detail', { courseId }, 'GET'),
  getLessonContent: (lessonId) => request('/api/lesson/content', { lessonId }, 'GET'),
  updateProgress: (lessonId, progress) => request('/api/lesson/progress', { lessonId, progress }, 'POST'),
  
  // 资讯相关
  getNewsList: (page = 1, limit = 10) => request('/api/news/list', { page, limit }, 'GET'),
  getNewsDetail: (newsId) => request('/api/news/detail', { newsId }, 'GET'),
  likeNews: (newsId) => request('/api/news/like', { newsId }, 'POST'),
  
  // 成就相关
  getAchievements: () => request('/api/achievement/list', {}, 'GET'),
  unlockAchievement: (achievementId) => request('/api/achievement/unlock', { achievementId }, 'POST'),
  
  // 统计相关
  getStudyStats: () => request('/api/stats/study', {}, 'GET'),
  
  // 通用请求方法
  request
} 