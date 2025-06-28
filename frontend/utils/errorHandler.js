/**
 * 统一错误处理工具
 * 负责处理各种HTTP状态码错误和业务错误
 */

const auth = require('./auth.js')

/**
 * 处理401未授权错误
 * @param {string} message 错误消息
 */
function handle401Error(message = '登录已过期，请重新登录') {
  console.log('[ERROR] 处理401错误，准备跳转登录页面');
  
  // 清除登录信息
  auth.clearLoginInfo();
  
  // 跳转到登录页面
  auth.redirectToLogin(message);
}

/**
 * 处理403权限不足错误
 * @param {string} message 错误消息
 */
function handle403Error(message = '权限不足，无法访问该资源') {
  console.log('[ERROR] 处理403错误，权限不足');
  
  // 显示权限不足提示
  wx.showModal({
    title: '权限不足',
    content: message,
    showCancel: false,
    confirmText: '确定',
    confirmColor: '#ff6b6b'
  });
}

/**
 * 处理404资源不存在错误
 * @param {string} message 错误消息
 */
function handle404Error(message = '请求的资源不存在') {
  console.log('[ERROR] 处理404错误，资源不存在');
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}

/**
 * 处理500服务器内部错误
 * @param {string} message 错误消息
 */
function handle500Error(message = '服务器内部错误，请稍后重试') {
  console.log('[ERROR] 处理500错误，服务器内部错误');
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}

/**
 * 统一处理HTTP状态码错误
 * @param {number} statusCode HTTP状态码
 * @param {string} message 错误消息
 * @param {Object} data 响应数据
 * @returns {Error} 错误对象
 */
function handleHttpError(statusCode, message, data) {
  console.log(`[ERROR] 处理HTTP错误: ${statusCode}, 消息: ${message}`);
  
  let errorMessage = message;
  
  switch (statusCode) {
    case 401:
      handle401Error(message);
      errorMessage = '登录已过期';
      break;
      
    case 403:
      handle403Error(message);
      errorMessage = '权限不足';
      break;
      
    case 404:
      handle404Error(message);
      errorMessage = '资源不存在';
      break;
      
    case 500:
      handle500Error(message);
      errorMessage = '服务器错误';
      break;
      
    case 502:
    case 503:
    case 504:
      wx.showToast({
        title: '服务暂时不可用，请稍后重试',
        icon: 'none',
        duration: 3000
      });
      errorMessage = '服务不可用';
      break;
      
    default:
      wx.showToast({
        title: message || `请求失败 (${statusCode})`,
        icon: 'none',
        duration: 3000
      });
      errorMessage = message || `HTTP ${statusCode}`;
      break;
  }
  
  const error = new Error(errorMessage);
  error.statusCode = statusCode;
  error.data = data;
  return error;
}

/**
 * 统一处理业务错误码
 * @param {number} code 业务错误码
 * @param {string} message 错误消息
 * @param {Object} data 响应数据
 * @returns {Error} 错误对象
 */
function handleBusinessError(code, message, data) {
  console.log(`[ERROR] 处理业务错误: ${code}, 消息: ${message}`);
  
  let errorMessage = message;
  
  switch (code) {
    case 401:
      handle401Error(message);
      errorMessage = '登录已过期';
      break;
      
    case 403:
      handle403Error(message);
      errorMessage = '权限不足';
      break;
      
    case 1001:
      // 参数错误
      wx.showToast({
        title: message || '参数错误',
        icon: 'none',
        duration: 2000
      });
      break;
      
    case 1002:
      // 数据不存在
      wx.showToast({
        title: message || '数据不存在',
        icon: 'none',
        duration: 2000
      });
      break;
      
    default:
      // 其他业务错误
      wx.showToast({
        title: message || '操作失败',
        icon: 'none',
        duration: 2000
      });
      break;
  }
  
  const error = new Error(errorMessage);
  error.code = code;
  error.data = data;
  return error;
}

/**
 * 处理网络错误
 * @param {Object} error 网络错误对象
 * @returns {Error} 错误对象
 */
function handleNetworkError(error) {
  console.log('[ERROR] 处理网络错误:', error);
  
  let errorMessage = '网络连接失败';
  
  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接';
    } else if (error.errMsg.includes('fail')) {
      errorMessage = '网络连接失败，请检查网络设置';
    }
  }
  
  wx.showToast({
    title: errorMessage,
    icon: 'none',
    duration: 3000
  });
  
  return new Error(errorMessage);
}

/**
 * 检查错误是否为认证相关错误
 * @param {Error} error 错误对象
 * @returns {boolean} 是否为认证错误
 */
function isAuthError(error) {
  return error.statusCode === 401 || 
         error.code === 401 || 
         (error.message && error.message.includes('登录已过期'));
}

/**
 * 检查错误是否为权限相关错误
 * @param {Error} error 错误对象
 * @returns {boolean} 是否为权限错误
 */
function isPermissionError(error) {
  return error.statusCode === 403 || 
         error.code === 403 || 
         (error.message && error.message.includes('权限不足'));
}

module.exports = {
  handle401Error,
  handle403Error,
  handle404Error,
  handle500Error,
  handleHttpError,
  handleBusinessError,
  handleNetworkError,
  isAuthError,
  isPermissionError
} 