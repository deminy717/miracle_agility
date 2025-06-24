// 导入API接口
import { getVideoDetail, mockVideoDetail } from '../../api/videoApi';

// 定义视频类型
interface VideoItem {
  id: number;
  title: string;
  coverImage: string;
  duration: string;
}

interface Video {
  id: number;
  title: string;
  desc: string;
  coverImage: string;
  videoUrl: string;
  duration: string;
  publishTime: string;
  views: number;
  related: VideoItem[];
}

// 页面数据和方法
Page({
  data: {
    // 视频详情
    video: {} as Video,
    // 是否正在加载
    loading: true,
    // 视频ID
    videoId: 0,
    // 视频播放位置
    currentTime: 0
  },

  // 视频播放器实例
  videoContext: null as any,

  // 页面加载
  onLoad(options) {
    // 获取视频ID
    const videoId = Number(options.id || 1);
    this.setData({
      videoId,
      loading: true
    });

    // 加载视频详情
    this.loadVideoDetail(videoId);
  },

  // 页面显示
  onShow() {
    // 创建视频播放器实例
    this.videoContext = wx.createVideoContext('myVideo');
  },

  // 加载视频详情
  async loadVideoDetail(id: number) {
    try {
      // 调用API获取视频详情
      // const video = await getVideoDetail({ id });
      
      // 使用模拟数据（实际项目中删除）
      const video = mockVideoDetail;
      
      this.setData({
        video,
        loading: false
      });
    } catch (error) {
      console.error('获取视频详情失败', error);
      wx.showToast({
        title: '获取视频详情失败',
        icon: 'none'
      });
      this.setData({
        loading: false
      });
    }
  },

  // 跳转到视频详情
  goToVideoDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/pages/video-detail/video-detail?id=${id}`
    });
  },

  // 视频播放事件
  onVideoPlay() {
    console.log('视频开始播放');
  },

  // 视频暂停事件
  onVideoPause() {
    console.log('视频暂停播放');
  },

  // 视频结束事件
  onVideoEnd() {
    console.log('视频播放结束');
    // 可以在这里添加播放结束后的逻辑，如自动播放下一个视频
  },

  // 视频错误事件
  onVideoError(e: any) {
    console.error('视频播放错误', e.detail);
    wx.showToast({
      title: '视频播放错误',
      icon: 'none'
    });
  },

  // 视频播放进度更新事件
  onTimeUpdate(e: any) {
    this.setData({
      currentTime: e.detail.currentTime
    });
  },

  // 分享
  onShareAppMessage() {
    const { video } = this.data;
    return {
      title: video.title,
      path: `/pages/video-detail/video-detail?id=${video.id}`,
      imageUrl: video.coverImage
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { video } = this.data;
    return {
      title: video.title,
      query: `id=${video.id}`,
      imageUrl: video.coverImage
    };
  }
}); 