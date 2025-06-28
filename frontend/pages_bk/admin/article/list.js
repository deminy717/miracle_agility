const request = require('../../../api/request')

Page({
  data: {
    articles: [],
    searchKeyword: '',
    loading: false,
    loadingMore: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10
  },

  onLoad: function (options) {
    this.loadArticles()
  },

  /**
   * 加载文章列表
   */
  async loadArticles(isLoadMore = false) {
    if (!isLoadMore) {
      this.setData({ loading: true })
    } else {
      this.setData({ loadingMore: true })
    }

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({
          title: '请先登录管理后台',
          icon: 'none'
        })
        wx.navigateBack()
        return
      }

      const params = {
        page: isLoadMore ? this.data.currentPage + 1 : 1,
        size: this.data.pageSize
      }

      if (this.data.searchKeyword) {
        params.keyword = this.data.searchKeyword
      }

      const result = await request.get('/admin/content/articles', params, {
        'Admin-Token': adminToken
      })

      const newArticles = result.records || []
      
      this.setData({
        articles: isLoadMore ? [...this.data.articles, ...newArticles] : newArticles,
        hasMore: newArticles.length === this.data.pageSize,
        currentPage: params.page,
        loading: false,
        loadingMore: false
      })

    } catch (error) {
      console.error('加载文章列表失败:', error)
      this.setData({ 
        loading: false, 
        loadingMore: false 
      })
      
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
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
      hasMore: true
    })
    this.loadArticles()
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadArticles(true)
    }
  },

  /**
   * 创建文章
   */
  createArticle() {
    wx.navigateTo({
      url: '/pages/admin/article/create'
    })
  },

  /**
   * 编辑文章
   */
  editArticle(e) {
    const articleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/article/edit?id=${articleId}`
    })
  },

  /**
   * 删除文章
   */
  async deleteArticle(e) {
    const articleId = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title

    const result = await wx.showModal({
      title: '确认删除',
      content: `确定要删除文章"${title}"吗？此操作不可恢复。`
    })

    if (!result.confirm) {
      return
    }

    try {
      const adminToken = wx.getStorageSync('adminToken')
      await request.delete(`/admin/content/articles/${articleId}`, {}, {
        'Admin-Token': adminToken
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })

      // 重新加载列表
      this.setData({
        currentPage: 1,
        hasMore: true
      })
      this.loadArticles()

    } catch (error) {
      console.error('删除文章失败:', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      hasMore: true
    })
    
    this.loadArticles().then(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 