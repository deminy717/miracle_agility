Page({
  data: {
    courseId: null,
    courseInfo: {},
    chapters: [],
    loading: true
  },

  onLoad(options) {
    console.log('章节管理页面加载', options);
    if (options.courseId) {
      this.setData({
        courseId: options.courseId
      });
      this.loadCourseInfo();
      this.loadChapters();
    }
  },

  // 加载课程信息
  loadCourseInfo() {
    // 模拟获取课程信息
    const mockCourseInfo = {
      id: this.data.courseId,
      title: '犬类敏捷训练基础课程',
      cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      description: '从零开始学习犬类敏捷训练的基础知识和技巧',
      studentCount: 128,
      status: 'published'
    };

    this.setData({
      courseInfo: mockCourseInfo
    });
  },

  // 加载章节列表
  loadChapters() {
    wx.showLoading({
      title: '加载中...'
    });

    // 模拟章节数据
    const mockChapters = [
      {
        id: 1,
        title: '敏捷训练入门',
        description: '了解敏捷训练的基本概念和准备工作',
        lessonCount: 5,
        duration: 45,
        status: 'published',
        order: 1,
        createTime: '2024-01-15'
      },
      {
        id: 2,
        title: '基础障碍训练',
        description: '学习基本的障碍物训练技巧',
        lessonCount: 8,
        duration: 60,
        status: 'published',
        order: 2,
        createTime: '2024-01-16'
      },
      {
        id: 3,
        title: '高级技巧训练',
        description: '掌握更复杂的敏捷训练技巧',
        lessonCount: 6,
        duration: 50,
        status: 'draft',
        order: 3,
        createTime: '2024-01-17'
      }
    ];

    setTimeout(() => {
      this.setData({
        chapters: mockChapters,
        loading: false
      });
      wx.hideLoading();
    }, 1000);
  },

  // 新增章节
  addChapter() {
    wx.navigateTo({
      url: `/pages/admin/chapter-create/chapter-create?courseId=${this.data.courseId}`
    });
  },

  // 查看章节
  viewChapter(e) {
    e.stopPropagation();
    const chapter = e.currentTarget.dataset.chapter;
    console.log('查看章节:', chapter);
    // 可以跳转到章节详情页面
  },

  // 编辑章节
  editChapter(e) {
    e.stopPropagation();
    const chapterId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/chapter-edit/chapter-edit?chapterId=${chapterId}&courseId=${this.data.courseId}`
    });
  },

  // 管理课时
  manageLessons(e) {
    e.stopPropagation();
    const chapterId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/lesson-manage/lesson-manage?chapterId=${chapterId}&courseId=${this.data.courseId}`
    });
  },

  // 移动章节
  moveChapter(e) {
    e.stopPropagation();
    const chapterId = e.currentTarget.dataset.id;
    const direction = e.currentTarget.dataset.direction;
    
    const chapters = [...this.data.chapters];
    const currentIndex = chapters.findIndex(chapter => chapter.id == chapterId);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < chapters.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }
    
    // 交换位置
    [chapters[currentIndex], chapters[newIndex]] = [chapters[newIndex], chapters[currentIndex]];
    
    // 更新排序
    chapters.forEach((chapter, index) => {
      chapter.order = index + 1;
    });
    
    this.setData({
      chapters: chapters
    });
    
    wx.showToast({
      title: '章节顺序已更新',
      icon: 'success'
    });
  },

  // 删除章节
  deleteChapter(e) {
    e.stopPropagation();
    const chapterId = e.currentTarget.dataset.id;
    const chapter = this.data.chapters.find(item => item.id == chapterId);
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除章节"${chapter.title}"吗？删除后不可恢复。`,
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteChapter(chapterId);
        }
      }
    });
  },

  // 执行删除章节
  performDeleteChapter(chapterId) {
    wx.showLoading({
      title: '删除中...'
    });

    // 模拟API调用
    setTimeout(() => {
      const chapters = this.data.chapters.filter(chapter => chapter.id != chapterId);
      
      // 重新排序
      chapters.forEach((chapter, index) => {
        chapter.order = index + 1;
      });
      
      this.setData({
        chapters: chapters
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadChapters();
    wx.stopPullDownRefresh();
  },

  // 页面显示时刷新数据
  onShow() {
    if (this.data.courseId) {
      this.loadChapters();
    }
  }
})