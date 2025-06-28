Page({
  data: {
    selectedCategory: 'images', // 当前选择的文件类型
    selectedFiles: [], // 待上传的文件列表
    uploading: false, // 是否正在上传
    uploadProgress: 0, // 上传进度
    uploadedCount: 0, // 已上传数量
    totalCount: 0, // 总数量
    uploadResults: [] // 上传结果
  },

  onLoad: function (options) {
    // 页面加载
    this.checkAdminAuth()
  },

  /**
   * 检查管理员权限
   */
  checkAdminAuth() {
    const adminToken = wx.getStorageSync('adminToken')
    if (!adminToken) {
      wx.showModal({
        title: '权限不足',
        content: '请先登录管理后台',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  /**
   * 选择文件类型
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category,
      selectedFiles: [],
      uploadResults: []
    })
  },

  /**
   * 选择图片
   */
  chooseImages() {
    wx.chooseImage({
      count: 9, // 最多选择9张
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.processSelectedFiles(res.tempFilePaths, 'images')
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 选择视频
   */
  chooseVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60, // 微信小程序限制最长60秒
      camera: 'back',
      success: (res) => {
        this.processSelectedFiles([res.tempFilePath], 'videos')
      },
      fail: (err) => {
        console.error('选择视频失败:', err)
        let errorMsg = '选择视频失败';
        if (err.errMsg && err.errMsg.includes('maxDuration')) {
          errorMsg = '视频时长不能超过60秒';
        } else if (err.errMsg && err.errMsg.includes('cancel')) {
          errorMsg = '用户取消选择';
        }
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
      }
    })
  },

  /**
   * 选择文档文件
   */
  chooseFiles() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const tempFilePaths = res.tempFiles.map(file => file.path)
        this.processSelectedFiles(tempFilePaths, 'documents')
      },
      fail: (err) => {
        console.error('选择文件失败:', err)
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 处理选择的文件
   */
  processSelectedFiles(filePaths, category) {
    const files = filePaths.map((path, index) => {
      // 获取文件信息
      return new Promise((resolve) => {
        wx.getFileInfo({
          filePath: path,
          success: (info) => {
            resolve({
              path: path,
              name: this.getFileName(path, category, index),
              size: info.size,
              sizeText: this.formatFileSize(info.size)
            })
          },
          fail: () => {
            resolve({
              path: path,
              name: this.getFileName(path, category, index),
              size: 0,
              sizeText: '未知大小'
            })
          }
        })
      })
    })

    Promise.all(files).then(fileList => {
      this.setData({
        selectedFiles: [...this.data.selectedFiles, ...fileList]
      })
    })
  },

  /**
   * 获取文件名
   */
  getFileName(path, category, index) {
    const timestamp = new Date().getTime()
    const extensions = {
      images: '.jpg',
      videos: '.mp4',
      documents: '.pdf'
    }
    return `${category}_${timestamp}_${index}${extensions[category] || ''}`
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 移除文件
   */
  removeFile(e) {
    const index = e.currentTarget.dataset.index
    const selectedFiles = this.data.selectedFiles
    selectedFiles.splice(index, 1)
    this.setData({
      selectedFiles: selectedFiles
    })
  },

  /**
   * 上传所有文件
   */
  async uploadAllFiles() {
    if (this.data.selectedFiles.length === 0) {
      wx.showToast({
        title: '请先选择文件',
        icon: 'none'
      })
      return
    }

    this.setData({
      uploading: true,
      uploadProgress: 0,
      uploadedCount: 0,
      totalCount: this.data.selectedFiles.length,
      uploadResults: []
    })

    const adminToken = wx.getStorageSync('adminToken')
    const results = []

    for (let i = 0; i < this.data.selectedFiles.length; i++) {
      const file = this.data.selectedFiles[i]
      
      try {
        // 上传单个文件
        const result = await this.uploadSingleFile(file, adminToken)
        results.push({
          fileName: file.name,
          success: true,
          url: result.body,
          error: null
        })
      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          url: null,
          error: error.message || '上传失败'
        })
      }

      // 更新进度
      const progress = Math.round(((i + 1) / this.data.selectedFiles.length) * 100)
      this.setData({
        uploadedCount: i + 1,
        uploadProgress: progress
      })
    }

    // 上传完成
    this.setData({
      uploading: false,
      uploadResults: results,
      selectedFiles: [] // 清空待上传列表
    })

    const successCount = results.filter(r => r.success).length
    wx.showToast({
      title: `上传完成：${successCount}/${results.length}`,
      icon: successCount === results.length ? 'success' : 'none'
    })
  },

  /**
   * 上传单个文件
   */
  uploadSingleFile(file, adminToken) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${getApp().globalData.baseUrl}/admin/upload`,
        filePath: file.path,
        name: 'file',
        formData: {
          category: this.data.selectedCategory
        },
        header: {
          'Admin-Token': adminToken
        },
        success: (res) => {
          try {
            const result = JSON.parse(res.data)
            if (result.error === 0) {
              resolve(result)
            } else {
              reject(new Error(result.message || '上传失败'))
            }
          } catch (e) {
            reject(new Error('服务器响应格式错误'))
          }
        },
        fail: (err) => {
          reject(new Error('网络请求失败'))
        }
      })
    })
  },

  /**
   * 复制链接
   */
  copyUrl(e) {
    const url = e.currentTarget.dataset.url
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 预览文件
   */
  previewFile(e) {
    const url = e.currentTarget.dataset.url
    const type = e.currentTarget.dataset.type

    if (type === 'images') {
      wx.previewImage({
        urls: [url],
        current: url
      })
    } else if (type === 'videos') {
      // 视频预览可以跳转到视频播放页面或使用video组件
      wx.showModal({
        title: '视频预览',
        content: '是否打开视频播放？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以跳转到视频播放页面
            console.log('播放视频:', url)
          }
        }
      })
    } else {
      wx.showToast({
        title: '暂不支持预览此文件类型',
        icon: 'none'
      })
    }
  }
}) 