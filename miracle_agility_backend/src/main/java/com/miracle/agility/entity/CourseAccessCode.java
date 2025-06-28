package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 课程授权码实体类
 */
@Data
@Accessors(chain = true)
@TableName("course_access_codes")
public class CourseAccessCode {

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 授权码（唯一）
     */
    @TableField("code")
    private String code;

    /**
     * 课程ID
     */
    @TableField("course_id")
    private Long courseId;

    /**
     * 创建者ID（管理员）
     */
    @TableField("created_by")
    private Long createdBy;

    /**
     * 授权码描述/备注
     */
    @TableField("description")
    private String description;

    /**
     * 有效期开始时间
     */
    @TableField("valid_from")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validFrom;

    /**
     * 有效期结束时间
     */
    @TableField("valid_until")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validUntil;

    /**
     * 使用次数限制（null表示无限制）
     */
    @TableField("usage_limit")
    private Integer usageLimit;

    /**
     * 已使用次数
     */
    @TableField("used_count")
    private Integer usedCount = 0;

    /**
     * 状态: active-有效, used-已使用, expired-已过期, disabled-已禁用
     */
    @TableField("status")
    private String status = "active";

    /**
     * 使用者ID（如果已使用）
     */
    @TableField("used_by")
    private Long usedBy;

    /**
     * 使用时间
     */
    @TableField("used_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime usedAt;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // 非数据库字段，用于关联查询
    @TableField(exist = false)
    private Course course;

    @TableField(exist = false)
    private User createdByUser;

    @TableField(exist = false)
    private User usedByUser;

    /**
     * 判断授权码是否可用
     */
    public boolean isUsable() {
        if (!"active".equals(this.status)) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // 检查有效期
        if (validFrom != null && now.isBefore(validFrom)) {
            return false;
        }
        if (validUntil != null && now.isAfter(validUntil)) {
            return false;
        }
        
        // 检查使用次数
        if (usageLimit != null && usedCount >= usageLimit) {
            return false;
        }
        
        return true;
    }

    /**
     * 判断是否为一次性授权码
     */
    public boolean isOneTimeUse() {
        return usageLimit != null && usageLimit == 1;
    }

    /**
     * 标记为已使用
     */
    public void markAsUsed(Long userId) {
        this.usedCount = (this.usedCount == null ? 0 : this.usedCount) + 1;
        this.usedBy = userId;
        this.usedAt = LocalDateTime.now();
        
        // 如果是一次性使用的码，标记为已使用状态
        if (isOneTimeUse()) {
            this.status = "used";
        }
        
        // 如果达到使用次数限制，标记为已使用
        if (usageLimit != null && usedCount >= usageLimit) {
            this.status = "used";
        }
    }

    /**
     * 检查是否已过期
     */
    public boolean isExpired() {
        return validUntil != null && LocalDateTime.now().isAfter(validUntil);
    }

    /**
     * 获取状态显示名称
     */
    public String getStatusDisplayName() {
        switch (status) {
            case "active": return "有效";
            case "used": return "已使用";
            case "expired": return "已过期";
            case "disabled": return "已禁用";
            default: return status;
        }
    }
} 