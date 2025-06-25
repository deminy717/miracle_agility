package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.common.BusinessException;
import com.miracle.agility.service.VideoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/video")
public class VideoController {

    private static final Logger logger = LoggerFactory.getLogger(VideoController.class);

    @Autowired
    private VideoService videoService;

    /**
     * 获取视频详情
     */
    @GetMapping("/detail")
    public ApiResponse<Map<String, Object>> getVideoDetail(@RequestParam Long id) {
        logger.info("获取视频详情，视频ID: {}", id);
        Map<String, Object> video = videoService.getVideoDetail(id);
        if (video == null) {
            logger.warn("视频不存在，ID: {}", id);
            throw new BusinessException("视频不存在");
        }
        logger.info("成功获取视频详情，ID: {}", id);
        return ApiResponse.success(video);
    }
} 