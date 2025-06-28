Page({

  /**
   * 页面的初始数据
   */
  data: {
    lessonId: null,
    lessonInfo: {},
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('课时详情页面参数:', options);
    
    if (options.lessonId) {
      this.setData({
        lessonId: options.lessonId
      });
      this.loadLessonDetail();
    } else {
      wx.showToast({
        title: '课时ID无效',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载课时详情
   */
  async loadLessonDetail() {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      const api = require('../../utils/api.js');
      
      // 调用API获取课时详情
      const lessonInfo = await api.getLessonById(this.data.lessonId);
      
      console.log('课时详情:', lessonInfo);
      
      // 如果课时有章节ID，获取该章节的所有课时来计算相对位置
      if (lessonInfo && lessonInfo.chapterId) {
        try {
          const chapterLessons = await api.getLessonsByChapterId(lessonInfo.chapterId);
          
          // 按sortOrder排序
          chapterLessons.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          
          // 找到当前课时在章节中的位置
          const lessonIndex = chapterLessons.findIndex(lesson => lesson.id === lessonInfo.id);
          if (lessonIndex !== -1) {
            lessonInfo.chapterLessonOrder = lessonIndex + 1;
          } else {
            lessonInfo.chapterLessonOrder = lessonInfo.sortOrder || 1;
          }
          
          console.log(`课时在章节中的位置: ${lessonInfo.chapterLessonOrder}`);
        } catch (chapterError) {
          console.warn('获取章节课时列表失败，使用原始sortOrder:', chapterError);
          lessonInfo.chapterLessonOrder = lessonInfo.sortOrder || 1;
        }
      } else {
        lessonInfo.chapterLessonOrder = lessonInfo.sortOrder || 1;
      }
      
      this.setData({
        lessonInfo: lessonInfo,
        loading: false
      });
      
      wx.hideLoading();
      
    } catch (error) {
      console.error('加载课时详情失败:', error);
      
      // 如果API调用失败，使用模拟数据进行演示
      const mockLessonInfo = this.generateMockLessonData();
      
      wx.hideLoading();
      wx.showToast({
        title: '使用演示数据',
        icon: 'none',
        duration: 1500
      });
      
      this.setData({
        lessonInfo: mockLessonInfo,
        loading: false
      });
    }
  },

  /**
   * 生成模拟课时数据
   */
  generateMockLessonData() {
    return {
      id: this.data.lessonId || 1,
      title: '犬敏捷基础动作训练',
      description: '本课时将详细介绍犬敏捷训练的基础动作，包括直线行走、转弯技巧和基本障碍物训练。通过系统性的训练方法，帮助您的爱犬掌握敏捷运动的基本技能。',
      status: 'published',
      durationMinutes: 45,
      lessonCardCount: 5,
      sortOrder: 1,
      chapterLessonOrder: 2, // 假设这是章节内的第2个课时
      lessonCards: [
        {
          id: 1,
          cardType: 'text',
          title: '课程介绍',
          content: '犬敏捷训练是一项非常有趣且具有挑战性的运动。它不仅能够增强狗狗的身体素质，还能提高狗狗与主人之间的配合默契度。在本课时中，我们将从最基础的动作开始，逐步引导您的爱犬进入敏捷训练的世界。\n\n训练过程中，请保持耐心和积极的态度。每只狗狗的学习能力和适应速度都不同，重要的是要根据自己狗狗的特点来调整训练方法和进度。',
          sortOrder: 1,
          status: 'active'
        },
        {
          id: 2,
          cardType: 'highlight',
          title: '训练要点',
          highlightPoints: [
            '保持积极正面的训练态度，多使用奖励机制',
            '训练时间不宜过长，建议每次15-20分钟',
            '确保训练环境安全，移除可能造成伤害的物品',
            '根据狗狗的体型和能力调整训练强度',
            '训练前进行充分的热身活动'
          ],
          sortOrder: 2,
          status: 'active'
        },
        {
          id: 3,
          cardType: 'video',
          title: '基础动作演示',
          videoUrl: 'https://example.com/lesson-video.mp4',
          videoDuration: '8分30秒',
          videoViews: '1,234次观看',
          videoThumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
          sortOrder: 3,
          status: 'active'
        },
        {
          id: 4,
          cardType: 'image',
          title: '训练场地布置',
          imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
          imageDescription: '标准的犬敏捷训练场地布置示意图，包含基础障碍物的摆放位置和安全距离要求。',
          sortOrder: 4,
          status: 'active'
        },
        {
          id: 5,
          cardType: 'text',
          title: '课后练习',
          content: '完成本课时学习后，请按照以下步骤进行练习：\n\n1. 选择一个安全、宽敞的场地\n2. 准备好训练用的奖励食物\n3. 从最简单的直线行走开始练习\n4. 每天练习时间控制在15-20分钟\n5. 记录狗狗的进步情况\n\n记住，耐心是训练成功的关键。如果狗狗在某个动作上遇到困难，不要急于求成，可以降低难度或者暂停训练，给狗狗一些休息时间。',
          sortOrder: 5,
          status: 'active'
        }
      ]
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadLessonDetail();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.lessonInfo.title || '课时内容',
      path: `/pages/lesson-detail/lesson-detail?lessonId=${this.data.lessonId}`
    }
  }
}) 