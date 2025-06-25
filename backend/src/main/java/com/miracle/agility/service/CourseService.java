package com.miracle.agility.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.miracle.agility.dto.request.PageRequest;
import com.miracle.agility.dto.request.UpdateLessonStatusRequest;
import com.miracle.agility.dto.response.PageResponse;
import com.miracle.agility.entity.*;
import com.miracle.agility.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CourseService {

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private ChapterMapper chapterMapper;

    @Autowired
    private LessonMapper lessonMapper;

    @Autowired
    private UserCourseMapper userCourseMapper;

    @Autowired
    private UserLessonMapper userLessonMapper;

    /**
     * 获取用户课程列表
     */
    public PageResponse<Map<String, Object>> getCourseList(Long userId, PageRequest request) {
        Page<UserCourse> page = new Page<>(request.getPage(), request.getPageSize());
        QueryWrapper<UserCourse> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId);
        queryWrapper.orderByDesc("create_time");

        Page<UserCourse> result = userCourseMapper.selectPage(page, queryWrapper);

        List<Map<String, Object>> courseList = new ArrayList<>();
        for (UserCourse userCourse : result.getRecords()) {
            Course course = courseMapper.selectById(userCourse.getCourseId());
            if (course != null) {
                Map<String, Object> courseInfo = new HashMap<>();
                courseInfo.put("id", course.getId());
                courseInfo.put("title", course.getTitle());
                courseInfo.put("desc", course.getDesc());
                courseInfo.put("coverImage", course.getCoverImage());
                courseInfo.put("lessonCount", course.getLessonCount());
                courseInfo.put("progress", userCourse.getProgress());
                courseList.add(courseInfo);
            }
        }

        return new PageResponse<>(result.getTotal(), courseList);
    }

    /**
     * 获取课程详情
     */
    public Map<String, Object> getCourseDetail(Long userId, Long courseId) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            return null;
        }

        // 获取用户课程进度
        QueryWrapper<UserCourse> userCourseQuery = new QueryWrapper<>();
        userCourseQuery.eq("user_id", userId).eq("course_id", courseId);
        UserCourse userCourse = userCourseMapper.selectOne(userCourseQuery);
        
        // 如果用户还没有购买课程，创建记录
        if (userCourse == null) {
            userCourse = new UserCourse(userId, courseId);
            userCourseMapper.insert(userCourse);
        }

        // 获取章节和课时
        QueryWrapper<Chapter> chapterQuery = new QueryWrapper<>();
        chapterQuery.eq("course_id", courseId).orderByAsc("sort_order");
        List<Chapter> chapters = chapterMapper.selectList(chapterQuery);

        List<Map<String, Object>> chapterList = new ArrayList<>();
        for (Chapter chapter : chapters) {
            QueryWrapper<Lesson> lessonQuery = new QueryWrapper<>();
            lessonQuery.eq("chapter_id", chapter.getId()).orderByAsc("sort_order");
            List<Lesson> lessons = lessonMapper.selectList(lessonQuery);

            List<Map<String, Object>> lessonList = new ArrayList<>();
            for (Lesson lesson : lessons) {
                // 获取用户课时状态
                QueryWrapper<UserLesson> userLessonQuery = new QueryWrapper<>();
                userLessonQuery.eq("user_id", userId).eq("lesson_id", lesson.getId());
                UserLesson userLesson = userLessonMapper.selectOne(userLessonQuery);

                String status = "unlearned";
                String statusText = "未学习";
                if (userLesson != null && userLesson.getCompleted()) {
                    status = "completed";
                    statusText = "已完成";
                } else if (userLesson != null) {
                    status = "learning";
                    statusText = "学习中";
                }

                Map<String, Object> lessonInfo = new HashMap<>();
                lessonInfo.put("id", lesson.getId());
                lessonInfo.put("title", lesson.getTitle());
                lessonInfo.put("duration", lesson.getDuration());
                lessonInfo.put("status", status);
                lessonInfo.put("statusText", statusText);
                lessonList.add(lessonInfo);
            }

            Map<String, Object> chapterInfo = new HashMap<>();
            chapterInfo.put("id", chapter.getId());
            chapterInfo.put("title", chapter.getTitle());
            chapterInfo.put("lessons", lessonList);
            chapterList.add(chapterInfo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", course.getId());
        result.put("title", course.getTitle());
        result.put("desc", course.getDesc());
        result.put("coverImage", course.getCoverImage());
        result.put("lessonCount", course.getLessonCount());
        result.put("progress", userCourse.getProgress());
        result.put("chapters", chapterList);

        return result;
    }

    /**
     * 获取课时内容
     */
    public Map<String, Object> getLessonContent(Long userId, Long courseId, Long chapterId, Long lessonId) {
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            return null;
        }

        Chapter chapter = chapterMapper.selectById(chapterId);
        if (chapter == null) {
            return null;
        }

        // 获取用户课时状态
        QueryWrapper<UserLesson> userLessonQuery = new QueryWrapper<>();
        userLessonQuery.eq("user_id", userId).eq("lesson_id", lessonId);
        UserLesson userLesson = userLessonMapper.selectOne(userLessonQuery);

        // 获取上一课时和下一课时
        QueryWrapper<Lesson> prevQuery = new QueryWrapper<>();
        prevQuery.eq("course_id", courseId).lt("sort_order", lesson.getSortOrder()).orderByDesc("sort_order").last("LIMIT 1");
        Lesson prevLesson = lessonMapper.selectOne(prevQuery);

        QueryWrapper<Lesson> nextQuery = new QueryWrapper<>();
        nextQuery.eq("course_id", courseId).gt("sort_order", lesson.getSortOrder()).orderByAsc("sort_order").last("LIMIT 1");
        Lesson nextLesson = lessonMapper.selectOne(nextQuery);

        Map<String, Object> result = new HashMap<>();
        result.put("id", lesson.getId());
        result.put("title", lesson.getTitle());
        result.put("chapterTitle", chapter.getTitle());
        result.put("duration", lesson.getDuration());
        result.put("completed", userLesson != null && userLesson.getCompleted());
        result.put("videoUrl", lesson.getVideoUrl());
        result.put("videoPoster", lesson.getVideoPoster());
        result.put("content", lesson.getContent());
        result.put("images", lesson.getImages() != null ? Arrays.asList(lesson.getImages().split(",")) : new ArrayList<>());
        result.put("prevLessonId", prevLesson != null ? prevLesson.getId() : 0);
        result.put("nextLessonId", nextLesson != null ? nextLesson.getId() : 0);

        return result;
    }

    /**
     * 更新课时状态
     */
    public Map<String, Object> updateLessonStatus(Long userId, UpdateLessonStatusRequest request) {
        // 查找或创建用户课时记录
        QueryWrapper<UserLesson> userLessonQuery = new QueryWrapper<>();
        userLessonQuery.eq("user_id", userId).eq("lesson_id", request.getLessonId());
        UserLesson userLesson = userLessonMapper.selectOne(userLessonQuery);

        if (userLesson == null) {
            userLesson = new UserLesson(userId, request.getLessonId(), request.getCourseId());
            userLessonMapper.insert(userLesson);
        }

        userLesson.setCompleted(request.getCompleted());
        userLesson.setUpdateTime(LocalDateTime.now());
        userLessonMapper.updateById(userLesson);

        // 重新计算课程进度
        QueryWrapper<Lesson> totalLessonQuery = new QueryWrapper<>();
        totalLessonQuery.eq("course_id", request.getCourseId());
        long totalLessons = lessonMapper.selectCount(totalLessonQuery);

        QueryWrapper<UserLesson> completedLessonQuery = new QueryWrapper<>();
        completedLessonQuery.eq("user_id", userId).eq("course_id", request.getCourseId()).eq("completed", true);
        long completedLessons = userLessonMapper.selectCount(completedLessonQuery);

        int progress = totalLessons > 0 ? (int) ((completedLessons * 100) / totalLessons) : 0;

        // 更新用户课程进度
        QueryWrapper<UserCourse> userCourseQuery = new QueryWrapper<>();
        userCourseQuery.eq("user_id", userId).eq("course_id", request.getCourseId());
        UserCourse userCourse = userCourseMapper.selectOne(userCourseQuery);
        if (userCourse != null) {
            userCourse.setProgress(progress);
            userCourse.setUpdateTime(LocalDateTime.now());
            userCourseMapper.updateById(userCourse);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("progress", progress);

        return result;
    }
}