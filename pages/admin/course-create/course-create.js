Page({
  data: {
    formData: {
      title: '',
      description: '',
      cover: '',
      category: '基础训练',
      tags: ''
    },
    categoryIndex: 0,
    categoryOptions: ['基础训练', '敏捷训练', '行为纠正', '技能提升', '比赛准备'],
    errors: {},
    saving: false
  },

  onLoad(options) {
    // 页面加载时的初始化
    console.log('课程创建页面加载');
  },

  // 课程标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      'formData.title': title,
      'errors.title': ''
    });
    this.validateTitle(title);
  },

  // 课程介绍输入
  onDescriptionInput(e) {
    const description = e.detail.value;
    this.setData({
      'formData.description': description,
      'errors.description': ''
    });
    this.validateDescription(description);
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categoryOptions[index]
    });
  },

  // 标签输入
  onTagsInput(e) {
    this.setData({
      'formData.tags': e.detail.value
    });
  },

  // 选择封面图片
  chooseCover() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        wx.showLoading({
          title: '上传中...'
        });

        // 模拟图片上传
        that.uploadImage(tempFilePath).then(imageUrl => {
          that.setData({
            'formData.cover': imageUrl,
            'errors.cover': ''
          });
          wx.hideLoading();
          wx.showToast({
            title: '图片上传成功',
            icon: 'success'
          });
        }).catch(error => {
          wx.hideLoading();
          wx.showToast({
            title: '图片上传失败',
            icon: 'error'
          });
          console.error('图片上传失败:', error);
        });
      },
      fail() {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
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

  // 图片上传（模拟）
  uploadImage(tempFilePath) {
    return new Promise((resolve, reject) => {
      // 模拟上传延迟
      setTimeout(() => {
        // 实际项目中这里应该调用真实的上传API
        // 这里直接返回临时文件路径作为示例
        resolve(tempFilePath);
      }, 1500);
    });
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
  saveCourse(status) {
    this.setData({
      saving: true
    });

    const courseData = {
      ...this.data.formData,
      status: status,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
      id: Date.now(), // 临时ID，实际项目中由后端生成
      studentCount: 0,
      chapterCount: 0
    };

    // 模拟API调用
    setTimeout(() => {
      this.setData({
        saving: false
      });

      wx.showToast({
        title: status === 'published' ? '课程发布成功' : '草稿保存成功',
        icon: 'success',
        duration: 2000
      });

      // 保存成功后返回课程管理页面
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);

      console.log('课程数据:', courseData);
    }, 1500);
  },

  // 页面显示时
  onShow() {
    // 可以在这里处理页面显示逻辑
  },

  // 页面隐藏时
  onHide() {
    // 可以在这里处理页面隐藏逻辑
  },

  // 页面卸载时
  onUnload() {
    // 检查是否有未保存的内容
    const { formData } = this.data;
    if (formData.title || formData.description || formData.cover) {
      // 可以在这里提示用户保存草稿
    }
  }
})