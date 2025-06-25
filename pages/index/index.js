// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: '欢迎来到犬敏捷俱乐部',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '测试用户',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  
  onLoad() {
    // 设置登录状态
    this.setMockLoginState()
    
    // 延迟跳转到主页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      })
    }, 1500)
  },
  
  // 设置模拟登录状态
  setMockLoginState() {
    console.log('index页面：设置模拟登录状态')
    
    // 设置模拟token
    wx.setStorageSync('token', 'mock_token_for_development')
    
    // 设置模拟用户信息
    const mockUserInfo = {
      nickname: '测试用户',
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      level: '中级训练师',
      trainedDogs: 3,
      monthlyProgress: 75,
      gender: 1,
      province: '广东',
      city: '深圳'
    }
    
    wx.setStorageSync('userInfo', mockUserInfo)
    
    // 更新全局数据
    const app = getApp()
    app.globalData.userInfo = mockUserInfo
    app.globalData.isLoggedIn = true
    
    console.log('index页面：模拟登录状态已设置', mockUserInfo)
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
})
