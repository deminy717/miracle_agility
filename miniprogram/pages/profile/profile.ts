// 导入API接口
import { getUserInfo as fetchUserInfo, mockUserInfo, login as apiLogin, logout as apiLogout } from '../../api/userApi';
import { isLogin, getLocalUserInfo } from '../../utils/auth';

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

interface ProfilePageData {
  isLoggedIn: boolean;
  userInfo: {
    id?: number;
    nickName: string;
    avatarUrl: string;
  };
  loading: boolean;
  // 调试相关
  debugLogs: string[];
  showDebug: boolean;
  // 是否显示调试按钮（仅真机环境）
  showDebugButton: boolean;
  // 头像昵称填写表单
  showAvatarNicknameForm: boolean;
  loginCode: string;
  tempNickname: string;
  tempAvatarUrl: string;
  // 是否显示管理后台入口
  showAdminEntry: boolean;
}

// 页面数据和方法
Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    loading: false,
    // 调试日志
    debugLogs: [] as string[],
    // 是否显示调试信息
    showDebug: false,
    // 是否显示调试按钮（仅真机环境）
    showDebugButton: false,
    // 是否显示头像昵称填写表单
    showAvatarNicknameForm: false,
    // 登录凭证
    loginCode: '',
    // 临时昵称
    tempNickname: '',
    // 临时头像
    tempAvatarUrl: '',
    // 是否显示管理后台入口
    showAdminEntry: false
  },

  // 页面加载
  onLoad() {
    console.log('Profile page loaded');
    this.checkLoginStatus();
    
    // 检查是否为真机环境
    const systemInfo = wx.getSystemInfoSync();
    if (systemInfo.platform !== 'devtools') {
      this.setData({ showDebugButton: true });
    }
  },

  // 页面显示
  onShow() {
    this.checkLoginStatus();
    // 如果已登录，重新获取最新的用户信息
    if (this.data.isLoggedIn) {
      this.refreshUserInfo();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      this.addDebugLog('✅ 已登录状态');
      
      // 检查是否显示管理后台入口
      this.checkAdminAccess(userInfo);
    } else {
      this.addDebugLog('❌ 未登录状态');
    }
  },

  // 检查管理后台访问权限
  checkAdminAccess(userInfo: any) {
    // 可以根据用户ID、手机号或其他标识来判断是否显示管理后台
    // 这里提供几种方案：
    
    // 方案1：指定特定用户ID
    const adminUserIds = [1, 2, 3]; // 替换为实际的管理员用户ID
    
    // 方案2：指定特定手机号
    const adminPhones = ['13800000000', '13900000000']; // 替换为实际的管理员手机号
    
    // 方案3：指定特定微信openid或昵称
    const adminOpenids = ['o1234567890abcdef']; // 替换为实际的管理员openid
    
    // 方案4：开发测试模式 - 暂时对所有用户开放（生产环境请删除此行）
    const isDevelopmentMode = true; // 开发测试时设为true，生产环境改为false
    
    const showAdminEntry = 
      isDevelopmentMode || // 开发模式下对所有用户开放
      adminUserIds.includes(userInfo.id) ||
      adminPhones.includes(userInfo.phone) ||
      adminOpenids.includes(userInfo.openid) ||
      userInfo.nickName === '系统管理员' ||
      userInfo.nickName === '体验用户'; // 也可以通过昵称判断
    
    this.setData({ showAdminEntry });
    
    if (showAdminEntry) {
      this.addDebugLog('🔑 管理员权限已授予');
      console.log('🔑 管理员权限已授予，用户信息:', userInfo);
    } else {
      this.addDebugLog('❌ 无管理员权限');
      console.log('❌ 无管理员权限，用户信息:', userInfo);
    }
  },

  // 刷新用户信息
  async refreshUserInfo(silent: boolean = false) {
    try {
      if (!silent) {
        console.log('🔄 刷新用户信息...');
      }
      
      // 调用后台API获取最新用户信息
      const result = await fetchUserInfo();
      
      // 修复：request.ts已经处理了ApiResponse，成功时直接返回data.body
      // 所以这里只需要判断是否有返回数据即可
      if (result && result.id) {
        if (!silent) {
          console.log('✅ 获取最新用户信息成功:', result);
        }
        
        // 更新本地存储和页面数据
        const userInfo = {
          ...result,
          // 确保使用显示用的昵称和头像
          nickName: result.displayNickname || result.customNickname || result.nickName || '微信用户',
          avatarUrl: result.displayAvatar || result.customAvatar || result.avatarUrl || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
        };
        
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo: userInfo
        });
        
        if (!silent) {
          this.addDebugLog(`✅ 用户信息已更新: ${userInfo.nickName}`);
        } else {
          this.addDebugLog(`🔄 静默更新用户信息: ${userInfo.nickName}`);
        }
      } else {
        if (!silent) {
          console.warn('⚠️ 获取用户信息失败，继续使用本地缓存');
          this.addDebugLog('⚠️ 获取用户信息失败，使用本地缓存');
        }
      }
    } catch (error) {
      if (!silent) {
        console.warn('⚠️ 刷新用户信息失败:', error);
        this.addDebugLog(`⚠️ 刷新用户信息失败: ${error}`);
      }
      // 失败时不做任何处理，继续使用本地缓存的信息
    }
  },

  // 微信一键登录（使用头像昵称填写能力）
  login() {
    console.log('=== 开始微信一键登录 ===');
    this.addDebugLog('=== 开始微信一键登录 ===');
    this.setData({ loading: true });
    
    // 获取微信登录凭证
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          this.addDebugLog(`✅ 获取登录code: ${loginRes.code.substring(0, 10)}...`);
          
          // 优先尝试直接登录（针对老用户）
          await this.tryDirectLogin(loginRes.code);
        } else {
          this.addDebugLog('❌ 获取登录code失败');
          this.fallbackToMockLogin();
        }
      },
      fail: (error) => {
        console.error('❌ 微信登录失败:', error);
        this.addDebugLog(`❌ 微信登录失败: ${error.errMsg || '未知错误'}`);
        this.fallbackToMockLogin();
      }
    });
  },

  // 尝试直接登录（针对已注册用户）
  async tryDirectLogin(code: string) {
    try {
      this.addDebugLog('🔄 尝试直接登录...');
      
      // 先尝试直接登录，不传用户信息
      const result = await apiLogin({
        code: code
        // 不传 userInfo，让后端判断是否为老用户
      });
      
      this.addDebugLog('✅ 直接登录成功（老用户）');
      this.saveLoginResult(result, '登录成功');
      
    } catch (error: any) {
      this.addDebugLog(`⚠️ 直接登录失败: ${error.message || error}`);
      
      // 检查是否为code被使用的错误
      if (this.isCodeUsedError(error)) {
        this.addDebugLog('🔄 Code已被使用，重新获取...');
        this.retryLoginWithNewCode();
        return;
      }
      
      // 如果是新用户或需要完善信息，则显示头像昵称填写表单
      if (this.isNewUserError(error)) {
        this.addDebugLog('👤 检测到新用户，显示信息填写表单');
        await this.handleNewUserLoginWithNewCode();
      } else {
        this.addDebugLog('❌ 登录出错，重新获取code并使用默认信息重试');
        await this.retryLoginWithDefaultInfo();
      }
    }
  },

  // 判断是否为新用户错误
  isNewUserError(error: any): boolean {
    // 根据后端返回的错误信息判断是否为新用户
    const errorMsg = error.message || error.toString() || '';
    console.log('🔍 分析错误信息:', errorMsg);
    this.addDebugLog(`🔍 分析错误信息: ${errorMsg}`);
    
    // 匹配各种可能的新用户错误信息
    const newUserPatterns = [
      '用户不存在',
      '需要提供用户信息',
      '需要注册',
      '新用户',
      'USER_NOT_FOUND',
      'user not found',
      'not found'
    ];
    
    for (const pattern of newUserPatterns) {
      if (errorMsg.includes(pattern)) {
        this.addDebugLog(`✅ 匹配到新用户模式: ${pattern}`);
        return true;
      }
    }
    
    // 检查错误码
    if (error.code === 'USER_NOT_FOUND' || error.code === 404) {
      this.addDebugLog('✅ 错误码匹配新用户');
      return true;
    }
    
    this.addDebugLog('❌ 不是新用户错误，可能是其他登录问题');
    return false;
  },

  // 判断是否为code被使用的错误
  isCodeUsedError(error: any): boolean {
    const errorMsg = error.message || error.toString() || '';
    const codeUsedPatterns = [
      'code been used',
      'code已被使用',
      '登录凭证已被使用',
      '40163',
      'code无效',
      'invalid code'
    ];
    
    for (const pattern of codeUsedPatterns) {
      if (errorMsg.includes(pattern)) {
        this.addDebugLog(`✅ 检测到code被使用错误: ${pattern}`);
        return true;
      }
    }
    
    return false;
  },

  // 重新获取code并重试登录
  retryLoginWithNewCode() {
    this.addDebugLog('🔄 重新获取微信登录凭证...');
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          this.addDebugLog(`✅ 获取新的登录code: ${loginRes.code.substring(0, 10)}...`);
          await this.tryDirectLogin(loginRes.code);
        } else {
          this.addDebugLog('❌ 重新获取登录code失败');
          this.fallbackToMockLogin();
        }
      },
      fail: () => {
        this.addDebugLog('❌ 重新获取登录code失败');
        this.fallbackToMockLogin();
      }
    });
  },

  // 重新获取code并处理新用户登录
  async handleNewUserLoginWithNewCode() {
    this.addDebugLog('🔄 为新用户重新获取微信登录凭证...');
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          this.addDebugLog(`✅ 为新用户获取新的登录code: ${loginRes.code.substring(0, 10)}...`);
          await this.handleNewUserLogin(loginRes.code);
        } else {
          this.addDebugLog('❌ 重新获取登录code失败');
          this.fallbackToMockLogin();
        }
      },
      fail: () => {
        this.addDebugLog('❌ 重新获取登录code失败');
        this.fallbackToMockLogin();
      }
    });
  },

  // 重新获取code并使用默认信息登录
  async retryLoginWithDefaultInfo() {
    this.addDebugLog('🔄 重新获取微信登录凭证并使用默认信息...');
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          this.addDebugLog(`✅ 获取新的登录code: ${loginRes.code.substring(0, 10)}...`);
          await this.loginWithDefaultInfo(loginRes.code);
        } else {
          this.addDebugLog('❌ 重新获取登录code失败');
          this.fallbackToMockLogin();
        }
      },
      fail: () => {
        this.addDebugLog('❌ 重新获取登录code失败');
        this.fallbackToMockLogin();
      }
    });
  },

  // 处理新用户登录
  async handleNewUserLogin(code: string) {
    // 检查是否支持头像昵称填写能力
    const systemInfo = wx.getSystemInfoSync();
    this.addDebugLog(`📱 微信版本: ${systemInfo.version}, SDK: ${systemInfo.SDKVersion}`);
    
    if (this.checkAvatarNicknameSupport(systemInfo.SDKVersion)) {
      this.addDebugLog('✅ 支持头像昵称填写能力');
      this.showAvatarNicknameForm(code);
    } else {
      this.addDebugLog('⚠️ 不支持头像昵称填写能力，使用默认登录');
      await this.loginWithDefaultInfo(code);
    }
  },

  // 检查是否支持头像昵称填写能力
  checkAvatarNicknameSupport(sdkVersion: string): boolean {
    if (!sdkVersion) return false;
    
    const version = sdkVersion.split('.').map(Number);
    // 需要基础库 2.21.2 或以上
    if (version[0] > 2) return true;
    if (version[0] === 2 && version[1] > 21) return true;
    if (version[0] === 2 && version[1] === 21 && version[2] >= 2) return true;
    
    return false;
  },

  // 显示头像昵称填写表单
  showAvatarNicknameForm(code: string) {
    this.setData({ 
      loading: false,
      showAvatarNicknameForm: true,
      loginCode: code,
      tempNickname: '微信用户',
      tempAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    });
    this.addDebugLog('📝 显示头像昵称填写表单');
  },

  // 头像选择（新版API）
  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;
    this.setData({
      tempAvatarUrl: avatarUrl
    });
    this.addDebugLog(`✅ 用户选择了新头像: ${avatarUrl}`);
  },

  // 昵称输入
  onNicknameChange(e: any) {
    this.setData({
      tempNickname: e.detail.value
    });
  },

  // 取消头像昵称设置，使用默认信息登录
  async cancelAvatarNickname() {
    this.addDebugLog('⏭️ 用户跳过头像昵称设置');
    this.setData({ showAvatarNicknameForm: false });
    await this.retryLoginWithDefaultInfo();
  },

  // 确认使用头像昵称
  async confirmAvatarNickname() {
    const { tempNickname, tempAvatarUrl } = this.data;
    
    if (!tempNickname || tempNickname.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });
    this.addDebugLog(`🚀 确认使用昵称: ${tempNickname}`);

    // 重新获取登录凭证确保code有效
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          this.addDebugLog('❌ 获取登录凭证失败');
          this.setData({ loading: false });
          wx.showToast({
            title: '获取登录凭证失败，请重试',
            icon: 'none'
          });
          return;
        }

        this.addDebugLog(`✅ 获取新的登录code: ${loginRes.code.substring(0, 10)}...`);

        try {
          const result = await apiLogin({
            code: loginRes.code,
            userInfo: {
              nickName: tempNickname.trim(),
              avatarUrl: tempAvatarUrl
            }
          });

          this.addDebugLog('✅ 登录成功');
          this.setData({ showAvatarNicknameForm: false });
          this.saveLoginResult(result, '登录成功');
          
        } catch (error: any) {
          console.error('❌ 登录失败:', error);
          this.addDebugLog(`❌ 登录失败: ${error.message || error}`);
          this.setData({ loading: false });
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: () => {
        this.addDebugLog('❌ 获取登录凭证失败');
        this.setData({ loading: false });
        wx.showToast({
          title: '获取登录凭证失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 使用默认信息登录
  async loginWithDefaultInfo(code: string) {
    try {
      this.addDebugLog('🚀 使用默认信息登录...');
      
      const result = await apiLogin({
        code: code,
        userInfo: {
          nickName: '微信用户',
          avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
        }
      });
      
      this.addDebugLog('✅ 默认信息登录成功');
      this.saveLoginResult(result, '登录成功');
      
    } catch (error) {
      console.error('❌ 默认信息登录失败:', error);
      this.addDebugLog(`❌ 默认信息登录失败: ${error}`);
      this.fallbackToMockLogin();
    }
  },

  // 保存登录结果
  saveLoginResult(result: any, message: string) {
    this.setData({ loading: false });
    
    if (result && result.token && result.userInfo) {
      // 保存登录信息
      wx.setStorageSync('token', result.token);
      wx.setStorageSync('userInfo', result.userInfo);
      
      this.setData({
        isLoggedIn: true,
        userInfo: result.userInfo,
        showAvatarNicknameForm: false
      });
      
      // 检查管理员权限
      this.checkAdminAccess(result.userInfo);
      
      wx.showToast({
        title: message,
        icon: 'success'
      });
      
      this.addDebugLog(`✅ ${message} - 用户: ${result.userInfo.nickName}`);
      
      // 登录成功后，静默刷新用户信息以获取最新的头像和昵称
      setTimeout(() => {
        this.refreshUserInfo(true);
      }, 1000);
      
    } else {
      this.addDebugLog('❌ 登录结果数据异常');
      this.fallbackToMockLogin();
    }
  },

  // 模拟登录备用方案
  fallbackToMockLogin() {
    this.setData({ loading: false });
    this.addDebugLog('🔄 启用模拟登录');
    
    const mockUserInfo = {
      id: 1,
      nickName: '体验用户',
      avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    };
    
    wx.setStorageSync('token', 'mock_token');
    wx.setStorageSync('userInfo', mockUserInfo);
    
    this.setData({
      isLoggedIn: true,
      userInfo: mockUserInfo,
      showAvatarNicknameForm: false
    });
    
    // 检查管理员权限
    this.checkAdminAccess(mockUserInfo);
    
    wx.showToast({
      title: '体验模式登录成功',
      icon: 'success'
    });
    
    // 模拟登录后也尝试静默刷新用户信息
    setTimeout(() => {
      this.refreshUserInfo(true);
    }, 1000);
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      this.setData({ loading: true });
      
      console.log('🚀 开始获取用户信息');
      
      // 尝试调用后台API获取用户信息
      try {
        const userInfo = await fetchUserInfo();
        console.log('✅ 成功获取用户信息', userInfo);
        
        // 更新用户信息
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo,
          hasUserInfo: true,
          loading: false
        });
        
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
        
      } catch (apiError) {
        console.warn('⚠️ API获取用户信息失败，使用模拟数据', apiError);
        
        // API失败时使用模拟数据
        const userInfo = mockUserInfo;
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo,
          hasUserInfo: true,
          loading: false
        });
        
        wx.showToast({
          title: '使用模拟数据',
          icon: 'none'
        });
      }
      
    } catch (error) {
      console.error('❌ 获取用户信息失败', error);
      this.setData({ loading: false });
      
      wx.showToast({
        title: '获取失败',
        icon: 'error'
      });
    }
  },

  // 退出登录
  async logout() {
    this.addDebugLog('🚪 开始退出登录');
    
    try {
      // 调用退出登录API
      await apiLogout();
      this.addDebugLog('✅ API退出登录成功');
    } catch (error) {
      this.addDebugLog(`⚠️ API退出登录失败: ${error}`);
    }
    
    // 清除本地数据
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    this.setData({
      isLoggedIn: false,
      userInfo: {
        nickName: '',
        avatarUrl: ''
      }
    });
    
    this.addDebugLog('✅ 本地数据清除完成');
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  },

  // 跳转到我的课程
  goToMyCourses() {
    wx.switchTab({
      url: '/pages/course/course'
    });
  },

  // 跳转到完善个人信息页面
  navigateToProfileSetup() {
    wx.navigateTo({
      url: '/pages/profile-setup/profile-setup'
    });
  },

  // 跳转到收藏页面
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
      content: '如有问题请联系客服',
      showCancel: false
    });
  },

  // 跳转到管理后台
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/index'
    });
  },

  // 添加调试日志
  addDebugLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    this.setData({
      debugLogs: [...this.data.debugLogs, logMessage]
    });
  },

  // 切换调试信息显示
  toggleDebug() {
    this.setData({
      showDebug: !this.data.showDebug
    });
  },

  // 清除调试日志
  clearDebugLogs() {
    this.setData({
      debugLogs: []
    });
  },
}); 