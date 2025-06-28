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
    },
    // 课程有效期选择器相关数据
    showValidityPicker: false,
    selectedCourseId: null,
    selectedCourseTitle: '',
    selectedValidityIndex: 0,
    validityOptions: [
      { displayName: '📅 1周课程权限', displayText: '1周', days: 7 },
      { displayName: '📅 2周课程权限', displayText: '2周', days: 14 },
      { displayName: '📅 1个月课程权限', displayText: '1个月', days: 30 },
      { displayName: '📅 3个月课程权限', displayText: '3个月', days: 90 },
      { displayName: '📅 6个月课程权限', displayText: '6个月', days: 180 },
      { displayName: '📅 1年课程权限', displayText: '1年', days: 365 },
      { displayName: '♾️ 永久课程权限', displayText: '永久', permanent: true }
    ]
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
    // 跳转到专门的授权码查看页面
    wx.navigateTo({
      url: `/pages/admin/access-code-list/access-code-list?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`
    })
  },

  // 生成新授权码 - 使用自定义下拉选择器
  generateAccessCode(courseId, courseTitle) {
    // 直接显示自定义有效期选择器
    this.setData({
      showValidityPicker: true,
      selectedCourseId: courseId,
      selectedCourseTitle: courseTitle,
      selectedValidityIndex: 0  // 默认选择第一个选项
    })
  },

  // 执行生成授权码
  async performGenerateAccessCode(courseId, options = {}) {
    wx.showLoading({ title: '生成中...' })
    
    try {
      const api = require('../../../utils/api.js')
      
      // 当前时间作为validFrom
      const now = new Date()
      
      // 准备请求参数
      const requestData = {
        courseId: courseId,
        description: options.description || '管理员生成',
        usageLimit: options.usageLimit || 1,
        codeMethod: options.codeMethod || 'base32',
        validFrom: this.formatDateTimeForAPI(now)  // 添加validFrom字段
      }

      // 计算授权码有效期（24小时）和课程有效期
      if (options.validHours) {
        // 授权码有效期：24小时（用于授权码本身的过期时间，暂不使用）
        // 这里我们不设置validUntil，因为授权码有效期由validFrom+24h计算
      }
      
      // 课程有效期：用户选择的天数
      if (options.courseValidityDays) {
        const courseValidUntil = new Date()
        courseValidUntil.setDate(courseValidUntil.getDate() + options.courseValidityDays)
        requestData.validUntil = this.formatDateTimeForAPI(courseValidUntil)
      }
      // 如果没有设置课程有效期，则为永久有效（不传validUntil）

      console.log('生成授权码请求参数:', requestData)
      
      const accessCode = await api.generateAccessCode(requestData)
      console.log('生成授权码API响应:', accessCode)
      console.log('API响应类型:', typeof accessCode)
      console.log('API响应的code字段:', accessCode?.code)
      
      if (accessCode && accessCode.code) {
        console.log('准备显示成功弹窗，授权码:', accessCode.code)
        this.showGeneratedCodeModal(accessCode.code, options.description)
        // 刷新授权码列表（如果用户之前已经打开过）
        // this.loadCourses() // 可选：刷新整个列表
      } else {
        console.error('API响应中没有授权码:', accessCode)
        // 尝试显示一个临时的成功提示
        wx.showToast({
          title: '授权码生成成功（详情获取失败）',
          icon: 'success',
          duration: 2000
        })
        throw new Error('生成授权码失败：无效响应')
      }
    } catch (error) {
      console.error('生成授权码失败:', error)
      wx.showToast({
        title: error.message || '生成失败',
        icon: 'none',
        duration: 3000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 格式化日期时间用于API传递（本地时间）
  formatDateTimeForAPI(date) {
    if (!date) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    // 返回标准的LocalDateTime格式，后端能直接解析
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  },

  // 显示生成的授权码
  showGeneratedCodeModal(code, description = '') {
    console.log('showGeneratedCodeModal被调用，授权码:', code, '描述:', description)
    
    const that = this
    
    // 优化弹窗内容格式，分行显示
    let content = `新授权码：${code}\n\n`
    
    if (description) {
      content += `说明：${description}\n\n`
    }
    
    content += `请复制并分享给需要的用户\n\n`
    content += `注意事项：\n`
    content += `• 授权码默认24小时有效\n`
    content += `• 每个授权码只能使用1次\n`
    content += `• 使用后即刻失效`
    
    console.log('准备显示模态框，内容:', content)
    
    wx.showModal({
      title: '授权码生成成功',
      content: content,
      showCancel: false,
      confirmText: '复制',
      success: (res) => {
        console.log('模态框显示成功，用户操作:', res)
        if (res.confirm) {
          that.copyAccessCode(code)
        }
      },
      fail: (err) => {
        console.error('模态框显示失败:', err)
      }
    })
  },

  // 复制授权码到剪贴板
  copyAccessCode(code) {
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '授权码已复制',
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 获取状态文本
  getCodeStatusText(status) {
    switch (status) {
      case 'active': return '有效'
      case 'used': return '已使用'
      case 'expired': return '已过期'
      default: return '未知'
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
    // 清理可能存在的草稿，确保从空白开始
    try {
      wx.removeStorageSync('course_create_draft');
      console.log('清理草稿，准备创建新课程');
    } catch (error) {
      console.error('清理草稿失败:', error);
    }
    
    wx.navigateTo({
      url: '/pages/admin/course-create/course-create?forceNew=true'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourses()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // ============= 课程有效期选择器相关方法 =============
  
  // 隐藏有效期选择器
  hideValidityPicker() {
    this.setData({
      showValidityPicker: false,
      selectedCourseId: null,
      selectedCourseTitle: '',
      selectedValidityIndex: 0
    })
  },

  // 有效期选择变化
  onValidityChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedValidityIndex: index
    })
  },

  // 确认生成授权码
  confirmGenerateCode() {
    const { selectedCourseId, selectedCourseTitle, selectedValidityIndex, validityOptions } = this.data
    const selectedValidity = validityOptions[selectedValidityIndex]
    
    // 隐藏选择器
    this.hideValidityPicker()
    
    // 生成授权码
    this.performGenerateAccessCode(selectedCourseId, {
      description: `${selectedValidity.displayText}课程权限授权码`,
      usageLimit: 1,
      courseValidityDays: selectedValidity.permanent ? null : selectedValidity.days,  // 课程有效期
      codeMethod: 'base32',
      courseValidity: selectedValidity.displayText
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  }
})