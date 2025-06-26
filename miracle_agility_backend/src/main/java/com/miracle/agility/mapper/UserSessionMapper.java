package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.UserSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 用户会话Mapper接口
 */
@Mapper
public interface UserSessionMapper extends BaseMapper<UserSession> {
    
    /**
     * 根据访问令牌查找有效会话
     */
    @Select("SELECT * FROM user_sessions WHERE access_token = #{accessToken} AND status = 'active'")
    UserSession selectByAccessToken(@Param("accessToken") String accessToken);
    
    /**
     * 根据刷新令牌查找有效会话
     */
    @Select("SELECT * FROM user_sessions WHERE refresh_token = #{refreshToken} AND status = 'active'")
    UserSession selectByRefreshToken(@Param("refreshToken") String refreshToken);
    
    /**
     * 根据会话密钥查找会话
     */
    @Select("SELECT * FROM user_sessions WHERE session_key = #{sessionKey}")
    UserSession selectBySessionKey(@Param("sessionKey") String sessionKey);
    
    /**
     * 查找用户的所有活跃会话
     */
    @Select("SELECT * FROM user_sessions WHERE user_id = #{userId} AND status = 'active'")
    List<UserSession> selectActiveSessionsByUserId(@Param("userId") Long userId);
    
    /**
     * 撤销用户的所有会话
     */
    @Update("UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE user_id = #{userId} AND status = 'active'")
    int revokeAllUserSessions(@Param("userId") Long userId);
    
    /**
     * 撤销指定的会话
     */
    @Update("UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE access_token = #{accessToken}")
    int revokeSession(@Param("accessToken") String accessToken);
    
    /**
     * 删除或撤销具有相同session_key的旧会话（避免UNIQUE约束冲突）
     */
    @Update("UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE session_key = #{sessionKey}")
    int revokeSessionsBySessionKey(@Param("sessionKey") String sessionKey);
    
    /**
     * 物理删除具有相同session_key的旧会话记录（避免UNIQUE约束冲突）
     */
    @Update("DELETE FROM user_sessions WHERE session_key = #{sessionKey}")
    int deleteSessionsBySessionKey(@Param("sessionKey") String sessionKey);
    
    /**
     * 清理过期会话
     */
    @Update("UPDATE user_sessions SET status = 'expired', updated_at = NOW() WHERE expires_at < NOW() AND status = 'active'")
    int expireOldSessions();
    
    /**
     * 删除过期的已撤销会话（物理删除，用于定时清理）
     */
    @Update("DELETE FROM user_sessions WHERE status IN ('expired', 'revoked') AND updated_at < DATE_SUB(NOW(), INTERVAL #{days} DAY)")
    int deleteExpiredSessions(@Param("days") int days);
} 