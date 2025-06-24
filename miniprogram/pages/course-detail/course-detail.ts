// course-detail.ts
import { getCourseDetail, mockCourseDetail } from '../../api/courseApi';

// 页面数据和方法
Page({
  data: {
    // 课程详情
    course: {} as any,
    // 是否正在加载
    loading: true
  },

  // 页面加载
  onLoad(options: { id?: string }) {
    // 获取课程ID
    const id = Number(options.id || 1);
    
    // 加载课程详情
    this.loadCourseDetail(id);
  },

  // 加载课程详情
  async loadCourseDetail(id: number) {
    try {
      this.setData({ loading: true });
      
      // 调用API获取课程详情
      // const course = await getCourseDetail({ id });
      
      // 使用模拟数据
      const course = mockCourseDetail;
      
      // 为每个章节添加expanded属性
      const chapters = course.chapters.map(chapter => {
        return {
          ...chapter,
          expanded: false // 默认折叠
        };
      });
      
      // 展开第一个章节
      if (chapters.length > 0) {
        chapters[0].expanded = true;
      }
      
      this.setData({
        course: {
          ...course,
          chapters
        },
        loading: false
      });
    } catch (error) {
      console.error('获取课程详情失败', error);
      wx.showToast({
        title: '获取课程详情失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 切换章节展开/折叠状态
  toggleChapter(e: any) {
    const index = e.currentTarget.dataset.index;
    const chapters = this.data.course.chapters;
    
    // 切换展开状态
    chapters[index].expanded = !chapters[index].expanded;
    
    this.setData({
      'course.chapters': chapters
    });
  },

  // 跳转到课时内容页
  goToLesson(e: any) {
    const { chapterId, lessonId } = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: `/pages/course-content/course-content?courseId=${this.data.course.id}&chapterId=${chapterId}&lessonId=${lessonId}`
    });
  }
}); 