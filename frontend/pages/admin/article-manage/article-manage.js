Page({
  data: {
    searchKeyword: '',
    categoryIndex: 0,
    categoryOptions: ['全部分类', '训练技巧', '赛事资讯', '健康护理', '装备推荐', '新手指南'],
    articles: [],
    filteredArticles: [],
    stats: {
      total: 0,
      published: 0,
      draft: 0
    }
  },

  onLoad() {
    this.loadArticles()
  },

  onShow() {
    this.loadArticles()
  },

  // 加载文章数据
  loadArticles() {
    wx.showLoading({ title: '加载中...' })
    
    setTimeout(() => {
      const mockArticles = [
        {
          id: 1,
          title: '犬类敏捷训练的基础技巧',
          summary: '了解犬类敏捷训练的基本要点，让您的爱犬更加灵活敏捷',
          category: '训练技巧',
          cover: '/static/images/article1.jpg',
          status: 'published',
          viewCount: 1250,
          updateTime: '2024-01-15'
        },
        {
          id: 2,
          title: '2024年全国犬类敏捷比赛规则更新',
          summary: '最新的比赛规则和评分标准，参赛选手必读',
          category: '赛事资讯',
          cover: '/static/images/article2.jpg',
          status: 'published',
          viewCount: 890,
          updateTime: '2024-01-12'
        },
        {
          id: 3,
          title: '犬类运动后的护理要点',
          summary: '运动后如何正确护理您的爱犬，避免运动伤害',
          category: '健康护理',
          cover: '/static/images/article3.jpg',
          status: 'draft',
          viewCount: 0,
          updateTime: '2024-01-10'
        },
        {
          id: 4,
          title: '敏捷训练装备选购指南',
          summary: '专业装备推荐，让训练事半功倍',
          category: '装备推荐',
          cover: '/static/images/article4.jpg',
          status: 'published',
          viewCount: 567,
          updateTime: '2024-01-08'
        }
      ]

      this.setData({
        articles: mockArticles,
        filteredArticles: mockArticles
      })

      this.updateStats()
      wx.hideLoading()
    }, 800)
  },

  // 更新统计数据
  updateStats() {
    const { articles } = this.data
    const stats = {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      draft: articles.filter(a => a.status === 'draft').length
    }
    this.setData({ stats })
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this.filterArticles()
  },

  // 分类筛选
  onCategoryFilter(e) {
    const index = e.detail.value
    this.setData({ categoryIndex: index })
    this.filterArticles()
  },

  // 筛选文章
  filterArticles() {
    const { articles, searchKeyword, categoryIndex, categoryOptions } = this.data
    let filtered = articles

    // 按关键词筛选
    if (searchKeyword.trim()) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    // 按分类筛选
    if (categoryIndex > 0) {
      const category = categoryOptions[categoryIndex]
      filtered = filtered.filter(article => article.category === category)
    }

    this.setData({ filteredArticles: filtered })
  },

  // 查看文章详情
  viewArticle(e) {
    const article = e.currentTarget.dataset.article
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${article.id}`
    })
  },

  // 编辑文章
  editArticle(e) {
    e.stopPropagation()
    const articleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/article-edit/article-edit?id=${articleId}`
    })
  },

  // 预览文章
  previewArticle(e) {
    e.stopPropagation()
    const articleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${articleId}&preview=true`
    })
  },

  // 切换发布状态
  toggleStatus(e) {
    e.stopPropagation()
    const articleId = e.currentTarget.dataset.id
    const article = this.data.articles.find(a => a.id === articleId)
    
    if (!article) return

    const newStatus = article.status === 'published' ? 'draft' : 'published'
    const actionText = newStatus === 'published' ? '发布' : '下架'

    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}这篇文章吗？`,
      success: (res) => {
        if (res.confirm) {
          this.updateArticleStatus(articleId, newStatus)
        }
      }
    })
  },

  // 更新文章状态
  updateArticleStatus(articleId, status) {
    wx.showLoading({ title: '更新中...' })
    
    setTimeout(() => {
      const articles = this.data.articles.map(article => {
        if (article.id === articleId) {
          return { ...article, status }
        }
        return article
      })

      this.setData({ articles })
      this.filterArticles()
      this.updateStats()
      
      wx.hideLoading()
      wx.showToast({
        title: status === 'published' ? '发布成功' : '已下架',
        icon: 'success'
      })
    }, 500)
  },

  // 删除文章
  deleteArticle(e) {
    e.stopPropagation()
    const articleId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这篇文章吗？',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteArticle(articleId)
        }
      }
    })
  },

  // 执行删除操作
  performDeleteArticle(articleId) {
    wx.showLoading({ title: '删除中...' })
    
    setTimeout(() => {
      const articles = this.data.articles.filter(article => article.id !== articleId)
      
      this.setData({ articles })
      this.filterArticles()
      this.updateStats()
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 500)
  },

  // 创建新文章
  createArticle() {
    wx.navigateTo({
      url: '/pages/admin/article-create/article-create'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadArticles()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})