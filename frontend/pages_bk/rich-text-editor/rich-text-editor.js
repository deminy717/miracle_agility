// 富文本编辑器页面
Page({
  data: {
    formats: {
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      list: false
    },
    showPreview: false,
    previewContent: '',
    placeholder: '请输入内容...',
    showUploadToast: false,
    uploadText: '上传中...',
    uploadProgress: 0,
    containerHeight: 0,
    hasVideo: false,
    videoList: [],
    previewTextContent: '',
    previewHtmlStyle: ''
  },

  onLoad(options) {
    // 页面加载时的逻辑
    console.log('富文本编辑器页面加载');
    
    // 获取系统信息，动态设置容器高度
    this.setContainerHeight();
    
    // 从全局数据中获取已有内容
    const app = getApp();
    if (app.globalData.editorContent) {
      this.initialContent = app.globalData.editorContent;
    }
  },

  // 设置容器高度
  setContainerHeight() {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        // 获取屏幕高度、状态栏高度、导航栏高度
        const windowHeight = res.windowHeight;
        const statusBarHeight = res.statusBarHeight || 0;
        
        // 设置容器高度为窗口可用高度
        that.setData({
          containerHeight: windowHeight
        });
        
        console.log('容器高度设置为:', windowHeight);
      }
    });
  },

  // 编辑器准备就绪
  onEditorReady() {
    const that = this;
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;
      console.log('编辑器初始化完成');
      
      // 如果有初始内容，加载到编辑器中
      if (that.initialContent) {
        that.editorCtx.setContents({
          html: that.initialContent,
          success: function() {
            console.log('初始内容加载成功');
          },
          fail: function(error) {
            console.log('初始内容加载失败', error);
          }
        });
      }
    }).exec();
  },

  // 编辑器获得焦点
  onEditorFocus(e) {
    console.log('编辑器获得焦点', e.detail);
  },

  // 编辑器失去焦点
  onEditorBlur(e) {
    console.log('编辑器失去焦点', e.detail);
  },

  // 编辑器内容变化
  onEditorInput(e) {
    // 编辑器内容变化处理
    console.log('编辑器内容变化', e.detail);
  },

  // 编辑器状态变化（格式变化）
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({
      formats: {
        bold: formats.bold || false,
        italic: formats.italic || false,
        underline: formats.underline || false,
        align: formats.align || 'left',
        list: formats.list || false
      }
    });
  },

  // 格式化文本
  format(e) {
    if (!this.editorCtx) {
      wx.showToast({
        title: '编辑器未初始化',
        icon: 'none'
      });
      return;
    }

    const dataset = e.currentTarget.dataset;
    const name = dataset.name;
    const value = dataset.value;

    switch (name) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
        this.editorCtx.format(name);
        break;
      case 'align':
        this.editorCtx.format('align', value);
        break;
      case 'list':
        this.editorCtx.format('list', value);
        break;
      default:
        console.log('未知格式:', name);
    }
  },

  // 设置字体大小
  setFontSize(e) {
    if (!this.editorCtx) {
      wx.showToast({
        title: '编辑器未初始化',
        icon: 'none'
      });
      return;
    }

    const size = e.currentTarget.dataset.size;
    this.editorCtx.format('fontSize', size);
    
    wx.showToast({
      title: `字体大小设置为${size}`,
      icon: 'none',
      duration: 1000
    });
  },

  // 设置字体颜色
  setFontColor(e) {
    if (!this.editorCtx) {
      wx.showToast({
        title: '编辑器未初始化',
        icon: 'none'
      });
      return;
    }

    const color = e.currentTarget.dataset.color;
    this.editorCtx.format('color', color);
    
    wx.showToast({
      title: '字体颜色已设置',
      icon: 'none',
      duration: 1000
    });
  },

  // 插入图片
  insertImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示上传进度
        that.setData({
          showUploadToast: true,
          uploadText: '正在上传图片...',
          uploadProgress: 0
        });
        
        // 模拟上传进度
        that.simulateUploadProgress();
        
        that.uploadImage(tempFilePath).then(imageUrl => {
          if (that.editorCtx) {
            that.editorCtx.insertImage({
              src: imageUrl,
              data: {
                id: 'image_' + Date.now(),
                role: 'god'
              },
              width: '80%',
              success: function () {
                console.log('图片插入成功');
                that.setData({
                  showUploadToast: false
                });
                wx.showToast({
                  title: '图片插入成功',
                  icon: 'success'
                });
              },
              fail: function (error) {
                console.log('图片插入失败', error);
                that.setData({
                  showUploadToast: false
                });
                wx.showToast({
                  title: '图片插入失败',
                  icon: 'none'
                });
              }
            });
          }
        }).catch(error => {
          console.log('图片上传失败', error);
          that.setData({
            showUploadToast: false
          });
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        });
      },
      fail(error) {
        console.log('选择图片失败', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 模拟上传进度
  simulateUploadProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      this.setData({
        uploadProgress: progress
      });
    }, 200);
  },

  // 模拟图片上传（实际项目中需要连接后端API）
  uploadImage(tempFilePath) {
    return new Promise((resolve, reject) => {
      // 这里应该调用真实的上传API
      // 暂时直接返回临时路径作为演示
      setTimeout(() => {
        resolve(tempFilePath);
      }, 2000);
    });
  },

  // 插入视频
  insertVideo() {
    const that = this;
    
    // 显示选择视频来源的选项
    wx.showActionSheet({
      itemList: ['从相册选择', '拍摄视频', '输入视频链接'],
      success(res) {
        if (res.tapIndex === 0) {
          // 从相册选择视频
          that.chooseVideoFromAlbum();
        } else if (res.tapIndex === 1) {
          // 拍摄视频
          that.recordVideo();
        } else if (res.tapIndex === 2) {
          // 输入视频链接
          that.insertVideoUrl();
        }
      }
    });
  },

  // 从相册选择视频
  chooseVideoFromAlbum() {
    const that = this;
    console.log('开始从相册选择视频');
    wx.chooseVideo({
      sourceType: ['album'],
      maxDuration: 60, // 最长60秒
      camera: 'back',
      success(res) {
        console.log('选择视频成功', res);
        if (res.tempFilePath) {
          that.handleVideoUpload(res.tempFilePath);
        } else {
          console.error('视频文件路径为空');
          wx.showToast({
            title: '视频文件无效',
            icon: 'none'
          });
        }
      },
      fail(error) {
        console.error('选择视频失败', error);
        let errorMsg = '选择视频失败';
        if (error.errMsg) {
          if (error.errMsg.includes('cancel')) {
            errorMsg = '用户取消选择';
          } else if (error.errMsg.includes('permission')) {
            errorMsg = '没有相册访问权限';
          }
        }
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
      }
    });
  },

  // 拍摄视频
  recordVideo() {
    const that = this;
    console.log('开始拍摄视频');
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 60, // 最长60秒
      camera: 'back',
      success(res) {
        console.log('拍摄视频成功', res);
        if (res.tempFilePath) {
          that.handleVideoUpload(res.tempFilePath);
        } else {
          console.error('拍摄的视频文件路径为空');
          wx.showToast({
            title: '视频文件无效',
            icon: 'none'
          });
        }
      },
      fail(error) {
        console.error('拍摄视频失败', error);
        let errorMsg = '拍摄视频失败';
        if (error.errMsg) {
          if (error.errMsg.includes('cancel')) {
            errorMsg = '用户取消拍摄';
          } else if (error.errMsg.includes('permission')) {
            errorMsg = '没有摄像头访问权限';
          }
        }
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
      }
    });
  },

  // 处理视频上传
  handleVideoUpload(tempFilePath) {
    const that = this;
    
    // 显示上传进度
    this.setData({
      showUploadToast: true,
      uploadText: '视频上传中...',
      uploadProgress: 0
    });

    // 模拟上传进度
    this.simulateUploadProgress();

    // 上传视频
    this.uploadVideo(tempFilePath).then(videoUrl => {
      console.log('视频上传成功', videoUrl);
      
      // 插入视频到编辑器
      if (that.editorCtx) {
        // 尝试使用insertImage方法插入视频缩略图，并添加视频链接
        that.insertVideoWithThumbnail(videoUrl);
        that.setData({
          showUploadToast: false
        });
      }
    }).catch(error => {
      console.log('视频上传失败', error);
      that.setData({
        showUploadToast: false
      });
      wx.showToast({
        title: '视频上传失败',
        icon: 'none'
      });
    });
  },

  // 输入视频链接
  insertVideoUrl() {
    const that = this;
    wx.showModal({
      title: '插入视频',
      content: '请输入视频链接（支持mp4格式）',
      editable: true,
      placeholderText: 'https://example.com/video.mp4',
      success(res) {
        if (res.confirm && res.content) {
          const videoUrl = res.content.trim();
          
          // 简单验证URL格式
          if (!that.isValidVideoUrl(videoUrl)) {
            wx.showToast({
              title: '请输入有效的视频链接',
              icon: 'none'
            });
            return;
          }

          console.log('准备插入视频链接:', videoUrl);
          
          // 插入视频到编辑器
          if (that.editorCtx) {
            // 尝试使用insertImage方法插入视频缩略图，并添加视频链接
            that.insertVideoWithThumbnail(videoUrl);
          } else {
            console.error('编辑器上下文未初始化');
            wx.showToast({
              title: '编辑器未初始化',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 验证视频URL格式
  isValidVideoUrl(url) {
    // 简单的URL格式验证
    const urlPattern = /^(https?:\/\/).*\.(mp4|mov|avi|wmv|flv|webm)(\?.*)?$/i;
    return urlPattern.test(url);
  },

  // 模拟视频上传（实际项目中需要连接后端API）
  uploadVideo(tempFilePath) {
    return new Promise((resolve, reject) => {
      console.log('开始上传视频:', tempFilePath);
      
      // 检查文件路径是否有效
      if (!tempFilePath) {
        reject(new Error('视频文件路径无效'));
        return;
      }

      // 这里应该调用真实的视频上传API
      // 暂时直接返回临时路径作为演示
      setTimeout(() => {
        // 模拟上传成功
        console.log('视频上传模拟完成:', tempFilePath);
        resolve(tempFilePath);
      }, 3000); // 视频上传比图片耗时更长
    });
  },

  // 插入视频的主要方法 - 使用简化的文本+链接方案
  insertVideoWithThumbnail(videoUrl) {
    const that = this;
    
    // 直接使用文本方案，简单可靠
    const videoContent = `\n🎬 视频内容\n📱 链接: ${videoUrl}\n👆 点击预览播放视频\n\n`;
    
    if (that.editorCtx) {
      that.editorCtx.insertText({
        text: videoContent,
        success: function() {
          wx.showToast({
            title: '视频信息插入成功',
            icon: 'success'
          });
          
          // 保存视频信息到页面数据
          that.saveVideoInfo(videoUrl);
          
          // 提示用户如何查看视频
          setTimeout(() => {
            wx.showToast({
              title: '请点击预览播放视频',
              icon: 'none',
              duration: 2000
            });
          }, 1500);
        },
        fail: function(error) {
          console.log('视频信息插入失败', error);
          wx.showToast({
            title: '视频插入失败',
            icon: 'error'
          });
        }
      });
    }
  },



  // 保存视频信息
  saveVideoInfo(videoUrl) {
    const videoList = this.data.videoList || [];
    videoList.push({
      url: videoUrl,
      id: 'video_' + Date.now()
    });
    
    this.setData({
      videoList: videoList
    });
  },

  // 直接插入视频HTML
  insertVideoAsHTML(videoUrl) {
    const that = this;
    
    // 尝试使用insertImage方法插入一个占位图，然后替换为视频
    // 这是一个变通方法，因为editor可能不直接支持video标签
    const videoPlaceholder = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#f0f0f0" stroke="#ddd"/>
        <text x="150" y="100" text-anchor="middle" font-size="16" fill="#666">🎬 视频播放器</text>
        <text x="150" y="120" text-anchor="middle" font-size="12" fill="#999">点击预览查看视频</text>
      </svg>
    `);

    // 插入占位图
    if (this.editorCtx) {
      this.editorCtx.insertImage({
        src: videoPlaceholder,
        data: {
          videoUrl: videoUrl,
          type: 'video-placeholder'
        },
        width: '300px',
        success: function() {
          // 在占位图后添加视频链接文本
          that.editorCtx.insertText({
            text: `\n🎬 视频链接: ${videoUrl}\n`,
            success: function() {
              wx.showToast({
                title: '视频占位符插入成功',
                icon: 'success'
              });
            }
          });
        },
        fail: function(error) {
          console.log('视频占位符插入失败', error);
          that.insertVideoAsText(videoUrl);
        }
      });
    }
  },

  // 使用另一种方法插入视频HTML
  insertVideoHTML(videoUrl) {
    const that = this;
    
    // 尝试通过模拟键盘输入HTML
    const videoTag = `<video src="${videoUrl}" controls style="width:100%;max-width:300px;height:auto;"></video>`;
    
    // 先清除刚才插入的分割线
    this.editorCtx.undo();
    
    // 插入视频HTML作为文本，然后尝试格式化
    this.editorCtx.insertText({
      text: `\n${videoTag}\n`,
      success: function() {
        wx.showToast({
          title: '视频HTML已插入',
          icon: 'success'
        });
        // 提示用户可能需要在预览中查看效果
        setTimeout(() => {
          wx.showToast({
            title: '请在预览中查看视频',
            icon: 'none',
            duration: 2000
          });
        }, 1500);
      },
      fail: function(error) {
        console.log('视频HTML插入失败', error);
        that.insertVideoAsText(videoUrl);
      }
    });
  },

  // 备用方法：以文本形式插入视频链接
  insertVideoAsText(videoUrl) {
    if (this.editorCtx) {
      const videoText = `\n[视频] ${videoUrl}\n`;
      this.editorCtx.insertText({
        text: videoText,
        success: function() {
          wx.showToast({
            title: '视频链接插入成功',
            icon: 'success'
          });
        },
        fail: function(error) {
          console.log('文本插入也失败', error);
          wx.showToast({
            title: '视频插入失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 最后的备用方法
  insertVideoFallback(videoUrl) {
    const that = this;
    wx.showModal({
      title: '插入提示',
      content: '视频插入遇到问题，是否将视频链接复制到剪贴板？',
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: videoUrl,
            success: function() {
              wx.showToast({
                title: '视频链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 插入分割线
  insertDivider() {
    if (this.editorCtx) {
      this.editorCtx.insertDivider();
      wx.showToast({
        title: '分割线插入成功',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 清除格式
  removeFormat() {
    if (this.editorCtx) {
      this.editorCtx.removeFormat();
      wx.showToast({
        title: '格式已清除',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 撤销
  undo() {
    if (this.editorCtx) {
      this.editorCtx.undo();
    }
  },

  // 重做
  redo() {
    if (this.editorCtx) {
      this.editorCtx.redo();
    }
  },

  // 清空内容
  clear() {
    const that = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有内容吗？此操作不可撤销。',
      success(res) {
        if (res.confirm && that.editorCtx) {
          that.editorCtx.clear();
          wx.showToast({
            title: '内容已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 预览
  preview() {
    if (!this.editorCtx) {
      wx.showToast({
        title: '编辑器未初始化',
        icon: 'none'
      });
      return;
    }

    const that = this;
    this.editorCtx.getContents({
      success: function (res) {
        console.log('获取内容成功', res);
        
        // 检查内容中是否包含视频
        const htmlContent = res.html || '';
        const hasVideo = htmlContent.includes('<video') || 
                         htmlContent.includes('🎬 视频内容') || 
                         htmlContent.includes('📹 [视频内容]') ||
                         htmlContent.includes('🎬 视频链接:') ||
                         htmlContent.includes('📱 链接:');
        
        if (hasVideo) {
          // 提取视频链接
          const videoUrls = that.extractVideoUrls(htmlContent);
          // 提取纯文本内容（去除HTML标签）
          const textContent = that.extractTextContent(htmlContent);
          
          that.setData({
            previewContent: htmlContent,
            hasVideo: true,
            videoList: videoUrls,
            previewTextContent: textContent,
            showPreview: true
          });
        } else {
          that.setData({
            previewContent: htmlContent,
            hasVideo: false,
            videoList: [],
            showPreview: true
          });
        }
      },
      fail: function (error) {
        console.log('获取内容失败', error);
        wx.showToast({
          title: '获取内容失败',
          icon: 'none'
        });
      }
    });
  },

  // 提取视频链接
  extractVideoUrls(htmlContent) {
    const videoUrls = [];
    
    // 匹配 <video src="..." 格式
    const videoTagRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = videoTagRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }
    
    // 匹配新格式 📱 链接: http://... 格式
    const newVideoRegex = /📱 链接:\s*(https?:\/\/[^\s\n]+)/gi;
    while ((match = newVideoRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }
    
    // 匹配 🎬 视频: http://... 格式（兼容旧格式）
    const videoTextRegex = /🎬 视频:\s*(https?:\/\/[^\s\n]+)/gi;
    while ((match = videoTextRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }
    
    // 匹配 📹 [视频内容] 链接: http://... 格式（兼容旧格式）
    const videoInfoRegex = /📹 \[视频内容\]\s*链接:\s*(https?:\/\/[^\s\n]+)/gi;
    while ((match = videoInfoRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }
    
    // 匹配 🎬 视频链接: http://... 格式（兼容旧格式）
    const videoLinkRegex = /🎬 视频链接:\s*(https?:\/\/[^\s\n]+)/gi;
    while ((match = videoLinkRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }
    
    return videoUrls;
  },

  // 提取纯文本内容
  extractTextContent(htmlContent) {
    // 简单的HTML标签移除（实际项目中可能需要更复杂的处理）
    return htmlContent
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/🎬 视频内容\s*📱 链接:\s*https?:\/\/[^\s\n]+\s*👆 点击预览播放视频/gi, '[视频内容]') // 替换新的视频格式
      .replace(/🎬 视频:\s*https?:\/\/[^\s\n]+/gi, '[视频内容]') // 替换旧的视频标识
      .replace(/📹 \[视频内容\]\s*链接:\s*https?:\/\/[^\s\n]+\s*点击预览查看视频/gi, '[视频]') // 替换旧的视频格式
      .replace(/🎬 视频链接:\s*https?:\/\/[^\s\n]+/gi, '[视频]') // 替换视频链接格式
      .trim();
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false
    });
  },

  // 复制内容
  copyContent() {
    const that = this;
    this.editorCtx.getContents({
      success: function (res) {
        wx.setClipboardData({
          data: res.text,
          success: function () {
            wx.showToast({
              title: '内容已复制',
              icon: 'success'
            });
            that.closePreview();
          },
          fail: function () {
            wx.showToast({
              title: '复制失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 保存
  save() {
    if (!this.editorCtx) {
      wx.showToast({
        title: '编辑器未初始化',
        icon: 'none'
      });
      return;
    }

    const that = this;
    wx.showLoading({
      title: '保存中...'
    });

    this.editorCtx.getContents({
      success: function (res) {
        console.log('获取内容成功', res);
        
        // 将内容保存到全局数据中，供创建页面使用
        const app = getApp();
        app.globalData.editorContent = res.html;
        
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        });

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: function (error) {
        wx.hideLoading();
        console.log('获取内容失败', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  // 模拟保存内容（实际项目中需要连接后端API）
  saveContent(content) {
    return new Promise((resolve, reject) => {
      // 这里应该调用真实的保存API
      console.log('保存内容:', content);
      
      // 模拟网络请求
      setTimeout(() => {
        resolve();
      }, 1500);
    });
  },

  onShow() {
    // 页面显示时的逻辑
    console.log('富文本编辑器页面显示');
  },

  onHide() {
    // 页面隐藏时的逻辑
    console.log('富文本编辑器页面隐藏');
  },

  onUnload() {
    // 页面卸载时的逻辑
    console.log('富文本编辑器页面卸载');
  }
});
