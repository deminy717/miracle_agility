package com.miracle.agility.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.entity.Article;
import com.miracle.agility.entity.Course;
import com.miracle.agility.entity.Video;
import com.miracle.agility.mapper.ArticleMapper;
import com.miracle.agility.mapper.CourseMapper;
import com.miracle.agility.mapper.VideoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/content")
@CrossOrigin(origins = "*")
public class AdminContentController {
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private VideoMapper videoMapper;
    
    @Autowired
    private CourseMapper courseMapper;
    
    // ==================== 文章管理 ====================
    
    /**
     * 分页查询文章列表
     */
    @GetMapping("/articles")
    public ApiResponse<Page<Article>> getArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        try {
            Page<Article> articlePage = new Page<>(page, size);
            QueryWrapper<Article> wrapper = new QueryWrapper<>();
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                wrapper.like("title", keyword).or().like("content", keyword);
            }
            
            wrapper.orderByDesc("create_time");
            
            Page<Article> result = articleMapper.selectPage(articlePage, wrapper);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 获取文章详情
     */
    @GetMapping("/articles/{id}")
    public ApiResponse<Article> getArticle(@PathVariable Long id) {
        try {
            Article article = articleMapper.selectById(id);
            if (article == null) {
                return ApiResponse.error("文章不存在");
            }
            return ApiResponse.success(article);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 创建文章
     */
    @PostMapping("/articles")
    public ApiResponse<Article> createArticle(@RequestBody Article article) {
        try {
            article.setCreateTime(LocalDateTime.now());
            article.setUpdateTime(LocalDateTime.now());
            if (article.getViews() == null) {
                article.setViews(0);
            }
            articleMapper.insert(article);
            return ApiResponse.success(article);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 更新文章
     */
    @PutMapping("/articles/{id}")
    public ApiResponse<Article> updateArticle(@PathVariable Long id, @RequestBody Article article) {
        try {
            Article existingArticle = articleMapper.selectById(id);
            if (existingArticle == null) {
                return ApiResponse.error("文章不存在");
            }
            
            article.setId(id);
            article.setUpdateTime(LocalDateTime.now());
            articleMapper.updateById(article);
            
            return ApiResponse.success(article);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 删除文章
     */
    @DeleteMapping("/articles/{id}")
    public ApiResponse<String> deleteArticle(@PathVariable Long id) {
        try {
            Article article = articleMapper.selectById(id);
            if (article == null) {
                return ApiResponse.error("文章不存在");
            }
            
            articleMapper.deleteById(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // ==================== 视频管理 ====================
    
    /**
     * 分页查询视频列表
     */
    @GetMapping("/videos")
    public ApiResponse<Page<Video>> getVideos(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        try {
            Page<Video> videoPage = new Page<>(page, size);
            QueryWrapper<Video> wrapper = new QueryWrapper<>();
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                wrapper.like("title", keyword).or().like("desc", keyword);
            }
            
            wrapper.orderByDesc("create_time");
            
            Page<Video> result = videoMapper.selectPage(videoPage, wrapper);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 获取视频详情
     */
    @GetMapping("/videos/{id}")
    public ApiResponse<Video> getVideo(@PathVariable Long id) {
        try {
            Video video = videoMapper.selectById(id);
            if (video == null) {
                return ApiResponse.error("视频不存在");
            }
            return ApiResponse.success(video);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 创建视频
     */
    @PostMapping("/videos")
    public ApiResponse<Video> createVideo(@RequestBody Video video) {
        try {
            video.setCreateTime(LocalDateTime.now());
            video.setUpdateTime(LocalDateTime.now());
            if (video.getViews() == null) {
                video.setViews(0);
            }
            videoMapper.insert(video);
            return ApiResponse.success(video);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 更新视频
     */
    @PutMapping("/videos/{id}")
    public ApiResponse<Video> updateVideo(@PathVariable Long id, @RequestBody Video video) {
        try {
            Video existingVideo = videoMapper.selectById(id);
            if (existingVideo == null) {
                return ApiResponse.error("视频不存在");
            }
            
            video.setId(id);
            video.setUpdateTime(LocalDateTime.now());
            videoMapper.updateById(video);
            
            return ApiResponse.success(video);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 删除视频
     */
    @DeleteMapping("/videos/{id}")
    public ApiResponse<String> deleteVideo(@PathVariable Long id) {
        try {
            Video video = videoMapper.selectById(id);
            if (video == null) {
                return ApiResponse.error("视频不存在");
            }
            
            videoMapper.deleteById(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // ==================== 课程管理 ====================
    
    /**
     * 分页查询课程列表
     */
    @GetMapping("/courses")
    public ApiResponse<Page<Course>> getCourses(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        try {
            Page<Course> coursePage = new Page<>(page, size);
            QueryWrapper<Course> wrapper = new QueryWrapper<>();
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                wrapper.like("title", keyword).or().like("description", keyword);
            }
            
            wrapper.orderByDesc("create_time");
            
            Page<Course> result = courseMapper.selectPage(coursePage, wrapper);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 获取课程详情
     */
    @GetMapping("/courses/{id}")
    public ApiResponse<Course> getCourse(@PathVariable Long id) {
        try {
            Course course = courseMapper.selectById(id);
            if (course == null) {
                return ApiResponse.error("课程不存在");
            }
            return ApiResponse.success(course);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 创建课程
     */
    @PostMapping("/courses")
    public ApiResponse<Course> createCourse(@RequestBody Course course) {
        try {
            course.setCreateTime(LocalDateTime.now());
            course.setUpdateTime(LocalDateTime.now());
            courseMapper.insert(course);
            return ApiResponse.success(course);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 更新课程
     */
    @PutMapping("/courses/{id}")
    public ApiResponse<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        try {
            Course existingCourse = courseMapper.selectById(id);
            if (existingCourse == null) {
                return ApiResponse.error("课程不存在");
            }
            
            course.setId(id);
            course.setUpdateTime(LocalDateTime.now());
            courseMapper.updateById(course);
            
            return ApiResponse.success(course);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 删除课程
     */
    @DeleteMapping("/courses/{id}")
    public ApiResponse<String> deleteCourse(@PathVariable Long id) {
        try {
            Course course = courseMapper.selectById(id);
            if (course == null) {
                return ApiResponse.error("课程不存在");
            }
            
            courseMapper.deleteById(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    // ==================== 统计信息 ====================
    
    /**
     * 获取内容统计信息
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics() {
        try {
            Long totalArticles = articleMapper.selectCount(null);
            Long totalVideos = videoMapper.selectCount(null);
            Long totalCourses = courseMapper.selectCount(null);
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalArticles", totalArticles);
            statistics.put("totalVideos", totalVideos);
            statistics.put("totalCourses", totalCourses);
            
            return ApiResponse.success(statistics);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 