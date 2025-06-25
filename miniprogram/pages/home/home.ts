// home.ts
// 获取应用实例
const homeApp = getApp<IAppOption>()

// 导入API接口
import { getArticles, getVideos, mockArticles, mockVideos } from '../../api/homeApi';

// 页面数据和方法
Page({
  data: {
    // 资讯列表
    articles: [] as any[],
    // 视频列表
    videos: [] as any[],
    // 是否正在加载
    loading: true
  },

  // 页面加载
  onLoad() {
    this.setData({ loading: true });
    this.getArticles();
    this.getVideos();
  },

  // 页面显示
  onShow() {
    // 可以在这里刷新数据
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ loading: true });
    this.getArticles();
    this.getVideos();
    wx.stopPullDownRefresh();
  },

  // 获取资讯列表
  async getArticles() {
    try {
      console.log('🚀 开始获取资讯列表');
      
      const result = await getArticles({
        page: 1,
        pageSize: 10
      });
      
      console.log('✅ 获取资讯列表成功', result);
      
      // 如果API调用成功，使用返回的数据，否则使用模拟数据作为兜底
      const articles = (result && result.list) || mockArticles.list;
      
      this.setData({
        articles: articles,
        loading: false
      });
    } catch (error) {
      console.warn('⚠️ API获取资讯列表失败，使用模拟数据', error);
      
      // 检查是否是401错误
      if (error && (error as any).error === 401) {
        console.log('🔒 资讯API检测到401错误');
        // 清除登录信息
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('hasUserInfo');
      }
      
      this.setData({
        articles: mockArticles.list,
        loading: false
      });
    }
  },

  // 获取视频列表
  async getVideos() {
    try {
      console.log('🚀 开始获取视频列表');
      
      const result = await getVideos({
        page: 1,
        pageSize: 10
      });
      
      console.log('✅ 获取视频列表成功', result);
      
      // 如果API调用成功，使用返回的数据，否则使用模拟数据作为兜底
      const videos = (result && result.list) || mockVideos.list;
      
      this.setData({
        videos: videos,
        loading: false
      });
    } catch (error) {
      console.warn('⚠️ API获取视频列表失败，使用模拟数据', error);
      
      // 检查是否是401错误
      if (error && (error as any).error === 401) {
        console.log('🔒 视频API检测到401错误');
        // 清除登录信息
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('hasUserInfo');
      }
      
      this.setData({
        videos: mockVideos.list,
        loading: false
      });
    }
  },

  // 点击文章
  goToArticle(e: any) {
    wx.showToast({
      title: '点击了文章',
      icon: 'none'
    });
  },

  // 播放视频
  playVideo(e: any) {
    wx.showToast({
      title: '点击了视频',
      icon: 'none'
    });
  },

  // 跳转到文章详情
  goToArticleDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${id}`
    });
  },

  // 跳转到视频详情
  goToVideoDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/video-detail/video-detail?id=${id}`
    });
  }
}); 