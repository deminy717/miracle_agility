// course.ts
import { getCourseList, mockCourseList } from '../../api/courseApi';
import { isLogin, getLocalUserInfo, mockLogin } from '../../utils/auth';

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
      
      // 调用API获取课程列表
      // const courses = await getCourseList({
      //   page: 1,
      //   pageSize: 10
      // });
      
      // 使用模拟数据
      const courses = mockCourseList.courses;
      
      this.setData({
        courses,
        loading: false
      });
    } catch (error) {
      console.error('获取课程列表失败', error);
      this.setData({
        loading: false
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
    mockLogin(userInfo);
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