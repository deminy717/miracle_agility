// 导入API接口
import { getUserInfo as fetchUserInfo, mockUserInfo } from '../../api/userApi';
import { isLogin, mockLogin, logout as authLogout, getLocalUserInfo } from '../../utils/auth';

// 定义用户信息类型
interface UserInfo {
  userId: string;
  nickName: string;
  avatarUrl: string;
  gender: string;
  phone: string;
  coursesCount: number;
  completedCount: number;
}

// 页面数据和方法
Page({
  data: {
    // 用户信息
    userInfo: {} as UserInfo,
    // 是否有用户信息
    hasUserInfo: false,
    // 是否正在加载
    loading: true
  },

  // 页面加载
  onLoad() {
    this.updateLoginState();
  },

  // 页面显示
  onShow() {
    this.updateLoginState();
  },

  updateLoginState() {
    const logged = isLogin();
    if (logged) {
      const userInfo = getLocalUserInfo() || mockUserInfo;
      this.setData({ userInfo, hasUserInfo: true, loading: false });
    } else {
      this.setData({ hasUserInfo: false, loading: false });
    }
  },

  // 模拟微信登录
  login() {
    this.setData({ loading: true });
    // 直接本地模拟登录
    const userInfo = mockUserInfo;
    mockLogin(userInfo);
    this.updateLoginState();
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      this.setData({ loading: true });
      
      // 使用模拟数据
      const userInfo = mockUserInfo;
      
      // 更新用户信息
      wx.setStorageSync('userInfo', userInfo);
      
      this.setData({
        userInfo,
        hasUserInfo: true,
        loading: false
      });
    } catch (error) {
      console.error('获取用户信息失败', error);
      this.setData({ loading: false });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          authLogout();
          this.setData({ hasUserInfo: false, userInfo: {} as UserInfo, loading: false });
        }
      }
    });
  },

  // 跳转到我的课程
  goToMyCourses() {
    wx.switchTab({
      url: '/pages/course/course'
    });
  },

  // 跳转到我的收藏
  goToFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到设置
  goToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 联系我们
  contactUs() {
    wx.showModal({
      title: '联系我们',
      content: '电话：010-12345678\n邮箱：contact@dogagility.cn',
      showCancel: false
    });
  }
}); 