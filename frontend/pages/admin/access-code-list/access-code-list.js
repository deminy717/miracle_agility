Page({
  data: {
    courseId: '',
    courseTitle: '',
    accessCodes: [],
    usedCount: 0,
    unusedCount: 0,
    loading: false
  },

  onLoad(options) {
    console.log('授权码列表页面加载，参数:', options)
    
    const { courseId, courseTitle } = options
    if (!courseId) {
      wx.showToast({
        title: '课程ID缺失',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      courseId: courseId,
      courseTitle: decodeURIComponent(courseTitle || '未知课程')
    })

    this.loadAccessCodes()
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.courseId) {
      this.loadAccessCodes()
    }
  },

  onPullDownRefresh() {
    this.loadAccessCodes().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载授权码列表
  async loadAccessCodes() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })

    try {
      const api = require('../../../utils/api.js')
      const result = await api.getCourseAccessCodes(this.data.courseId)
      
      console.log('获取到的授权码数据:', result)
      
      // 处理授权码数据
      const processedCodes = this.processAccessCodes(result || [])
      
      // 统计数据
      const usedCount = processedCodes.filter(code => code.status === 'used').length
      const unusedCount = processedCodes.length - usedCount
      
      this.setData({
        accessCodes: processedCodes,
        usedCount: usedCount,
        unusedCount: unusedCount
      })

    } catch (error) {
      console.error('加载授权码失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none',
        duration: 3000
      })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  // 处理授权码数据
  processAccessCodes(codes) {
    const now = new Date()
    console.log('当前时间:', now)
    
    return codes.map(code => {
      console.log('处理授权码:', code.code, '原始validFrom:', code.validFrom, '原始validUntil:', code.validUntil)
      
      // 处理状态
      let status = 'active'
      let statusText = '未使用'
      
      if (code.usedCount > 0) {
        status = 'used'
        statusText = '已使用'
      } else if (code.validUntil && new Date(code.validUntil) < now) {
        status = 'expired'
        statusText = '已过期'
      }

      // 处理授权码有效期 - 显示validFrom + 24小时
      let codeValidUntil = '永久有效'
      let isCodeExpired = false
      
      if (code.validFrom) {
        const validFromDate = new Date(code.validFrom)
        // 授权码有效期 = validFrom + 24小时
        const codeExpireDate = new Date(validFromDate.getTime() + 24 * 60 * 60 * 1000)
        console.log('授权码开始时间:', validFromDate, '授权码过期时间:', codeExpireDate)
        codeValidUntil = this.formatDateTime(codeExpireDate)
        isCodeExpired = codeExpireDate < now
        console.log('授权码有效期显示:', codeValidUntil, '是否过期:', isCodeExpired)
      }

      // 处理课程有效期 - 显示validUntil的值
      let courseValidityText = '永久有效'
      let courseExpireTime = null
      let isCourseExpired = false
      
      if (code.validUntil) {
        const courseExpireDate = new Date(code.validUntil)
        console.log('课程过期时间:', courseExpireDate)
        courseExpireTime = this.formatDateTime(courseExpireDate)
        isCourseExpired = courseExpireDate < now
        courseValidityText = courseExpireTime
        console.log('课程有效期显示:', courseValidityText, '是否过期:', isCourseExpired)
      }

      // 处理注册信息
      const registeredAt = code.usedAt ? 
        this.formatDateTime(new Date(code.usedAt)) : null
      const registeredUserName = code.usedByUserName || null

      return {
        ...code,
        status,
        statusText,
        codeValidUntil,
        isCodeExpired,
        registeredAt,
        registeredUserName,
        courseValidityText,
        courseExpireTime,
        isCourseExpired,
        usedCount: code.usedCount || 0,
        usageLimit: code.usageLimit || 1
      }
    })
  },

  // 格式化日期时间
  formatDateTime(date) {
    if (!date) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  // 复制单个授权码
  copyCode(e) {
    const code = e.currentTarget.dataset.code
    if (!code) return

    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '授权码已复制',
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 分享页面
  onShareAppMessage() {
    return {
      title: `${this.data.courseTitle} - 授权码管理`,
      path: `/pages/admin/access-code-list/access-code-list?courseId=${this.data.courseId}&courseTitle=${encodeURIComponent(this.data.courseTitle)}`
    }
  }
}) 