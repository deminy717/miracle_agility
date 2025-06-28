Page({
  data: {
    clubInfo: {
      logo: '/static/images/logo.png',
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
    ],
    isLoaded: false // 添加加载状态标记
  },

  onLoad() {
    console.log('主页加载完成')
    this.loadNews()
  },

  onShow() {
    // 只有在页面已经加载过的情况下才刷新数据（从其他页面返回时）
    if (this.data.isLoaded) {
      console.log('主页显示，从其他页面返回，刷新资讯数据')
      this.loadNews()
    } else {
      console.log('主页显示，首次加载，跳过刷新')
    }
  },

  // 加载最新资讯
  loadNews() {
    console.log('开始加载资讯数据')
    wx.showLoading({
      title: '加载中...'
    })
    
    setTimeout(() => {
      // 尝试从全局获取最新文章
      const app = getApp()
      let latestArticles = []
      
      console.log('检查全局数据:', app.globalData)
      
      if (app.globalData && app.globalData.latestArticles && app.globalData.latestArticles.length > 0) {
        latestArticles = app.globalData.latestArticles
        console.log('使用全局数据中的文章:', latestArticles.length, '篇')
      } else {
        // 如果全局数据中没有文章或文章数组为空，使用本地模拟数据
        console.log('全局数据中没有文章或文章数组为空，使用本地模拟数据')
        latestArticles = [
          {
            id: 1,
            title: '春季敏捷训练营即将开始！',
            summary: '为期6周的专业训练课程，让您的爱犬掌握基础敏捷技能，提升协调性和反应速度。',
            cover: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=120&h=120&fit=crop',
            publishTime: new Date('2024-03-15').getTime(),
            readCount: 128
          },
          {
            id: 2,
            title: '全国犬敏捷大赛报名开启',
            summary: '比赛将于4月20日在北京举行，欢迎各级别选手参与，丰厚奖品等你来拿！',
            cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop',
            publishTime: new Date('2024-03-12').getTime(),
            readCount: 86
          },
          {
            id: 3,
            title: '新会员福利：免费体验课程',
            summary: '加入俱乐部即可获得一次免费体验课程，让您和爱犬零距离感受敏捷训练的乐趣。',
            cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=120&h=120&fit=crop',
            publishTime: new Date('2024-03-10').getTime(),
            readCount: 203
          }
        ]
        
        // 将数据保存到全局，供后续使用
        if (!app.globalData) {
          app.globalData = {}
        }
        app.globalData.latestArticles = latestArticles
        console.log('已将模拟数据保存到全局')
      }
      
      // 格式化数据以适应首页展示
      const formattedNews = latestArticles.map(article => ({
        id: article.id,
        title: article.title,
        content: article.summary,
        image: article.cover,
        date: new Date(article.publishTime).toISOString().split('T')[0],
        likes: article.readCount
      }))
      
      console.log('格式化后的资讯数据:', formattedNews.length, '条')
      
      this.setData({
        newsList: formattedNews,
        isLoaded: true
      })
      
      console.log('资讯数据加载完成，页面数据已更新')
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

  // Logo加载失败处理
  onLogoError(e) {
    console.error('Logo加载失败:', e.detail)
    const currentLogo = this.data.clubInfo.logo
    
    // 多重备用方案
    if (currentLogo === '/static/images/logo.png') {
      // 第一次失败，尝试使用PNG格式
      console.log('尝试使用PNG格式logo')
      this.setData({
        'clubInfo.logo': '/static/images/logo.png'
      })
    } else if (currentLogo === '/static/images/logo.png') {
      // 第二次失败，使用网络备用图片
      console.log('使用网络备用图片')
      this.setData({
        'clubInfo.logo': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop'
      })
    } else {
      // 最后的备用方案，使用默认头像
      console.log('使用默认图片')
      this.setData({
        'clubInfo.logo': '/static/images/default-avatar.png'
      })
      wx.showToast({
        title: 'Logo加载失败',
        icon: 'none',
        duration: 1500
      })
    }
  },

  // Logo加载成功处理
  onLogoLoad(e) {
    console.log('Logo加载成功:', e.detail)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadNews()
    wx.stopPullDownRefresh()
  }
}) 