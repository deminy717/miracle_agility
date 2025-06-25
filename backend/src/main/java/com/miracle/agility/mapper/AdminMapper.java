package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface AdminMapper extends BaseMapper<Admin> {
    
    @Select("SELECT * FROM admins WHERE username = #{username} AND status = 1")
    Admin findByUsername(String username);
    
    @Update("UPDATE admins SET last_login_time = #{lastLoginTime} WHERE id = #{id}")
    int updateLastLoginTime(Long id, java.time.LocalDateTime lastLoginTime);
} 