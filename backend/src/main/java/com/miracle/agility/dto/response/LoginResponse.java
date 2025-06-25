package com.miracle.agility.dto.response;

public class LoginResponse {
    
    private String token;
    private UserInfo userInfo;
    
    public LoginResponse() {
    }
    
    public LoginResponse(String token, String userId, String nickName, String avatarUrl) {
        this.token = token;
        
        // 创建完整的用户信息对象
        this.userInfo = new UserInfo();
        this.userInfo.setUserId(userId);
        this.userInfo.setNickName(nickName);
        this.userInfo.setAvatarUrl(avatarUrl);
        this.userInfo.setGender("未知");
        this.userInfo.setPhone("");
        this.userInfo.setCoursesCount(0);
        this.userInfo.setCompletedCount(0);
    }
    
    // 内部UserInfo类
    public static class UserInfo {
        private String userId;
        private String nickName;
        private String avatarUrl;
        private String gender;
        private String phone;
        private Integer coursesCount;
        private Integer completedCount;
        
        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getNickName() { return nickName; }
        public void setNickName(String nickName) { this.nickName = nickName; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public Integer getCoursesCount() { return coursesCount; }
        public void setCoursesCount(Integer coursesCount) { this.coursesCount = coursesCount; }
        
        public Integer getCompletedCount() { return completedCount; }
        public void setCompletedCount(Integer completedCount) { this.completedCount = completedCount; }
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserInfo getUserInfo() {
        return userInfo;
    }
    
    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }
} 