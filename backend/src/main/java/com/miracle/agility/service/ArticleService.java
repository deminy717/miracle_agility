package com.miracle.agility.service;

import com.miracle.agility.entity.Article;
import com.miracle.agility.mapper.ArticleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    /**
     * 获取文章详情
     */
    public Article getArticleDetail(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            // 增加浏览量
            article.setViews(article.getViews() + 1);
            article.setUpdateTime(LocalDateTime.now());
            articleMapper.updateById(article);
        }
        return article;
    }
} 