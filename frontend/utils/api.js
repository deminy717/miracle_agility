// 网络请求工具
const config = require('./config.js')
const mockData = require('./mockData.js')
const auth = require('./auth.js')
const errorHandler = require('./errorHandler.js')

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
        
        // 处理HTTP状态码错误
        if (res.statusCode !== 200) {
          const error = errorHandler.handleHttpError(
            res.statusCode,
            res.data?.message || `HTTP ${res.statusCode}`,
            res.data
          )
          reject(error)
          return
        }
        
        // 处理响应数据 - 兼容两种后端响应格式
        // 格式1: {code: 200, message: "", data: {}}  (ApiResponse格式)
        // 格式2: {success: true, message: "", data: {}}  (Map格式)
        const responseBody = res.data
        
        // 检查是否为ApiResponse格式
        if (responseBody.hasOwnProperty('code')) {
          const { code, message, data: responseData } = responseBody
          
          if (code === 200) {
            // 请求成功
            resolve(responseData)
          } else {
            // 业务错误
            const error = errorHandler.handleBusinessError(code, message, responseData)
            reject(error)
          }
        } 
        // 检查是否为Map格式
        else if (responseBody.hasOwnProperty('success')) {
          const { success, message, data: responseData } = responseBody
          
          if (success === true) {
            // 请求成功
            resolve(responseData)
          } else {
            // 业务错误 - 对于Map格式，我们假设失败就是普通业务错误
            wx.showToast({
              title: message || '请求失败',
              icon: 'none'
            })
            reject(new Error(message || '请求失败'))
          }
        }
        // 未知格式
        else {
          console.error('[API] 未知的响应格式:', responseBody)
          wx.showToast({
            title: '响应格式错误',
            icon: 'none'
          })
          reject(new Error('响应格式错误'))
        }
      },
      fail: (err) => {
        console.error('[API] 网络请求失败:', err)
        const error = errorHandler.handleNetworkError(err)
        reject(error)
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
  
  // 用户管理相关（管理员）
  getUserList: () => request('/api/admin/users/list', {}, 'GET'),
  getUserDetail: (userId) => request(`/api/admin/users/${userId}/detail`, {}, 'GET'),
  getUserStatistics: () => request('/api/admin/users/statistics', {}, 'GET'),
  
  // 课程相关
  // 管理员获取所有课程列表（后台管理）
  getCourseList: (params = {}) => {
    console.log('[API] getCourseList 被调用，参数:', params);
    const queryParts = [];
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.keyword) queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
    const queryString = queryParts.join('&');
    const url = queryString ? `/api/courses/admin/list?${queryString}` : '/api/courses/admin/list';
    console.log('[API] getCourseList 请求URL:', url);
    return request(url, {}, 'GET');
  },
  
  // 普通用户获取公开课程列表（前台）
  getPublicCourseList: (params = {}) => {
    const queryParts = [];
    if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.keyword) queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
    const queryString = queryParts.join('&');
    const url = queryString ? `/api/courses/public/list?${queryString}` : '/api/courses/public/list';
    return request(url, {}, 'GET');
  },
  getCourseDetail: (courseId) => request(`/api/courses/${courseId}`, {}, 'GET'),
  getCourseById: (courseId) => request(`/api/courses/${courseId}`, {}, 'GET'), // 别名，与getCourseDetail相同
  createCourse: (courseData) => request('/api/courses/create', courseData, 'POST'),
  updateCourse: (courseId, courseData) => request(`/api/courses/${courseId}`, courseData, 'PUT'),
  deleteCourse: (courseId) => request(`/api/courses/${courseId}`, {}, 'DELETE'),
  publishCourse: (courseId) => request(`/api/courses/${courseId}/publish`, {}, 'POST'),
  unpublishCourse: (courseId) => request(`/api/courses/${courseId}/unpublish`, {}, 'POST'),
  archiveCourse: (courseId) => request(`/api/courses/${courseId}/archive`, {}, 'POST'),
  getMyCourses: () => request('/api/courses/my', {}, 'GET'),
  getCourseStatistics: () => request('/api/courses/statistics', {}, 'GET'),
  
  // 章节相关
  getChaptersByCourseId: (courseId) => request(`/api/chapters/course/${courseId}`, {}, 'GET'),
  getPublishedChaptersByCourseId: (courseId) => request(`/api/chapters/course/${courseId}/published`, {}, 'GET'),
  getChapterById: (chapterId) => request(`/api/chapters/${chapterId}`, {}, 'GET'),
  createChapter: (chapterData) => request('/api/chapters/create', chapterData, 'POST'),
  updateChapter: (chapterId, chapterData) => request(`/api/chapters/${chapterId}`, chapterData, 'PUT'),
  deleteChapter: (chapterId) => request(`/api/chapters/${chapterId}`, {}, 'DELETE'),
  publishChapter: (chapterId) => request(`/api/chapters/${chapterId}/publish`, {}, 'POST'),
  unpublishChapter: (chapterId) => request(`/api/chapters/${chapterId}/unpublish`, {}, 'POST'),
  archiveChapter: (chapterId) => request(`/api/chapters/${chapterId}/archive`, {}, 'POST'),
  updateChapterSort: (courseId, chapterIds) => request(`/api/chapters/course/${courseId}/sort`, { chapterIds }, 'POST'),
  getMyChapters: () => request('/api/chapters/my', {}, 'GET'),
  getCourseChapterStats: (courseId) => request(`/api/chapters/course/${courseId}/stats`, {}, 'GET'),

  // 课时相关
  getLessonsByChapterId: (chapterId) => request(`/api/lessons/chapter/${chapterId}`, {}, 'GET'),
  getLessonsByCourseId: (courseId) => request(`/api/lessons/course/${courseId}`, {}, 'GET'),
  getPublishedLessonsByChapterId: (chapterId) => request(`/api/lessons/chapter/${chapterId}/published`, {}, 'GET'),
  getLessonById: (lessonId) => request(`/api/lessons/${lessonId}`, {}, 'GET'),
  getLessonWithCards: (lessonId) => request(`/api/lessons/${lessonId}`, {}, 'GET'), // 别名，包含卡片数据
  createLesson: (lessonData) => request('/api/lessons/create', lessonData, 'POST'),
  updateLesson: (lessonId, lessonData) => request(`/api/lessons/${lessonId}`, lessonData, 'PUT'),
  deleteLesson: (lessonId) => request(`/api/lessons/${lessonId}`, {}, 'DELETE'),
  publishLesson: (lessonId) => request(`/api/lessons/${lessonId}/publish`, {}, 'POST'),
  unpublishLesson: (lessonId) => request(`/api/lessons/${lessonId}/unpublish`, {}, 'POST'),
  archiveLesson: (lessonId) => request(`/api/lessons/${lessonId}/archive`, {}, 'POST'),
  updateLessonSort: (chapterId, lessonIds) => request(`/api/lessons/chapter/${chapterId}/sort`, lessonIds, 'POST'),
  getMyLessons: () => request('/api/lessons/my', {}, 'GET'),
  getChapterLessonStats: (chapterId) => request(`/api/lessons/chapter/${chapterId}/stats`, {}, 'GET'),
  getCourseLessonStats: (courseId) => request(`/api/lessons/course/${courseId}/stats`, {}, 'GET'),
  recordLessonStudy: (lessonId) => request(`/api/lessons/${lessonId}/study`, {}, 'POST'),
  recordLessonCompletion: (lessonId) => request(`/api/lessons/${lessonId}/completion`, {}, 'POST'),
  getMyCourseStatistics: () => request('/api/courses/my/statistics', {}, 'GET'),
  getPopularCourses: (limit = 10) => request(`/api/courses/popular?limit=${limit}`, {}, 'GET'),
  getLatestCourses: (limit = 10) => request(`/api/courses/latest?limit=${limit}`, {}, 'GET'),
  
  // 保留原有的课程接口（兼容性）
  getLessonContent: (lessonId) => request('/api/lesson/content', { lessonId }, 'GET'),
  updateProgress: (lessonId, progress) => request('/api/lesson/progress', { lessonId, progress }, 'POST'),
  
  // 授权码相关
  generateAccessCode: (params) => request('/api/courses/access-codes/generate', params, 'POST'),
  getCourseAccessCodes: (courseId) => request(`/api/courses/access-codes/course/${courseId}`, {}, 'GET'),
  getAllAccessCodes: () => request('/api/courses/access-codes/admin/list', {}, 'GET'),
  redeemAccessCode: (code) => request('/api/courses/access-codes/redeem', { code }, 'POST'),
  validateAccessCode: (code) => request(`/api/courses/access-codes/validate/${code}`, {}, 'GET'),
  disableAccessCode: (codeId) => request(`/api/courses/access-codes/${codeId}/disable`, {}, 'PUT'),
  enableAccessCode: (codeId) => request(`/api/courses/access-codes/${codeId}/enable`, {}, 'PUT'),
  deleteAccessCode: (codeId) => request(`/api/courses/access-codes/${codeId}`, {}, 'DELETE'),
  
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