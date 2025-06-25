Page({
  data: {
    courseId: null,
    courseInfo: {},
    chapters: [
      {
        id: 1,
        title: '第一章：认识敏捷训练',
        subtitle: '基础理论和准备工作',
        expanded: false,
        completedLessons: 3,
        totalLessons: 3,
        lessons: [
          {
            id: 1,
            title: '1.1 什么是犬敏捷训练',
            duration: '15分钟',
            type: '视频',
            status: 'completed'
          },
          {
            id: 2,
            title: '1.2 训练前的准备工作',
            duration: '20分钟',
            type: '图文',
            status: 'completed'
          },
          {
            id: 3,
            title: '1.3 安全注意事项',
            duration: '12分钟',
            type: '视频',
            status: 'completed'
          }
        ]
      },
      {
        id: 2,
        title: '第二章：基础动作训练',
        subtitle: '核心技能学习',
        expanded: true,
        completedLessons: 2,
        totalLessons: 5,
        lessons: [
          {
            id: 4,
            title: '2.1 基本站立姿势',
            duration: '25分钟',
            type: '视频',
            status: 'completed'
          },
          {
            id: 5,
            title: '2.2 直线行走训练',
            duration: '30分钟',
            type: '图文+视频',
            status: 'current'
          },
          {
            id: 6,
            title: '2.3 转向训练',
            duration: '28分钟',
            type: '视频',
            status: 'pending'
          },
          {
            id: 7,
            title: '2.4 停止指令',
            duration: '22分钟',
            type: '图文',
            status: 'pending'
          },
          {
            id: 8,
            title: '2.5 基础动作综合练习',
            duration: '35分钟',
            type: '实践',
            status: 'pending'
          }
        ]
      },
      {
        id: 3,
        title: '第三章：障碍设备训练',
        subtitle: '专业设备使用',
        expanded: false,
        completedLessons: 0,
        totalLessons: 4,
        lessons: [
          {
            id: 9,
            title: '3.1 跳跃训练',
            duration: '40分钟',
            type: '视频',
            status: 'pending'
          },
          {
            id: 10,
            title: '3.2 隧道穿越',
            duration: '35分钟',
            type: '视频',
            status: 'pending'
          },
          {
            id: 11,
            title: '3.3 A型架训练',
            duration: '45分钟',
            type: '图文+视频',
            status: 'pending'
          },
          {
            id: 12,
            title: '3.4 综合障碍练习',
            duration: '50分钟',
            type: '实践',
            status: 'pending'
          }
        ]
      }
    ]
  },

  onLoad(options) {
    const courseId = options.id
    this.setData({ courseId })
    this.loadCourseDetail()
  },

  // 加载课程详情
  loadCourseDetail() {
    // 模拟数据
    const mockCourseInfo = {
      id: this.data.courseId,
      title: '基础敏捷训练',
      description: '从零开始学习犬类敏捷训练的基础知识和技能，通过系统性的课程设计，让您和爱犬建立默契配合。',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop',
      duration: '8周课程',
      students: 156,
      rating: 4.8,
      progress: 60,
      completedLessons: 12,
      totalLessons: 20
    }

    this.setData({
      courseInfo: mockCourseInfo
    })
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
    const lesson = this.findLessonById(lessonId)
    
    if (lesson.status === 'pending') {
      wx.showToast({
        title: '请按顺序学习',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/course-content/course-content?lessonId=${lessonId}&courseId=${this.data.courseId}`
    })
  },

  // 根据ID查找课程
  findLessonById(lessonId) {
    for (let chapter of this.data.chapters) {
      for (let lesson of chapter.lessons) {
        if (lesson.id == lessonId) {
          return lesson
        }
      }
    }
    return null
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  }
}) 