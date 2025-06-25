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
  loadCourses() {
    wx.showLoading({ title: '加载中...' })
    
    // 模拟API调用，实际项目中替换为真实API
    setTimeout(() => {
      const mockCourses = [
        {
          id: 1,
          title: '犬类基础训练课程',
          description: '从零开始学习犬类基础训练技巧，包括坐、卧、来等基本指令',
          cover: '/static/images/course1.jpg',
          status: 'published',
          studentCount: 156,
          chapterCount: 8,
          updateTime: '2024-01-15'
        },
        {
          id: 2,
          title: '敏捷训练进阶教程',
          description: '提升犬类敏捷性和协调能力的专业训练方法',
          cover: '/static/images/course2.jpg',
          status: 'published',
          studentCount: 89,
          chapterCount: 12,
          updateTime: '2024-01-10'
        },
        {
          id: 3,
          title: '行为纠正专项训练',
          description: '针对犬类不良行为的专业纠正训练课程',
          cover: '/static/images/course3.jpg',
          status: 'draft',
          studentCount: 0,
          chapterCount: 6,
          updateTime: '2024-01-08'
        }
      ]

      this.setData({
        courses: mockCourses,
        filteredCourses: mockCourses
      })

      this.updateStats()
      wx.hideLoading()
    }, 800)
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
    e.stopPropagation()
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/course-edit/course-edit?id=${courseId}`
    })
  },

  // 管理章节
  manageChapters(e) {
    e.stopPropagation()
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/chapter-manage/chapter-manage?courseId=${courseId}`
    })
  },

  // 切换发布状态
  toggleStatus(e) {
    e.stopPropagation()
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
  updateCourseStatus(courseId, status) {
    wx.showLoading({ title: '更新中...' })
    
    // 模拟API调用
    setTimeout(() => {
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
        title: status === 'published' ? '发布成功' : '已下架',
        icon: 'success'
      })
    }, 500)
  },

  // 删除课程
  deleteCourse(e) {
    e.stopPropagation()
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
  performDeleteCourse(courseId) {
    wx.showLoading({ title: '删除中...' })
    
    // 模拟API调用
    setTimeout(() => {
      const courses = this.data.courses.filter(course => course.id !== courseId)
      
      this.setData({ courses })
      this.filterCourses()
      this.updateStats()
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 500)
  },

  // 创建新课程
  createCourse() {
    wx.navigateTo({
      url: '/pages/admin/course-create/course-create'
    })
  },

  // 管理章节
  manageChapters(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/chapter-manage/chapter-manage?courseId=${courseId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourses()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})