// 卡片式内容编辑器
Page({
  // 添加调试日志方法
  addDebugLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // 同时输出到控制台和页面
    console.log(logEntry);
    
    // 添加到页面显示的日志数组
    const logs = this.data.debugLogs || [];
    logs.push(logEntry);
    
    // 只保留最近50条日志，避免页面过长
    if (logs.length > 50) {
      logs.shift();
    }
    
    this.setData({
      debugLogs: logs
    });
  },
  data: {
    editorType: 'lesson', // lesson: 课时编辑, chapter: 章节创建, subchapter: 子章节编辑
    courseId: null,
    courseName: '',
    chapterId: null,
    chapterTitle: '',
    courseInfo: {
      title: '2.2 直线行走训练',
      subtitle: '第二章：基础动作训练'
    },
    chapterInfo: {
      title: '',
      description: ''
    },
    lessonInfo: {
      title: '',
      description: '',
      typeIndex: -1,
      levelIndex: -1,
      duration: ''
    },
    lessonTypes: ['理论课', '实践课', '演示课', '练习课', '测试课'],
    lessonLevels: ['入门级', '初级', '中级', '高级', '专业级'],
    contentCards: [
      {
        id: 1,
        type: 'text',
        typeName: '文本',
        title: '课时概述',
        content: '在这里输入课时的详细介绍和学习目标...'
      }
    ],
    cardIdCounter: 2,
    showAddMenu: false,
    showPreview: false,
    pageInitialized: false,
    lastSaveTimestamp: null,
    // 调试日志显示（临时禁用避免热重载）
    showDebugLog: false,
    debugLogs: [],
    debugLogExpanded: false
  },

  onLoad(options) {
    this.addDebugLog('=== onLoad 开始 ===');
    this.addDebugLog(`卡片编辑器参数: ${JSON.stringify(options)}`);
    this.addDebugLog(`当前页面数据状态: pageInitialized=${this.data.pageInitialized}, contentCards数量=${this.data.contentCards?.length || 0}, editorType=${this.data.editorType}`);
    
    // 移除重复初始化检查，避免影响正常的页面加载
    // if (this.data.pageInitialized) {
    //   console.log('页面已初始化，跳过重复初始化');
    //   return;
    // }
    
    // 设置基本参数
    const updateData = {
      pageInitialized: true  // 标记页面已初始化
    };
    
    if (options.type) {
      updateData.editorType = options.type;
    }
    
    if (options.courseId) {
      updateData.courseId = options.courseId;
    }
    
    if (options.courseName) {
      updateData.courseName = decodeURIComponent(options.courseName);
    }
    
    // 处理章节参数
    if (options.chapterId) {
      updateData.chapterId = options.chapterId;
    }
    
    if (options.chapterTitle) {
      updateData.chapterTitle = decodeURIComponent(options.chapterTitle);
    }
    
    // 处理编辑模式参数
    if (options.mode === 'edit' && options.lessonId) {
      updateData.editMode = true;
      updateData.lessonId = options.lessonId;
    } else {
      updateData.editMode = false;
    }
    
    this.setData(updateData);
    
    // 生成缓存键值
    const cacheKey = `card_editor_${this.data.editorType}_${this.data.courseId || 'default'}_${this.data.chapterId || 'default'}_${this.data.lessonId || 'new'}`;
    this.setData({ cacheKey });
    
    // 根据编辑器类型和模式初始化
    if (this.data.editMode && this.data.lessonId) {
      // 编辑模式：加载现有课时数据（不恢复缓存）
      this.loadLessonForEdit();
    } else {
      // 创建模式：初始化空白表单
      if (this.data.editorType === 'lesson') {
        this.initLessonMode();
      } else if (this.data.editorType === 'chapter') {
        this.initChapterMode();
      } else if (this.data.editorType === 'subchapter') {
        this.initSubChapterMode();
      }
      
      // 移除自动恢复缓存数据的逻辑，避免数据被意外覆盖
      // this.restoreFormData();
    }
  },

  // 恢复表单数据
  restoreFormData() {
    try {
      const cachedData = wx.getStorageSync(this.data.cacheKey);
      if (cachedData && typeof cachedData === 'object') {
        console.log('恢复缓存数据:', cachedData);
        
        // 合并缓存数据到当前data
        const updateData = {
          isDataRestored: true
        };
        
        // 恢复基本信息
        if (cachedData.lessonInfo) {
          Object.keys(cachedData.lessonInfo).forEach(key => {
            updateData[`lessonInfo.${key}`] = cachedData.lessonInfo[key];
          });
        }
        
        if (cachedData.chapterInfo) {
          Object.keys(cachedData.chapterInfo).forEach(key => {
            updateData[`chapterInfo.${key}`] = cachedData.chapterInfo[key];
          });
        }
        
        // 恢复内容卡片
        if (cachedData.contentCards && cachedData.contentCards.length > 0) {
          updateData.contentCards = cachedData.contentCards;
          updateData.cardIdCounter = cachedData.cardIdCounter || (cachedData.contentCards.length + 1);
        }
        
        this.setData(updateData);
        
        wx.showToast({
          title: '已恢复未保存的数据',
          icon: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('恢复缓存数据失败:', error);
    }
  },

  // 保存表单数据到缓存
  saveFormDataToCache() {
    console.log('[DEBUG] saveFormDataToCache 开始');
    // 暂时禁用缓存保存，避免可能导致的页面刷新问题
    console.log('[DEBUG] saveFormDataToCache 被禁用，直接返回');
    return;
    
    try {
      const timestamp = Date.now();
      const cacheData = {
        lessonInfo: this.data.lessonInfo,
        chapterInfo: this.data.chapterInfo,
        contentCards: this.data.contentCards,
        cardIdCounter: this.data.cardIdCounter,
        timestamp: timestamp
      };
      
      wx.setStorageSync(this.data.cacheKey, cacheData);
      
      console.log('数据已缓存:', this.data.cacheKey, '时间戳:', timestamp);
    } catch (error) {
      console.error('缓存数据失败:', error);
    }
  },

  // 清除缓存数据
  clearFormDataCache() {
    try {
      wx.removeStorageSync(this.data.cacheKey);
      console.log('已清除缓存:', this.data.cacheKey);
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  },

  // 加载课时数据用于编辑
  async loadLessonForEdit() {
    wx.showLoading({
      title: '加载课时数据...'
    });

    try {
      const api = require('../../utils/api.js');
      
      // 获取课时详情
      const lessonData = await api.getLessonById(this.data.lessonId);
      
      console.log('加载的课时数据:', lessonData);
      
      // 设置页面标题为编辑模式
      wx.setNavigationBarTitle({
        title: '编辑课时'
      });
      
      // 填充课时基本信息，同时设置courseId和chapterId
      const updateData = {
        'courseInfo.title': '编辑课时',
        'courseInfo.subtitle': this.data.chapterTitle || '章节课时',
        'lessonInfo.title': lessonData.title || '',
        'lessonInfo.description': lessonData.description || '',
        'lessonInfo.duration': lessonData.durationMinutes ? lessonData.durationMinutes.toString() : '',
        // 关键修复：设置courseId和chapterId
        courseId: lessonData.courseId,
        chapterId: lessonData.chapterId
      };
      
      // 处理课时内容卡片
      if (lessonData.lessonCards && lessonData.lessonCards.length > 0) {
        const contentCards = lessonData.lessonCards.map((card, index) => {
          const cardData = {
            id: card.id || (index + 1),
            type: card.cardType || 'text',
            typeName: this.getCardTypeName(card.cardType || 'text'),
            sortOrder: card.sortOrder || (index + 1)
          };
          
          // 根据卡片类型设置具体内容
          switch (card.cardType) {
            case 'text':
              cardData.title = card.title || '';
              cardData.content = card.content || '';
              break;
            case 'image':
              cardData.imageUrl = card.imageUrl || '';
              cardData.description = card.description || '';
              break;
            case 'video':
              cardData.videoUrl = card.videoUrl || '';
              cardData.title = card.title || '';
              cardData.duration = card.videoDuration || '';
              cardData.thumbnail = card.videoThumbnail || '';
              break;
            case 'highlight':
              cardData.title = card.title || '';
              cardData.points = [];
              if (card.highlightPoints) {
                try {
                  cardData.points = typeof card.highlightPoints === 'string' 
                    ? JSON.parse(card.highlightPoints) 
                    : card.highlightPoints;
                } catch (e) {
                  console.error('解析重点内容失败:', e);
                  cardData.points = [];
                }
              }
              break;
            case 'audio':
              cardData.title = card.title || '';
              cardData.audioUrl = card.audioUrl || '';
              cardData.duration = card.audioDuration || '';
              break;
            case 'quiz':
              cardData.title = card.title || '';
              cardData.content = card.content || '';
              break;
            default:
              cardData.title = card.title || '';
              cardData.content = card.content || '';
          }
          
          return cardData;
        });
        
        updateData.contentCards = contentCards;
        updateData.cardIdCounter = Math.max(...contentCards.map(card => card.id)) + 1;
      } else {
        // 如果没有内容卡片，创建一个默认的
        updateData.contentCards = [
          {
            id: 1,
            type: 'text',
            typeName: '文本',
            title: '课时概述',
            content: '在这里输入课时的详细介绍和学习目标...'
          }
        ];
        updateData.cardIdCounter = 2;
      }
      
      this.setData(updateData);
      
      wx.hideLoading();
      
    } catch (error) {
      console.error('加载课时数据失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载课时数据失败',
        icon: 'none'
      });
      
      // 加载失败时，初始化为创建模式
      this.initLessonMode();
    }
  },

  // 获取卡片类型名称
  getCardTypeName(cardType) {
    const typeMap = {
      'text': '文本',
      'image': '图片',
      'video': '视频',
      'highlight': '重点',
      'audio': '音频',
      'quiz': '测验'
    };
    return typeMap[cardType] || '文本';
  },

  // 初始化课时创建模式
  initLessonMode() {
    // 设置页面标题为创建模式
    wx.setNavigationBarTitle({
      title: '新增课时'
    });
    
    const updateData = {
      'courseInfo.title': '新建课时',
      'courseInfo.subtitle': this.data.chapterTitle || '章节课时'
    };
    
    // 只在没有现有内容卡片时才设置默认卡片
    if (!this.data.contentCards || this.data.contentCards.length === 0) {
      updateData.contentCards = [
        {
          id: 1,
          type: 'text',
          typeName: '文本',
          title: '课时概述',
          content: '在这里输入课时的详细介绍和学习目标...'
        }
      ];
    }
    
    this.setData(updateData);
  },

  // 初始化章节创建模式
  initChapterMode() {
    const updateData = {
      'courseInfo.title': '新建章节',
      'courseInfo.subtitle': this.data.courseName || '课程章节'
    };
    
    // 只在没有现有内容卡片时才设置默认卡片
    if (!this.data.contentCards || this.data.contentCards.length === 0) {
      updateData.contentCards = [
        {
          id: 1,
          type: 'text',
          typeName: '文本',
          title: '章节概述',
          content: '在这里输入章节的详细介绍和学习目标...'
        }
      ];
    }
    
    this.setData(updateData);
  },

  // 初始化子章节编辑模式
  initSubChapterMode() {
    const updateData = {
      'courseInfo.title': '新增子章节内容',
      'courseInfo.subtitle': this.data.chapterTitle || '章节内容'
    };
    
    // 只在没有现有内容卡片时才设置默认卡片
    if (!this.data.contentCards || this.data.contentCards.length === 0) {
      updateData.contentCards = [
        {
          id: 1,
          type: 'text',
          typeName: '文本',
          title: '子章节介绍',
          content: '在这里输入子章节的具体内容...'
        }
      ];
    }
    
    this.setData(updateData);
  },

  // 课时标题输入
  onLessonTitleInput(e) {
    this.setData({
      'lessonInfo.title': e.detail.value
    });
    this.saveFormDataToCache();
  },

  // 课时描述输入
  onLessonDescriptionInput(e) {
    this.setData({
      'lessonInfo.description': e.detail.value
    });
    this.saveFormDataToCache();
  },

  // 课时类型选择
  onLessonTypeChange(e) {
    this.setData({
      'lessonInfo.typeIndex': parseInt(e.detail.value)
    });
    this.saveFormDataToCache();
  },

  // 课时难度等级选择
  onLessonLevelChange(e) {
    this.setData({
      'lessonInfo.levelIndex': parseInt(e.detail.value)
    });
    this.saveFormDataToCache();
  },

  // 课时时长输入
  onLessonDurationInput(e) {
    this.setData({
      'lessonInfo.duration': e.detail.value
    });
    this.saveFormDataToCache();
  },

  // 章节标题输入
  onChapterTitleInput(e) {
    this.setData({
      'chapterInfo.title': e.detail.value
    });
    this.saveFormDataToCache();
  },

  // 章节描述输入
  onChapterDescriptionInput(e) {
    this.setData({
      'chapterInfo.description': e.detail.value
    });
    this.saveFormDataToCache();
  },

  onTitleInput(e) {
    this.setData({
      'courseInfo.title': e.detail.value
    });
  },

  onSubtitleInput(e) {
    this.setData({
      'courseInfo.subtitle': e.detail.value
    });
  },

  showAddMenu() {
    this.setData({ showAddMenu: true });
  },

  hideAddMenu() {
    this.setData({ showAddMenu: false });
  },

  addCard(e) {
    const type = e.currentTarget.dataset.type;
    const newCard = this.createCard(type);
    
    const cards = this.data.contentCards;
    cards.push(newCard);
    
    this.setData({
      contentCards: cards,
      cardIdCounter: this.data.cardIdCounter + 1,
      showAddMenu: false
    });

    this.saveFormDataToCache();

    wx.showToast({
      title: `${newCard.typeName}卡片已添加`,
      icon: 'success'
    });
  },

  createCard(type) {
    const id = this.data.cardIdCounter;
    
    switch (type) {
      case 'video':
        return {
          id,
          type: 'video',
          typeName: '视频',
          videoUrl: '',
          duration: '',
          views: ''
        };
      case 'text':
        return {
          id,
          type: 'text',
          typeName: '文本',
          title: '',
          content: ''
        };
      case 'image':
        return {
          id,
          type: 'image',
          typeName: '图片',
          imageUrl: '',
          description: ''
        };
      case 'highlight':
        return {
          id,
          type: 'highlight',
          typeName: '重点',
          title: '重点内容',
          points: ['']
        };
      default:
        return { id, type, typeName: '未知' };
    }
  },

  deleteCard(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个卡片吗？',
      success(res) {
        if (res.confirm) {
          const cards = that.data.contentCards;
          cards.splice(index, 1);
          that.setData({ contentCards: cards });
          that.saveFormDataToCache();
          wx.showToast({
            title: '卡片已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  moveUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    
    const cards = this.data.contentCards;
    [cards[index], cards[index - 1]] = [cards[index - 1], cards[index]];
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  moveDown(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    if (index === cards.length - 1) return;
    
    [cards[index], cards[index + 1]] = [cards[index + 1], cards[index]];
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  selectVideo(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍摄视频', '输入视频链接'],
      success(res) {
        if (res.tapIndex === 0) {
          that.chooseVideoFromAlbum(index);
        } else if (res.tapIndex === 1) {
          that.recordVideo(index);
        } else if (res.tapIndex === 2) {
          that.inputVideoUrl(index);
        }
      },
      fail(error) {
        console.log('选择操作失败', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 从相册选择视频
  chooseVideoFromAlbum(index) {
    const that = this;
    
    // 先检查相册权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.album'] === false) {
          // 用户之前拒绝了权限，引导用户去设置
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限，以便选择视频',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 选择视频
        wx.chooseVideo({
          sourceType: ['album'],
          maxDuration: 60, // 微信小程序限制最长60秒
          compressed: true,
          success(res) {
            console.log('选择视频成功', res);
            that.updateVideoCard(index, res);
          },
          fail(error) {
            console.log('选择视频失败', error);
            if (error.errMsg.includes('cancel')) {
              // 用户取消选择
              return;
            }
            
            let errorMsg = '选择视频失败';
            if (error.errMsg.includes('maxDuration')) {
              errorMsg = '视频时长不能超过60秒，请选择较短的视频';
            } else if (error.errMsg.includes('permission')) {
              errorMsg = '没有相册访问权限';
            }
            
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000
            });
          }
        });
      }
    });
  },

  // 拍摄视频
  recordVideo(index) {
    const that = this;
    
    // 先检查摄像头权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.camera'] === false) {
          // 用户之前拒绝了权限，引导用户去设置
          wx.showModal({
            title: '需要摄像头权限',
            content: '请在设置中开启摄像头权限，以便拍摄视频',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 拍摄视频
        wx.chooseVideo({
          sourceType: ['camera'],
          maxDuration: 60, // 微信小程序限制最长60秒
          compressed: true,
          success(res) {
            console.log('拍摄视频成功', res);
            that.updateVideoCard(index, res);
          },
          fail(error) {
            console.log('拍摄视频失败', error);
            if (error.errMsg.includes('cancel')) {
              // 用户取消拍摄
              return;
            }
            
            let errorMsg = '拍摄视频失败';
            if (error.errMsg.includes('maxDuration')) {
              errorMsg = '视频时长不能超过60秒，请录制较短的视频';
            } else if (error.errMsg.includes('permission')) {
              errorMsg = '没有摄像头访问权限';
            }
            
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000
            });
          }
        });
      }
    });
  },

  // 更新视频卡片信息
  async updateVideoCard(index, videoRes) {
    const cards = this.data.contentCards;
    
    // 显示上传进度
    wx.showLoading({
      title: '上传视频中...'
    });
    
    try {
      const upload = require('../../utils/upload.js');
      
      // 上传视频到服务器
      const uploadResult = await upload.uploadVideo(videoRes.tempFilePath, 'chapter');
      
      // 更新卡片数据
      cards[index].videoUrl = uploadResult.url;
      cards[index].duration = `${Math.round(videoRes.duration)}秒`;
      cards[index].videoDuration = `${Math.round(videoRes.duration)}秒`;
      cards[index].size = videoRes.size;
      cards[index].fileSize = upload.formatFileSize(videoRes.size);
      cards[index].height = videoRes.height;
      cards[index].width = videoRes.width;
      cards[index].originalName = uploadResult.originalName;
      
      this.setData({ contentCards: cards });
      
      wx.hideLoading();
      wx.showToast({
        title: '视频上传成功',
        icon: 'success',
        duration: 2000
      });
      
      // 显示视频信息
      setTimeout(() => {
        wx.showToast({
          title: `视频时长：${Math.round(videoRes.duration)}秒`,
          icon: 'none',
          duration: 2000
        });
      }, 2500);
      
    } catch (error) {
      wx.hideLoading();
      console.error('视频上传失败:', error);
      
      const errorHandler = require('../../utils/errorHandler.js');
      
      // 检查是否是认证错误（401）- 已经自动处理了跳转
      if (errorHandler.isAuthError(error)) {
        console.log('检测到401认证错误，已触发登录跳转');
        return;
      }
      
      // 检查是否是权限错误（403）- 已经自动显示了权限提示
      if (errorHandler.isPermissionError(error)) {
        console.log('检测到403权限错误，已显示权限提示');
        return;
      }
      
      // 其他错误显示通用错误提示
      wx.showToast({
        title: error.message || '视频上传失败',
        icon: 'none',
        duration: 3000
      });
      
      // 上传失败时仍使用本地路径，但标记为未上传
      cards[index].videoUrl = videoRes.tempFilePath;
      cards[index].duration = `${Math.round(videoRes.duration)}秒`;
      cards[index].videoDuration = `${Math.round(videoRes.duration)}秒`;
      cards[index].size = videoRes.size;
      cards[index].height = videoRes.height;
      cards[index].width = videoRes.width;
      cards[index].uploadFailed = true;
      cards[index].errorMessage = error.message;
      this.setData({ contentCards: cards });
    }
  },

  // 选择图片
  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    this.addDebugLog(`selectImage 开始，index: ${index}`);
    this.addDebugLog('显示操作选择框：从相册选择 vs 拍照');
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success(res) {
        that.addDebugLog(`用户选择了操作: ${res.tapIndex === 0 ? '从相册选择' : '拍照'}`);
        if (res.tapIndex === 0) {
          that.chooseImageFromAlbum(index);
        } else if (res.tapIndex === 1) {
          that.takePhoto(index);
        }
      },
      fail(error) {
        that.addDebugLog(`操作选择失败: ${error.errMsg}`);
        console.log('选择操作失败', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 从相册选择图片
  chooseImageFromAlbum(index) {
    this.addDebugLog(`chooseImageFromAlbum 开始，index: ${index}`);
    const that = this;
    
    // 简化版本：直接选择图片，不进行复杂的权限预检查
    that.addDebugLog('直接调用 wx.chooseImage 选择图片');
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        that.addDebugLog(`选择图片成功，路径: ${res.tempFilePaths[0]}`);
        that.addDebugLog(`图片数量: ${res.tempFilePaths.length}`);
        that.addDebugLog(`准备调用 updateImageCard，参数: index=${index}`);
        that.updateImageCard(index, res.tempFilePaths[0]);
      },
      fail(error) {
        that.addDebugLog(`选择图片失败: ${error.errMsg}`);
        if (error.errMsg.includes('cancel')) {
          that.addDebugLog('用户取消选择图片');
          return;
        }
        
        // 如果是权限问题，提示用户
        if (error.errMsg.includes('authorize') || error.errMsg.includes('permission')) {
          that.addDebugLog('权限问题，显示权限申请弹窗');
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限，以便选择图片',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 拍照
  takePhoto(index) {
    const that = this;
    
    // 先检查摄像头权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.camera'] === false) {
          wx.showModal({
            title: '需要摄像头权限',
            content: '请在设置中开启摄像头权限，以便拍照',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 拍照
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['camera'],
          success(res) {
            console.log('拍照成功', res);
            that.updateImageCard(index, res.tempFilePaths[0]);
          },
          fail(error) {
            console.log('拍照失败', error);
            if (error.errMsg.includes('cancel')) {
              return;
            }
            wx.showToast({
              title: '拍照失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },

  // 更新图片卡片
  async updateImageCard(index, imagePath) {
    this.addDebugLog('=== updateImageCard 开始 ===');
    this.addDebugLog(`参数: index=${index}, imagePath=${imagePath}`);
    this.addDebugLog(`当前页面状态: pageInitialized=${this.data.pageInitialized}, editMode=${this.data.editMode}, contentCards数量=${this.data.contentCards?.length || 0}`);
    
    const cards = [...this.data.contentCards]; // 创建副本避免引用问题
    this.addDebugLog(`创建副本完成，原始卡片数量: ${this.data.contentCards.length}`);
    
    // 先设置本地图片路径，让用户立即看到图片
    cards[index].imageUrl = imagePath;
    cards[index].uploadStatus = 'uploading';


    
    this.addDebugLog('准备调用 setData，更新卡片状态为 uploading');
    
    this.setData({ 
      contentCards: cards
    });
    this.addDebugLog(`setData 调用完成，当前卡片数量: ${this.data.contentCards.length}`);
    
    this.addDebugLog('准备调用 saveFormDataToCache');
    this.saveFormDataToCache();
    this.addDebugLog('saveFormDataToCache 调用完成');
    
    this.addDebugLog(`设置本地图片路径完成，当前卡片数量: ${cards.length}`);
    
    // 显示上传进度
    console.log('[DEBUG] 准备显示上传进度');
    wx.showLoading({
      title: '上传图片中...'
    });
    console.log('[DEBUG] 上传进度显示完成');
    
    try {
      console.log('[DEBUG] 开始上传图片到服务器');
      const upload = require('../../utils/upload.js');
      console.log('[DEBUG] upload 模块加载完成');
      
      // 上传图片到服务器
      console.log('[DEBUG] 调用 upload.uploadImage，参数:', { imagePath, category: 'chapter' });
      const uploadResult = await upload.uploadImage(imagePath, 'chapter');
      console.log('[DEBUG] upload.uploadImage 返回结果:', uploadResult);
      
      this.addDebugLog('图片上传成功，开始更新卡片数据');
      
      // 更新卡片数据为服务器URL
      cards[index].imageUrl = uploadResult.url;
      cards[index].originalName = uploadResult.originalName;
      cards[index].fileSize = upload.formatFileSize(uploadResult.size);
      cards[index].uploadStatus = 'success';
      cards[index].uploadFailed = false;
      delete cards[index].errorMessage;
      
      this.addDebugLog('卡片数据更新完成，准备调用 setData');
      this.addDebugLog(`更新的卡片数据: imageUrl=${cards[index].imageUrl}, uploadStatus=${cards[index].uploadStatus}`);
      
      this.setData({ 
        contentCards: cards
      });
      this.addDebugLog(`setData 调用完成，当前页面卡片数量: ${this.data.contentCards.length}`);
      
      this.addDebugLog('准备调用 saveFormDataToCache');
      this.saveFormDataToCache();
      this.addDebugLog('saveFormDataToCache 调用完成');
      
      this.addDebugLog(`图片上传完成，更新数据成功，当前卡片数量: ${cards.length}`);
      
      this.addDebugLog('准备隐藏加载提示');
      wx.hideLoading();
      this.addDebugLog('加载提示隐藏完成');
      
      this.addDebugLog('图片上传成功，显示成功提示');
      wx.showToast({
        title: '图片上传成功',
        icon: 'success',
        duration: 2000
      });
      this.addDebugLog('=== updateImageCard 成功结束 ===');
      
    } catch (error) {
      console.log('[DEBUG] 捕获到上传错误:', error);
      wx.hideLoading();
      console.error('[DEBUG] 图片上传失败:', error);
      
      const errorHandler = require('../../utils/errorHandler.js');
      
      // 检查是否是认证错误（401）- 已经自动处理了跳转
      if (errorHandler.isAuthError(error)) {
        console.log('检测到401认证错误，已触发登录跳转');
        return;
      }
      
      // 检查是否是权限错误（403）- 已经自动显示了权限提示
      if (errorHandler.isPermissionError(error)) {
        console.log('检测到403权限错误，已显示权限提示');
        return;
      }
      
      // 其他错误处理：上传失败时保持本地路径，但标记为失败
      cards[index].imageUrl = imagePath;
      cards[index].uploadStatus = 'failed';
      cards[index].uploadFailed = true;
      cards[index].errorMessage = error.message;
      
      console.log('[DEBUG] 上传失败，准备调用 setData 更新状态');
      this.setData({ 
        contentCards: cards
      });
      console.log('[DEBUG] setData 调用完成，准备调用 saveFormDataToCache');
      this.saveFormDataToCache();
      console.log('[DEBUG] saveFormDataToCache 调用完成');
      
      console.log('[DEBUG] 图片上传失败，保持本地路径，当前卡片数量:', cards.length);
      
      wx.showToast({
        title: error.message || '图片上传失败',
        icon: 'none',
        duration: 2000
      });
    }
    console.log('=== [DEBUG] updateImageCard 方法完全结束 ===');
  },

  // 图片描述输入
  onImageDescriptionInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].description = e.detail.value;
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  inputVideoUrl(index) {
    const that = this;
    wx.showModal({
      title: '输入视频链接',
      editable: true,
      placeholderText: '请输入视频URL',
      success(res) {
        if (res.confirm && res.content) {
          const cards = that.data.contentCards;
          cards[index].videoUrl = res.content;
          that.setData({ contentCards: cards });
          wx.showToast({
            title: '视频链接已添加',
            icon: 'success'
          });
        }
      }
    });
  },

  onTextTitleInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].title = e.detail.value;
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  onTextContentInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].content = e.detail.value;
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  onHighlightTitleInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].title = e.detail.value;
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  onPointInput(e) {
    const index = e.currentTarget.dataset.index;
    const pointIndex = e.currentTarget.dataset.pointIndex;
    const cards = this.data.contentCards;
    cards[index].points[pointIndex] = e.detail.value;
    this.setData({ contentCards: cards });
    this.saveFormDataToCache();
  },

  addPoint(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].points.push('');
    this.setData({ contentCards: cards });
  },

  deletePoint(e) {
    const index = e.currentTarget.dataset.index;
    const pointIndex = e.currentTarget.dataset.pointIndex;
    const cards = this.data.contentCards;
    
    if (cards[index].points.length > 1) {
      cards[index].points.splice(pointIndex, 1);
      this.setData({ contentCards: cards });
    }
  },

  showPreview() {
    this.setData({ showPreview: true });
  },

  closePreview() {
    this.setData({ showPreview: false });
  },

  clearAll() {
    const that = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有内容吗？',
      success(res) {
        if (res.confirm) {
          that.setData({
            courseInfo: { title: '', subtitle: '' },
            contentCards: [],
            cardIdCounter: 1,
            'lessonInfo.title': '',
            'lessonInfo.description': '',
            'lessonInfo.typeIndex': -1,
            'lessonInfo.levelIndex': -1,
            'lessonInfo.duration': '',
            'chapterInfo.title': '',
            'chapterInfo.description': ''
          });
          
          // 清除缓存
          that.clearFormDataCache();
          
          wx.showToast({
            title: '内容已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  saveContent() {
    // 根据编辑器类型执行不同的保存逻辑
    if (this.data.editorType === 'lesson') {
      this.saveLesson();
    } else if (this.data.editorType === 'chapter') {
      this.saveChapter();
    } else if (this.data.editorType === 'subchapter') {
      this.saveSubChapter();
    } else {
      this.saveLessonContent();
    }
  },

  // 保存课时
  async saveLesson() {
    // 验证课时信息
    if (!this.data.lessonInfo.title.trim()) {
      wx.showToast({
        title: '请输入课时标题',
        icon: 'none'
      });
      return;
    }

    if (!this.data.lessonInfo.description.trim()) {
      wx.showToast({
        title: '请输入课时简介',
        icon: 'none'
      });
      return;
    }

    if (this.data.contentCards.length === 0) {
      wx.showToast({
        title: '请添加至少一个内容卡片',
        icon: 'none'
      });
      return;
    }

    const isEditMode = this.data.editMode && this.data.lessonId;
    
    wx.showLoading({
      title: isEditMode ? '更新课时中...' : '创建课时中...'
    });

    try {
      const api = require('../../utils/api.js');
      
      // 构建请求数据
      const requestData = {
        chapterId: parseInt(this.data.chapterId),
        courseId: parseInt(this.data.courseId),
        title: this.data.lessonInfo.title.trim(),
        description: this.data.lessonInfo.description.trim(),
        durationMinutes: this.data.lessonInfo.duration ? parseInt(this.data.lessonInfo.duration) : null,
        status: 'draft',
        lessonCards: this.data.contentCards.map((card, index) => ({
          cardType: card.type,
          title: card.title || '',
          content: card.content || '',
          sortOrder: index + 1,
          status: 'active',
          // 视频相关字段
          videoUrl: card.type === 'video' ? card.videoUrl : null,
          videoDuration: card.type === 'video' ? card.duration : null,
          videoViews: card.type === 'video' ? card.views : null,
          videoThumbnail: card.type === 'video' ? card.thumbnail : null,
          // 图片相关字段
          imageUrl: card.type === 'image' ? card.imageUrl : null,
          imageDescription: card.type === 'image' ? card.description : null,
          // 重点卡片相关字段
          highlightPoints: card.type === 'highlight' ? card.points : null
        }))
      };

      console.log(isEditMode ? '更新课时请求数据:' : '创建课时请求数据:', requestData);
      
      let result;
      if (isEditMode) {
        // 编辑模式：更新现有课时
        result = await api.updateLesson(this.data.lessonId, requestData);
      } else {
        // 创建模式：创建新课时
        result = await api.request('/api/lessons/create', requestData, 'POST');
      }
      
      wx.hideLoading();
      
      // 清除缓存数据
      this.clearFormDataCache();
      
      wx.showToast({
        title: isEditMode ? '课时更新成功' : '课时创建成功',
        icon: 'success'
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      wx.hideLoading();
      console.error(isEditMode ? '更新课时失败:' : '创建课时失败:', error);
      wx.showToast({
        title: error.message || (isEditMode ? '更新失败，请重试' : '创建失败，请重试'),
        icon: 'none'
      });
    }
  },

  // 保存章节
  async saveChapter() {
    // 验证章节信息
    if (!this.data.chapterInfo.title.trim()) {
      wx.showToast({
        title: '请输入章节标题',
        icon: 'none'
      });
      return;
    }

    if (!this.data.chapterInfo.description.trim()) {
      wx.showToast({
        title: '请输入章节描述',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '创建章节中...'
    });

    try {
      const api = require('../../utils/api.js');
      
      // 构建请求数据
      const requestData = {
        courseId: parseInt(this.data.courseId),
        title: this.data.chapterInfo.title.trim(),
        description: this.data.chapterInfo.description.trim(),
        status: 'draft',
        contentCards: this.data.contentCards.map((card, index) => ({
          cardType: card.type,
          title: card.title || '',
          content: card.content || '',
          sortOrder: index + 1,
          status: 'active',
          // 视频相关字段
          videoUrl: card.type === 'video' ? card.videoUrl : null,
          videoDuration: card.type === 'video' ? card.duration : null,
          videoViews: card.type === 'video' ? card.views : null,
          videoThumbnail: card.type === 'video' ? card.thumbnail : null,
          // 图片相关字段
          imageUrl: card.type === 'image' ? card.imageUrl : null,
          imageDescription: card.type === 'image' ? card.description : null,
          // 重点卡片相关字段
          highlightPoints: card.type === 'highlight' ? card.points : null
        }))
      };

      console.log('创建章节请求数据:', requestData);
      
      // 调用后端API
      const result = await api.request('/api/chapters/create', requestData, 'POST');
      
      wx.hideLoading();
      
      if (result.success) {
        // 清除缓存数据
        this.clearFormDataCache();
        
        wx.showToast({
          title: '章节创建成功',
          icon: 'success'
        });
        
        // 返回章节管理页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '创建失败');
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('创建章节失败:', error);
      wx.showToast({
        title: error.message || '创建失败，请重试',
        icon: 'none'
      });
    }
  },

  // 保存子章节内容
  async saveSubChapter() {
    if (this.data.contentCards.length === 0) {
      wx.showToast({
        title: '请添加至少一个内容卡片',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存子章节中...'
    });

    try {
      const api = require('../../utils/api.js');
      
      // 构建请求数据
      const requestData = {
        chapterId: parseInt(this.data.chapterId),
        contentCards: this.data.contentCards.map((card, index) => ({
          cardType: card.type,
          title: card.title || '',
          content: card.content || '',
          sortOrder: index + 1,
          status: 'active',
          // 视频相关字段
          videoUrl: card.type === 'video' ? card.videoUrl : null,
          videoDuration: card.type === 'video' ? card.duration : null,
          videoViews: card.type === 'video' ? card.views : null,
          videoThumbnail: card.type === 'video' ? card.thumbnail : null,
          // 图片相关字段
          imageUrl: card.type === 'image' ? card.imageUrl : null,
          imageDescription: card.type === 'image' ? card.description : null,
          // 重点卡片相关字段
          highlightPoints: card.type === 'highlight' ? card.points : null
        }))
      };

      console.log('保存子章节内容请求数据:', requestData);
      
      // 调用后端API保存内容卡片
      const result = await api.request('/api/chapters/content-cards', requestData, 'POST');
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '子章节内容保存成功',
          icon: 'success'
        });
        
        // 返回章节管理页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '保存失败');
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('保存子章节内容失败:', error);
      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 保存课时内容
  saveLessonContent() {
    if (!this.data.courseInfo.title.trim()) {
      wx.showToast({
        title: '请输入课程标题',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  // 重试上传
  retryUpload(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    const card = this.data.contentCards[index];
    
    if (type === 'image' && card.imageUrl) {
      this.updateImageCard(index, card.imageUrl);
    } else if (type === 'video' && card.videoUrl) {
      // 构造视频响应对象
      const videoRes = {
        tempFilePath: card.videoUrl,
        duration: parseInt(card.duration) || 30,
        size: card.size || 0,
        height: card.height || 480,
        width: card.width || 640
      };
      this.updateVideoCard(index, videoRes);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  // 页面生命周期方法
  onShow() {
    this.addDebugLog('=== onShow 开始 ===');
    this.addDebugLog(`页面显示，当前内容卡片数量: ${this.data.contentCards?.length || 0}`);
    this.addDebugLog(`页面状态: pageInitialized=${this.data.pageInitialized}, editMode=${this.data.editMode}, editorType=${this.data.editorType}`);
    // 移除所有缓存恢复逻辑，避免数据被意外覆盖
    this.addDebugLog('=== onShow 结束 ===');
  },

  onHide() {
    this.addDebugLog('=== onHide 开始 ===');
    this.addDebugLog(`页面隐藏，当前卡片数量: ${this.data.contentCards?.length || 0}`);
    // 页面隐藏时自动保存数据
    this.saveFormDataToCache();
    this.addDebugLog('=== onHide 结束 ===');
  },

  onUnload() {
    this.addDebugLog('=== onUnload 开始 ===');
    this.addDebugLog(`页面卸载，当前卡片数量: ${this.data.contentCards?.length || 0}`);
    this.addDebugLog('=== onUnload 结束 ===');
  },

  // 切换调试日志显示
  toggleDebugLog() {
    this.setData({
      debugLogExpanded: !this.data.debugLogExpanded
    });
  }
});
