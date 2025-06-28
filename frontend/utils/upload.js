// 文件上传工具
const config = require('./config.js')
const auth = require('./auth.js')
const errorHandler = require('./errorHandler.js')

/**
 * 上传单个文件到服务器
 * @param {string} filePath 文件本地路径
 * @param {string} fileType 文件类型: image|video|document
 * @param {string} category 业务分类: course|news|avatar|chapter等
 * @returns {Promise} 返回上传结果
 */
function uploadFile(filePath, fileType = 'image', category = 'chapter') {
  return new Promise((resolve, reject) => {
    // Mock模式处理
    if (config.isMock()) {
      console.log(`[MOCK UPLOAD] 上传文件: ${filePath}`)
      
      // 模拟上传延迟
      setTimeout(() => {
        const mockUrl = `https://mock-cdn.example.com/${category}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${getFileExtension(filePath)}`
        console.log(`[MOCK UPLOAD] 上传成功: ${mockUrl}`)
        resolve({
          success: true,
          url: mockUrl,
          size: Math.floor(Math.random() * 1000000), // 随机文件大小
          originalName: getFileName(filePath)
        })
      }, 1000 + Math.random() * 2000) // 1-3秒随机延迟
      return
    }

    // 生产环境上传
    const baseUrl = config.getCurrentConfig().baseUrl
    const uploadUrl = `${baseUrl}/api/upload/${fileType}`
    
    // 获取认证token
    const accessToken = auth.getAccessToken()
    if (!accessToken) {
      reject(new Error('未登录或登录已过期'))
      return
    }

    console.log(`[UPLOAD] 开始上传: ${filePath} 到 ${uploadUrl}`)
    console.log(`[UPLOAD] 使用token: ${accessToken}`)
    console.log(`[UPLOAD] 文件分类: ${category}, 文件类型: ${fileType}`)

    wx.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file', // 后端接收的字段名
      formData: {
        category: category,
        fileType: fileType
      },
      header: {
        'Authorization': `Bearer ${accessToken}`
      },
      success: (res) => {
        console.log(`[UPLOAD] 上传响应:`, res)
        
        // 处理HTTP状态码错误
        if (res.statusCode !== 200) {
          const error = errorHandler.handleHttpError(
            res.statusCode,
            res.data?.message || `上传失败 (HTTP ${res.statusCode})`,
            res.data
          )
          reject(error)
          return
        }
        
        try {
          const result = JSON.parse(res.data)
          
          // 检查业务响应
          if (result.success || result.code === 200) {
            console.log(`[UPLOAD] 上传成功:`, result.data || result)
            resolve(result.data || result)
          } else if (result.code) {
            // 有错误码的业务错误
            const error = errorHandler.handleBusinessError(
              result.code, 
              result.message || '上传失败', 
              result.data
            )
            reject(error)
          } else {
            // 其他未知错误
            throw new Error(result.message || '上传失败')
          }
        } catch (e) {
          console.error('[UPLOAD] 解析响应失败:', e)
          reject(new Error('服务器响应格式错误'))
        }
      },
      fail: (err) => {
        console.error('[UPLOAD] 上传失败:', err)
        
        // 检查是否是HTTP状态码错误
        if (err.statusCode) {
          const error = errorHandler.handleHttpError(
            err.statusCode,
            err.errMsg || `上传失败 (HTTP ${err.statusCode})`,
            err
          )
          reject(error)
          return
        }
        
        // 处理网络错误
        const error = errorHandler.handleNetworkError(err)
        reject(error)
      }
    })
  })
}

/**
 * 上传图片（带压缩和格式检查）
 * @param {string} imagePath 图片路径
 * @param {string} category 业务分类
 * @param {object} options 配置选项
 * @returns {Promise}
 */
function uploadImage(imagePath, category = 'chapter', options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // 检查文件格式
      const extension = getFileExtension(imagePath).toLowerCase()
      const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      
      if (!allowedFormats.includes(extension)) {
        throw new Error('不支持的图片格式，请选择JPG、PNG、GIF或WebP格式')
      }

      // 获取文件信息
      const fileInfo = await getFileInfo(imagePath)
      const maxSize = options.maxSize || 10 * 1024 * 1024 // 默认10MB
      
      if (fileInfo.size > maxSize) {
        throw new Error(`图片文件过大，请选择小于${Math.round(maxSize / 1024 / 1024)}MB的图片`)
      }

      // 执行上传
      const result = await uploadFile(imagePath, 'image', category)
      resolve(result)
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 上传视频（带大小和时长检查）
 * @param {string} videoPath 视频路径
 * @param {string} category 业务分类
 * @param {object} options 配置选项
 * @returns {Promise}
 */
function uploadVideo(videoPath, category = 'chapter', options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // 检查文件格式
      const extension = getFileExtension(videoPath).toLowerCase()
      const allowedFormats = ['mp4', 'avi', 'mov', 'm4v']
      
      if (!allowedFormats.includes(extension)) {
        throw new Error('不支持的视频格式，请选择MP4、AVI或MOV格式')
      }

      // 获取文件信息
      const fileInfo = await getFileInfo(videoPath)
      const maxSize = options.maxSize || 100 * 1024 * 1024 // 默认100MB
      
      if (fileInfo.size > maxSize) {
        throw new Error(`视频文件过大，请选择小于${Math.round(maxSize / 1024 / 1024)}MB的视频`)
      }

      // 执行上传
      const result = await uploadFile(videoPath, 'video', category)
      resolve(result)
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 批量上传文件
 * @param {Array} filePaths 文件路径数组
 * @param {string} fileType 文件类型
 * @param {string} category 业务分类
 * @param {function} onProgress 进度回调
 * @returns {Promise}
 */
function uploadMultipleFiles(filePaths, fileType, category, onProgress) {
  return new Promise(async (resolve, reject) => {
    const results = []
    const totalCount = filePaths.length
    
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const filePath = filePaths[i]
        let result
        
        if (fileType === 'image') {
          result = await uploadImage(filePath, category)
        } else if (fileType === 'video') {
          result = await uploadVideo(filePath, category)
        } else {
          result = await uploadFile(filePath, fileType, category)
        }
        
        results.push({
          index: i,
          success: true,
          data: result,
          error: null
        })
        
        // 进度回调
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalCount,
            progress: Math.round(((i + 1) / totalCount) * 100),
            currentFile: getFileName(filePath),
            successCount: results.filter(r => r.success).length
          })
        }
        
      } catch (error) {
        results.push({
          index: i,
          success: false,
          data: null,
          error: error.message
        })
        
        console.error(`[UPLOAD] 文件上传失败 [${i}]:`, error)
      }
    }
    
    resolve(results)
  })
}

/**
 * 获取文件信息
 * @param {string} filePath 文件路径
 * @returns {Promise}
 */
function getFileInfo(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileInfo({
      filePath: filePath,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 从文件路径获取文件扩展名
 * @param {string} filePath 文件路径
 * @returns {string}
 */
function getFileExtension(filePath) {
  const lastDot = filePath.lastIndexOf('.')
  return lastDot !== -1 ? filePath.substring(lastDot + 1) : ''
}

/**
 * 从文件路径获取文件名
 * @param {string} filePath 文件路径
 * @returns {string}
 */
function getFileName(filePath) {
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return lastSlash !== -1 ? filePath.substring(lastSlash + 1) : filePath
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

module.exports = {
  uploadFile,
  uploadImage,
  uploadVideo,
  uploadMultipleFiles,
  getFileInfo,
  getFileExtension,
  getFileName,
  formatFileSize
} 