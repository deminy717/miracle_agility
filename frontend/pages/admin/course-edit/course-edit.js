// pages/admin/course-edit/course-edit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courseId: null,
    courseInfo: {},
    loading: true,
    formData: {
      title: '',
      description: '',
      cover: '',
      category: '',
      level: 'beginner',
      price: 0,
      tags: '',
      requirements: '',
      objectives: ''
    },
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('课程编辑页面加载:', options);
    if (options.id) {
      this.setData({
        courseId: options.id
      });
      this.loadCourseInfo();
    }
  },

  // 加载课程信息
  async loadCourseInfo() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const api = require('../../../utils/api.js');
      const result = await api.getCourseById(this.data.courseId);
      
      console.log('获取课程详情成功:', result);
      
      this.setData({
        courseInfo: result,
        formData: {
          title: result.title || '',
          description: result.description || '',
          cover: result.cover || '',
          category: result.category || '',
          level: result.level || 'beginner',
          price: result.price || 0,
          tags: result.tags || '',
          requirements: result.requirements || '',
          objectives: result.objectives || ''
        },
        loading: false
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

  // 表单输入处理
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  onCategoryInput(e) {
    this.setData({
      'formData.category': e.detail.value
    });
  },

  onPriceInput(e) {
    this.setData({
      'formData.price': parseFloat(e.detail.value) || 0
    });
  },

  onTagsInput(e) {
    this.setData({
      'formData.tags': e.detail.value
    });
  },

  onRequirementsInput(e) {
    this.setData({
      'formData.requirements': e.detail.value
    });
  },

  onObjectivesInput(e) {
    this.setData({
      'formData.objectives': e.detail.value
    });
  },

  // 保存修改
  async saveCourse() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      const api = require('../../../utils/api.js');
      const result = await api.updateCourse(this.data.courseId, this.data.formData);
      
      console.log('更新课程成功:', result);
      
      this.setData({ submitting: false });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 保存成功后返回
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      
    } catch (error) {
      console.error('更新课程失败:', error);
      this.setData({ submitting: false });
      
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 表单验证
  validateForm() {
    const { title, description, category } = this.data.formData;
    return title.trim() && description.trim() && category.trim();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
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

  }
})