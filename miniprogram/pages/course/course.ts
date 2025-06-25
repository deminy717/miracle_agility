// course.ts
import { getCourseList, mockCourseList } from '../../api/courseApi';
import { isLogin, getLocalUserInfo } from '../../utils/auth';

// 课程类型定义
interface Course {
  id: number;
  title: string;
  desc: string;
  coverImage: string;
  lessonCount: number;
  progress: number;
}

const courseApp = getApp<IAppOption>()
const courseDefaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    // 课程列表
    courses: [] as Course[],
    // 是否有用户信息
    hasUserInfo: false,
    // 是否正在加载
    loading: true,
    // 用户信息
    userInfo: {} as any
  },

  // 页面加载
  onLoad() {
    this.checkLogin();
  },

  // 页面显示
  onShow() {
    this.checkLogin();
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.hasUserInfo) {
      this.loadCourses();
    }
    wx.stopPullDownRefresh();
  },

  // 检查登录状态
  checkLogin() {
    const logged = isLogin();
    if (!logged) {
      this.setData({ hasUserInfo: false, loading: false });
      return;
    }
    const userInfo = getLocalUserInfo();
    this.setData({ hasUserInfo: true, userInfo: userInfo, loading: true }, () => {
      this.loadCourses();
    });
  },

  // 加载课程列表
  async loadCourses() {
    try {
      this.setData({ loading: true });
      
      console.log('🚀 开始获取课程列表');
      
      // 调用API获取课程列表
      const result = await getCourseList({
        page: 1,
        pageSize: 10
      });
      
      console.log('✅ 获取课程列表成功', result);
      
      // 如果API调用成功，使用返回的数据，否则使用模拟数据作为兜底
      const courses = (result && result.list) || mockCourseList.courses;
      
      this.setData({
        courses,
        loading: false
      });
    } catch (error) {
      console.error('❌ 获取课程列表失败', error);
      
      // 检查是否是401错误（需要登录）
      if (error && (error as any).error === 401) {
        console.log('🔒 检测到401错误，清除登录状态');
        
        // 清除本地登录信息
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('hasUserInfo');
        
        // 更新登录状态
        this.setData({
          hasUserInfo: false,
          loading: false,
          courses: []
        });
        
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        });
        
        return;
      }
      
      // 其他错误使用模拟数据
      this.setData({
        courses: mockCourseList.courses,
        loading: false
      });
      
      wx.showToast({
        title: '获取失败，使用模拟数据',
        icon: 'none'
      });
    }
  },

  // 登录
  login() {
    // 直接模拟登录
    const userInfo = {
      nickName: '测试用户',
      avatarUrl: '',
      gender: '男',
      phone: '',
      coursesCount: 3,
      completedCount: 1
    };
    
    // 保存token和用户信息
    wx.setStorageSync('token', 'mock-token-' + Date.now());
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('hasUserInfo', true);
    
    this.checkLogin();
  },

  // 跳转到课程详情
  goToCourseDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  }
}) 