Page({
  data: {
    clubInfo: {
      logo: '/static/logo.JPG',
      name: '奇迹犬敏捷',
      description: '欢迎来到奇迹犬敏捷！我们致力于为每一位狗狗和主人提供专业的敏捷训练课程，让您的爱犬在快乐中成长，在挑战中进步。'
    },
    newsList: [
      {
        id: 1,
        title: '春季敏捷训练营即将开始！',
        content: '为期6周的专业训练课程，让您的爱犬掌握基础敏捷技能...',
        image: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=120&h=120&fit=crop',
        date: '2024-03-15',
        likes: 128
      },
      {
        id: 2,
        title: '全国犬敏捷大赛报名开启',
        content: '比赛将于4月20日在北京举行，欢迎各级别选手参与...',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop',
        date: '2024-03-12',
        likes: 86
      },
      {
        id: 3,
        title: '新会员福利：免费体验课程',
        content: '加入俱乐部即可获得一次免费体验课程，让您和爱犬零距离感受敏捷训练...',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=120&h=120&fit=crop',
        date: '2024-03-10',
        likes: 203
      }
    ]
  },

  onLoad() {
    console.log('主页加载完成')
    this.loadNews()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadNews()
  },

  // 加载最新资讯
  loadNews() {
    wx.showLoading({
      title: '加载中...'
    })
    
    setTimeout(() => {
      // 尝试从全局获取最新文章
      const app = getApp()
      if (app.globalData && app.globalData.latestArticles) {
        const latestArticles = app.globalData.latestArticles
        
        // 格式化数据以适应首页展示
        const formattedNews = latestArticles.map(article => ({
          id: article.id,
          title: article.title,
          content: article.summary,
          image: article.cover,
          date: new Date(article.publishTime).toISOString().split('T')[0],
          likes: article.readCount
        }))
        
        this.setData({
          newsList: formattedNews
        })
      }
      
      wx.hideLoading()
    }, 500)
  },

  // 点击资讯卡片
  onNewsClick(e) {
    const newsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${newsId}`
    })
  },

  // 点击点赞
  onLikeClick(e) {
    const index = e.currentTarget.dataset.index
    const newsList = this.data.newsList
    newsList[index].likes++
    
    this.setData({
      newsList: newsList
    })
    
    wx.vibrateShort()
  },

  // 跳转到文章列表
  goToArticleList() {
    wx.navigateTo({
      url: '/pages/article-list/article-list'
    });
  },

  // 跳转到富文本编辑器
  goToRichTextEditor() {
    wx.navigateTo({
      url: '/pages/rich-text-editor/rich-text-editor'
    });
  },

  // 跳转到卡片式编辑器
  goToCardEditor() {
    wx.navigateTo({
      url: '/pages/card-editor/card-editor'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadNews()
    wx.stopPullDownRefresh()
  }
}) 