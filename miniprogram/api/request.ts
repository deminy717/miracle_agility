// API请求基础封装

// 根据环境自动选择API地址
function getBaseURL() {
  // 获取系统信息
  const systemInfo = wx.getSystemInfoSync();
  
  // 如果是开发者工具，使用localhost
  if (systemInfo.platform === 'devtools') {
    return 'http://localhost:8080/api';
  }
  
  // 真机环境使用局域网IP（你可以根据需要修改这个IP）
  return 'http://192.168.10.100:8080/api';
}

const BASE_URL = getBaseURL();

console.log('🌐 当前API地址:', BASE_URL);

// 封装请求函数
export const request = (options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  needLogin?: boolean;
}): Promise<any> => {
  const { url, method = 'POST', data = {}, needLogin = true } = options;

  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token') || '';
    
    // 判断是否需要登录
    if (needLogin && !token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      reject({ error: 401, message: '请先登录' });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 发起请求
    console.log('🚀 发起网络请求:', {
      url: `${BASE_URL}${url}`,
      method,
      data,
      needLogin,
      token: token ? '***有token***' : '无token'
    });

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'auth': token
      },
      success: (res: any) => {
        // 关闭加载提示
        wx.hideLoading();
        
        console.log('✅ 网络请求成功:', {
          url: `${BASE_URL}${url}`,
          statusCode: res.statusCode,
          data: res.data
        });
        
        const { data } = res;
        
        // 处理响应数据
        if (data.error === 0) {
          // 成功
          resolve(data.body || {});
        } else if (data.error === 401) {
          // 未登录
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          
          // 清除登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('hasUserInfo');
          
          reject({ error: 401, message: data.message || '请先登录' });
        } else if (data.error === 500) {
          // 系统异常
          wx.showToast({
            title: '系统异常，请稍后再试',
            icon: 'none'
          });
          reject({ error: 500, message: data.message || '系统异常' });
        } else {
          // 业务异常
          // 对于登录接口，不自动显示toast，让调用方处理
          if (!url.includes('/user/login')) {
            wx.showToast({
              title: data.message || '请求失败',
              icon: 'none'
            });
          }
          reject({ error: data.error, message: data.message || '请求失败' });
        }
      },
      fail: (err) => {
        // 关闭加载提示
        wx.hideLoading();
        
        console.error('❌ 网络请求失败:', {
          url: `${BASE_URL}${url}`,
          error: err
        });
        
        // 网络错误
        wx.showToast({
          title: '网络异常，请检查网络连接',
          icon: 'none'
        });
        reject({ error: 999, message: '网络异常' });
      }
    });
  });
};

// 为了方便使用，提供不同请求方法的封装
export const get = (url: string, data: any = {}, needLogin: boolean = true): Promise<any> => {
  return request({ url, method: 'GET', data, needLogin });
};

export const post = (url: string, data: any = {}, needLogin: boolean = true): Promise<any> => {
  return request({ url, method: 'POST', data, needLogin });
};

export const put = (url: string, data: any = {}, needLogin: boolean = true): Promise<any> => {
  return request({ url, method: 'PUT', data, needLogin });
};

export const del = (url: string, data: any = {}, needLogin: boolean = true): Promise<any> => {
  return request({ url, method: 'DELETE', data, needLogin });
}; 