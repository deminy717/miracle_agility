// 首页相关API接口
import { get } from './request';

// 获取首页资讯列表
export const getArticles = (data: {
  page: number;
  pageSize: number;
}) => {
  return get('/home/articles', data, false);
};

// 获取首页视频列表
export const getVideos = (data: {
  page: number;
  pageSize: number;
}) => {
  return get('/home/videos', data, false);
};

// 模拟资讯数据，实际项目中删除
export const mockArticles = {
  total: 100,
  list: [
    {
      id: 1,
      title: '2023年全国犬敏捷大赛报名开始',
      desc: '第十届全国犬敏捷大赛将于2023年9月举行，现已开始接受报名，欢迎各位爱好者积极参与！',
      coverImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      publishTime: '2023-06-15',
      views: 1255
    },
    {
      id: 2,
      title: '夏季犬敏捷训练专题课程上线',
      desc: '夏季高温期间如何科学训练？我们推出了夏季专题课程，帮助您和爱犬安全度过炎热夏天。',
      coverImage: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwdHJhaW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
      publishTime: '2023-06-10',
      views: 865
    },
    {
      id: 3,
      title: '如何选择适合犬敏捷的犬种',
      desc: '并非所有犬种都适合参加敏捷训练，本文将从体型、性格等方面为您详细介绍如何选择适合敏捷训练的犬种。',
      coverImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      publishTime: '2023-06-05',
      views: 1024
    }
  ]
};

// 模拟视频数据，实际项目中删除
export const mockVideos = {
  total: 50,
  list: [
    {
      id: 1,
      title: '犬敏捷基础教程 - 第1集',
      coverImage: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nJTIwdHJhaW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
      duration: '12:30',
      publishTime: '2023-06-10'
    },
    {
      id: 2,
      title: '如何训练障碍跳跃',
      coverImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      duration: '18:45',
      publishTime: '2023-06-03'
    },
    {
      id: 3,
      title: '教你读懂犬只肢体语言',
      coverImage: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvZyUyMHRyYWluaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      duration: '22:10',
      publishTime: '2023-05-25'
    }
  ]
}; 