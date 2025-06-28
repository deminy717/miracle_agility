// pages/article-list/article-list.js

Page({
  data: {
    articles: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 5,
    categories: ['全部', '训练技巧', '赛事资讯', '健康护理', '装备推荐', '新手指南'],
    activeCategory: '全部',
    allArticles: [
      {
        id: 1,
        title: '春季敏捷训练营即将开始！',
        summary: '为期6周的专业训练课程，让您的爱犬掌握基础敏捷技能，提升协调性和反应速度。',
        cover: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=500&h=300&fit=crop',
        category: '训练技巧',
        author: '张教练',
        publishTime: new Date('2024-03-15').getTime(),
        readCount: 328,
        content: '春季是狗狗训练的黄金季节，气温适宜，户外活动增多。我们特别推出为期6周的春季敏捷训练营，帮助您的爱犬掌握基础敏捷技能...'
      },
      {
        id: 2,
        title: '全国犬敏捷大赛报名开启',
        summary: '比赛将于4月20日在北京举行，欢迎各级别选手参与，丰厚奖品等你来拿！',
        cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=300&fit=crop',
        category: '赛事资讯',
        author: '赛事组委会',
        publishTime: new Date('2024-03-12').getTime(),
        readCount: 286,
        content: '2024年全国犬敏捷大赛将于4月20日在北京奥林匹克森林公园举行，本次比赛设置初级组、中级组和高级组三个级别...'
      },
      {
        id: 3,
        title: '新会员福利：免费体验课程',
        summary: '加入俱乐部即可获得一次免费体验课程，让您和爱犬零距离感受敏捷训练的乐趣。',
        cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=300&fit=crop',
        category: '新手指南',
        author: '会员部',
        publishTime: new Date('2024-03-10').getTime(),
        readCount: 203,
        content: '为了让更多爱狗人士了解犬敏捷运动的魅力，我们推出了新会员免费体验课程活动。专业教练一对一指导，基础敏捷设备体验，狗狗适应性评估，个性化训练建议。新注册会员可免费参加一次60分钟的体验课程，课程价值150元。'
      },
      {
        id: 4,
        title: '如何选择适合的敏捷训练装备',
        summary: '不同的训练阶段需要不同的装备，本文为您详细介绍各类敏捷训练装备的选择要点。',
        cover: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&h=300&fit=crop',
        category: '装备推荐',
        author: '李装备师',
        publishTime: new Date('2024-03-08').getTime(),
        readCount: 176,
        content: '敏捷训练需要专业的装备支持，包括障碍物、隧道、跳环等。初学者可以从基础装备开始，随着训练水平的提高逐步添置更专业的设备。基础装备推荐：跳杆组合、训练隧道、轮胎跳、独木桥等。选择要点：安全第一、尺寸适配、材质考虑、便携性。'
      },
      {
        id: 5,
        title: '犬敏捷训练中常见的健康问题及预防',
        summary: '训练过程中如何保护爱犬的关节健康，预防运动损伤，延长运动寿命。',
        cover: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&h=300&fit=crop',
        category: '健康护理',
        author: '王兽医',
        publishTime: new Date('2024-03-05').getTime(),
        readCount: 245,
        content: '犬敏捷是一项高强度的运动，对狗狗的身体素质要求较高。在训练过程中，需要注意保护爱犬的关节，特别是肩部和髋部关节。常见健康问题：关节磨损、肌肉拉伤、爪垫损伤、疲劳过度。预防措施：充分热身、循序渐进、定期检查、营养补充。'
      },
      {
        id: 6,
        title: '边牧犬敏捷训练技巧分享',
        summary: '边牧是敏捷比赛的明星犬种，本文分享如何发挥边牧的天赋优势进行高效训练。',
        cover: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=500&h=300&fit=crop',
        category: '训练技巧',
        author: '边牧专家',
        publishTime: new Date('2024-03-03').getTime(),
        readCount: 312,
        content: '边牧犬是敏捷比赛中的佼佼者，其高智商、强体力和服从性使其成为理想的敏捷犬。训练边牧时，可以充分利用其对视觉信号的敏感度...'
      },
      {
        id: 7,
        title: '2024年国际犬敏捷规则更新解读',
        summary: '国际犬敏捷联合会发布新规则，比赛评分标准和场地设置有重要变化。',
        cover: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=300&fit=crop',
        category: '赛事资讯',
        author: '规则委员会',
        publishTime: new Date('2024-02-28').getTime(),
        readCount: 198,
        content: '国际犬敏捷联合会于2024年2月发布了新版比赛规则，主要变化包括障碍物间距的调整、评分标准的细化以及新增的安全要求...'
      },
      {
        id: 8,
        title: '小型犬敏捷训练指南',
        summary: '小型犬在敏捷训练中有哪些优势和注意事项？如何为小型犬设计专属训练计划？',
        cover: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=300&fit=crop',
        category: '训练技巧',
        author: '小型犬训练师',
        publishTime: new Date('2024-02-25').getTime(),
        readCount: 167,
        content: '小型犬在敏捷训练中具有转弯灵活、加速快的优势，但也面临跳跃高度和设备尺寸的挑战。本文将为小型犬主人提供专属训练建议...'
      },
      {
        id: 9,
        title: '夏季犬敏捷训练的注意事项',
        summary: '高温天气如何安排训练时间，防止中暑，确保训练效果和安全。',
        cover: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=500&h=300&fit=crop',
        category: '健康护理',
        author: '季节训练专家',
        publishTime: new Date('2024-02-20').getTime(),
        readCount: 221,
        content: '夏季是犬敏捷训练的挑战季节，高温可能导致狗狗中暑和体力不支。建议将训练时间安排在清晨或傍晚，确保场地有遮阳和充足的饮水...'
      },
      {
        id: 10,
        title: '从零开始：犬敏捷入门指南',
        summary: '没有任何经验的新手如何开始犬敏捷训练？需要准备什么，从哪些基础动作练起？',
        cover: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500&h=300&fit=crop',
        category: '新手指南',
        author: '新手引导员',
        publishTime: new Date('2024-02-15').getTime(),
        readCount: 356,
        content: '犬敏捷看起来复杂，但实际上可以从简单的基础训练开始。首先需要建立良好的沟通和信任关系，然后从基础的注意力训练和简单指令开始...'
      }
    ]
  },

  onLoad() {
    this.loadArticles();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      articles: [],
      hasMore: true
    });
    this.loadArticles();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadArticles();
    }
  },

  // 加载文章列表
  loadArticles() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    setTimeout(() => {
      // 模拟从服务器获取数据
      let filteredArticles = this.data.allArticles;
      
      // 根据分类筛选
      if (this.data.activeCategory !== '全部') {
        filteredArticles = filteredArticles.filter(article => 
          article.category === this.data.activeCategory
        );
      }
      
      // 计算分页
      const start = (this.data.page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const currentPageArticles = filteredArticles.slice(start, end);
      
      const newArticles = this.data.page === 1 
        ? currentPageArticles 
        : [...this.data.articles, ...currentPageArticles];
      
      this.setData({
        articles: newArticles,
        hasMore: end < filteredArticles.length,
        page: this.data.page + 1,
        loading: false
      });
      
      // 将最新的三篇文章保存到全局数据，供首页使用
      if (this.data.page === 2) {
        const latestArticles = this.data.allArticles.slice(0, 3);
        const app = getApp();
        app.globalData.latestArticles = latestArticles;
      }
    }, 500); // 模拟网络延迟
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      page: 1,
      articles: [],
      hasMore: true
    });
    this.loadArticles();
  },

  // 跳转到文章详情
  goToArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${articleId}`
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${Math.floor(diff / 86400000)}天前`;
    }
  },

  // 格式化日期
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}); 