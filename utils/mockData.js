// Mock数据管理
const mockData = {
  
  // 用户相关mock数据
  user: {
    '/user/login': {
      token: 'mock_token_123456',
      userInfo: {
        id: 1,
        nickname: '测试用户',
        avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
        phone: '138****8888',
        joinDate: '2024-01-15',
        role: 'developer', // 修改为开发者角色
        isAdmin: false,
        isDeveloper: true
      }
    },
    '/user/info': {
      id: 1,
      nickname: '测试用户',
      avatar: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
      phone: '138****8888',
      joinDate: '2024-01-15',
      studyDays: 45,
      completedCourses: 12,
      totalStudyTime: 1280,
      role: 'developer', // 修改为开发者角色
      isAdmin: false,
      isDeveloper: true
    },
    
    // 添加不同类型的用户数据用于测试
    adminUser: {
      id: 2,
      nickname: '管理员',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      phone: '139****9999',
      joinDate: '2023-12-01',
      role: 'admin',
      isAdmin: true,
      isDeveloper: false
    },
    
    normalUser: {
      id: 3,
      nickname: '普通用户',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      phone: '137****7777',
      joinDate: '2024-02-01',
      role: 'user',
      isAdmin: false,
      isDeveloper: false
    }
  },

  // 课程相关mock数据
  course: {
    '/course/list': [
      {
        id: 1,
        title: '犬敏捷入门基础',
        description: '从零开始学习犬敏捷运动的基础知识和技能',
        cover: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
        duration: '2小时30分钟',
        lessons: 8,
        difficulty: '初级',
        category: '基础训练',
        progress: 65,
        isEnrolled: true
      },
      {
        id: 2,
        title: '障碍物训练进阶',
        description: '学习各种障碍物的训练技巧和方法',
        cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
        duration: '3小时15分钟',
        lessons: 12,
        difficulty: '中级',
        category: '技能提升',
        progress: 30,
        isEnrolled: true
      },
      {
        id: 3,
        title: '高级竞技训练',
        description: '面向竞赛的高级犬敏捷训练课程',
        cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
        duration: '4小时45分钟',
        lessons: 16,
        difficulty: '高级',
        category: '竞技训练',
        progress: 0,
        isEnrolled: true
      }
    ],
    '/course/detail': {
      id: 1,
      title: '犬敏捷入门基础',
      description: '从零开始学习犬敏捷运动的基础知识和技能，包括基本规则、训练方法和实战技巧。',
      cover: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
      duration: '2小时30分钟',
      lessons: 8,
      difficulty: '初级',
      category: '基础训练',
      instructor: '张教练',
      students: 1234,
      rating: 4.8,
      tags: ['基础', '入门', '实用'],
      chapters: [
        {
          id: 1,
          title: '第一章：犬敏捷基础概念',
          lessons: [
            { id: 1, title: '1-1 什么是犬敏捷', duration: '15分钟', completed: true },
            { id: 2, title: '1-2 比赛规则介绍', duration: '20分钟', completed: true },
            { id: 3, title: '1-3 基础装备准备', duration: '25分钟', completed: false }
          ]
        },
        {
          id: 2,
          title: '第二章：基础动作训练',
          lessons: [
            { id: 4, title: '2-1 坐立训练', duration: '18分钟', completed: false },
            { id: 5, title: '2-2 直线行走', duration: '22分钟', completed: false }
          ]
        }
      ]
    },
    '/lesson/content': {
      id: 3,
      title: '1-3 犬敏捷基础',
      chapterTitle: '第一章 - 犬敏捷基础概念',
      duration: '25分钟',
      progress: 50,
      content: {
        introduction: '欢迎来到犬敏捷赛事规则简介课程！在本课程中，我们将详细介绍犬敏捷比赛的基本规则、分组和评分标准。通过学习这些规则，您将更好地理解犬敏捷比赛的精髓，为未来可能的参赛做准备。',
        modules: [
          {
            title: '什么是犬敏捷比赛',
            content: '犬敏捷比赛是一项有趣的犬类运动，起源于英国的1978年克拉夫兹犬展。它类似于马术中的障碍赛，但是更加强调犬只与主人之间的合作关系。',
            video: {
              url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
              poster: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=450&fit=crop',
              title: '犬敏捷比赛介绍视频',
              duration: '2:30',
              description: '观看真实的犬敏捷比赛场景，了解比赛的基本流程和要求'
            }
          },
          {
            title: '基础训练技巧',
            content: '掌握正确的训练方法是成功的关键。本节将通过实际演示教您如何进行基础的犬敏捷训练。',
            video: {
              url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
              poster: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=450&fit=crop',
              title: '基础训练演示',
              duration: '3:45',
              description: '专业教练演示基础训练动作和技巧要点'
            }
          },
          {
            title: '比赛规则详解',
            content: '在比赛中，犬只需要在主人的引导下，按照特定的顺序通过一系列障碍物，如跳跃栏、隧道、跷跷板等。整个过程既考验犬只的敏捷性和服从性，也考验主人的指导技巧。',
            image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop'
          }
        ],
        keyRules: {
          title: '基本赛事规则',
          description: '在标准的犬敏捷比赛中，有以下几个基本规则：',
          items: [
            '参赛者需要引导犬只按特定顺序完成一系列障碍物',
            '犬只必须在规定时间内完成比赛路线',
            '任何错误或违规都会导致罚分',
            '最终成绩以完成时间和罚分综合计算'
          ]
        }
      }
    }
  },

  // 资讯相关mock数据
  news: {
    '/news/list': {
      total: 25,
      page: 1,
      limit: 10,
      list: [
        {
          id: 1,
          title: '2024年全国犬敏捷锦标赛报名开始',
          summary: '一年一度的全国犬敏捷锦标赛将于今年夏天举行，现已开始接受报名...',
          cover: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
          category: '赛事通知',
          publishTime: '2024-01-20',
          views: 1248,
          likes: 89
        },
        {
          id: 2,
          title: '春季训练营：提升你和爱犬的默契',
          summary: '专为初学者设计的春季训练营，帮助主人和狗狗建立更好的配合关系...',
          cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
          category: '训练技巧',
          publishTime: '2024-01-18',
          views: 856,
          likes: 67
        }
      ]
    },
    '/news/detail': {
      id: 1,
      title: '2024年全国犬敏捷锦标赛报名开始',
      content: '<h2>赛事简介</h2><p>2024年全国犬敏捷锦标赛是国内最高水平的犬敏捷比赛...</p>',
      cover: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
      category: '赛事通知',
      publishTime: '2024-01-20',
      views: 1248,
      likes: 89,
      isLiked: false
    }
  },

  // 统计相关mock数据
  stats: {
    '/stats/study': {
      totalStudyTime: 1280, // 分钟
      completedCourses: 12,
      studyDays: 45,
      currentStreak: 7,
      weeklyProgress: [65, 78, 82, 91, 88, 95, 100], // 7天的学习进度
      recentAchievements: [
        { name: '坚持学习', icon: '📚', date: '2024-01-20' },
        { name: '课程达人', icon: '🏆', date: '2024-01-18' }
      ]
    }
  },

  // 通用方法：根据URL获取mock数据
  getMockData(url, data = {}, method = 'GET') {
    console.log(`[Mock] 请求: ${method} ${url}`, data)
    
    // 用户相关接口
    if (url.startsWith('/user/')) {
      return this.user[url] || null
    }
    
    // 课程相关接口
    if (url.startsWith('/course/') || url.startsWith('/lesson/')) {
      if (url === '/course/detail' && data.courseId) {
        return { ...this.course[url], id: data.courseId }
      }
      if (url === '/lesson/content' && data.lessonId) {
        return { ...this.course[url], id: data.lessonId }
      }
      return this.course[url] || null
    }
    
    // 资讯相关接口
    if (url.startsWith('/news/')) {
      if (url === '/news/detail' && data.newsId) {
        return { ...this.news[url], id: data.newsId }
      }
      if (url === '/news/list') {
        const mockList = this.news[url]
        return {
          ...mockList,
          page: data.page || 1,
          limit: data.limit || 10
        }
      }
      return this.news[url] || null
    }
    
    // 统计相关接口
    if (url.startsWith('/stats/')) {
      return this.stats[url] || null
    }
    
    return null
  }
}

module.exports = mockData