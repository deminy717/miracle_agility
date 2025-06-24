// utils/auth.ts
// 全局登录状态工具，模拟微信登录

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

/** 判断是否已登录 */
export function isLogin(): boolean {
  const token = wx.getStorageSync(TOKEN_KEY);
  return !!token;
}

/** 模拟登录，保存 token 和用户信息 */
export function mockLogin(userInfo: any) {
  wx.setStorageSync(TOKEN_KEY, 'mock-token-' + Date.now());
  wx.setStorageSync(USER_INFO_KEY, userInfo);
}

/** 退出登录 */
export function logout() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_INFO_KEY);
}

/** 获取本地用户信息 */
export function getLocalUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY) || null;
} 