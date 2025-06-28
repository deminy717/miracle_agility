Page({
  data: {
    formData: {
      title: '',
      description: '',
      cover: '',
      category: '基础训练',
      tags: [''] // 改为数组形式，默认有一个空标签
    },
    categoryIndex: 0,
    categoryOptions: ['基础训练', '敏捷训练', '行为纠正', '技能提升', '比赛准备'],
    errors: {},
    saving: false,
    uploading: false, // 添加上传状态
    isEditMode: false, // 是否为编辑模式
    courseId: null, // 编辑的课程ID
    loading: false // 加载状态
  },

  onLoad(options) {
    console.log('课程页面加载，参数:', options);
    
    // 检查是否为编辑模式
    if (options.courseId && options.mode === 'edit') {
      this.setData({
        isEditMode: true,
        courseId: options.courseId
      });
      
      // 设置页面标题为编辑模式
      wx.setNavigationBarTitle({
        title: '编辑课程'
      });
      
      // 加载课程数据
      this.loadCourseData(options.courseId);
    } else {
      // 新增模式
      this.setData({
        isEditMode: false,
        courseId: null
      });
      
      // 设置页面标题为新增模式
      wx.setNavigationBarTitle({
        title: '新增课程'
      });
      
      // 尝试从本地存储恢复表单数据
      this.restoreFormData();
    }
  },

  // 通用标签清理函数
  cleanTagsData(rawTags) {
    console.log('开始清理标签数据:', rawTags, '类型:', typeof rawTags);
    
    try {
      let tagsArray = [''];
      
      if (!rawTags) {
        return tagsArray;
      }
      
      let processedTags = rawTags;
      
      // 如果是字符串，尝试多种解析方式
      if (typeof processedTags === 'string') {
        // 先尝试JSON解析（处理被意外JSON化的数据）
        if (processedTags.startsWith('[') && processedTags.endsWith(']')) {
          try {
            processedTags = JSON.parse(processedTags);
            console.log('JSON解析成功:', processedTags);
          } catch (e) {
            console.log('JSON解析失败，使用字符串分割');
          }
        }
        
        // 如果仍是字符串，按逗号分割
        if (typeof processedTags === 'string') {
          tagsArray = processedTags.split(',')
            .map(tag => tag.trim())
            .map(tag => this.removeQuotes(tag))
            .filter(tag => tag && tag.length > 0);
        }
      }
      
      // 如果是数组，处理每个元素
      if (Array.isArray(processedTags)) {
        tagsArray = processedTags
          .map(tag => {
            if (typeof tag === 'string') {
              return this.removeQuotes(tag.trim());
            }
            return String(tag);
          })
          .filter(tag => tag && tag.length > 0);
      }
      
      // 确保至少有一个空标签
      if (tagsArray.length === 0) {
        tagsArray = [''];
      }
      
      console.log('清理后的标签数组:', tagsArray);
      return tagsArray;
      
    } catch (error) {
      console.error('标签数据清理失败:', error);
      return [''];
    }
  },

  // 去除字符串两端的引号
  removeQuotes(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }
    
    let cleaned = str.trim();
    // 去除可能的单引号或双引号
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  },

  // 加载课程数据（编辑模式）
  async loadCourseData(courseId) {
    this.setData({ loading: true });
    
    try {
      wx.showLoading({ title: '加载课程数据...' });
      
      const api = require('../../../utils/api.js');
      const courseData = await api.getCourseById(courseId);
      
      console.log('加载的课程数据:', courseData);
      
      // 找到分类索引
      const categoryIndex = this.data.categoryOptions.indexOf(courseData.category) >= 0 
        ? this.data.categoryOptions.indexOf(courseData.category) 
        : 0;
      
      // 处理标签：使用通用清理函数
      const tagsArray = this.cleanTagsData(courseData.tags);

      // 填充表单数据
      this.setData({
        formData: {
          title: courseData.title || '',
          description: courseData.description || '',
          cover: courseData.cover || courseData.coverImage || '',
          category: courseData.category || this.data.categoryOptions[0],
          tags: tagsArray
        },
        categoryIndex: categoryIndex,
        loading: false
      });
      
      wx.hideLoading();
      console.log('课程数据加载完成，表单数据:', this.data.formData);
      
    } catch (error) {
      console.error('加载课程数据失败:', error);
      this.setData({ loading: false });
      
      wx.hideLoading();
      wx.showModal({
        title: '加载失败',
        content: '获取课程数据失败，请检查网络连接或重试',
        showCancel: true,
        cancelText: '返回',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.loadCourseData(courseId);
          } else {
            // 返回上一页
            wx.navigateBack();
          }
        }
      });
    }
  },

  // 课程标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      'formData.title': title,
      'errors.title': ''
    });
    this.validateTitle(title);
    
    // 自动保存表单数据
    this.saveFormDataToStorage();
  },

  // 课程介绍输入
  onDescriptionInput(e) {
    const description = e.detail.value;
    this.setData({
      'formData.description': description,
      'errors.description': ''
    });
    this.validateDescription(description);
    
    // 自动保存表单数据
    this.saveFormDataToStorage();
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categoryOptions[index]
    });
    
    // 自动保存表单数据
    this.saveFormDataToStorage();
  },

  // 标签输入
  onTagInput(e) {
    const tagIndex = e.currentTarget.dataset.tagIndex;
    const tags = this.data.formData.tags;
    tags[tagIndex] = e.detail.value;
    
    this.setData({
      'formData.tags': tags
    });
    
    // 自动保存表单数据
    this.saveFormDataToStorage();
  },

  // 添加标签
  addTag() {
    const tags = this.data.formData.tags;
    tags.push('');
    
    this.setData({
      'formData.tags': tags
    });
    
    // 自动保存表单数据
    this.saveFormDataToStorage();
  },

  // 删除标签
  deleteTag(e) {
    const tagIndex = e.currentTarget.dataset.tagIndex;
    const tags = this.data.formData.tags;
    
    // 至少保留一个标签输入框
    if (tags.length > 1) {
      tags.splice(tagIndex, 1);
      this.setData({
        'formData.tags': tags
      });
      
      // 自动保存表单数据
      this.saveFormDataToStorage();
    }
  },

  // 选择封面图片
  chooseCover() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 选择压缩图
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        console.log('选择图片成功，开始检查文件信息:', tempFilePath);
        
        // 获取文件信息
        wx.getFileInfo({
          filePath: tempFilePath,
          success(fileInfo) {
            console.log('文件信息:', fileInfo);
            
            const fileSizeMB = (fileInfo.size / 1024 / 1024).toFixed(2);
            console.log(`文件大小: ${fileSizeMB}MB (${fileInfo.size} bytes)`);
            
            // 检查文件大小
            if (fileInfo.size > 5 * 1024 * 1024) { // 大于5MB
              wx.showModal({
                title: '文件较大',
                content: `图片大小: ${fileSizeMB}MB\n文件较大，建议选择更小的图片或重新选择时选择"原图"选项进行压缩`,
                confirmText: '重新选择',
                cancelText: '强制上传',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    // 重新选择，建议原图压缩
                    that.chooseCompressedImage();
                  } else {
                    // 强制上传大文件
                    that.startUpload(tempFilePath, fileSizeMB);
                  }
                }
              });
            } else {
              // 文件大小合适，直接显示确认对话框
              wx.showModal({
                title: '文件信息',
                content: `图片大小: ${fileSizeMB}MB\n是否继续上传？`,
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    that.startUpload(tempFilePath, fileSizeMB);
                  }
                }
              });
            }
          },
          fail(error) {
            console.error('获取文件信息失败:', error);
            wx.showToast({
              title: '获取文件信息失败',
              icon: 'none'
            });
          }
        });
      },
      fail(error) {
        console.error('选择图片失败:', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择压缩图片
  chooseCompressedImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 强制压缩
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 再次检查压缩后的文件大小
        wx.getFileInfo({
          filePath: tempFilePath,
          success(fileInfo) {
            const fileSizeMB = (fileInfo.size / 1024 / 1024).toFixed(2);
            console.log(`压缩后文件大小: ${fileSizeMB}MB`);
            
            wx.showModal({
              title: '压缩后文件信息',
              content: `压缩后图片大小: ${fileSizeMB}MB\n是否上传？`,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  that.startUpload(tempFilePath, fileSizeMB);
                }
              }
            });
          }
        });
      }
    });
  },

  // 开始上传流程
  startUpload(tempFilePath, fileSizeMB) {
    console.log(`开始上传，文件大小: ${fileSizeMB}MB`);
    
    // 设置上传状态
    this.setData({
      uploading: true
    });
    
    wx.showLoading({
      title: `上传中(${fileSizeMB}MB)...`
    });

    // 先显示本地预览图
    this.setData({
      'formData.cover': tempFilePath,
      'errors.cover': ''
    });

    // 上传图片到服务器
    this.uploadImage(tempFilePath).then(result => {
      console.log('图片上传成功，返回结果:', result);
      console.log('当前页面数据状态:', this.data);
      
      // 验证返回结果
      if (!result || !result.url) {
        throw new Error('服务器返回的图片URL无效');
      }
      
      // 更新为服务器返回的URL
      this.setData({
        'formData.cover': result.url,
        'errors.cover': ''
      });
      
      console.log('图片URL已更新到formData.cover:', result.url);
      console.log('更新后的表单数据:', this.data.formData);
      
      // 保存到本地存储
      this.saveFormDataToStorage();
      
      // 清除上传状态
      this.setData({
        uploading: false
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '图片上传成功',
        icon: 'success',
        duration: 1500
      });
      
    }).catch(error => {
      console.error('图片上传失败:', error);
      
      wx.hideLoading();
      
      // 检查错误类型
      let errorTitle = '上传失败';
      let errorContent = error.message || '图片上传失败，请重试';
      
      if (error.message && error.message.includes('413')) {
        errorTitle = '文件过大';
        errorContent = `图片文件太大（${fileSizeMB}MB），服务器拒绝接收。\n建议：\n1. 压缩图片后重试\n2. 选择较小的图片文件`;
      } else if (error.message && error.message.includes('网络')) {
        errorContent = '网络连接失败，请检查网络后重试';
      }
      
      // 上传失败，清除预览图和上传状态
      this.setData({
        'formData.cover': '',
        'errors.cover': errorContent,
        uploading: false
      });
      
      wx.showModal({
        title: errorTitle,
        content: errorContent,
        showCancel: false,
        confirmText: '知道了'
      });
    });
  },

  // 删除封面
  deleteCover() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除封面图片吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'formData.cover': ''
          });
        }
      }
    });
  },

  // 图片上传
  uploadImage(tempFilePath) {
    const upload = require('../../../utils/upload.js')
    // 使用course分类来上传课程封面图片
    return upload.uploadImage(tempFilePath, 'course')
  },

  // 验证标题
  validateTitle(title) {
    if (!title || title.trim().length === 0) {
      this.setData({
        'errors.title': '请输入课程标题'
      });
      return false;
    }
    if (title.length < 3) {
      this.setData({
        'errors.title': '课程标题至少需要3个字符'
      });
      return false;
    }
    return true;
  },

  // 验证介绍
  validateDescription(description) {
    if (!description || description.trim().length === 0) {
      this.setData({
        'errors.description': '请输入课程介绍'
      });
      return false;
    }
    if (description.length < 10) {
      this.setData({
        'errors.description': '课程介绍至少需要10个字符'
      });
      return false;
    }
    return true;
  },

  // 验证封面
  validateCover() {
    if (!this.data.formData.cover) {
      this.setData({
        'errors.cover': '请选择课程封面'
      });
      return false;
    }
    return true;
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data;
    let isValid = true;

    // 清空之前的错误信息
    this.setData({
      errors: {}
    });

    // 验证各个字段
    if (!this.validateTitle(formData.title)) {
      isValid = false;
    }
    if (!this.validateDescription(formData.description)) {
      isValid = false;
    }
    if (!this.validateCover()) {
      isValid = false;
    }

    return isValid;
  },

  // 保存草稿
  saveDraft() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }

    this.saveCourse('draft');
  },

  // 发布课程
  publishCourse() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }

    this.saveCourse('published');
  },

  // 保存课程
  async saveCourse(status) {
    this.setData({
      saving: true
    });

    try {
      const api = require('../../../utils/api.js')
      
      // 处理标签：清理并转换为字符串格式
      const cleanedTags = this.cleanTagsData(this.data.formData.tags);
      const tags = cleanedTags
        .filter(tag => tag && tag.trim() && tag.length > 0) // 过滤空标签
        .map(tag => this.removeQuotes(tag.trim())) // 清理引号
        .join(','); // 用逗号连接
      
      console.log('准备发送的标签数据:', tags);

      // 准备课程数据
      const courseData = {
        title: this.data.formData.title,
        description: this.data.formData.description,
        cover: this.data.formData.cover,
        category: this.data.formData.category,
        tags: tags,
        level: 'beginner', // 默认为初级
        isFree: true // 默认免费
      }

      let result;
      if (this.data.isEditMode) {
        // 编辑模式：更新课程
        console.log('编辑模式：更新课程', this.data.courseId, courseData);
        result = await api.updateCourse(this.data.courseId, courseData);
        
        // 如果需要发布状态变更
        if (status === 'published') {
          await api.publishCourse(this.data.courseId);
        }
      } else {
        // 新增模式：创建课程
        console.log('新增模式：创建课程', courseData);
        result = await api.createCourse(courseData);
        
        // 如果需要直接发布
        if (status === 'published') {
          await api.publishCourse(result.id);
        }
      }

      this.setData({
        saving: false
      });

      const actionText = this.data.isEditMode ? '更新' : '创建';
      wx.showToast({
        title: status === 'published' ? `课程${actionText}并发布成功` : `课程${actionText}成功`,
        icon: 'success',
        duration: 2000
      });

      // 清理本地存储的草稿数据
      this.clearFormDataFromStorage();

      // 保存成功后返回课程管理页面
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);

    } catch (error) {
      console.error('保存课程失败:', error)
      this.setData({
        saving: false
      });

      const actionText = this.data.isEditMode ? '更新' : '保存';
      wx.showToast({
        title: `${actionText}失败，请重试`,
        icon: 'none'
      });
    }
  },

  // 页面显示时
  onShow() {
    // 可以在这里处理页面显示逻辑
    console.log('页面显示时的表单数据:', this.data.formData);
    console.log('页面显示时的完整状态:', this.data);
    
    // 检查图片是否还存在
    if (this.data.formData.cover) {
      console.log('页面显示时发现封面图片:', this.data.formData.cover);
    }
  },

  // 页面隐藏时
  onHide() {
    // 可以在这里处理页面隐藏逻辑
    console.log('页面隐藏，当前表单数据:', this.data.formData);
    
    // 确保数据已保存到本地存储
    this.saveFormDataToStorage();
  },

  // 页面卸载时
  onUnload() {
    // 检查是否有未保存的内容
    const { formData } = this.data;
    if (formData.title || formData.description || formData.cover) {
      // 保存表单数据到本地存储
      this.saveFormDataToStorage();
    }
  },

  // 保存表单数据到本地存储
  saveFormDataToStorage() {
    try {
      const formData = this.data.formData;
      if (formData.title || formData.description || formData.cover) {
        wx.setStorageSync('course_create_draft', {
          formData: formData,
          categoryIndex: this.data.categoryIndex,
          timestamp: Date.now()
        });
        console.log('表单数据已保存到本地存储');
      }
    } catch (error) {
      console.error('保存表单数据到本地存储失败:', error);
    }
  },

  // 从本地存储恢复表单数据
  restoreFormData() {
    try {
      const savedData = wx.getStorageSync('course_create_draft');
      if (savedData && savedData.formData) {
        // 检查数据是否过期（24小时）
        const isExpired = Date.now() - savedData.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
          console.log('恢复保存的表单数据:', savedData);
          
          // 处理标签格式兼容性 - 使用通用清理函数
          let formData = savedData.formData;
          formData.tags = this.cleanTagsData(formData.tags);
          
          this.setData({
            formData: formData,
            categoryIndex: savedData.categoryIndex || 0
          });
          
          wx.showToast({
            title: '已恢复上次编辑的内容',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 清理过期数据
          wx.removeStorageSync('course_create_draft');
        }
      }
    } catch (error) {
      console.error('恢复表单数据失败:', error);
    }
  },

  // 清理本地存储的表单数据
  clearFormDataFromStorage() {
    try {
      wx.removeStorageSync('course_create_draft');
      console.log('已清理本地存储的表单数据');
    } catch (error) {
      console.error('清理本地存储失败:', error);
    }
  }
})