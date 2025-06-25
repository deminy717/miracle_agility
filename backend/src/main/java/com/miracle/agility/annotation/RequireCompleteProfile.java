package com.miracle.agility.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 标记需要完整用户信息的接口
 * 用户必须已登录且设置了自定义昵称和头像才能访问
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireCompleteProfile {
    String message() default "请先完善个人信息（昵称和头像）";
} 