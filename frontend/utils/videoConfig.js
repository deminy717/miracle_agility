/**
 * 视频选择配置和工具函数
 * 统一管理微信小程序视频选择的配置参数
 */

// 微信小程序视频选择配置
const VIDEO_CONFIG = {
  // 微信小程序限制最大时长为60秒
  maxDuration: 60,
  // 默认压缩视频以减少文件大小
  compressed: true,
  // 默认后置摄像头
  camera: 'back'
}

/**
 * 处理视频选择错误
 * @param {Object} error - 错误对象
 * @param {string} operation - 操作类型：'choose' | 'record'
 * @returns {string} 用户友好的错误信息
 */
function handleVideoError(error, operation = 'choose') {
  if (!error || !error.errMsg) {
    return `${operation === 'choose' ? '选择' : '拍摄'}视频失败`
  }

  const errMsg = error.errMsg.toLowerCase()
  
  if (errMsg.includes('cancel')) {
    return null // 用户取消，不显示错误信息
  }
  
  if (errMsg.includes('maxduration')) {
    return '视频时长不能超过60秒，请选择或录制较短的视频'
  }
  
  if (errMsg.includes('permission') || errMsg.includes('authorize')) {
    const permissionType = operation === 'choose' ? '相册' : '摄像头'
    return `没有${permissionType}访问权限，请在设置中开启权限`
  }
  
  if (errMsg.includes('size')) {
    return '视频文件过大，请选择较小的视频文件'
  }
  
  return `${operation === 'choose' ? '选择' : '拍摄'}视频失败，请重试`
}

/**
 * 显示视频时长限制提示
 */
function showDurationLimitTip() {
  wx.showModal({
    title: '视频时长限制',
    content: '由于微信小程序限制，选择的视频时长不能超过60秒。\n\n建议：\n1. 录制较短的视频片段\n2. 使用视频编辑工具剪辑视频\n3. 分段录制多个短视频',
    showCancel: false,
    confirmText: '我知道了'
  })
}

/**
 * 选择视频的通用方法
 * @param {Object} options - 配置选项
 * @param {Array} options.sourceType - 来源类型 ['album'] | ['camera'] | ['album', 'camera']
 * @param {Function} options.success - 成功回调
 * @param {Function} options.fail - 失败回调（可选）
 * @param {string} options.operation - 操作类型，用于错误提示
 */
function chooseVideo(options = {}) {
  const { 
    sourceType = ['album', 'camera'], 
    success, 
    fail,
    operation = 'choose'
  } = options

  wx.chooseVideo({
    sourceType,
    maxDuration: VIDEO_CONFIG.maxDuration,
    compressed: VIDEO_CONFIG.compressed,
    camera: VIDEO_CONFIG.camera,
    success: (res) => {
      console.log('选择视频成功:', res)
      if (success) success(res)
    },
    fail: (error) => {
      console.error('选择视频失败:', error)
      
      const errorMsg = handleVideoError(error, operation)
      if (errorMsg) {
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        })
        
        // 如果是时长限制错误，显示详细提示
        if (errorMsg.includes('60秒')) {
          setTimeout(() => {
            showDurationLimitTip()
          }, 3500)
        }
      }
      
      if (fail) fail(error)
    }
  })
}

module.exports = {
  VIDEO_CONFIG,
  handleVideoError,
  showDurationLimitTip,
  chooseVideo
} 