// pages/admin/chapter-create/chapter-create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseId: null,
    courseName: '',
    formData: {
      title: '',
      description: '',
      duration: ''
    },
    errors: {},
    saving: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('章节创建页面参数:', options);
    
    if (options.courseId) {
      this.setData({
        courseId: parseInt(options.courseId),
        courseName: decodeURIComponent(options.courseName || '')
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 章节标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      'formData.title': title,
      'errors.title': ''
    });
  },

  // 章节描述输入
  onDescriptionInput(e) {
    const description = e.detail.value;
    this.setData({
      'formData.description': description,
      'errors.description': ''
    });
  },

  // 预计时长输入
  onDurationInput(e) {
    const duration = e.detail.value;
    this.setData({
      'formData.duration': duration
    });
  },



  // 表单验证
  validateForm() {
    const { title, description } = this.data.formData;
    const errors = {};

    if (!title.trim()) {
      errors.title = '请输入章节标题';
    } else if (title.trim().length < 3) {
      errors.title = '章节标题至少3个字符';
    } else if (title.trim().length > 100) {
      errors.title = '章节标题不能超过100个字符';
    }

    if (!description.trim()) {
      errors.description = '请输入章节描述';
    } else if (description.trim().length < 10) {
      errors.description = '章节描述至少10个字符';
    } else if (description.trim().length > 300) {
      errors.description = '章节描述不能超过300个字符';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存草稿
  async saveDraft() {
    if (!this.validateForm()) {
      return;
    }

    if (this.data.saving) return;

    this.setData({ saving: true });

    try {
      wx.showLoading({ title: '保存中...' });
      
      const api = require('../../../utils/api.js');
      const requestData = {
        courseId: this.data.courseId,
        title: this.data.formData.title.trim(),
        description: this.data.formData.description.trim(),
        duration: parseInt(this.data.formData.duration) || 0,
        status: 'draft'
      };

      console.log('保存草稿数据:', requestData);
      
      // 调用后端API保存草稿
      const result = await api.createChapter(requestData);
      
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存草稿失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ saving: false });
    }
  },

  // 立即发布
  async publishChapter() {
    if (!this.validateForm()) {
      return;
    }

    if (this.data.saving) return;

    this.setData({ saving: true });

    try {
      wx.showLoading({ title: '发布中...' });
      
      const api = require('../../../utils/api.js');
      const requestData = {
        courseId: this.data.courseId,
        title: this.data.formData.title.trim(),
        description: this.data.formData.description.trim(),
        duration: parseInt(this.data.formData.duration) || 0,
        status: 'published'
      };

      console.log('发布章节数据:', requestData);
      
      // 调用后端API发布章节
      const result = await api.createChapter(requestData);
      
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('发布章节失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    } finally {
      this.setData({ saving: false });
    }
  }
})