Page({
  data: {
    formData: {
      title: '',
      summary: '',
      category: '训练技巧',
      cover: '',
      content: '',
      tags: ''
    },
    categoryIndex: 0,
    categoryOptions: ['训练技巧', '赛事资讯', '健康护理', '装备推荐', '新手指南'],
    contentPreview: '',
    errors: {},
    saving: false
  },

  onLoad(options) {
    console.log('文章创建页面加载');
  },

  onShow() {
    // 从富文本编辑器返回时，获取编辑的内容
    const app = getApp();
    if (app.globalData.editorContent) {
      this.setData({
        'formData.content': app.globalData.editorContent,
        contentPreview: this.extractTextPreview(app.globalData.editorContent)
      });
      // 清除全局数据
      app.globalData.editorContent = null;
    }
  },

  // 文章标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      'formData.title': title,
      'errors.title': ''
    });
    this.validateTitle(title);
  },

  // 文章摘要输入
  onSummaryInput(e) {
    const summary = e.detail.value;
    this.setData({
      'formData.summary': summary,
      'errors.summary': ''
    });
    this.validateSummary(summary);
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categoryOptions[index],
      'errors.category': ''
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

  // 编辑内容（跳转到富文本编辑器）
  editContent() {
    // 将当前内容保存到全局数据中
    const app = getApp();
    app.globalData.editorContent = this.data.formData.content;
    app.globalData.editorContext = 'article'; // 标识来源
    
    wx.navigateTo({
      url: '/pages/card-editor/card-editor'
    });
  },

  // 提取文本预览
  extractTextPreview(htmlContent) {
    if (!htmlContent) return '';
    
    // 简单的HTML标签移除，实际项目中可能需要更复杂的处理
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  },

  // 图片上传（模拟）
  uploadImage(tempFilePath) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(tempFilePath);
      }, 1500);
    });
  },

  // 验证标题
  validateTitle(title) {
    if (!title || title.trim().length === 0) {
      this.setData({
        'errors.title': '请输入文章标题'
      });
      return false;
    }
    if (title.length < 5) {
      this.setData({
        'errors.title': '文章标题至少需要5个字符'
      });
      return false;
    }
    return true;
  },

  // 验证摘要
  validateSummary(summary) {
    if (!summary || summary.trim().length === 0) {
      this.setData({
        'errors.summary': '请输入文章摘要'
      });
      return false;
    }
    if (summary.length < 10) {
      this.setData({
        'errors.summary': '文章摘要至少需要10个字符'
      });
      return false;
    }
    return true;
  },

  // 验证封面
  validateCover() {
    if (!this.data.formData.cover) {
      this.setData({
        'errors.cover': '请选择封面图片'
      });
      return false;
    }
    return true;
  },

  // 验证内容
  validateContent() {
    if (!this.data.formData.content || this.data.formData.content.trim().length === 0) {
      this.setData({
        'errors.content': '请添加文章内容'
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
    if (!this.validateSummary(formData.summary)) {
      isValid = false;
    }
    if (!this.validateCover()) {
      isValid = false;
    }
    if (!this.validateContent()) {
      isValid = false;
    }

    return isValid;
  },

  // 保存草稿
  saveDraft() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善文章信息',
        icon: 'none'
      });
      return;
    }

    this.saveArticle('draft');
  },

  // 发布文章
  publishArticle() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善文章信息',
        icon: 'none'
      });
      return;
    }

    this.saveArticle('published');
  },

  // 保存文章
  saveArticle(status) {
    this.setData({
      saving: true
    });

    const articleData = {
      ...this.data.formData,
      status: status,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
      id: Date.now(),
      viewCount: 0,
      author: '管理员'
    };

    // 模拟API调用
    setTimeout(() => {
      this.setData({
        saving: false
      });

      wx.showToast({
        title: status === 'published' ? '文章发布成功' : '草稿保存成功',
        icon: 'success',
        duration: 2000
      });

      // 保存成功后返回文章管理页面
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);

      console.log('文章数据:', articleData);
    }, 1500);
  },

  // 页面卸载时
  onUnload() {
    // 清除可能存在的全局数据
    const app = getApp();
    if (app.globalData.editorContent) {
      app.globalData.editorContent = null;
    }
  }
})