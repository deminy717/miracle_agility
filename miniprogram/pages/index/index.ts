// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    articles: [
      {
        id: 1,
        title: '2023年全国犬敏捷大赛报名开始',
        desc: '第十届全国犬敏捷大赛将于2023年9月举行，现已开始接受报名，欢迎各位爱好者积极参与！',
        date: '2023-06-15',
        views: '1255次浏览',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 2,
        title: '夏季犬敏捷训练专题课程上线',
        desc: '夏季高温期间如何科学训练？我们推出了夏季专题课程，帮助您和爱犬安全度过炎热夏天。',
        date: '2023-06-10',
        views: '865次浏览',
        image: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwdHJhaW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 3,
        title: '如何选择适合犬敏捷的犬种',
        desc: '并非所有犬种都适合参加敏捷训练，本文将从体型、性格等方面为您详细介绍如何选择适合敏捷训练的犬种。',
        date: '2023-06-05',
        views: '1024次浏览',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
      }
    ],
    videos: [
      {
        id: 1,
        title: '犬敏捷基础教程 - 第1集',
        duration: '12分钟',
        time: '5天前',
        cover: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nJTIwdHJhaW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 2,
        title: '如何训练障碍跳跃',
        duration: '18分钟',
        time: '1周前',
        cover: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9nJTIwYWdpbGl0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 3,
        title: '教你读懂犬只肢体语言',
        duration: '22分钟',
        time: '2周前',
        cover: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvZyUyMHRyYWluaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
      }
    ]
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    // 点击文章
    goToArticle(e: any) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/article/article?id=${id}`,
      });
    },
    
    // 点击视频
    playVideo(e: any) {
      const id = e.currentTarget.dataset.id;
      wx.showToast({
        title: '视频播放功能开发中',
        icon: 'none'
      });
    }
  },
})
