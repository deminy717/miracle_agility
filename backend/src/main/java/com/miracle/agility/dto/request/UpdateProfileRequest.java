package com.miracle.agility.dto.request;

public class UpdateProfileRequest {
    
    private String customNickname;
    private String customAvatar;
    
    public UpdateProfileRequest() {
    }
    
    public UpdateProfileRequest(String customNickname, String customAvatar) {
        this.customNickname = customNickname;
        this.customAvatar = customAvatar;
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
} 