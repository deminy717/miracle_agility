// 卡片式内容编辑器
Page({
  data: {
    courseInfo: {
      title: '2.2 直线行走训练',
      subtitle: '第二章：基础动作训练'
    },
    contentCards: [
      {
        id: 1,
        type: 'video',
        typeName: '视频',
        videoUrl: '',
        duration: '30分钟',
        views: '156人学习'
      },
      {
        id: 2,
        type: 'text',
        typeName: '文本',
        title: '课程概述',
        content: '直线行走训练是犬敏捷训练的基础技能之一。通过本节课程，您将学会如何引导狗狗保持直线前进，控制步伐节奏，以及如何在训练中建立良好的沟通。'
      },
      {
        id: 3,
        type: 'highlight',
        typeName: '重点',
        title: '本节重点',
        points: [
          '掌握直线行走的基本手势',
          '学会控制狗狗的行走速度',
          '建立清晰的指令系统'
        ]
      }
    ],
    cardIdCounter: 4,
    showAddMenu: false,
    showPreview: false
  },

  onTitleInput(e) {
    this.setData({
      'courseInfo.title': e.detail.value
    });
  },

  onSubtitleInput(e) {
    this.setData({
      'courseInfo.subtitle': e.detail.value
    });
  },

  showAddMenu() {
    this.setData({ showAddMenu: true });
  },

  hideAddMenu() {
    this.setData({ showAddMenu: false });
  },

  addCard(e) {
    const type = e.currentTarget.dataset.type;
    const newCard = this.createCard(type);
    
    const cards = this.data.contentCards;
    cards.push(newCard);
    
    this.setData({
      contentCards: cards,
      cardIdCounter: this.data.cardIdCounter + 1,
      showAddMenu: false
    });

    wx.showToast({
      title: `${newCard.typeName}卡片已添加`,
      icon: 'success'
    });
  },

  createCard(type) {
    const id = this.data.cardIdCounter;
    
    switch (type) {
      case 'video':
        return {
          id,
          type: 'video',
          typeName: '视频',
          videoUrl: '',
          duration: '',
          views: ''
        };
      case 'text':
        return {
          id,
          type: 'text',
          typeName: '文本',
          title: '',
          content: ''
        };
      case 'image':
        return {
          id,
          type: 'image',
          typeName: '图片',
          imageUrl: '',
          description: ''
        };
      case 'highlight':
        return {
          id,
          type: 'highlight',
          typeName: '重点',
          title: '重点内容',
          points: ['']
        };
      default:
        return { id, type, typeName: '未知' };
    }
  },

  deleteCard(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个卡片吗？',
      success(res) {
        if (res.confirm) {
          const cards = that.data.contentCards;
          cards.splice(index, 1);
          that.setData({ contentCards: cards });
          wx.showToast({
            title: '卡片已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  moveUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    
    const cards = this.data.contentCards;
    [cards[index], cards[index - 1]] = [cards[index - 1], cards[index]];
    this.setData({ contentCards: cards });
  },

  moveDown(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    if (index === cards.length - 1) return;
    
    [cards[index], cards[index + 1]] = [cards[index + 1], cards[index]];
    this.setData({ contentCards: cards });
  },

  selectVideo(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍摄视频', '输入视频链接'],
      success(res) {
        if (res.tapIndex === 0) {
          that.chooseVideoFromAlbum(index);
        } else if (res.tapIndex === 1) {
          that.recordVideo(index);
        } else if (res.tapIndex === 2) {
          that.inputVideoUrl(index);
        }
      },
      fail(error) {
        console.log('选择操作失败', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 从相册选择视频
  chooseVideoFromAlbum(index) {
    const that = this;
    
    // 先检查相册权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.album'] === false) {
          // 用户之前拒绝了权限，引导用户去设置
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限，以便选择视频',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 选择视频
        wx.chooseVideo({
          sourceType: ['album'],
          maxDuration: 300, // 最大5分钟
          compressed: true,
          success(res) {
            console.log('选择视频成功', res);
            that.updateVideoCard(index, res);
          },
          fail(error) {
            console.log('选择视频失败', error);
            if (error.errMsg.includes('cancel')) {
              // 用户取消选择
              return;
            }
            wx.showToast({
              title: '选择视频失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },

  // 拍摄视频
  recordVideo(index) {
    const that = this;
    
    // 先检查摄像头权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.camera'] === false) {
          // 用户之前拒绝了权限，引导用户去设置
          wx.showModal({
            title: '需要摄像头权限',
            content: '请在设置中开启摄像头权限，以便拍摄视频',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 拍摄视频
        wx.chooseVideo({
          sourceType: ['camera'],
          maxDuration: 300, // 最大5分钟
          compressed: true,
          success(res) {
            console.log('拍摄视频成功', res);
            that.updateVideoCard(index, res);
          },
          fail(error) {
            console.log('拍摄视频失败', error);
            if (error.errMsg.includes('cancel')) {
              // 用户取消拍摄
              return;
            }
            wx.showToast({
              title: '拍摄视频失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },

  // 更新视频卡片信息
  updateVideoCard(index, videoRes) {
    const cards = this.data.contentCards;
    cards[index].videoUrl = videoRes.tempFilePath;
    cards[index].duration = `${Math.round(videoRes.duration)}秒`;
    cards[index].size = videoRes.size;
    cards[index].height = videoRes.height;
    cards[index].width = videoRes.width;
    
    this.setData({ contentCards: cards });
    
    wx.showToast({
      title: '视频添加成功',
      icon: 'success',
      duration: 2000
    });
    
    // 显示视频信息
    setTimeout(() => {
      wx.showToast({
        title: `视频时长：${Math.round(videoRes.duration)}秒`,
        icon: 'none',
        duration: 2000
      });
         }, 2500);
   },

  // 选择图片
  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success(res) {
        if (res.tapIndex === 0) {
          that.chooseImageFromAlbum(index);
        } else if (res.tapIndex === 1) {
          that.takePhoto(index);
        }
      },
      fail(error) {
        console.log('选择操作失败', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 从相册选择图片
  chooseImageFromAlbum(index) {
    const that = this;
    
    // 先检查相册权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.album'] === false) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限，以便选择图片',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 选择图片
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success(res) {
            console.log('选择图片成功', res);
            that.updateImageCard(index, res.tempFilePaths[0]);
          },
          fail(error) {
            console.log('选择图片失败', error);
            if (error.errMsg.includes('cancel')) {
              return;
            }
            wx.showToast({
              title: '选择图片失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },

  // 拍照
  takePhoto(index) {
    const that = this;
    
    // 先检查摄像头权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.camera'] === false) {
          wx.showModal({
            title: '需要摄像头权限',
            content: '请在设置中开启摄像头权限，以便拍照',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 拍照
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['camera'],
          success(res) {
            console.log('拍照成功', res);
            that.updateImageCard(index, res.tempFilePaths[0]);
          },
          fail(error) {
            console.log('拍照失败', error);
            if (error.errMsg.includes('cancel')) {
              return;
            }
            wx.showToast({
              title: '拍照失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    });
  },

  // 更新图片卡片
  updateImageCard(index, imagePath) {
    const cards = this.data.contentCards;
    cards[index].imageUrl = imagePath;
    
    this.setData({ contentCards: cards });
    
    wx.showToast({
      title: '图片添加成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 图片描述输入
  onImageDescriptionInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].description = e.detail.value;
    this.setData({ contentCards: cards });
  },

  inputVideoUrl(index) {
    const that = this;
    wx.showModal({
      title: '输入视频链接',
      editable: true,
      placeholderText: '请输入视频URL',
      success(res) {
        if (res.confirm && res.content) {
          const cards = that.data.contentCards;
          cards[index].videoUrl = res.content;
          that.setData({ contentCards: cards });
          wx.showToast({
            title: '视频链接已添加',
            icon: 'success'
          });
        }
      }
    });
  },

  onTextTitleInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].title = e.detail.value;
    this.setData({ contentCards: cards });
  },

  onTextContentInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].content = e.detail.value;
    this.setData({ contentCards: cards });
  },

  onHighlightTitleInput(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].title = e.detail.value;
    this.setData({ contentCards: cards });
  },

  onPointInput(e) {
    const index = e.currentTarget.dataset.index;
    const pointIndex = e.currentTarget.dataset.pointIndex;
    const cards = this.data.contentCards;
    cards[index].points[pointIndex] = e.detail.value;
    this.setData({ contentCards: cards });
  },

  addPoint(e) {
    const index = e.currentTarget.dataset.index;
    const cards = this.data.contentCards;
    cards[index].points.push('');
    this.setData({ contentCards: cards });
  },

  deletePoint(e) {
    const index = e.currentTarget.dataset.index;
    const pointIndex = e.currentTarget.dataset.pointIndex;
    const cards = this.data.contentCards;
    
    if (cards[index].points.length > 1) {
      cards[index].points.splice(pointIndex, 1);
      this.setData({ contentCards: cards });
    }
  },

  showPreview() {
    this.setData({ showPreview: true });
  },

  closePreview() {
    this.setData({ showPreview: false });
  },

  clearAll() {
    const that = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有内容吗？',
      success(res) {
        if (res.confirm) {
          that.setData({
            courseInfo: { title: '', subtitle: '' },
            contentCards: [],
            cardIdCounter: 1
          });
          wx.showToast({
            title: '内容已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  saveContent() {
    if (!this.data.courseInfo.title.trim()) {
      wx.showToast({
        title: '请输入课程标题',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }, 1500);
  },

  goBack() {
    wx.navigateBack();
  }
});
