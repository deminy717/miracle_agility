/**
 * 用户认证工具模块
 * 负责处理用户登录、令牌管理、权限验证等功能
 */

const config = require('./config.js')

/**
 * 微信小程序用户登录
 * @param {Object} options 登录选项
 * @returns {Promise} 登录结果
 */
function wxLogin(options = {}) {
  return new Promise((resolve, reject) => {
    // 1. 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 2. 获取用户信息（如果需要）
          if (options.withUserInfo) {
            getUserProfile(loginRes.code, options)
              .then(resolve)
              .catch(reject)
          } else {
            // 3. 直接使用code登录
            performLogin(loginRes.code, null, options)
              .then(resolve)
              .catch(reject)
          }
        } else {
          console.error('微信登录失败:', loginRes.errMsg)
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: (error) => {
        console.error('wx.login调用失败:', error)
        reject(new Error('调用微信登录接口失败'))
      }
    })
  })
}

/**
 * 获取用户资料
 * @param {string} code 微信登录凭证
 * @param {Object} options 选项
 */
function getUserProfile(code, options = {}) {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const userInfo = profileRes.userInfo
        performLogin(code, userInfo, options)
          .then(resolve)
          .catch(reject)
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error)
        // 即使获取用户信息失败，也可以进行登录
        performLogin(code, null, options)
          .then(resolve)
          .catch(reject)
      }
    })
  })
}

/**
 * 执行登录请求
 * @param {string} code 微信登录凭证
 * @param {Object} userInfo 用户信息
 * @param {Object} options 选项
 */
function performLogin(code, userInfo, options = {}) {
  return new Promise((resolve, reject) => {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 构建登录请求数据
    const loginData = {
      code: code,
      deviceModel: systemInfo.model,
      deviceSystem: systemInfo.system,
      deviceVersion: systemInfo.version,
      clientVersion: systemInfo.SDKVersion
    }
    
    // 添加用户信息（如果有）
    if (userInfo) {
      loginData.nickname = userInfo.nickName
      loginData.avatarUrl = userInfo.avatarUrl
      loginData.gender = userInfo.gender
    }
    
    // 检查配置有效性
    const currentConfig = config.getCurrentConfig()
    const baseUrl = currentConfig ? currentConfig.baseUrl : null
    
    if (!baseUrl) {
      console.error('baseUrl配置无效:', currentConfig)
      reject(new Error('网络配置错误，请检查环境设置'))
      return
    }
    
    // 构建完整的请求URL
    const requestUrl = `${baseUrl}/api/user/wx-login`
    console.log('登录请求URL:', requestUrl)
    
    // 发送登录请求
    wx.request({
      url: requestUrl,
      method: 'POST',
      data: loginData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('登录响应:', res.data)
        
        if (res.data.code === 200) {
          const loginResult = res.data.data
          
          // 保存登录信息
          saveLoginInfo(loginResult)
          
          // 更新全局用户信息
          updateGlobalUserInfo(loginResult.userInfo)
          
          resolve({
            success: true,
            data: loginResult,
            isNewUser: loginResult.isNewUser
          })
        } else {
          reject(new Error(res.data.message || '登录失败'))
        }
      },
      fail: (error) => {
        console.error('登录请求失败:', error)
        reject(new Error(`网络请求失败: ${error.errMsg || error.message || '未知错误'}`))
      }
    })
  })
}

/**
 * 保存登录信息到本地存储
 * @param {Object} loginResult 登录结果
 */
function saveLoginInfo(loginResult) {
  try {
    // 保存访问令牌
    wx.setStorageSync('accessToken', loginResult.accessToken)
    
    // 保存刷新令牌
    wx.setStorageSync('refreshToken', loginResult.refreshToken)
    
    // 保存过期时间
    const expiresTime = Date.now() + (loginResult.expiresIn * 1000)
    wx.setStorageSync('tokenExpiresTime', expiresTime)
    
    // 保存用户信息
    wx.setStorageSync('userInfo', loginResult.userInfo)
    
    console.log('登录信息保存成功')
  } catch (error) {
    console.error('保存登录信息失败:', error)
  }
}

