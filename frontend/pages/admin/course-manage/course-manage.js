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

  // 管理授权码
  manageAccessCodes(e) {
    const courseId = e.currentTarget.dataset.id
    const courseTitle = e.currentTarget.dataset.title
    
    wx.showActionSheet({
      itemList: ['查看授权码', '生成新授权码'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.viewAccessCodes(courseId, courseTitle)
        } else if (res.tapIndex === 1) {
          this.generateAccessCode(courseId, courseTitle)
        }
      }
    })
  },

  // 查看授权码列表
  async viewAccessCodes(courseId, courseTitle) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const api = require('../../../utils/api.js')
      const response = await api.request(`/courses/access-codes/course/${courseId}`, {}, 'GET')
      
      if (response && response.code === 200) {
        const accessCodes = response.data || []
        this.showAccessCodesModal(courseTitle, accessCodes)
      } else {
        throw new Error(response?.message || '获取授权码失败')
      }
    } catch (error) {
      console.error('获取授权码失败:', error)
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 显示授权码列表模态框
  showAccessCodesModal(courseTitle, accessCodes) {
    if (accessCodes.length === 0) {
      wx.showModal({
        title: '授权码管理',
        content: `课程"${courseTitle}"还没有任何授权码`,
        showCancel: false,
        confirmText: '确定'
      })
      return
    }

    let content = `课程："${courseTitle}"\n\n`
    content += `共 ${accessCodes.length} 个授权码：\n\n`
    
    accessCodes.forEach((code, index) => {
      content += `${index + 1}. ${code.code}\n`
      content += `   状态：${this.getCodeStatusText(code.status)}\n`
      content += `   使用次数：${code.usedCount}/${code.usageLimit || '无限制'}\n`
      if (code.validUntil) {
        content += `   有效期至：${new Date(code.validUntil).toLocaleDateString()}\n`
      }
      content += `\n`
    })

    wx.showModal({
      title: '授权码列表',
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 生成新授权码
  generateAccessCode(courseId, courseTitle) {
    wx.showModal({
      title: '生成授权码',
      content: `确定为课程"${courseTitle}"生成一个新的授权码吗？\n\n默认设置：\n- 仅可使用1次\n- 永久有效`,
      confirmText: '生成',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performGenerateAccessCode(courseId)
        }
      }
    })
  },

  // 执行生成授权码
  async performGenerateAccessCode(courseId) {
    wx.showLoading({ title: '生成中...' })
    
    try {
      const api = require('../../../utils/api.js')
      const response = await api.request('/courses/access-codes/generate', {
        courseId: courseId,
        description: '管理员生成',
        usageLimit: 1, // 默认只能使用一次
        // validFrom: null,
        // validUntil: null  // 永久有效
      }, 'POST')
      
      if (response && response.code === 200) {
        const accessCode = response.data
        this.showGeneratedCodeModal(accessCode.code)
      } else {
        throw new Error(response?.message || '生成授权码失败')
      }
    } catch (error) {
      console.error('生成授权码失败:', error)
      wx.showToast({
        title: error.message || '生成失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 显示生成的授权码
  showGeneratedCodeModal(code) {
    wx.showModal({
      title: '授权码生成成功',
      content: `新授权码：${code}\n\n请复制并分享给需要的用户。\n\n注意：此授权码只能使用一次！`,
      confirmText: '复制授权码',
      cancelText: '确定',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: code,
            success: () => {
              wx.showToast({
                title: '授权码已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 获取授权码状态文本
  getCodeStatusText(status) {
    switch(status) {
      case 'active': return '有效'
      case 'used': return '已使用'
      case 'expired': return '已过期'
      case 'disabled': return '已禁用'
      default: return status || '未知'
    }
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