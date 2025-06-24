// 视频相关API接口
import { get } from './request';

// 获取视频详情
export const getVideoDetail = (data: {
  id: number;
}) => {
  return get('/video/detail', data, false);
};

// 模拟视频详情数据，实际项目中删除
export const mockVideoDetail = {
  id: 1,
  title: '犬敏捷基础教程 - 第1集',
  desc: '本视频介绍犬敏捷运动的基本概念、训练方法和注意事项，适合刚刚接触犬敏捷运动的新手观看。',
  coverImage: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nJTIwdHJhaW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
  videoUrl: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
  duration: '12:30',
  publishTime: '2023-06-10 10:15',
  views: 1255,
  related: [
    {
      id: 2,
      title: '如何训练障碍跳跃',
      coverImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      duration: '18:45'
    },
    {
      id: 3,
      title: '教你读懂犬只肢体语言',
      coverImage: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvZyUyMHRyYWluaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      duration: '22:10'
    }
  ]
}; 