const request = require('../../../api/request')

Page({
  data: {
    formData: {
      title: '',
      desc: '',
      coverImage: '',
      content: '',
      author: '',
      tags: ''
    },
    submitting: false
  },

  onLoad: function (options) {
    // 页面加载
  },

  /**
   * 标题输入
   */
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  /**
   * 描述输入
   */
  onDescInput(e) {
    this.setData({
      'formData.desc': e.detail.value
    })
  },

  /**
   * 内容输入
   */
  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value
    })
  },

  /**
   * 作者输入
   */
  onAuthorInput(e) {
    this.setData({
      'formData.author': e.detail.value
    })
  },

  /**
   * 标签输入
   */
  onTagsInput(e) {
    this.setData({
      'formData.tags': e.detail.value
    })
  },

  /**
   * 选择封面图片
   */
  chooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadCover(tempFilePath)
      }
    })
  },

  /**
   * 上传封面图片
   */
  async uploadCover(filePath) {
    wx.showLoading({ title: '上传中...' })
    
    try {
      const adminToken = wx.getStorageSync('adminToken')
      
      // 使用微信上传API
      const uploadRes = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${getApp().globalData.baseUrl}/admin/upload`,
          filePath: filePath,
          name: 'file',
          formData: {
            category: 'images'
          },
          header: {
            'Admin-Token': adminToken
          },
          success: resolve,
          fail: reject
        })
      })

      const result = JSON.parse(uploadRes.data)
      
      if (result.error === 0) {
        this.setData({
          'formData.coverImage': result.body
        })
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } else {
        throw new Error(result.message || '上传失败')
      }
    } catch (error) {
      console.error('上传封面失败:', error)
      wx.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 移除封面
   */
  removeCover() {
    this.setData({
      'formData.coverImage': ''
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { title, content } = this.data.formData
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入文章标题',
        icon: 'none'
      })
      return false
    }

    if (!content.trim()) {
      wx.showToast({
        title: '请输入文章内容',
        icon: 'none'
      })
      return false
    }

    return true
  },

  /**
   * 提交表单
   */
  async submitForm() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ submitting: true })

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({
          title: '请先登录管理后台',
          icon: 'none'
        })
        return
      }

      const result = await request.post('/admin/content/articles', this.data.formData, {
        'Admin-Token': adminToken
      })

      wx.showToast({
        title: '创建成功',
        icon: 'success'
      })

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('创建文章失败:', error)
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
}) 