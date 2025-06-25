package com.miracle.agility.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.miracle.agility.dto.request.PageRequest;
import com.miracle.agility.dto.response.PageResponse;
import com.miracle.agility.entity.Article;
import com.miracle.agility.entity.Video;
import com.miracle.agility.mapper.ArticleMapper;
import com.miracle.agility.mapper.VideoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HomeService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private VideoMapper videoMapper;

    /**
     * 获取首页资讯列表
     */
    public PageResponse<Article> getArticles(PageRequest request) {
        Page<Article> page = new Page<>(request.getPage(), request.getPageSize());
        QueryWrapper<Article> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("publish_time");
        
        Page<Article> result = articleMapper.selectPage(page, queryWrapper);
        
        return new PageResponse<>(result.getTotal(), result.getRecords());
    }

    /**
     * 获取首页视频列表
     */
    public PageResponse<Video> getVideos(PageRequest request) {
        Page<Video> page = new Page<>(request.getPage(), request.getPageSize());
        QueryWrapper<Video> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("publish_time");
        
        Page<Video> result = videoMapper.selectPage(page, queryWrapper);
        
        return new PageResponse<>(result.getTotal(), result.getRecords());
    }
} 