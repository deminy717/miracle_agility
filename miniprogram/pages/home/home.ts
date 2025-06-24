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
    // 加载资讯和视频
    this.loadArticles();
    this.loadVideos();
  },

  // 页面显示
  onShow() {
    // 可以在这里添加刷新逻辑
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 重新加载数据
    this.loadArticles();
    this.loadVideos();
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  // 加载资讯
  async loadArticles() {
    try {
      // 调用API获取资讯列表
      // const articles = await getArticles({
      //   page: 1,
      //   pageSize: 10
      // });
      
      // 使用模拟数据（实际项目中删除）
      const articles = mockArticles.list;
      
      this.setData({
        articles,
        loading: false
      });
    } catch (error) {
      console.error('获取资讯失败', error);
      this.setData({
        loading: false
      });
    }
  },

  // 加载视频
  async loadVideos() {
    try {
      // 调用API获取视频列表
      // const videos = await getVideos({
      //   page: 1,
      //   pageSize: 10
      // });
      
      // 使用模拟数据（实际项目中删除）
      const videos = mockVideos.list;
      
      this.setData({
        videos,
        loading: false
      });
    } catch (error) {
      console.error('获取视频失败', error);
      this.setData({
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