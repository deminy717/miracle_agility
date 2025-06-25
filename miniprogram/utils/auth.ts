// utils/auth.ts
// 全局登录状态工具

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

/** 判断是否已登录 */
export function isLogin(): boolean {
  const token = wx.getStorageSync(TOKEN_KEY);
  return !!token;
}

/** 获取本地用户信息 */
export function getLocalUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY) || null;
}

/** 获取本地token */
export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY) || '';
} 