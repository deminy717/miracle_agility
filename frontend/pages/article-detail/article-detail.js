// pages/article-detail/article-detail.js

Page({
  data: {
    article: null,
    loading: true,
    isLiked: false,
    isCollected: false,
    relatedArticles: [],
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
        likeCount: 56,
        content: `<p>春季是狗狗训练的黄金季节，气温适宜，户外活动增多。我们特别推出为期6周的春季敏捷训练营，帮助您的爱犬掌握基础敏捷技能。</p>

<h3>训练内容包括：</h3>
<p>• 基础障碍跨越训练<br/>
• 隧道穿越技巧<br/>
• 跳圈动作练习<br/>
• 平衡木行走<br/>
• 转向和急停训练</p>

<h3>适合对象：</h3>
<p>6个月以上，身体健康的各种犬类，特别适合边牧、拉布拉多、金毛等活泼犬种。</p>

<h3>训练时间：</h3>
<p>每周2次课程，每次90分钟，小班制教学（最多6只狗狗）。</p>

<p>现在报名享受早鸟优惠，欢迎咨询！</p>`
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
        likeCount: 42,
        content: `<p>2024年全国犬敏捷大赛将于4月20日在北京奥林匹克森林公园举行，本次比赛设置初级组、中级组和高级组三个级别。</p>

<h3>比赛信息：</h3>
<p>• 比赛时间：4月20-21日<br/>
• 比赛地点：北京奥林匹克森林公园<br/>
• 报名截止：4月10日<br/>
• 参赛费用：每组别200元</p>

<h3>奖项设置：</h3>
<p>各组别前三名将获得奖杯和奖金，所有参赛选手都有纪念品。</p>

<h3>报名方式：</h3>
<p>请联系俱乐部工作人员或在线填写报名表格。</p>`
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
        likeCount: 38,
        content: `<p>为了让更多爱狗人士了解犬敏捷运动的魅力，我们推出了新会员免费体验课程活动。</p>

<h3>体验内容：</h3>
<p>• 专业教练一对一指导<br/>
• 基础敏捷设备体验<br/>
• 狗狗适应性评估<br/>
• 个性化训练建议</p>

<h3>福利详情：</h3>
<p>新注册会员可免费参加一次60分钟的体验课程，课程价值150元。</p>

<h3>预约方式：</h3>
<p>关注我们的微信公众号，发送"体验课程"即可预约。</p>`
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
        likeCount: 28,
        content: `<p>敏捷训练需要专业的装备支持，包括障碍物、隧道、跳环等。初学者可以从基础装备开始，随着训练水平的提高逐步添置更专业的设备。</p>

<h3>基础装备推荐：</h3>
<p>• <strong>跳杆组合</strong>：高度可调节，适合不同体型的狗狗<br/>
• <strong>训练隧道</strong>：软质材料，安全可靠<br/>
• <strong>轮胎跳</strong>：培养狗狗的跳跃准确性<br/>
• <strong>独木桥</strong>：锻炼平衡能力</p>

<h3>选择要点：</h3>
<p>1. <strong>安全第一</strong>：选择圆滑无棱角的设备<br/>
2. <strong>尺寸适配</strong>：根据狗狗体型选择合适规格<br/>
3. <strong>材质考虑</strong>：耐用且易清洁的材料<br/>
4. <strong>便携性</strong>：方便收纳和运输</p>

<p>建议新手先购买基础套装，在专业教练指导下逐步学习使用。</p>`
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
        likeCount: 34,
        content: `<p>犬敏捷是一项高强度的运动，对狗狗的身体素质要求较高。在训练过程中，需要注意保护爱犬的关节，特别是肩部和髋部关节。</p>

<h3>常见健康问题：</h3>
<p>• <strong>关节磨损</strong>：长期高强度训练可能导致关节提前老化<br/>
• <strong>肌肉拉伤</strong>：热身不充分或动作不当引起<br/>
• <strong>爪垫损伤</strong>：在粗糙地面训练造成<br/>
• <strong>疲劳过度</strong>：训练强度过大导致</p>

<h3>预防措施：</h3>
<p>1. <strong>充分热身</strong>：每次训练前进行10-15分钟热身<br/>
2. <strong>循序渐进</strong>：逐步增加训练强度和难度<br/>
3. <strong>定期检查</strong>：观察狗狗的步态和精神状态<br/>
4. <strong>营养补充</strong>：适当补充关节保健品</p>

<p>如发现异常，应立即停止训练并咨询兽医。</p>`
      }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.loadArticle(parseInt(options.id));
      this.loadRelatedArticles(parseInt(options.id));
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.article?.title || '犬敏捷俱乐部文章',
      path: `/pages/article-detail/article-detail?id=${this.data.article?.id}`
    };
  },

  // 加载文章详情
  loadArticle(articleId) {
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(() => {
      const article = this.data.allArticles.find(item => item.id === articleId);
      
      if (article) {
        // 格式化时间
        const formattedArticle = {
          ...article,
          publishTime: this.formatTime(article.publishTime)
        };
        
        this.setData({
          article: formattedArticle,
          loading: false
        });
        
        // 模拟增加阅读量
        article.readCount++;
        
        console.log('文章加载成功:', formattedArticle);
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: '文章不存在',
          icon: 'none'
        });
      }
      
      wx.hideLoading();
    }, 500);
  },

  // 加载相关文章
  loadRelatedArticles(articleId) {
    // 获取除当前文章外的其他文章作为相关文章
    const relatedArticles = this.data.allArticles
      .filter(item => item.id !== articleId)
      .slice(0, 2); // 只取前2篇作为相关文章

    this.setData({
      relatedArticles: relatedArticles
    });
  },



  // 点赞/取消点赞
  toggleLike() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const newLikedState = !this.data.isLiked;
    const likeCountChange = newLikedState ? 1 : -1;

    this.setData({
      isLiked: newLikedState,
      'article.likeCount': this.data.article.likeCount + likeCountChange
    });

    wx.showToast({
      title: newLikedState ? '已点赞' : '已取消点赞',
      icon: 'success'
    });

    wx.vibrateShort();
  },

  // 收藏/取消收藏
  toggleCollect() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const newCollectedState = !this.data.isCollected;

    this.setData({
      isCollected: newCollectedState
    });

    wx.showToast({
      title: newCollectedState ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 跳转相关文章
  goToRelatedArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/pages/article-detail/article-detail?id=${articleId}`
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}); 