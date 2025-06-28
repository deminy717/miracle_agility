const config = require('../../utils/config')
const api = require('../../utils/api')
const upload = require('../../utils/upload')

Page({
  data: {
    userInfo: {
      avatar: '',
      nickname: '',
      phone: '',
      profession: '',
      bio: '',
      specialties: '',
      gender: '',
      province: '',
      city: '',
      experience: ''
    },
    originalUserInfo: {}, // 保存原始用户信息用于对比
    nicknameLength: 0,
    bioLength: 0,
    canSave: false,
    uploading: false, // 头像上传状态
    
    // 性别选项
    genderList: [
      { name: '男', value: 'male' },
      { name: '女', value: 'female' },
      { name: '保密', value: 'secret' }
    ],
    genderIndex: -1,
    
    // 地区
    region: ['北京市', '北京市', '朝阳区'],
    
    // 训练经验选项
    experienceList: [
      { name: '新手（0-1年）', value: 'beginner' },
      { name: '初级（1-3年）', value: 'junior' },
      { name: '中级（3-5年）', value: 'intermediate' },
      { name: '高级（5-10年）', value: 'senior' },
      { name: '专家（10年以上）', value: 'expert' }
    ],
    experienceIndex: -1
  },

  onLoad(options) {
    console.log('编辑个人信息页面加载，参数:', options)
    this.loadUserInfo()
  },

  // 将后端的数字性别转换为前端字符串格式
  mapGenderFromNumber(genderNumber) {
    if (genderNumber === 1) {
      return 'male'
    } else if (genderNumber === 2) {
      return 'female'
    } else {
      return 'secret' // 0或其他值都视为保密
    }
  },

  // 将前端的字符串性别转换为后端数字格式
  mapGenderToNumber(genderString) {
    if (genderString === 'male') {
      return 1
    } else if (genderString === 'female') {
      return 2
    } else {
      return 0 // secret或其他值都视为保密
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    const app = getApp()
    let userInfo = {}
    
    if (config.isMock()) {
      // Mock模式从本地存储获取
      userInfo = wx.getStorageSync('userInfo') || app.globalData.userInfo || {}
    } else {
      // 生产模式：先尝试从API获取最新数据
      try {
        wx.showLoading({ title: '加载中...' })
        console.log('从API获取用户信息')
        
        const apiUserInfo = await api.getUserInfo()
        console.log('API返回的用户信息:', apiUserInfo)
        
        userInfo = apiUserInfo || {}
        
        // 更新本地缓存
        wx.setStorageSync('userInfo', userInfo)
        
        // 更新全局数据
        if (app && app.globalData) {
          app.globalData.userInfo = userInfo
        }
        
        wx.hideLoading()
      } catch (error) {
        wx.hideLoading()
        console.error('获取用户信息失败，使用本地缓存:', error)
        
        // API失败时使用本地缓存
        const auth = require('../../utils/auth')
        userInfo = auth.getCurrentUser() || wx.getStorageSync('userInfo') || {}
        
        wx.showToast({
          title: '获取最新信息失败，使用本地数据',
          icon: 'none',
          duration: 2000
        })
      }
    }
    
    // 设置默认值 - 处理后端字段映射
    const profileData = {
      avatar: userInfo.avatarUrl || userInfo.avatar || '/static/images/default-avatar.png',
      nickname: userInfo.nickname || '',
      phone: userInfo.phone || '',
      profession: userInfo.profession || '',
      bio: userInfo.bio || '',
      specialties: userInfo.specialties || '',
      gender: this.mapGenderFromNumber(userInfo.gender) || '', // 将数字转换为字符串
      province: userInfo.province || '',
      city: userInfo.city || '',
      district: userInfo.district || '',
      experience: userInfo.experienceLevel || userInfo.experience || '' // 优先使用experienceLevel
    }
    
    console.log('原始用户信息:', userInfo)
    console.log('映射后的个人资料数据:', profileData)
    
    // 设置地区 - 使用默认地区避免空值问题
    let region = ['北京市', '北京市', '朝阳区'] // 设置默认值
    if (profileData.province && profileData.city) {
      region = [
        profileData.province,
        profileData.city,
        profileData.district || profileData.city
      ]
    }
    

    
    // 设置性别索引
    const genderIndex = this.data.genderList.findIndex(item => item.value === profileData.gender)
    
    // 设置经验索引
    const experienceIndex = this.data.experienceList.findIndex(item => item.value === profileData.experience)
    
    this.setData({
      userInfo: profileData,
      originalUserInfo: JSON.parse(JSON.stringify(profileData)), // 深拷贝
      nicknameLength: profileData.nickname.length,
      bioLength: profileData.bio.length,
      region: region,
      genderIndex: genderIndex,
      experienceIndex: experienceIndex
    })
    
    console.log('加载用户信息:', profileData)
  },

  // 选择头像
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择微信头像:', avatarUrl)
    
    // 先显示本地预览
    this.setData({
      'userInfo.avatar': avatarUrl,
      uploading: true
    })
    
    try {
      wx.showLoading({ title: '上传中...' })
      
      // 上传头像到服务器
      const uploadResult = await upload.uploadImage(avatarUrl, 'avatar')
      console.log('头像上传成功:', uploadResult)
      
      // 更新为服务器返回的URL
      this.setData({
        'userInfo.avatar': uploadResult.url,
        uploading: false
      })
      
      this.checkCanSave()
      
      wx.hideLoading()
      wx.showToast({
        title: '头像上传成功',
        icon: 'success'
      })
      
    } catch (error) {
      console.error('头像上传失败:', error)
      
      // 恢复原来的头像
      this.setData({
        'userInfo.avatar': this.data.originalUserInfo.avatar,
        uploading: false
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '头像上传失败',
        icon: 'none'
      })
    }
  },

  // 昵称输入
  onNicknameInput(e) {
    const value = e.detail.value
    this.setData({
      'userInfo.nickname': value,
      nicknameLength: value.length
    })
    this.checkCanSave()
  },

  // 性别选择
  onGenderChange(e) {
    const index = parseInt(e.detail.value)
    const gender = this.data.genderList[index]
    
    this.setData({
      genderIndex: index,
      'userInfo.gender': gender.value
    })
    
    this.checkCanSave()
  },

  // 手机号输入
  onPhoneInput(e) {
    const value = e.detail.value
    this.setData({
      'userInfo.phone': value
    })
    this.checkCanSave()
  },

  // 地区选择
  onRegionChange(e) {
    const region = e.detail.value
    console.log('地区选择变化:', region)
    
    this.setData({
      region: region,
      'userInfo.province': region[0] || '',
      'userInfo.city': region[1] || '',
      'userInfo.district': region[2] || ''
    })
    
    this.checkCanSave()
  },

  // 职业输入
  onProfessionInput(e) {
    const value = e.detail.value
    this.setData({
      'userInfo.profession': value
    })
    this.checkCanSave()
  },

  // 个人简介输入
  onBioInput(e) {
    const value = e.detail.value
    this.setData({
      'userInfo.bio': value,
      bioLength: value.length
    })
    this.checkCanSave()
  },

  // 训练经验选择
  onExperienceChange(e) {
    const index = parseInt(e.detail.value)
    const experience = this.data.experienceList[index]
    
    this.setData({
      experienceIndex: index,
      'userInfo.experience': experience.value
    })
    
    this.checkCanSave()
  },

  // 擅长项目输入
  onSpecialtiesInput(e) {
    const value = e.detail.value
    this.setData({
      'userInfo.specialties': value
    })
    this.checkCanSave()
  },

  // 检查是否可以保存
  checkCanSave() {
    const { userInfo, originalUserInfo } = this.data
    
    // 检查是否有必填项
    const hasRequired = userInfo.nickname.trim().length > 0
    
    // 检查是否有修改
    const hasChanges = JSON.stringify(userInfo) !== JSON.stringify(originalUserInfo)
    
    this.setData({
      canSave: hasRequired && hasChanges
    })
  },

  // 保存修改
  async onSave() {
    if (!this.data.canSave) {
      console.log('保存按钮未激活')
      return
    }
    
    console.log('开始保存用户信息:', this.data.userInfo)
    
    // 基本验证
    if (!this.data.userInfo.nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }
    
    // 手机号验证
    if (this.data.userInfo.phone && !/^1[3-9]\d{9}$/.test(this.data.userInfo.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    try {
      if (config.isMock()) {
        console.log('使用Mock模式保存')
        // Mock模式：更新本地存储
        this.saveMockUserInfo()
      } else {
        console.log('使用生产模式保存')
        // 生产模式：调用API保存
        await this.saveUserInfo()
      }
      
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页并刷新
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      
    } catch (error) {
      wx.hideLoading()
      console.error('保存失败详细信息:', {
        error: error,
        message: error.message,
        statusCode: error.statusCode,
        data: error.data
      })
      
      let errorMessage = '保存失败'
      if (error.statusCode === 400) {
        errorMessage = '请求数据格式错误，请检查输入信息'
      } else if (error.statusCode === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.statusCode === 500) {
        errorMessage = '服务器错误，请稍后重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      wx.showModal({
        title: '保存失败',
        content: errorMessage,
        showCancel: false
      })
    }
  },

  // Mock模式保存用户信息
  saveMockUserInfo() {
    const { userInfo } = this.data
    
    // 转换为后端字段格式用于存储
    const saveData = {
      ...userInfo,
      avatarUrl: userInfo.avatar, // 同时保存两种格式
      experienceLevel: userInfo.experience, // 同时保存两种格式
      gender: this.mapGenderToNumber(userInfo.gender) // 转换为数字格式
    }
    
    // 更新本地存储
    wx.setStorageSync('userInfo', saveData)
    
    // 更新全局数据
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.userInfo = { ...app.globalData.userInfo, ...saveData }
    }
    
    console.log('Mock模式：用户信息已保存', saveData)
  },

  // 生产模式保存用户信息
  async saveUserInfo() {
    const { userInfo } = this.data
    
    // 构建更新数据 - 处理字段映射和数据格式
    const updateData = {
      nickname: userInfo.nickname ? userInfo.nickname.trim() : '',
      avatar: userInfo.avatar || '', // 前端使用avatar，后端映射为avatarUrl
      phone: userInfo.phone ? userInfo.phone.trim() : '',
      profession: userInfo.profession ? userInfo.profession.trim() : '',
      bio: userInfo.bio ? userInfo.bio.trim() : '',
      specialties: userInfo.specialties ? userInfo.specialties.trim() : '',
      gender: userInfo.gender || '', // 保持字符串格式，后端Controller已处理转换
      province: userInfo.province || '',
      city: userInfo.city || '',
      district: userInfo.district || '',
      experience: userInfo.experience || '' // 前端使用experience，后端映射为experienceLevel
    }
    
    console.log('发送到后端的数据:', updateData)
    
    // 调用API更新用户信息
    const result = await api.updateUserInfo(updateData)
    
    // 更新本地存储
    const auth = require('../../utils/auth')
    const currentUser = auth.getCurrentUser()
    const updatedUser = { ...currentUser, ...updateData }
    wx.setStorageSync('userInfo', updatedUser)
    
    // 更新全局数据
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.userInfo = updatedUser
    }
    
    console.log('生产模式：用户信息已保存', result)
    return result
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '个人信息编辑',
      path: '/pages/edit-profile/edit-profile'
    }
  }
}) 