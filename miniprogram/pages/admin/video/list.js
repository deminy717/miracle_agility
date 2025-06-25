const request = require('../../../api/request')

Page({
  data: {
    videoList: [],
    searchKeyword: '',
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasMore: true,
    loading: false,
    loadingMore: false
  },

  onLoad: function (options) {
    this.loadVideoList()
  },

  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      videoList: [],
      hasMore: true
    })
    this.loadVideoList()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  /**
   * 加载视频列表
   */
  async loadVideoList(isLoadMore = false) {
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

      const result = await request.get('/admin/content/videos', params, {
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
          videoList: [...this.data.videoList, ...formattedList],
          hasMore: list.length === this.data.pageSize,
          loadingMore: false
        })
      } else {
        this.setData({
          videoList: formattedList,
          totalCount: total,
          hasMore: list.length === this.data.pageSize,
          loading: false
        })
        // 停止下拉刷新
        wx.stopPullDownRefresh()
      }

    } catch (error) {
      console.error('加载视频列表失败:', error)
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
      videoList: [],
      hasMore: true
    })
    this.loadVideoList()
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
      this.loadVideoList(true)
    }
  },

  /**
   * 跳转到创建页面
   */
  goToCreate() {
    wx.navigateTo({
      url: '/pages/admin/video/create'
    })
  },

  /**
   * 跳转到详情页面
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/video/detail?id=${id}`
    })
  },

  /**
   * 编辑视频
   */
  editVideo(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/video/edit?id=${id}`
    })
  },

  /**
   * 删除视频
   */
  deleteVideo(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.videoList.find(v => v.id === id)
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除视频《${item.title}》吗？`,
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
      
      await request.delete(`/admin/content/videos/${id}`, {}, {
        'Admin-Token': adminToken
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })

      // 重新加载列表
      this.setData({
        currentPage: 1,
        videoList: [],
        hasMore: true
      })
      this.loadVideoList()

    } catch (error) {
      console.error('删除视频失败:', error)
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