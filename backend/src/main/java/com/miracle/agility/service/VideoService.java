package com.miracle.agility.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.miracle.agility.entity.Video;
import com.miracle.agility.mapper.VideoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VideoService {

    @Autowired
    private VideoMapper videoMapper;

    /**
     * 获取视频详情
     */
    public Map<String, Object> getVideoDetail(Long id) {
        Video video = videoMapper.selectById(id);
        if (video != null) {
            // 增加浏览量
            video.setViews(video.getViews() + 1);
            video.setUpdateTime(LocalDateTime.now());
            videoMapper.updateById(video);
            
            // 获取相关视频
            QueryWrapper<Video> queryWrapper = new QueryWrapper<>();
            queryWrapper.ne("id", id);
            queryWrapper.orderByDesc("publish_time");
            queryWrapper.last("LIMIT 5");
            List<Video> relatedVideos = videoMapper.selectList(queryWrapper);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", video.getId());
            result.put("title", video.getTitle());
            result.put("desc", video.getDesc());
            result.put("coverImage", video.getCoverImage());
            result.put("videoUrl", video.getVideoUrl());
            result.put("duration", video.getDuration());
            result.put("publishTime", video.getPublishTime());
            result.put("views", video.getViews());
            result.put("related", relatedVideos);
            
            return result;
        }
        return null;
    }
} 