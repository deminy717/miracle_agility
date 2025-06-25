package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@TableName("users")
public class User {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("wx_openid")
    private String wxOpenid;
    
    @TableField("nick_name")
    private String nickName;
    
    @TableField("avatar_url")
    private String avatarUrl;
    
    private String gender;
    
    private String phone;
    
    @TableField("courses_count")
    private Integer coursesCount = 0;
    
    @TableField("completed_count")
    private Integer completedCount = 0;
    
    @TableField("profile_completed")
    private Boolean profileCompleted = false;
    
    @TableField("custom_nickname")
    private String customNickname;
    
    @TableField("custom_avatar")
    private String customAvatar;
    
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    @TableField("update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
    
    // Constructors
    public User() {
    }
    
    public User(String wxOpenid, String nickName, String avatarUrl) {
        this.wxOpenid = wxOpenid;
        this.nickName = nickName;
        this.avatarUrl = avatarUrl;
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getWxOpenid() {
        return wxOpenid;
    }
    
    public void setWxOpenid(String wxOpenid) {
        this.wxOpenid = wxOpenid;
    }
    
    public String getNickName() {
        return nickName;
    }
    
    public void setNickName(String nickName) {
        this.nickName = nickName;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public Integer getCoursesCount() {
        return coursesCount;
    }
    
    public void setCoursesCount(Integer coursesCount) {
        this.coursesCount = coursesCount;
    }
    
    public Integer getCompletedCount() {
        return completedCount;
    }
    
    public void setCompletedCount(Integer completedCount) {
        this.completedCount = completedCount;
    }
    
    public Boolean getProfileCompleted() {
        return profileCompleted;
    }
    
    public void setProfileCompleted(Boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }
    
    public String getCustomNickname() {
        return customNickname;
    }
    
    public void setCustomNickname(String customNickname) {
        this.customNickname = customNickname;
    }
    
    public String getCustomAvatar() {
        return customAvatar;
    }
    
    public void setCustomAvatar(String customAvatar) {
        this.customAvatar = customAvatar;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
    
    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
    
    /**
     * 判断用户是否已完善个人信息
     * @return true如果用户已设置自定义昵称和头像
     */
    public boolean isProfileComplete() {
        return this.profileCompleted != null && this.profileCompleted && 
               this.customNickname != null && !this.customNickname.trim().isEmpty() &&
               this.customAvatar != null && !this.customAvatar.trim().isEmpty();
    }
    
    /**
     * 获取显示用的昵称（优先使用自定义昵称）
     * @return 显示昵称
     */
    public String getDisplayNickname() {
        if (this.customNickname != null && !this.customNickname.trim().isEmpty()) {
            return this.customNickname;
        }
        return this.nickName != null ? this.nickName : "用户";
    }
    
    /**
     * 获取显示用的头像（优先使用自定义头像）
     * @return 显示头像URL
     */
    public String getDisplayAvatar() {
        if (this.customAvatar != null && !this.customAvatar.trim().isEmpty()) {
            return this.customAvatar;
        }
        return this.avatarUrl != null ? this.avatarUrl : "";
    }
} 