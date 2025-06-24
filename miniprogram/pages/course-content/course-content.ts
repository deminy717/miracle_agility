// course-content.ts
import { getCourseContent, getMockCourseContentById, mockCourseContent } from '../../api/courseApi';

const courseContentApp = getApp<IAppOption>()

Component({
  data: {
    courseId: 0,
    chapterId: 0,
    lessonId: 0,
    chapter: {} as any,
    lesson: {} as any,
    loading: true,
    isMarked: false,
    hasPrev: false,
    hasNext: false,
    videoContext: null as any,
    lessonStatusMap: {} as Record<string, string> // 课时状态缓存
  },
  methods: {
    onLoad(options: { courseId?: string; chapterId?: string; lessonId?: string }) {
      const courseId = Number(options.courseId || 0);
      const chapterId = Number(options.chapterId || 0);
      const lessonId = Number(options.lessonId || 0);
      
      this.setData({
        courseId,
        chapterId,
        lessonId
      });
      
      this.loadCourseContent(courseId, chapterId, lessonId);
    },
    onShow() {
      if (this.data.videoContext) {
        this.data.videoContext.play();
      }
    },
    onHide() {
      if (this.data.videoContext) {
        this.data.videoContext.pause();
      }
    },
    onUnload() {
      if (this.data.videoContext) {
        this.data.videoContext.stop();
      }
    },
    async loadCourseContent(courseId: number, chapterId: number, lessonId: number) {
      this.setData({ loading: true });
      let data;
      if (courseId === 1 && chapterId === 1 && lessonId === 1) {
        data = mockCourseContent;
      } else {
        data = getMockCourseContentById(courseId, chapterId, lessonId);
      }
      // 自动标记为学习中
      this.updateLessonStatus('learning');
      this.setData({
        chapter: data.chapter,
        lesson: data.lesson,
        isMarked: data.lesson.isMarked || false,
        hasPrev: data.hasPrev,
        hasNext: data.hasNext,
        loading: false
      });
      if (data.lesson.videoUrl) {
        this.setData({
          videoContext: wx.createVideoContext('lessonVideo')
        });
      }
    },
    goBack() {
      wx.navigateBack();
    },
    shareLesson() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    },
    previewImage(e: any) {
      const src = e.currentTarget.dataset.src;
      const urls: string[] = [];
      
      this.data.lesson.contentSections.forEach((section: any) => {
        if (section.imageUrl) {
          urls.push(section.imageUrl);
        }
      });
      
      wx.previewImage({
        current: src,
        urls: urls
      });
    },
    toggleMark() {
      const isMarked = !this.data.isMarked;
      
      this.setData({ isMarked });
      
      // 同步状态到缓存
      this.updateLessonStatus(isMarked ? 'completed' : 'learning');
      wx.showToast({
        title: isMarked ? '已标记为完成' : '已取消标记',
        icon: 'success'
      });
    },
    goPrevLesson() {
      if (!this.data.hasPrev) {
        wx.showToast({ title: '已经是第一节课', icon: 'none' });
        return;
      }
      
      const prevLessonInfo = this.getPrevLessonInfo();
      
      if (prevLessonInfo) {
        wx.redirectTo({
          url: `/pages/course-content/course-content?courseId=${this.data.courseId}&chapterId=${prevLessonInfo.chapterId}&lessonId=${prevLessonInfo.lessonId}`
        });
      }
    },
    goNextLesson() {
      if (!this.data.hasNext) {
        wx.showToast({ title: '已经是最后一节课', icon: 'none' });
        return;
      }
      
      const nextLessonInfo = this.getNextLessonInfo();
      
      if (nextLessonInfo) {
        wx.redirectTo({
          url: `/pages/course-content/course-content?courseId=${this.data.courseId}&chapterId=${nextLessonInfo.chapterId}&lessonId=${nextLessonInfo.lessonId}`
        });
      }
    },
    getPrevLessonInfo() {
      return {
        chapterId: this.data.chapterId,
        lessonId: this.data.lessonId - 1
      };
    },
    getNextLessonInfo() {
      return {
        chapterId: this.data.chapterId,
        lessonId: this.data.lessonId + 1
      };
    },
    // 课时状态缓存（同步到课程详情页）
    updateLessonStatus(status: string) {
      const key = `${this.data.courseId}_${this.data.chapterId}_${this.data.lessonId}`;
      const lessonStatusMap = wx.getStorageSync('lessonStatusMap') || {};
      lessonStatusMap[key] = status;
      wx.setStorageSync('lessonStatusMap', lessonStatusMap);
    }
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      
      if (options.courseId && options.chapterId && options.lessonId) {
        this.setData({
          courseId: parseInt(options.courseId),
          chapterId: parseInt(options.chapterId),
          lessonId: parseInt(options.lessonId)
        });
        
        console.log(`加载课程ID: ${options.courseId}, 章节ID: ${options.chapterId}, 课程ID: ${options.lessonId}的内容`);
      }
    }
  }
}) 