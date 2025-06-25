package com.miracle.agility.dto.request;

public class PageRequest {
    
    private Integer page = 1;
    private Integer pageSize = 10;
    
    public PageRequest() {
    }
    
    public PageRequest(Integer page, Integer pageSize) {
        this.page = page;
        this.pageSize = pageSize;
    }
    
    // Getters and Setters
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }
} 