const request = require('../../../api/request')

Page({
  data: {
    videoId: null,
    formData: {
      title: '',
      desc: '',
      videoUrl: '',
      coverImage: '',
      author: '',
      duration: '',
      tags: ''
    },
    loading: true,
    submitting: false
  },

  onLoad: function (options) {
    const { id } = options
    if (id) {
      this.setData({ videoId: id })
      this.loadVideoDetail(id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 加载视频详情
   */
  async loadVideoDetail(id) {
    this.setData({ loading: true })

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({
          title: '请先登录管理后台',
          icon: 'none'
        })
        return
      }

      const result = await request.get(`/admin/content/videos/${id}`, {}, {
        'Admin-Token': adminToken
      })

      const video = result.body
      this.setData({
        formData: {
          title: video.title || '',
          desc: video.desc || '',
          videoUrl: video.videoUrl || '',
          coverImage: video.coverImage || '',
          author: video.author || '',
          duration: video.duration || '',
          tags: video.tags || ''
        },
        loading: false
      })

    } catch (error) {
      console.error('加载视频详情失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 复用创建页面的输入处理函数
  onTitleInput(e) { this.setData({ 'formData.title': e.detail.value }) },
  onDescInput(e) { this.setData({ 'formData.desc': e.detail.value }) },
  onAuthorInput(e) { this.setData({ 'formData.author': e.detail.value }) },
  onDurationInput(e) { this.setData({ 'formData.duration': e.detail.value }) },
  onTagsInput(e) { this.setData({ 'formData.tags': e.detail.value }) },

  // 复用创建页面的上传函数（省略具体实现，与create.js相同）
  chooseVideo() { /* 与create.js相同 */ },
  uploadVideo(filePath) { /* 与create.js相同 */ },
  removeVideo() { this.setData({ 'formData.videoUrl': '' }) },
  chooseCover() { /* 与create.js相同 */ },
  uploadCover(filePath) { /* 与create.js相同 */ },
  removeCover() { this.setData({ 'formData.coverImage': '' }) },

  validateForm() {
    const { title, videoUrl } = this.data.formData
    if (!title.trim()) {
      wx.showToast({ title: '请输入视频标题', icon: 'none' })
      return false
    }
    if (!videoUrl.trim()) {
      wx.showToast({ title: '请选择视频文件', icon: 'none' })
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
      await request.put(`/admin/content/videos/${this.data.videoId}`, this.data.formData, {
        'Admin-Token': adminToken
      })

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)

    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() { wx.navigateBack() }
}) 