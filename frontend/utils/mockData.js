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
        isDeveloper: true,
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        profession: '软件工程师',
        bio: '热爱犬敏捷训练的开发者',
        specialties: '敏捷训练、服从训练',
        gender: 'male',
        experience: 'intermediate'
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
      isDeveloper: true,
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      profession: '软件工程师',
      bio: '热爱犬敏捷训练的开发者',
      specialties: '敏捷训练、服从训练',
      gender: 'male',
      experience: 'intermediate'
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
    },
    
    // 用户信息更新接口
    '/user/update': {
      success: true,
      message: '用户信息更新成功',
      data: {
        updated: true
      }
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

  // 授权码相关mock数据
  accessCodes: {
    // 生成授权码 - 这个会在getMockData方法中动态生成
    '/courses/access-codes/generate': {
      id: Date.now(),
      code: 'MOCK0001', // 默认值，实际使用时会被动态生成的值替换
      courseId: 1,
      description: '管理员生成',
      status: 'active',
      usageLimit: 1,
      usedCount: 0,
      validUntil: null,
      createdAt: new Date().toISOString(),
      createdBy: 1,
      usedBy: null,
      usedAt: null
    },

    // 获取课程授权码列表
    '/courses/access-codes/course/1': [
      {
        id: 1,
        code: 'ABC123XY',
        courseId: 1,
        description: '快速授权码(24小时)',
        status: 'active',
        usageLimit: 1,
        usedCount: 0,
        validUntil: '2024-12-21T10:30:00.000Z',
        createdAt: '2024-12-20T10:30:00.000Z',
        createdBy: 1,
        usedBy: null,
        usedAt: null,
        usedByUserName: null
      },
      {
        id: 2,
        code: 'DEF456UV',
        courseId: 1,
        description: '授权码(7天有效)',
        status: 'used',
        usageLimit: 1,
        usedCount: 1,
        validUntil: '2024-12-27T15:20:00.000Z',
        createdAt: '2024-12-19T15:20:00.000Z',
        createdBy: 1,
        usedBy: 3,
        usedAt: '2024-12-20T09:15:00.000Z',
        usedByUserName: '张三'
      },
      {
        id: 3,
        code: 'GHI789ST',
        courseId: 1,
        description: '授权码(永久有效)',
        status: 'expired',
        usageLimit: 1,
        usedCount: 0,
        validUntil: '2024-12-19T20:00:00.000Z',
        createdAt: '2024-12-18T20:00:00.000Z',
        createdBy: 1,
        usedBy: null,
        usedAt: null,
        usedByUserName: null
      }
    ],

    // 获取所有授权码（管理员）
    '/courses/access-codes/admin/list': [
      {
        id: 1,
        code: 'ABC123XY',
        courseId: 1,
        courseTitle: '犬敏捷入门基础',
        description: '快速授权码(24小时)',
        status: 'active',
        usageLimit: 1,
        usedCount: 0,
        validUntil: '2024-12-21T10:30:00.000Z',
        createdAt: '2024-12-20T10:30:00.000Z'
      },
      {
        id: 4,
        code: 'JKL012QR',
        courseId: 2,
        courseTitle: '障碍物训练进阶',
        description: '授权码(30天有效)',
        status: 'active',
        usageLimit: 1,
        usedCount: 0,
        validUntil: '2025-01-20T14:45:00.000Z',
        createdAt: '2024-12-20T14:45:00.000Z'
      }
    ]
  },

  // 授权码生成方法集合
  codeGenerators: {
    
    /**
     * 方案1：Base32编码（推荐）
     * 特点：8位固定长度，去除易混淆字符(0,1,O,I)，用户友好
     * 字符集：23456789ABCDEFGHJKLMNPQRSTUVWXYZ (32个字符)
     * 示例：A7K9M2N8
     */
    base32: () => {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    },

    /**
     * 方案2：时间戳+随机数组合
     * 特点：前4位基于时间戳，后4位随机，保证唯一性
     * 字符集：0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ (36个字符)
     * 示例：K7M9-A2N8 (带分隔符) 或 K7M9A2N8
     */
    timestampRandom: (withSeparator = false) => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const now = Date.now()
      
      // 时间戳部分（4位）
      let timeCode = ''
      let timeValue = now % (36 * 36 * 36 * 36) // 确保4位内
      for (let i = 0; i < 4; i++) {
        timeCode = chars[timeValue % 36] + timeCode
        timeValue = Math.floor(timeValue / 36)
      }
      
      // 随机部分（4位）
      let randomCode = ''
      for (let i = 0; i < 4; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      return withSeparator ? `${timeCode}-${randomCode}` : `${timeCode}${randomCode}`
    },

    /**
     * 方案3：纯随机Base36
     * 特点：完全随机，包含数字和字母
     * 字符集：0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ (36个字符)
     * 示例：A7K9M2N8
     */
    base36: () => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    },

    /**
     * 方案4：分组式编码
     * 特点：4+4分组，便于阅读和输入
     * 字符集：23456789ABCDEFGHJKLMNPQRSTUVWXYZ (去除易混淆字符)
     * 示例：A7K9-M2N8
     */
    grouped: () => {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let part1 = '', part2 = ''
      
      for (let i = 0; i < 4; i++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length))
        part2 += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      return `${part1}-${part2}`
    },

    /**
     * 方案5：校验位编码
     * 特点：7位随机码+1位校验码，防止输入错误
     * 字符集：23456789ABCDEFGHJKLMNPQRSTUVWXYZ
     * 示例：A7K9M2N8 (最后一位是校验码)
     */
    withChecksum: () => {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let code = ''
      
      // 生成7位随机码
      for (let i = 0; i < 7; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      // 计算校验码
      let checksum = 0
      for (let i = 0; i < code.length; i++) {
        checksum += chars.indexOf(code[i])
      }
      const checksumChar = chars[checksum % chars.length]
      
      return code + checksumChar
    }
  },

  // 生成Mock授权码的辅助方法（保留备用）
  generateMockCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // 当前使用的授权码生成方法（可配置）
  generateAccessCode(method = 'base32') {
    if (this.codeGenerators[method]) {
      return this.codeGenerators[method]()
    }
    console.warn(`未找到授权码生成方法: ${method}，使用默认方法`)
    return this.codeGenerators.base32()
  },

  // 通用方法：根据URL获取mock数据
  getMockData(url, data = {}, method = 'GET') {
    console.log(`[Mock] 请求: ${method} ${url}`, data)
    
    // 去除URL前缀，统一处理（支持/api前缀和不带前缀）
    let cleanUrl = url
    if (url.startsWith('/api/')) {
      cleanUrl = url.replace('/api', '')
    }
    
    console.log(`[Mock] 清理后的URL: ${cleanUrl}`)
    
    // 用户相关接口
    if (cleanUrl.startsWith('/user/')) {
      // 特殊处理PUT请求的用户信息更新
      if (cleanUrl === '/user/update' && method === 'PUT') {
        console.log('[Mock] 处理用户信息更新请求，数据:', data)
        return this.user[cleanUrl] || null
      }
      return this.user[cleanUrl] || null
    }
    
    // 课程相关接口
    if (cleanUrl.startsWith('/course/') || cleanUrl.startsWith('/lesson/')) {
      if (cleanUrl === '/course/detail' && data.courseId) {
        return { ...this.course[cleanUrl], id: data.courseId }
      }
      if (cleanUrl === '/lesson/content' && data.lessonId) {
        return { ...this.course[cleanUrl], id: data.lessonId }
      }
      return this.course[cleanUrl] || null
    }
    
    // 资讯相关接口
    if (cleanUrl.startsWith('/news/')) {
      if (cleanUrl === '/news/detail' && data.newsId) {
        return { ...this.news[cleanUrl], id: data.newsId }
      }
      if (cleanUrl === '/news/list') {
        const mockList = this.news[cleanUrl]
        return {
          ...mockList,
          page: data.page || 1,
          limit: data.limit || 10
        }
      }
      return this.news[cleanUrl] || null
    }
    
    // 统计相关接口
    if (cleanUrl.startsWith('/stats/')) {
      return this.stats[cleanUrl] || null
    }
    
    // 课时和章节发布/下架相关接口
    if (cleanUrl.includes('/lessons/') && (cleanUrl.includes('/publish') || cleanUrl.includes('/unpublish'))) {
      console.log(`[Mock] 处理课时发布/下架接口: ${cleanUrl}`)
      const lessonId = cleanUrl.split('/')[2] // 提取课时ID
      const action = cleanUrl.includes('/publish') ? '发布' : '下架'
      console.log(`[Mock] ${action}课时 ID: ${lessonId}`)
      return { success: true, message: `课时${action}成功` }
    }
    
    if (cleanUrl.includes('/chapters/') && (cleanUrl.includes('/publish') || cleanUrl.includes('/unpublish'))) {
      console.log(`[Mock] 处理章节发布/下架接口: ${cleanUrl}`)
      const chapterId = cleanUrl.split('/')[2] // 提取章节ID
      const action = cleanUrl.includes('/publish') ? '发布' : '下架'
      console.log(`[Mock] ${action}章节 ID: ${chapterId}`)
      return { success: true, message: `章节${action}成功` }
    }
    
    if (cleanUrl.includes('/courses/') && (cleanUrl.includes('/publish') || cleanUrl.includes('/unpublish'))) {
      console.log(`[Mock] 处理课程发布/下架接口: ${cleanUrl}`)
      const courseId = cleanUrl.split('/')[2] // 提取课程ID
      const action = cleanUrl.includes('/publish') ? '发布' : '下架'
      console.log(`[Mock] ${action}课程 ID: ${courseId}`)
      return { success: true, message: `课程${action}成功` }
    }

    // 授权码相关接口
    if (cleanUrl.startsWith('/courses/access-codes/')) {
      console.log(`[Mock] 处理授权码接口: ${cleanUrl}`)
      
      // 生成授权码
      if (cleanUrl === '/courses/access-codes/generate' && method === 'POST') {
        // 使用新的授权码生成方法
        const codeMethod = data.codeMethod || 'base32' // 默认使用base32方法
        const randomCode = this.generateAccessCode(codeMethod)
        
        const newCode = {
          ...this.accessCodes[cleanUrl],
          id: Date.now(),
          code: randomCode,
          courseId: data.courseId || 1,
          description: data.description || '管理员生成',
          usageLimit: data.usageLimit || 1,
          validUntil: data.validUntil || null,
          createdAt: new Date().toISOString()
        }
        console.log(`[Mock] 生成新授权码 (${codeMethod}):`, newCode)
        return newCode
      }
      
      // 获取课程授权码列表
      if (cleanUrl.includes('/courses/access-codes/course/')) {
        const courseId = cleanUrl.split('/').pop()
        const courseCodesKey = `/courses/access-codes/course/${courseId}`
        console.log(`[Mock] 获取课程 ${courseId} 的授权码列表`)
        return this.accessCodes[courseCodesKey] || []
      }
      
      // 获取所有授权码
      if (cleanUrl === '/courses/access-codes/admin/list') {
        console.log('[Mock] 获取所有授权码列表')
        return this.accessCodes[cleanUrl] || []
      }
      
      // 其他授权码接口的默认响应
      return this.accessCodes[cleanUrl] || { success: true, message: '操作成功' }
    }
    
    console.log(`[Mock] 未找到匹配的数据: ${cleanUrl}`)
    return null
  }
}

module.exports = mockData