const request = require('../../../api/request')

Page({
  data: {
    courseId: null,
    formData: {
      title: '', desc: '', coverImage: '', instructor: '',
      duration: '', level: '', price: '', content: ''
    },
    levelOptions: ['L1-初级', 'L2-中级', 'L3-高级', 'L4-专业级'],
    levelIndex: -1,
    loading: true,
    submitting: false
  },

  onLoad: function (options) {
    const { id } = options
    if (id) {
      this.setData({ courseId: id })
      this.loadCourseDetail(id)
    }
  },

  async loadCourseDetail(id) {
    try {
      const adminToken = wx.getStorageSync('adminToken')
      const result = await request.get(`/admin/content/courses/${id}`, {}, {
        'Admin-Token': adminToken
      })

      const course = result.body
      const levelIndex = this.data.levelOptions.findIndex(item => item === course.level)
      
      this.setData({
        formData: { ...course },
        levelIndex: levelIndex >= 0 ? levelIndex : -1,
        loading: false
      })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 输入处理函数（简化版）
  onTitleInput(e) { this.setData({ 'formData.title': e.detail.value }) },
  onDescInput(e) { this.setData({ 'formData.desc': e.detail.value }) },
  onInstructorInput(e) { this.setData({ 'formData.instructor': e.detail.value }) },
  onDurationInput(e) { this.setData({ 'formData.duration': e.detail.value }) },
  onPriceInput(e) { this.setData({ 'formData.price': e.detail.value }) },
  onContentInput(e) { this.setData({ 'formData.content': e.detail.value }) },

  onLevelChange(e) {
    const index = e.detail.value
    this.setData({
      levelIndex: index,
      'formData.level': this.data.levelOptions[index]
    })
  },

  chooseCover() { /* 上传逻辑 */ },
  removeCover() { this.setData({ 'formData.coverImage': '' }) },

  async submitForm() {
    if (!this.data.formData.title.trim()) {
      wx.showToast({ title: '请输入课程标题', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    try {
      const adminToken = wx.getStorageSync('adminToken')
      await request.put(`/admin/content/courses/${this.data.courseId}`, this.data.formData, {
        'Admin-Token': adminToken
      })

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() { wx.navigateBack() }
}) 