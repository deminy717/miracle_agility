// pages/admin/chapter-edit/chapter-edit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterId: null,
    courseId: null,
    chapterTitle: '',
    chapterInfo: {
      title: '',
      description: '',
      duration: '',
      status: 'draft'
    },
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('章节编辑页面参数:', options);
    
    if (options.chapterId) {
      this.setData({
        chapterId: options.chapterId
      });
    }
    
    if (options.courseId) {
      this.setData({
        courseId: options.courseId
      });
    }
    
    if (options.chapterTitle) {
      this.setData({
        chapterTitle: decodeURIComponent(options.chapterTitle)
      });
    }
    
    // 加载章节详细信息
    this.loadChapterInfo();
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

  // 加载章节信息
  async loadChapterInfo() {
    if (!this.data.chapterId) {
      wx.showToast({
        title: '章节ID无效',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      // 调用API获取章节详情
      const chapterInfo = await api.getChapterById(this.data.chapterId);
      
      console.log('章节详情:', chapterInfo);
      
      // 字段映射：将后端的durationMinutes映射到前端的duration
      const mappedChapterInfo = {
        ...chapterInfo,
        duration: chapterInfo.durationMinutes // 映射字段名
      };
      
      this.setData({
        chapterInfo: mappedChapterInfo,
        courseId: chapterInfo.courseId, // 从章节详情中获取courseId
        loading: false
      });
      
      wx.hideLoading();
      
    } catch (error) {
      console.error('加载章节信息失败:', error);
      
      wx.hideLoading();
      wx.showToast({
        title: '加载章节信息失败',
        icon: 'none'
      });
      
      // 使用传入的标题和courseId作为默认值
      this.setData({
        'chapterInfo.title': this.data.chapterTitle,
        courseId: this.data.courseId, // 使用传入的courseId
        loading: false
      });
    }
  },

  // 输入事件处理
  onTitleInput(e) {
    this.setData({
      'chapterInfo.title': e.detail.value
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'chapterInfo.description': e.detail.value
    });
  },

  onDurationInput(e) {
    this.setData({
      'chapterInfo.duration': e.detail.value
    });
  },

  // 选择状态
  selectStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      'chapterInfo.status': status
    });
  },

  // 保存章节
  async saveChapter() {
    const { title, description, duration, status } = this.data.chapterInfo;
    
    // 基础验证
    if (!title.trim()) {
      wx.showToast({
        title: '请输入章节标题',
        icon: 'none'
      });
      return;
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请输入章节描述',
        icon: 'none'
      });
      return;
    }

    if (!this.data.courseId) {
      wx.showToast({
        title: '课程ID缺失，无法保存',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    try {
      const api = require('../../../utils/api.js');
      
      const requestData = {
        courseId: parseInt(this.data.courseId),
        title: title.trim(),
        description: description.trim(),
        durationMinutes: parseInt(duration) || 0,
        status: status
      };

      console.log('更新章节请求数据:', requestData);
      
      // 调用API更新章节
      const result = await api.updateChapter(this.data.chapterId, requestData);
      
      wx.hideLoading();
      
      // API调用成功，result就是返回的章节数据
      console.log('章节更新成功:', result);
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      console.error('保存章节失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
})