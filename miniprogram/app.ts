// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 开启真机调试日志
    console.log('🚀 小程序启动');
    
    // 检查是否为真机环境
    const systemInfo = wx.getSystemInfoSync();
    console.log('📱 系统信息:', {
      platform: systemInfo.platform,
      version: systemInfo.version,
      SDKVersion: systemInfo.SDKVersion
    });
    
    // 真机环境下开启调试模式
    if (systemInfo.platform !== 'devtools') {
      console.log('📱 真机环境，开启调试模式');
      wx.setEnableDebug({
        enableDebug: true,
        success: () => {
          console.log('✅ 真机调试模式已开启');
        },
        fail: (error) => {
          console.error('❌ 开启真机调试模式失败:', error);
        }
      });
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})