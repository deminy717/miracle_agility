const request = require('../../../api/request')

Page({
  data: {
    courseList: [],
    searchKeyword: '',
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasMore: true,
    loading: false,
    loadingMore: false
  },

  onLoad: function (options) {
    this.loadCourseList()
  },

  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      courseList: [],
      hasMore: true
    })
    this.loadCourseList()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  /**
   * 加载课程列表
   */
  async loadCourseList(isLoadMore = false) {
    if (!isLoadMore) {
      this.setData({ loading: true })
    }

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({
          title: '请先登录管理后台',
          icon: 'none'
        })
        return
      }

      const params = {
        page: this.data.currentPage,
        size: this.data.pageSize,
        keyword: this.data.searchKeyword
      }

      const result = await request.get('/admin/content/courses', params, {
        'Admin-Token': adminToken
      })

      const { list, total } = result.body || { list: [], total: 0 }
      
      // 格式化数据
      const formattedList = list.map(item => ({
        ...item,
        createTime: this.formatTime(item.createTime)
      }))

      if (isLoadMore) {
        this.setData({
          courseList: [...this.data.courseList, ...formattedList],
          hasMore: list.length === this.data.pageSize,
          loadingMore: false
        })
      } else {
        this.setData({
          courseList: formattedList,
          totalCount: total,
          hasMore: list.length === this.data.pageSize,
          loading: false
        })
        // 停止下拉刷新
        wx.stopPullDownRefresh()
      }

    } catch (error) {
      console.error('加载课程列表失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      this.setData({ 
        loading: false,
        loadingMore: false
      })
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.setData({
      currentPage: 1,
      courseList: [],
      hasMore: true
    })
    this.loadCourseList()
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({
        currentPage: this.data.currentPage + 1,
        loadingMore: true
      })
      this.loadCourseList(true)
    }
  },

  /**
   * 跳转到创建页面
   */
  goToCreate() {
    wx.navigateTo({
      url: '/pages/admin/course/create'
    })
  },

  /**
   * 跳转到详情页面
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/course/detail?id=${id}`
    })
  },

  /**
   * 编辑课程
   */
  editCourse(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/course/edit?id=${id}`
    })
  },

  /**
   * 删除课程
   */
  deleteCourse(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.courseList.find(c => c.id === id)
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除课程《${item.title}》吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.performDelete(id)
        }
      }
    })
  },

  /**
   * 执行删除操作
   */
  async performDelete(id) {
    try {
      const adminToken = wx.getStorageSync('adminToken')
      
      await request.delete(`/admin/content/courses/${id}`, {}, {
        'Admin-Token': adminToken
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })

      // 重新加载列表
      this.setData({
        currentPage: 1,
        courseList: [],
        hasMore: true
      })
      this.loadCourseList()

    } catch (error) {
      console.error('删除课程失败:', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }
}) 