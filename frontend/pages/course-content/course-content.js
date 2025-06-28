Page({
  data: {
    courseId: null,
    lessonId: null,
    lessonInfo: {},
    nextLesson: null,
    prevLesson: null
  },

  onLoad(options) {
    const { courseId, lessonId } = options
    this.setData({ courseId, lessonId })
    this.loadLessonContent()
  },

  // 加载课程内容
  loadLessonContent() {
    const api = require('../../utils/api.js')
    
    wx.showLoading({
      title: '加载中...'
    })

    api.getLessonContent(this.data.lessonId)
      .then(lessonInfo => {
        console.log('课程内容加载成功:', lessonInfo)
        this.setData({
          lessonInfo: lessonInfo
        })
      })
      .catch(error => {
        console.error('课程内容加载失败:', error)
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'error'
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  // 视频播放事件
  onVideoPlay(e) {
    console.log('视频开始播放')
  },

  onVideoPause(e) {
    console.log('视频暂停播放')
  },

  onVideoEnded(e) {
    console.log('视频播放结束')
    wx.showToast({
      title: '视频播放完成',
      icon: 'success'
    })
  },

  onVideoError(e) {
    console.log('视频播放出错', e.detail)
    wx.showToast({
      title: '视频加载失败',
      icon: 'error'
    })
  },

  // 上一课
  onPrevLesson() {
    if (this.data.prevLesson) {
      wx.redirectTo({
        url: `/pages/course-content/course-content?lessonId=${this.data.prevLesson.id}&courseId=${this.data.courseId}`
      })
    } else {
      wx.showToast({
        title: '已是第一课',
        icon: 'none'
      })
    }
  },

  // 下一课
  onNextLesson() {
    if (this.data.nextLesson) {
      wx.redirectTo({
        url: `/pages/course-content/course-content?lessonId=${this.data.nextLesson.id}&courseId=${this.data.courseId}`
      })
    } else {
      wx.showToast({
        title: '已是最后一课',
        icon: 'none'
      })
    }
  },

  // 收藏课程
  onFavorite() {
    wx.showToast({
      title: '已收藏',
      icon: 'success'
    })
  },

  // 分享课程
  onShare() {
    return {
      title: this.data.lessonInfo.title,
      path: `/pages/course-content/course-content?lessonId=${this.data.lessonId}&courseId=${this.data.courseId}`
    }
  }
}) 