// 课程相关API接口
import { get, post } from './request';
import { request } from './request';

// 获取课程列表
export function getCourseList(data?: any) {
  return request({
    url: '/api/courses',
    method: 'GET',
    data
  });
}

// 获取课程详情
export function getCourseDetail(data: { id: number }) {
  return request({
    url: `/api/courses/${data.id}`,
    method: 'GET'
  });
}

// 获取课程内容
export function getCourseContent(data: { courseId: number; chapterId: number; lessonId: number }) {
  return request({
    url: `/api/courses/${data.courseId}/chapters/${data.chapterId}/lessons/${data.lessonId}`,
    method: 'GET'
  });
}

// 更新课程学习状态
export function updateLessonStatus(data: { courseId: number; chapterId: number; lessonId: number; status: string }) {
  return request({
    url: `/api/courses/${data.courseId}/chapters/${data.chapterId}/lessons/${data.lessonId}/status`,
    method: 'POST',
    data: {
      status: data.status
    }
  });
}

// 模拟课程列表数据
export const mockCourseList = {
  courses: [
    {
      id: 1,
      title: '犬敏捷初级课程',
      desc: '本课程适合初学者，将从敏捷训练的基础知识开始，循序渐进地引导您和爱犬进入敏捷运动的世界。',
      coverImage: 'https://images.unsplash.com/photo-1567014830285-163a97f2068a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRvZyUyMGFnaWxpdHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
      lessonCount: 12,
      progress: 35
    },
    {
      id: 2,
      title: '犬敏捷中级课程',
      desc: '适合已掌握基础训练的犬只，本课程将帮助您和爱犬更好地掌握各种障碍装备的训练技巧。',
      coverImage: 'https://images.unsplash.com/photo-1558929996-da64ba858215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      lessonCount: 15,
      progress: 0
    },
    {
      id: 3,
      title: '犬敏捷比赛实战',
      desc: '针对准备参加敏捷比赛的犬只和主人，提供完整的比赛策略和实战技巧。',
      coverImage: 'https://images.unsplash.com/photo-1583337426008-2fef51aa841d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      lessonCount: 10,
      progress: 0
    }
  ]
};

// 模拟课程详情数据
export const mockCourseDetail = {
  id: 1,
  title: '犬敏捷初级课程',
  desc: '本课程适合初学者，将从敏捷训练的基础知识开始，循序渐进地引导您和爱犬进入敏捷运动的世界。',
  coverImage: 'https://images.unsplash.com/photo-1567014830285-163a97f2068a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRvZyUyMGFnaWxpdHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
  lessonCount: 12,
  progress: 35,
  chapters: [
    {
      id: 1,
      title: '第一章 - 犬敏捷基础概念',
      lessons: [
        {
          id: 1,
          title: '1-1 什么是犬敏捷运动',
          duration: '15分钟',
          status: 'completed',
          statusText: '已完成'
        },
        {
          id: 2,
          title: '1-2 犬敏捷运动的历史与发展',
          duration: '20分钟',
          status: 'completed',
          statusText: '已完成'
        },
        {
          id: 3,
          title: '1-3 犬敏捷赛事规则简介',
          duration: '25分钟',
          status: 'learning',
          statusText: '学习中'
        }
      ]
    },
    {
      id: 2,
      title: '第二章 - 基础训练方法',
      lessons: [
        {
          id: 4,
          title: '2-1 犬只行为理解基础',
          duration: '18分钟',
          status: '',
          statusText: '未学习'
        },
        {
          id: 5,
          title: '2-2 基础服从训练',
          duration: '22分钟',
          status: '',
          statusText: '未学习'
        },
        {
          id: 6,
          title: '2-3 犬只注意力训练',
          duration: '20分钟',
          status: '',
          statusText: '未学习'
        }
      ]
    },
    {
      id: 3,
      title: '第三章 - 障碍器材介绍',
      lessons: [
        {
          id: 7,
          title: '3-1 跳跃障碍介绍',
          duration: '16分钟',
          status: '',
          statusText: '未学习'
        },
        {
          id: 8,
          title: '3-2 隧道与软管介绍',
          duration: '14分钟',
          status: '',
          statusText: '未学习'
        },
        {
          id: 9,
          title: '3-3 跷跷板与A字架介绍',
          duration: '18分钟',
          status: '',
          statusText: '未学习'
        }
      ]
    }
  ]
};

