package com.miracle.agility.service;

import com.miracle.agility.entity.Admin;
import com.miracle.agility.mapper.AdminMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {
    
    @Autowired
    private AdminMapper adminMapper;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // 临时存储token，实际项目中应该使用Redis
    private final Map<String, Admin> tokenStore = new HashMap<>();
    
    /**
     * 管理员登录
     */
    public Map<String, Object> login(String username, String password) {
        Admin admin = adminMapper.findByUsername(username);
        
        if (admin == null) {
            throw new RuntimeException("用户名不存在");
        }
        
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        
        if (admin.getStatus() != 1) {
            throw new RuntimeException("账户已被禁用");
        }
        
        // 更新最后登录时间
        admin.setLastLoginTime(LocalDateTime.now());
        adminMapper.updateLastLoginTime(admin.getId(), admin.getLastLoginTime());
        
        // 生成token
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, admin);
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("admin", admin);
        
        return result;
    }
    
    /**
     * 验证token
     */
    public Admin validateToken(String token) {
        return tokenStore.get(token);
    }
    
    /**
     * 退出登录
     */
    public void logout(String token) {
        tokenStore.remove(token);
    }
    
    /**
     * 创建管理员（仅超级管理员可用）
     */
    public Admin createAdmin(Admin admin) {
        // 检查用户名是否已存在
        if (adminMapper.findByUsername(admin.getUsername()) != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 加密密码
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        adminMapper.insert(admin);
        
        return admin;
    }
    
    /**
     * 修改密码
     */
    public void changePassword(Long adminId, String oldPassword, String newPassword) {
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            throw new RuntimeException("管理员不存在");
        }
        
        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setUpdateTime(LocalDateTime.now());
        adminMapper.updateById(admin);
    }
} 