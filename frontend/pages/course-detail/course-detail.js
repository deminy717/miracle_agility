Page({
  data: {
    courseId: null,
    courseInfo: {},
    chapters: [],
    isAdminView: false // 是否为后台管理页面视图
  },

  onLoad(options) {
    const courseId = options.id
    const isAdminView = options.admin === 'true' // 通过admin参数判断是否为后台管理页面
    this.setData({ 
      courseId,
      isAdminView 
    })
    console.log('课程详情页面加载:', { courseId, isAdminView })
    this.loadCourseDetail()
    this.loadChapters()
  },

  // 加载课程详情
  async loadCourseDetail() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const api = require('../../utils/api.js');
      const result = await api.getCourseById(this.data.courseId);
      
      console.log('获取课程详情成功:', result);
      
      // 将后端数据适配到前端格式
      const courseInfo = {
        id: result.id,
        title: result.title,
        description: result.description,
        image: result.cover,
        duration: `${result.durationMinutes || 0}分钟`,
        students: result.studentCount || 0,
        progress: 0, // 进度暂时设为0，需要后续开发
        completedLessons: 0, // 暂时设为0
        totalLessons: result.chapterCount || 0,
        category: result.category,
        level: result.level,
        price: result.price,
        status: result.status,
        teacherName: result.teacherName
      };
      
      this.setData({
        courseInfo: courseInfo
      });
      
      wx.hideLoading();
    } catch (error) {
      console.error('获取课程详情失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      
      // 失败后返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  // 加载章节列表
  async loadChapters() {
    try {
      const api = require('../../utils/api.js');
      
      // 检查是否有课程ID
      if (!this.data.courseId) {
        console.warn('课程ID不存在，无法加载章节');
        return;
      }
      
      const { courseId, isAdminView } = this.data;
      console.log('正在获取课程章节列表，课程ID:', courseId, '管理页面视图:', isAdminView);
      
      // 根据页面类型选择不同的API
      let chapters, allLessons;
      if (isAdminView) {
        // 后台管理页面：获取所有章节和课时（包括草稿状态）
        console.log('管理页面：获取所有章节和课时');
        [chapters, allLessons] = await Promise.all([
          api.getChaptersByCourseId(courseId),
          api.getLessonsByCourseId(courseId)
        ]);
      } else {
        // 前台用户页面：只获取已发布的章节和课时
        console.log('用户页面：获取已发布的章节和课时');
        [chapters, allLessons] = await Promise.all([
          api.getPublishedChaptersByCourseId(courseId),
          api.getPublishedLessonsByCourseId(courseId)
        ]);
      }
      
      console.log('获取章节列表成功:', chapters);
      console.log('获取课时列表成功:', allLessons);
      
      // 为每个章节分配对应的课时
      if (chapters && chapters.length > 0) {
        chapters.forEach(chapter => {
          // 筛选属于当前章节的课时
          const chapterLessons = allLessons ? allLessons.filter(lesson => lesson.chapterId === chapter.id) : [];
          
          // 按sortOrder排序课时
          chapterLessons.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          
          // 为课时添加显示格式
          chapterLessons.forEach((lesson, index) => {
            lesson.chapterLessonOrder = index + 1; // 章节内的课时序号
            lesson.duration = lesson.durationMinutes ? `${lesson.durationMinutes}分钟` : '时长未设置';
            lesson.type = '视频课程'; // 临时设置，后续可根据课时类型调整
            
            // 设置课时学习状态（暂时都设为pending，后续可根据用户学习进度调整）
            lesson.status = 'pending'; // pending, current, completed
          });
          
          // 将课时列表添加到章节对象中
          chapter.lessons = chapterLessons;
          chapter.totalLessons = chapterLessons.length;
          chapter.completedLessons = 0; // 暂时设为0，后续可根据用户学习进度计算
          chapter.expanded = false; // 默认不展开
          
          console.log(`章节 "${chapter.title}" 包含 ${chapterLessons.length} 个课时:`, chapterLessons);
        });
      }
      
      this.setData({
        chapters: chapters || []
      });
      
      // 如果没有章节，显示提示（但不用Toast，因为这是正常情况）
      if (!chapters || chapters.length === 0) {
        console.log('该课程暂无章节');
      } else {
        // 统计总课时数
        const totalLessons = allLessons ? allLessons.length : 0;
        console.log(`课程总共包含 ${totalLessons} 个课时，分布在 ${chapters.length} 个章节中`);
      }
      
    } catch (error) {
      console.error('加载章节列表失败:', error);
      this.setData({
        chapters: []
      });
      // 在课程详情页不显示章节加载失败的Toast，因为可能会干扰用户体验
    }
  },

  // 切换章节展开/收起
  toggleChapter(e) {
    const chapterId = e.currentTarget.dataset.id
    const chapters = this.data.chapters.map(chapter => {
      if (chapter.id == chapterId) {
        return { ...chapter, expanded: !chapter.expanded }
      }
      return chapter
    })
    
    this.setData({ chapters })
  },

  // 点击课程内容
  onLessonClick(e) {
    const lessonId = e.currentTarget.dataset.id
    
    console.log('点击课时，lessonId:', lessonId);
    
    // 跳转到课时详情页面
    wx.navigateTo({
      url: `/pages/lesson-detail/lesson-detail?lessonId=${lessonId}`
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  }
}) 