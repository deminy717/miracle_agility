package com.miracle.agility.dto.request;

public class UpdateLessonStatusRequest {
    
    private Long courseId;
    private Long lessonId;
    private Boolean completed;
    
    public UpdateLessonStatusRequest() {
    }
    
    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    public Long getLessonId() {
        return lessonId;
    }
    
    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }
    
    public Boolean getCompleted() {
        return completed;
    }
    
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
} 