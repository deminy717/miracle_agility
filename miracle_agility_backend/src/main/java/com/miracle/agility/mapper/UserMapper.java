package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 用户Mapper接口
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 根据openid查找用户
     */
    @Select("SELECT * FROM users WHERE openid = #{openid} AND deleted_at IS NULL")
    User selectByOpenid(@Param("openid") String openid);
    
    /**
     * 根据unionid查找用户
     */
    @Select("SELECT * FROM users WHERE unionid = #{unionid} AND deleted_at IS NULL")
    User selectByUnionid(@Param("unionid") String unionid);
    
    /**
     * 根据手机号查找用户
     */
    @Select("SELECT * FROM users WHERE phone = #{phone} AND deleted_at IS NULL")
    User selectByPhone(@Param("phone") String phone);
    
    /**
     * 根据邮箱查找用户
     */
    @Select("SELECT * FROM users WHERE email = #{email} AND deleted_at IS NULL")
    User selectByEmail(@Param("email") String email);
    
    /**
     * 更新用户最后登录信息
     */
    @Update("UPDATE users SET last_login_time = #{lastLoginTime}, last_login_ip = #{lastLoginIp}, updated_at = NOW() WHERE id = #{userId}")
    int updateLastLoginInfo(@Param("userId") Long userId, 
                          @Param("lastLoginTime") String lastLoginTime, 
                          @Param("lastLoginIp") String lastLoginIp);
    
    /**
     * 统计指定角色的用户数量
     */
    @Select("SELECT COUNT(*) FROM users WHERE role = #{role} AND deleted_at IS NULL")
    long countByRole(@Param("role") String role);
    
    /**
     * 统计活跃用户总数
     */
    @Select("SELECT COUNT(*) FROM users WHERE status = 'active' AND deleted_at IS NULL")
    long countActiveUsers();
} 