/**
 * 更新全局用户信息
 * @param {Object} userInfo 用户信息
 */
function updateGlobalUserInfo(userInfo) {
  try {
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.userInfo = userInfo
      app.globalData.isLoggedIn = true
      app.globalData.isAdmin = userInfo.isAdmin || false
      app.globalData.isDeveloper = userInfo.isDeveloper || false
    }
  } catch (error) {
    console.error('更新全局用户信息失败:', error)
  }
}

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
function checkLoginStatus() {
  try {
    const accessToken = wx.getStorageSync('accessToken')
    const expiresTime = wx.getStorageSync('tokenExpiresTime')
    
    if (!accessToken || !expiresTime) {
      return false
    }
    
    // 检查令牌是否过期
    if (Date.now() >= expiresTime) {
      console.log('访问令牌已过期')
      return false
    }
    
    return true
  } catch (error) {
    console.error('检查登录状态失败:', error)
    return false
  }
}

/**
 * 获取访问令牌
 * @returns {string|null} 访问令牌
 */
function getAccessToken() {
  try {
    return wx.getStorageSync('accessToken')
  } catch (error) {
    console.error('获取访问令牌失败:', error)
    return null
  }
}

/**
 * 刷新访问令牌
 * @returns {Promise} 刷新结果
 */
function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const refreshToken = wx.getStorageSync('refreshToken')
    
    if (!refreshToken) {
      reject(new Error('刷新令牌不存在'))
      return
    }
    
    // 检查配置有效性
    const currentConfig = config.getCurrentConfig()
    const baseUrl = currentConfig ? currentConfig.baseUrl : null
    
    if (!baseUrl) {
      console.error('refreshAccessToken: baseUrl配置无效')
      reject(new Error('网络配置错误，请检查环境设置'))
      return
    }
    
    const refreshUrl = `${baseUrl}/api/user/refresh-token`
    console.log('刷新令牌请求URL:', refreshUrl)
    
    wx.request({
      url: refreshUrl,
      method: 'POST',
      data: { refreshToken },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === 200) {
          const refreshResult = res.data.data
          
          // 保存新的登录信息
          saveLoginInfo(refreshResult)
          
          // 更新全局用户信息
          updateGlobalUserInfo(refreshResult.userInfo)
          
          resolve(refreshResult)
        } else {
          reject(new Error(res.data.message || '刷新令牌失败'))
        }
      },
      fail: (error) => {
        console.error('刷新令牌请求失败:', error)
        reject(new Error(`网络请求失败: ${error.errMsg || error.message || '未知错误'}`))
      }
    })
  })
}

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
function logout() {
  return new Promise((resolve, reject) => {
    // 在Mock模式下直接清除本地信息，不发送网络请求
    if (config.isMock()) {
      console.log('Mock模式：直接清除登录信息')
      clearLoginInfo()
      resolve()
      return
    }
    
    const accessToken = getAccessToken()
    
    // 发送登出请求
    if (accessToken) {
      // 检查配置有效性
      const currentConfig = config.getCurrentConfig()
      const baseUrl = currentConfig ? currentConfig.baseUrl : null
      
      if (!baseUrl) {
        console.warn('baseUrl配置无效，直接清除本地登录信息')
        clearLoginInfo()
        resolve()
        return
      }
      
      const logoutUrl = `${baseUrl}/api/user/logout`
      console.log('退出登录请求URL:', logoutUrl)
      
      wx.request({
        url: logoutUrl,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('登出响应:', res.data)
        },
        fail: (error) => {
          console.error('登出请求失败:', error)
        },
        complete: () => {
          // 无论请求成功或失败都清除本地信息
          clearLoginInfo()
          resolve()
        }
      })
    } else {
      clearLoginInfo()
      resolve()
    }
  })
}

/**
 * 清除登录信息
 */
