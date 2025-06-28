const api = require('../../../utils/api.js')
const auth = require('../../../utils/auth.js')

Page({
  data: {
    userList: [],
    statistics: {},
    loading: false,
    expandedUsers: {} // 记录展开状态的用户ID
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
    this.loadStatistics()
  },

  // 加载用户列表
  async loadUserList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      const response = await api.request('/admin/users/list', {}, 'GET')
      
      if (response && response.code === 200) {
        // 预处理用户数据，添加格式化字段
        const processedUserList = (response.data || []).map(user => {
          return {
            ...user,
            // 预处理课程数据
            courses: user.courses ? user.courses.map(course => ({
              ...course,
              registrationTypeText: this.getRegistrationTypeText(course.registrationType),
              formattedCreatedAt: this.formatDate(course.createdAt)
            })) : [],
            // 预计算完成率
            completionRate: this.calculateCompletionRate(user.courses)
          }
        })
        
        this.setData({
          userList: processedUserList
        })
      } else {
        throw new Error(response?.message || '获取用户列表失败')
      }
      
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

  // 加载统计信息
  async loadStatistics() {
    try {
      const response = await api.request('/admin/users/statistics', {}, 'GET')
      
      if (response && response.code === 200) {
        this.setData({
          statistics: response.data || {}
        })
      }
      
    } catch (error) {
      console.error('加载统计信息失败:', error)
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
      
      const response = await api.request(`/admin/users/${userId}/detail`, {}, 'GET')
      
      if (response && response.code === 200) {
        const userDetail = response.data
        
        // 显示用户详情对话框
        this.showUserDetailModal(userDetail)
      } else {
        throw new Error(response?.message || '获取用户详情失败')
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

  // 显示用户详情模态框
  showUserDetailModal(userDetail) {
    const userInfo = userDetail.userInfo
    const courses = userDetail.courses
    
    let content = `用户信息：\n`
    content += `昵称：${userInfo.nickname}\n`
    content += `角色：${userInfo.role}\n`
    content += `等级：${userInfo.level}\n`
    content += `注册时间：${userInfo.createdAt}\n\n`
    
    content += `课程信息（${courses.length}门）：\n`
    courses.forEach((course, index) => {
      content += `${index + 1}. ${course.courseTitle}\n`
      content += `   进度：${course.progress}%\n`
      content += `   注册方式：${this.getRegistrationTypeText(course.registrationType)}\n`
      content += `   状态：${course.isCompleted ? '已完成' : '学习中'}\n\n`
    })
    
    wx.showModal({
      title: '用户详情',
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
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
  },

  // 计算完成率
  calculateCompletionRate(courses) {
    if (!courses || courses.length === 0) return 0
    const completedCount = courses.filter(course => course.isCompleted).length
    return Math.round((completedCount / courses.length) * 100)
  }
})