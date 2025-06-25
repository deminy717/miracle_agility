const request = require('../../../api/request')

Page({
  data: {
    articleId: null,
    article: null,
    tagList: [],
    loading: true
  },

  onLoad: function (options) {
    const { id } = options
    if (id) {
      this.setData({ articleId: id })
      this.loadArticleDetail(id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 加载文章详情
   */
  async loadArticleDetail(id) {
    this.setData({ loading: true })

    try {
      const adminToken = wx.getStorageSync('adminToken')
      if (!adminToken) {
        wx.showToast({
          title: '请先登录管理后台',
          icon: 'none'
        })
        return
      }

      const result = await request.get(`/admin/content/articles/${id}`, {}, {
        'Admin-Token': adminToken
      })

      const article = result.body
      // 处理标签
      const tagList = article.tags ? article.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      
      this.setData({
        article: {
          ...article,
          createTime: this.formatTime(article.createTime)
        },
        tagList,
        loading: false
      })

    } catch (error) {
      console.error('加载文章详情失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      this.setData({ 
        loading: false,
        article: null
      })
    }
  },

  /**
   * 编辑文章
   */
  editArticle() {
    wx.navigateTo({
      url: `/pages/admin/article/edit?id=${this.data.articleId}`
    })
  },

  /**
   * 删除文章
   */
  deleteArticle() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除文章《${this.data.article.title}》吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.performDelete()
        }
      }
    })
  },

  /**
   * 执行删除操作
   */
  async performDelete() {
    try {
      const adminToken = wx.getStorageSync('adminToken')
      
      await request.delete(`/admin/content/articles/${this.data.articleId}`, {}, {
        'Admin-Token': adminToken
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })

      // 延迟返回列表页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('删除文章失败:', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
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
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}) 