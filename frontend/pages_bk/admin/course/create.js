const request = require('../../../api/request')

Page({
  data: {
    formData: {
      title: '',
      desc: '',
      coverImage: '',
      instructor: '',
      duration: '',
      level: '',
      price: '',
      content: ''
    },
    levelOptions: ['L1-初级', 'L2-中级', 'L3-高级', 'L4-专业级'],
    levelIndex: -1,
    submitting: false
  },

  onLoad: function (options) {
    // 页面加载
  },

  // 输入处理函数
  onTitleInput(e) { this.setData({ 'formData.title': e.detail.value }) },
  onDescInput(e) { this.setData({ 'formData.desc': e.detail.value }) },
  onInstructorInput(e) { this.setData({ 'formData.instructor': e.detail.value }) },
  onDurationInput(e) { this.setData({ 'formData.duration': e.detail.value }) },
  onPriceInput(e) { this.setData({ 'formData.price': e.detail.value }) },
  onContentInput(e) { this.setData({ 'formData.content': e.detail.value }) },

  /**
   * 选择课程等级
   */
  onLevelChange(e) {
    const index = e.detail.value
    this.setData({
      levelIndex: index,
      'formData.level': this.data.levelOptions[index]
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
      
      const uploadRes = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${getApp().globalData.baseUrl}/admin/upload`,
          filePath: filePath,
          name: 'file',
          formData: { category: 'images' },
          header: { 'Admin-Token': adminToken },
          success: resolve,
          fail: reject
        })
      })

      const result = JSON.parse(uploadRes.data)
      
      if (result.error === 0) {
        this.setData({ 'formData.coverImage': result.body })
        wx.showToast({ title: '上传成功', icon: 'success' })
      } else {
        throw new Error(result.message || '上传失败')
      }
    } catch (error) {
      wx.showToast({ title: error.message || '上传失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 移除封面
   */
  removeCover() {
    this.setData({ 'formData.coverImage': '' })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { title } = this.data.formData
    
    if (!title.trim()) {
      wx.showToast({ title: '请输入课程标题', icon: 'none' })
      return false
    }

    return true
  },

  /**
   * 提交表单
   */
  async submitForm() {
    if (!this.validateForm()) return

    this.setData({ submitting: true })

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({ title: '请先登录管理后台', icon: 'none' })
        return
      }

      await request.post('/admin/content/courses', this.data.formData, {
        'Admin-Token': adminToken
      })

      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)

    } catch (error) {
      wx.showToast({ title: error.message || '创建失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() { wx.navigateBack() }
}) 