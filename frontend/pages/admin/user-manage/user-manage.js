const api = require('../../../utils/api.js')
const auth = require('../../../utils/auth.js')

Page({
  data: {
    userList: [],
    loading: false,
    expandedUsers: {}, // 记录展开状态的用户ID
    showUserDetail: false, // 控制用户详情模态框显示
    userDetailInfo: {} // 用户详情信息
  },

  onLoad() {
    this.checkAuthAndLoadData()
  },

  onShow() {
    this.checkAuthAndLoadData()
  },

  // 检查权限并加载数据
  checkAuthAndLoadData() {
    if (!auth.checkAdminAuth()) {
      return
    }
    this.loadUserList()
  },

  // 加载用户列表
  async loadUserList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      const response = await api.request('/api/admin/users/list', {}, 'GET')
      console.log('API响应:', response) // 添加日志
      
      // 预处理用户数据，添加格式化字段
      const processedUserList = response.map(user => {
        // 确保courses是数组
        const courses = Array.isArray(user.courses) ? user.courses : []
        
        // 处理课程数据
        const processedCourses = courses.map(course => ({
          ...course,
          courseTitle: course.courseTitle || '未知课程',
          registrationTypeText: this.getRegistrationTypeText(course.registrationType),
          formattedCreatedAt: this.formatDate(course.createdAt)
        }))

        return {
          userId: user.userId,
          nickname: user.nickname || '未知用户',
          avatarUrl: user.avatarUrl || '/static/images/default-avatar.png',
          phone: user.phone || '',
          email: user.email || '',
          courseCount: user.courseCount || 0,
          courses: processedCourses
        }
      })
      
      console.log('处理后的用户数据:', processedUserList) // 添加日志
      
      this.setData({
        userList: processedUserList,
        loading: false
      })
      
    } catch (error) {
      console.error('加载用户列表失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  // 切换用户展开状态
  toggleUserExpanded(e) {
    const userId = e.currentTarget.dataset.userId
    const expandedUsers = { ...this.data.expandedUsers }
    
    expandedUsers[userId] = !expandedUsers[userId]
    
    this.setData({ expandedUsers })
  },

  // 查看用户详情
  async viewUserDetail(e) {
    const userId = e.currentTarget.dataset.userId
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      const response = await api.request(`/api/admin/users/${userId}/detail`, {}, 'GET')
      console.log('用户详情API响应:', response) // 添加调试日志
      
      // 根据您提供的数据结构，直接使用response作为数据
      if (response && response.userInfo) {
        // 显示用户详情表单
        this.showUserDetailModal(response)
      } else if (response && response.code === 200 && response.data) {
        // 如果是标准格式，使用data字段
        this.showUserDetailModal(response.data)
      } else {
        throw new Error(response.message || '获取用户详情失败')
      }
      
    } catch (error) {
      console.error('获取用户详情失败:', error)
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 显示用户详情表单模态框
  showUserDetailModal(userDetail) {
    const userInfo = userDetail.userInfo || {}
    const courses = userDetail.courses || []
    
    // 格式化角色显示
    const roleText = userInfo.role === 'admin' ? '管理员' : '普通用户'
    
    // 格式化注册时间
    const registrationDate = this.formatDate(userInfo.createdAt) || '未知'
    
    // 设置详情信息
    this.setData({
      showUserDetail: true,
      userDetailInfo: {
        nickname: userInfo.nickname,
        phone: userInfo.phone,
        email: userInfo.email,
        roleText: roleText,
        level: userInfo.level,
        registrationDate: registrationDate,
        totalCourses: courses.length
      }
    })
  },

  // 隐藏用户详情模态框
  hideUserDetail() {
    this.setData({
      showUserDetail: false,
      userDetailInfo: {}
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击模态框内容时关闭模态框
  },

  // 获取注册方式文本
  getRegistrationTypeText(type) {
    switch(type) {
      case 'direct': return '直接注册'
      case 'code': return '授权码注册'
      case 'gift': return '赠送'
      default: return type || '未知'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多（预留）
  onReachBottom() {
    // 如果有分页需求，在这里实现
  },

    // 格式化日期
  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
})