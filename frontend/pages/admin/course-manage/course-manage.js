Page({
  data: {
    searchKeyword: '',
    statusIndex: 0,
    statusOptions: ['全部状态', '已发布', '草稿'],
    courses: [],
    filteredCourses: [],
    stats: {
      total: 0,
      published: 0,
      draft: 0
    }
  },

  onLoad() {
    this.loadCourses()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadCourses()
  },

  // 加载课程数据
  async loadCourses() {
    console.log('开始加载课程数据...')
    wx.showLoading({ title: '加载中...' })
    
    try {
      const api = require('../../../utils/api.js')
      console.log('调用 api.getCourseList()...')
      
      // 后台管理获取所有课程，不仅仅是当前用户的课程
      const courses = await api.getCourseList()
      
      console.log('课程数据加载成功:', courses)
      console.log('课程数量:', courses ? courses.length : 0)
      
      this.setData({
        courses: courses || [],
        filteredCourses: courses || []
      })
      
      this.updateStats()
      wx.hideLoading()
      
      wx.showToast({
        title: `成功加载 ${courses ? courses.length : 0} 个课程`,
        icon: 'success',
        duration: 1500
      })
      
    } catch (error) {
      console.error('加载课程失败:', error)
      console.error('错误详情:', {
        message: error.message,
        statusCode: error.statusCode,
        data: error.data
      })
      
      wx.hideLoading()
      wx.showToast({
        title: `加载失败: ${error.message || '未知错误'}`,
        icon: 'none',
        duration: 3000
      })
    }
  },

  // 更新统计数据
  updateStats() {
    const { courses } = this.data
    const stats = {
      total: courses.length,
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length
    }
    this.setData({ stats })
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this.filterCourses()
  },

  // 状态筛选
  onStatusFilter(e) {
    const index = e.detail.value
    this.setData({ statusIndex: index })
    this.filterCourses()
  },

  // 筛选课程
  filterCourses() {
    const { courses, searchKeyword, statusIndex, statusOptions } = this.data
    let filtered = courses

    // 按关键词筛选
    if (searchKeyword.trim()) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.description.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    // 按状态筛选
    if (statusIndex > 0) {
      const status = statusIndex === 1 ? 'published' : 'draft'
      filtered = filtered.filter(course => course.status === status)
    }

    this.setData({ filteredCourses: filtered })
  },

  // 查看课程详情
  viewCourse(e) {
    const course = e.currentTarget.dataset.course
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${course.id}`
    })
  },

  // 编辑课程
  editCourse(e) {
    const courseId = e.currentTarget.dataset.id
    console.log('编辑课程:', courseId)
    wx.navigateTo({
      url: `/pages/admin/course-create/course-create?courseId=${courseId}&mode=edit`
    })
  },

  // 管理章节
  manageChapters(e) {
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/chapter-manage/chapter-manage?courseId=${courseId}`
    })
  },

  // 切换发布状态
  toggleStatus(e) {
    const courseId = e.currentTarget.dataset.id
    const course = this.data.courses.find(c => c.id === courseId)
    
    if (!course) return

    const newStatus = course.status === 'published' ? 'draft' : 'published'
    const actionText = newStatus === 'published' ? '发布' : '下架'

    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}这个课程吗？`,
      success: (res) => {
        if (res.confirm) {
          this.updateCourseStatus(courseId, newStatus)
        }
      }
    })
  },

  // 更新课程状态
  async updateCourseStatus(courseId, status) {
    wx.showLoading({ title: '更新中...' })
    
    try {
      const api = require('../../../utils/api.js')
      
      // 调用相应的API接口
      if (status === 'published') {
        await api.publishCourse(courseId)
      } else if (status === 'draft') {
        await api.unpublishCourse(courseId)
      } else if (status === 'archived') {
        await api.archiveCourse(courseId)
      }
      
      // 更新本地数据
      const courses = this.data.courses.map(course => {
        if (course.id === courseId) {
          return { ...course, status }
        }
        return course
      })

      this.setData({ courses })
      this.filterCourses()
      this.updateStats()
      
      wx.hideLoading()
      wx.showToast({
        title: status === 'published' ? '发布成功' : status === 'draft' ? '已下架' : '已归档',
        icon: 'success'
      })
    } catch (error) {
      console.error('更新课程状态失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  },

  // 删除课程
  deleteCourse(e) {
    const courseId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个课程吗？',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteCourse(courseId)
        }
      }
    })
  },

  // 执行删除操作
  async performDeleteCourse(courseId) {
    wx.showLoading({ title: '删除中...' })
    
    try {
      const api = require('../../../utils/api.js')
      await api.deleteCourse(courseId)
      
      const courses = this.data.courses.filter(course => course.id !== courseId)
      
      this.setData({ courses })
      this.filterCourses()
      this.updateStats()
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除课程失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '删除失败，请重试',
        icon: 'none'
      })
    }
  },

  // 创建新课程
  createCourse() {
    wx.navigateTo({
      url: '/pages/admin/course-create/course-create'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourses()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})