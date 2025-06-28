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
  async loadCourseInfo() {
    try {
      const api = require('../../../utils/api.js');
      const result = await api.getCourseById(this.data.courseId);
      
      console.log('获取课程详情成功:', result);
      
      this.setData({
        courseInfo: result
      });
    } catch (error) {
      console.error('获取课程详情失败:', error);
      wx.showToast({
        title: '获取课程信息失败',
        icon: 'none'
      });
    }
  },

  // 加载章节列表
  async loadChapters() {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      // 检查是否有课程ID
      if (!this.data.courseId) {
        throw new Error('课程ID不能为空');
      }
      
      console.log('正在获取课程章节列表，课程ID:', this.data.courseId);
      
      // 并行获取章节数据和课时数据
      const [chapters, allLessons] = await Promise.all([
        api.getChaptersByCourseId(this.data.courseId),
        api.getLessonsByCourseId(this.data.courseId)
      ]);
      
      console.log('获取章节列表成功:', chapters);
      console.log('获取课时列表成功:', allLessons);
      
      // 为每个章节分配对应的课时
      if (chapters && chapters.length > 0) {
        chapters.forEach(chapter => {
          // 筛选属于当前章节的课时
          const chapterLessons = allLessons ? allLessons.filter(lesson => lesson.chapterId === chapter.id) : [];
          
          // 按sortOrder排序课时
          chapterLessons.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          
          // 为每个课时添加章节内的相对位置
          chapterLessons.forEach((lesson, index) => {
            lesson.chapterLessonOrder = index + 1; // 章节内的课时序号，从1开始
          });
          
          // 将课时列表添加到章节对象中
          chapter.lessons = chapterLessons;
          chapter.lessonCount = chapterLessons.length;
          
          console.log(`章节 "${chapter.title}" 包含 ${chapterLessons.length} 个课时:`, chapterLessons);
        });
      }
      
      this.setData({
        chapters: chapters || [],
        loading: false
      });
      wx.hideLoading();
      
      // 如果没有章节，显示提示
      if (!chapters || chapters.length === 0) {
        wx.showToast({
          title: '该课程暂无章节',
          icon: 'none'
        });
      } else {
        // 统计总课时数
        const totalLessons = allLessons ? allLessons.length : 0;
        console.log(`课程总共包含 ${totalLessons} 个课时，分布在 ${chapters.length} 个章节中`);
      }
      
    } catch (error) {
      console.error('加载章节和课时列表失败:', error);
      this.setData({
        chapters: [],
        loading: false
      });
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 新增章节 - 使用简单表单
  addChapter() {
    wx.navigateTo({
      url: `/pages/admin/chapter-create/chapter-create?courseId=${this.data.courseId}&courseName=${this.data.courseInfo.title}`
    });
  },

  // 新增课时 - 跳转到课时创建页面
  addSubChapter(e) {
    const chapterId = e.currentTarget.dataset.id;
    const chapterTitle = e.currentTarget.dataset.title;
    
    console.log('新增课时:', { chapterId, chapterTitle, courseId: this.data.courseId });
    
    // 跳转到课时创建页面，传递章节信息和课程ID
    wx.navigateTo({
      url: `/pages/card-editor/card-editor?chapterId=${chapterId}&courseId=${this.data.courseId}&chapterTitle=${encodeURIComponent(chapterTitle)}&type=lesson`
    });
  },

  // 编辑章节
  editChapter(e) {
    const chapterId = e.currentTarget.dataset.id;
    const chapterTitle = e.currentTarget.dataset.title;
    
    console.log('编辑章节:', { chapterId, chapterTitle });
    
    // 跳转到章节编辑页面
    wx.navigateTo({
      url: `/pages/admin/chapter-edit/chapter-edit?chapterId=${chapterId}&courseId=${this.data.courseId}&chapterTitle=${encodeURIComponent(chapterTitle)}`
    });
  },

  // 查看章节
  viewChapter(e) {
    // 安全地停止事件冒泡
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    const chapter = e.currentTarget.dataset.chapter;
    console.log('查看章节:', chapter);
    
    // 可以跳转到章节详情页面或显示章节信息
    if (chapter) {
      wx.showToast({
        title: `点击了章节: ${chapter.title}`,
        icon: 'none'
      });
    }
  },

  // 删除章节
  deleteChapter(e) {
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
  async performDeleteChapter(chapterId) {
    wx.showLoading({
      title: '删除中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      // 调用真实的API删除章节
      await api.deleteChapter(chapterId);
      
      console.log('删除章节成功:', chapterId);
      
      // 删除成功后重新加载章节列表
      await this.loadChapters();
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('删除章节失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '删除章节失败',
        icon: 'none'
      });
    }
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
  },

  // 编辑课时
  editLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const chapterId = e.currentTarget.dataset.chapterId;
    const lessonTitle = e.currentTarget.dataset.title;
    
    // 找到对应的章节以获取章节标题
    const chapter = this.data.chapters.find(ch => ch.id == chapterId);
    const chapterTitle = chapter ? chapter.title : '';
    
    console.log('编辑课时:', { lessonId, chapterId, lessonTitle, chapterTitle, courseId: this.data.courseId });
    
    // 跳转到课时编辑页面，传递必要参数包括courseId
    wx.navigateTo({
      url: `/pages/card-editor/card-editor?lessonId=${lessonId}&chapterId=${chapterId}&courseId=${this.data.courseId}&chapterTitle=${encodeURIComponent(chapterTitle)}&type=lesson&mode=edit`
    });
  },

  // 查看课时详情
  viewLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lesson = e.currentTarget.dataset.lesson;
    
    console.log('查看课时:', lesson);
    
    // 跳转到课时详情页面
    wx.navigateTo({
      url: `/pages/lesson-detail/lesson-detail?lessonId=${lessonId}`
    });
  },

  // 删除课时
  deleteLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lessonTitle = e.currentTarget.dataset.title;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除课时"${lessonTitle}"吗？删除后不可恢复。`,
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteLesson(lessonId);
        }
      }
    });
  },

  // 执行删除课时
  async performDeleteLesson(lessonId) {
    wx.showLoading({
      title: '删除中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      // 调用API删除课时
      await api.deleteLesson(lessonId);
      
      console.log('删除课时成功:', lessonId);
      
      // 删除成功后重新加载章节列表
      await this.loadChapters();
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('删除课时失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '删除课时失败',
        icon: 'none'
      });
    }
  },

  // 发布课时
  publishLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const lessonTitle = e.currentTarget.dataset.title;
    
    wx.showModal({
      title: '确认发布',
      content: `确定要发布课时"${lessonTitle}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performPublishLesson(lessonId);
        }
      }
    });
  },

  // 执行发布课时
  async performPublishLesson(lessonId) {
    wx.showLoading({
      title: '发布中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      // 调用API发布课时
      await api.publishLesson(lessonId);
      
      console.log('发布课时成功:', lessonId);
      
      // 发布成功后重新加载章节列表
      await this.loadChapters();
      
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('发布课时失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '发布课时失败',
        icon: 'none'
      });
    }
  }
})