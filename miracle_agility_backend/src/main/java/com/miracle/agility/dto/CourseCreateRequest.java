package com.miracle.agility.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 课程创建请求DTO
 */
@Data
public class CourseCreateRequest {

    /**
     * 课程标题
     */
    @NotBlank(message = "课程标题不能为空")
    private String title;

    /**
     * 课程描述
     */
    private String description;

    /**
     * 封面图片URL
     */
    private String cover;

    /**
     * 教师姓名
     */
    private String teacherName;

    /**
     * 课程分类
     */
    private String category;

    /**
     * 课程级别: beginner-初级, intermediate-中级, advanced-高级
     */
    private String level = "beginner";

    /**
     * 课程价格
     */
    private BigDecimal price;

    /**
     * 原价
     */
    private BigDecimal originalPrice;

    /**
     * 是否免费
     */
    private Boolean isFree = false;

    /**
     * 标签数组(逗号分隔)
     */
    private String tags;

    /**
     * 学习要求(逗号分隔)
     */
    private String requirements;

    /**
     * 学习目标(逗号分隔)
     */
    private String objectives;
} 