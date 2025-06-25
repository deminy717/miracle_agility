// 用户相关API接口
import { post, get } from './request';

// 用户登录
export const login = (data: {
  code: string;
  userInfo?: {
    nickName: string;
    avatarUrl: string;
  }
}) => {
  return post('/user/login', data, false);
};

// 获取用户信息
export const getUserInfo = () => {
  return get('/user/info');
};

// 用户退出登录（前端逻辑，清除本地存储）
export const logout = () => {
  console.log('🚀 执行退出登录');
  
  // 清除本地存储
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('hasUserInfo');
  
  console.log('✅ 退出登录成功');
  
  // 返回Promise以保持API一致性
  return Promise.resolve({
    message: '退出登录成功'
  });
};

// 模拟数据，实际项目中删除
export const mockUserInfo = {
  userId: 'u123456',
  nickName: '测试用户',
  avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
  gender: '男',
  phone: '13812345678',
  coursesCount: 3,
  completedCount: 1
};

// 更新用户信息
export const updateProfile = (data: {
  customNickname: string;
  customAvatar: string;
}) => {
  return post('/user/profile', data);
};

// 获取用户信息状态
export const getProfileStatus = () => {
  return get('/user/profile/status');
}; 