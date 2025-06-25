import { updateProfile, getProfileStatus } from '../../api/userApi';

interface ProfileStatus {
  profileCompleted: boolean;
  needCustomNickname: boolean;
  needCustomAvatar: boolean;
  displayNickname: string;
  displayAvatar: string;
}

Page({
  data: {
    nickname: '',
    avatarUrl: '',
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    loading: false,
    profileStatus: {} as ProfileStatus,
    supportAvatarApi: false,
    supportNicknameApi: false
  },

  onLoad() {
    this.checkApiSupport();
    this.loadCurrentUserInfo();
  },

  // 检查微信API支持情况
  checkApiSupport() {
    const systemInfo = wx.getSystemInfoSync();
    const sdkVersion = systemInfo.SDKVersion;
    
    // 检查是否支持头像昵称填写能力（基础库2.21.2及以上）
    const supportAvatarApi = this.compareVersion(sdkVersion, '2.21.2') >= 0;
    const supportNicknameApi = this.compareVersion(sdkVersion, '2.21.2') >= 0;
    
    console.log('SDK版本:', sdkVersion, '支持头像API:', supportAvatarApi, '支持昵称API:', supportNicknameApi);
    
    this.setData({
      supportAvatarApi,
      supportNicknameApi
    });
  },

  // 版本号比较
  compareVersion(v1: string, v2: string): number {
    const v1parts = v1.split('.').map(Number);
    const v2parts = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  },

  // 加载当前用户信息
  async loadCurrentUserInfo() {
    try {
      // 先从本地存储获取用户信息作为默认值
      const localUserInfo = wx.getStorageSync('userInfo') || {};
      console.log('本地用户信息:', localUserInfo);
      
      // 设置默认显示信息
      this.setData({
        nickname: localUserInfo.nickName || localUserInfo.customNickname || '',
        avatarUrl: localUserInfo.avatarUrl || localUserInfo.customAvatar || this.data.defaultAvatarUrl
      });
      
      // 然后尝试从后台获取最新信息
      await this.checkProfileStatus();
      
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 如果获取失败，使用本地信息
      const localUserInfo = wx.getStorageSync('userInfo') || {};
      this.setData({
        nickname: localUserInfo.nickName || localUserInfo.customNickname || '',
        avatarUrl: localUserInfo.avatarUrl || localUserInfo.customAvatar || this.data.defaultAvatarUrl
      });
    }
  },

  // 检查用户信息状态
  async checkProfileStatus() {
    try {
      const result = await getProfileStatus();
      
      // 修复：使用正确的判断逻辑
      if (result && result.profileCompleted !== undefined) {
        console.log('获取用户状态成功:', result);
        
        this.setData({ 
          profileStatus: result,
          // 更新显示信息，优先使用后台最新数据
          nickname: result.displayNickname || result.customNickname || this.data.nickname,
          avatarUrl: result.displayAvatar || result.customAvatar || this.data.avatarUrl
        });
        
        // 如果已完善，提示用户
        if (result.profileCompleted) {
          wx.showModal({
            title: '提示',
            content: '您已完善个人信息，可以继续修改或返回上一页',
            confirmText: '继续修改',
            cancelText: '返回',
            success: (res) => {
              if (!res.confirm) {
                wx.navigateBack();
              }
            }
          });
        }
      } else {
        console.warn('获取用户状态失败，使用本地信息');
      }
    } catch (error) {
      console.error('获取用户状态失败:', error);
      // 失败时不做处理，继续使用已设置的默认信息
    }
  },

  // 微信原生头像选择回调
  onChooseAvatar(e: any) {
    console.log('选择头像:', e);
    const { avatarUrl } = e.detail;
    
    if (avatarUrl) {
      this.setData({
        avatarUrl: avatarUrl
      });
      
      wx.showToast({
        title: '头像选择成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '头像选择失败',
        icon: 'none'
      });
    }
  },

  // 兼容旧版本的头像选择
  chooseAvatarFallback() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          
          this.setData({
            avatarUrl: tempFilePath
          });
          
          wx.showToast({
            title: '头像选择成功',
            icon: 'success'
          });
        }
      },
      fail: (error) => {
        console.error('选择头像失败:', error);
        wx.showToast({
          title: '选择头像失败',
          icon: 'none'
        });
      }
    });
  },

  // 昵称输入
  onNicknameInput(e: any) {
    const nickname = e.detail.value;
    this.setData({
      nickname: nickname
    });
  },

  // 保存用户信息
  async saveProfile() {
    const { nickname, avatarUrl } = this.data;
    
    // 验证输入
    if (!nickname || nickname.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    if (nickname.trim().length > 20) {
      wx.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none'
      });
      return;
    }
    
    if (!avatarUrl) {
      wx.showToast({
        title: '请选择头像',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      console.log('保存用户信息:', { nickname: nickname.trim(), avatarUrl });
      
      const result = await updateProfile({
        customNickname: nickname.trim(),
        customAvatar: avatarUrl
      });
      
      console.log('后台返回结果:', result);
      
      // 修复：request.ts已经处理了ApiResponse，成功时直接返回data.body
      // 所以这里只需要判断是否有返回数据即可
      if (result && result.id) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 更新本地存储 - 使用后台返回的用户信息
        let userInfo = wx.getStorageSync('userInfo') || {};
        
        // 使用后台返回的完整用户信息
        userInfo = {
          ...userInfo,
          ...result,
          // 确保使用显示用的昵称和头像
          nickName: result.displayNickname || result.customNickname || nickname.trim(),
          avatarUrl: result.displayAvatar || result.customAvatar || avatarUrl
        };
        
        wx.setStorageSync('userInfo', userInfo);
        console.log('更新本地用户信息:', userInfo);
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        console.error('保存失败 - 后台返回数据异常:', result);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 取消修改
  skipSetup() {
    wx.showModal({
      title: '确认取消',
      content: '您的修改尚未保存，确定要取消吗？',
      confirmText: '确定取消',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
}); 