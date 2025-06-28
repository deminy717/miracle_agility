Page({
  data: {
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      totalArticles: 0,
      todayActiveUsers: 0
    }
  },

  onLoad(options) {
    // 加载统计数据
    this.loadStats()
  },

  // 加载统计数据
  loadStats() {
    const api = require('../../utils/api.js')
    
    // 这里可以调用统计API，暂时使用mock数据
    const mockStats = {
      totalUsers: 2588,
      totalCourses: 45,
      totalArticles: 128,
      todayActiveUsers: 342
    }
    
    this.setData({
      stats: mockStats
    })
  },



  // 跳转到用户管理
  goToUserManagement() {
    wx.navigateTo({
      url: '/pages/admin/user/list'
    }).catch(() => {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    })
  },

  // 跳转到课程管理
  goToCourseManagement() {
    wx.navigateTo({
      url: '/pages/admin/course-manage/course-manage'
    }).catch(() => {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    })
  },

  // 跳转到文章管理
  goToArticleManagement() {
    wx.navigateTo({
      url: '/pages/admin/article-manage/article-manage'
    }).catch(() => {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    })
  }
})