// 模拟课程内容数据
export const mockCourseContent = {
  chapter: {
    id: 1,
    title: '第一章 - 犬敏捷基础概念'
  },
  lesson: {
    id: 3,
    title: '1-3 犬敏捷赛事规则简介',
    duration: '25分钟',
    isMarked: false,
    videoUrl: 'https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4',
    videoCover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
    introduction: `<div style="line-height: 1.8;">
      <p>欢迎来到犬敏捷赛事规则简介课程！在本课程中，我们将详细介绍犬敏捷比赛的基本规则、分组和评分标准。通过学习这些规则，您将更好地理解犬敏捷比赛的精髓，为未来可能的参赛做准备。</p>
    </div>`,
    contentSections: [
      {
        title: '什么是犬敏捷比赛',
        content: `<div style="line-height: 1.8;">
          <p>犬敏捷比赛是一项有趣的犬类运动，起源于英国的1978年克拉夫茨犬展。它类似于马术中的障碍赛，但是更加强调犬只与主人之间的合作关系。</p>
          <p>在比赛中，犬只需要在主人的引导下，按照特定的顺序通过一系列障碍物，如跳跃栏、隧道、跷跷板等。整个过程既考验犬只的敏捷性和服从性，也考验主人的指导技巧。</p>
        </div>`,
        imageUrl: 'https://images.unsplash.com/photo-1519150268069-c094cfc0b3c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        title: '基本赛事规则',
        content: `<div style="line-height: 1.8;">
          <p>在标准的犬敏捷比赛中，有以下几个基本规则：</p>
          <ol>
            <li>参赛者需要引导犬只按特定顺序完成一系列障碍物</li>
            <li>比赛以时间计算，并附加可能的错误惩罚</li>
            <li>障碍物通常包括跳跃、隧道、跷跷板、A字架、轮胎等</li>
            <li>主人不能触碰犬只或障碍物，只能通过声音和手势指令引导</li>
          </ol>
          <p>如果犬只跳过障碍物或者以错误的方式通过障碍物，将会被扣分或者失去资格。比赛的胜负通常由完成时间和准确性共同决定。</p>
        </div>`,
        videoUrl: 'https://mazwai.com/videvo_files/video/free/2015-09/small_watermarked/postcard_from_big_sur_preview.mp4'
      },
      {
        title: '分组和级别',
        content: `<div style="line-height: 1.8;">
          <p>犬敏捷比赛通常根据犬只的体型和经验分为不同的组别：</p>
          <ul>
            <li>按体型：迷你组、中型组、大型组</li>
            <li>按难度：新手组、初级组、中级组、高级组</li>
          </ul>
          <p>不同级别的比赛设置不同高度的障碍物和不同难度的路线。随着级别的提高，障碍物的数量会增加，路线的复杂度也会提高。</p>
        </div>`,
        imageUrl: 'https://images.unsplash.com/photo-1583337426008-2fef51aa841d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      }
    ],
    summary: `<div style="line-height: 1.8;">
      <p>通过本课程，我们了解了犬敏捷比赛的基本规则、比赛方式和分组级别。这些知识为我们进一步学习敏捷训练技巧打下了基础。</p>
      <p>在下一课中，我们将开始学习基础训练方法，帮助您和爱犬为参加敏捷活动做好准备。</p>
    </div>`
  },
  hasPrev: true,
  hasNext: true
};

// 根据课程ID、章节ID、课时ID生成模拟课程内容
export function getMockCourseContentById(courseId: number, chapterId: number, lessonId: number) {
  // 这里只处理课程ID=1 的模拟数据
  const course = mockCourseDetail;
  const chapter = course.chapters.find(c => c.id === chapterId) || course.chapters[0];
  const lessonMeta = chapter.lessons.find(l => l.id === lessonId) || chapter.lessons[0];

  // 简单生成富文本内容
  const rich = `<div style=\"line-height:1.8;\"><p>${lessonMeta.title} - 富文本内容示例。</p><p>这里是课程正文。</p></div>`;

  return {
    chapter: {
      id: chapter.id,
      title: chapter.title
    },
    lesson: {
      id: lessonMeta.id,
      title: lessonMeta.title,
      duration: lessonMeta.duration,
      isMarked: false,
      videoUrl: '',
      videoCover: '',
      introduction: rich,
      contentSections: [
        {
          title: lessonMeta.title,
          content: rich
        }
      ],
      summary: ''
    },
    hasPrev: lessonId > 1,
    hasNext: lessonId < 9 // 简单判断
  };
} 