package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.request.PageRequest;
import com.miracle.agility.dto.response.PageResponse;
import com.miracle.agility.entity.Article;
import com.miracle.agility.entity.Video;
import com.miracle.agility.service.HomeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/home")
public class HomeController {

    private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

    @Autowired
    private HomeService homeService;

    /**
     * 获取首页资讯列表
     */
    @GetMapping("/articles")
    public ApiResponse<PageResponse<Article>> getArticles(@RequestParam(defaultValue = "1") Integer page,
                                                         @RequestParam(defaultValue = "10") Integer pageSize) {
        logger.info("获取首页资讯列表，页码: {}, 页面大小: {}", page, pageSize);
        PageRequest request = new PageRequest(page, pageSize);
        PageResponse<Article> response = homeService.getArticles(request);
        logger.info("成功获取资讯列表，总数: {}", response.getTotal());
        return ApiResponse.success(response);
    }

    /**
     * 获取首页视频列表
     */
    @GetMapping("/videos")
    public ApiResponse<PageResponse<Video>> getVideos(@RequestParam(defaultValue = "1") Integer page,
                                                     @RequestParam(defaultValue = "10") Integer pageSize) {
        logger.info("获取首页视频列表，页码: {}, 页面大小: {}", page, pageSize);
        PageRequest request = new PageRequest(page, pageSize);
        PageResponse<Video> response = homeService.getVideos(request);
        logger.info("成功获取视频列表，总数: {}", response.getTotal());
        return ApiResponse.success(response);
    }
} 