function clearLoginInfo() {
  try {
    wx.removeStorageSync('accessToken')
    wx.removeStorageSync('refreshToken')
    wx.removeStorageSync('tokenExpiresTime')
    wx.removeStorageSync('userInfo')
    
    // 清除全局用户信息
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.userInfo = null
      app.globalData.isLoggedIn = false
      app.globalData.isAdmin = false
      app.globalData.isDeveloper = false
    }
    
    console.log('登录信息清除成功')
  } catch (error) {
    console.error('清除登录信息失败:', error)
  }
}

/**
 * 跳转到登录页面
 * 统一处理登录过期的跳转逻辑
 */
function redirectToLogin(message = '登录已过期，请重新登录') {
  console.log('准备跳转到登录页面:', message)
  
  // 清除登录信息
  clearLoginInfo()
  
  // 显示提示消息
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
  
  // 延迟跳转，确保Toast显示
  setTimeout(() => {
    try {
      // 获取当前页面栈
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = currentPage ? currentPage.route : ''
      
      console.log('当前页面路径:', currentRoute)
      
      // 如果当前不在个人中心页面，才进行跳转
      if (currentRoute !== 'pages/profile/profile') {
        wx.switchTab({
          url: '/pages/profile/profile',
          success: () => {
            console.log('成功跳转到个人中心页面（需要登录）')
          },
          fail: (error) => {
            console.error('跳转到个人中心页面失败:', error)
            // 降级方案：跳转到首页
            wx.switchTab({
              url: '/pages/home/home'
            })
          }
        })
      }
    } catch (error) {
      console.error('处理登录跳转时发生错误:', error)
    }
  }, 1000)
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
function getCurrentUser() {
  try {
    return wx.getStorageSync('userInfo')
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
    return null
  }
}

/**
 * 检查用户权限
 * @param {string} permission 权限类型
 * @returns {boolean} 是否有权限
 */
function hasPermission(permission) {
  const userInfo = getCurrentUser()
  if (!userInfo) {
    return false
  }
  
  switch (permission) {
    case 'admin':
      return userInfo.isAdmin || false
    case 'developer':
      return userInfo.isDeveloper || false
    default:
      return true
  }
}

/**
 * 检查管理员权限
 * 如果用户不是管理员，会自动跳转到首页并提示
 * @returns {boolean} 是否有管理员权限
 */
function checkAdminAuth() {
  if (!checkLoginStatus()) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    })
    wx.switchTab({
      url: '/pages/profile/profile'
    })
    return false
  }
  
  if (!hasPermission('admin')) {
    wx.showToast({
      title: '无管理员权限',
      icon: 'none'
    })
    wx.switchTab({
      url: '/pages/home/home'
    })
    return false
  }
  
  return true
}

/**
 * 自动登录检查
 * 在app启动时调用，检查是否需要自动登录或刷新令牌
 */
function autoLoginCheck() {
  return new Promise((resolve, reject) => {
    if (checkLoginStatus()) {
      // 令牌有效，直接加载用户信息到全局
      const userInfo = getCurrentUser()
      if (userInfo) {
        updateGlobalUserInfo(userInfo)
        resolve({ success: true, autoLogin: true })
        return
      }
    }
    
    // 尝试刷新令牌
    const refreshToken = wx.getStorageSync('refreshToken')
    if (refreshToken) {
      refreshAccessToken()
        .then(() => {
          resolve({ success: true, autoLogin: true, refreshed: true })
        })
        .catch(() => {
          // 刷新失败，清除无效信息
          clearLoginInfo()
          resolve({ success: false, autoLogin: false })
        })
    } else {
      resolve({ success: false, autoLogin: false })
    }
  })
}

module.exports = {
  wxLogin,
  checkLoginStatus,
  getAccessToken,
  refreshAccessToken,
  logout,
  clearLoginInfo,
  redirectToLogin,
  getCurrentUser,
  hasPermission,
  checkAdminAuth,
  autoLoginCheck
} 