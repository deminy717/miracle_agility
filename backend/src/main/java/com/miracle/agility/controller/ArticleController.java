package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.common.BusinessException;
import com.miracle.agility.entity.Article;
import com.miracle.agility.service.ArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/article")
public class ArticleController {

    private static final Logger logger = LoggerFactory.getLogger(ArticleController.class);

    @Autowired
    private ArticleService articleService;

    /**
     * 获取文章详情
     */
    @GetMapping("/detail")
    public ApiResponse<Article> getArticleDetail(@RequestParam Long id) {
        logger.info("获取文章详情，文章ID: {}", id);
        Article article = articleService.getArticleDetail(id);
        if (article == null) {
            logger.warn("文章不存在，ID: {}", id);
            throw new BusinessException("文章不存在");
        }
        logger.info("成功获取文章详情，ID: {}, 标题: {}", id, article.getTitle());
        return ApiResponse.success(article);
    }
} 