package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.ChapterContentCard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 章节内容卡片Mapper接口
 */
@Mapper
public interface ChapterContentCardMapper extends BaseMapper<ChapterContentCard> {
    
    /**
     * 根据章节ID查询内容卡片列表
     */
    @Select("SELECT * FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND deleted_at IS NULL ORDER BY sort_order ASC")
    List<ChapterContentCard> selectByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 根据章节ID和状态查询内容卡片列表
     */
    @Select("SELECT * FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND status = #{status} AND deleted_at IS NULL ORDER BY sort_order ASC")
    List<ChapterContentCard> selectByChapterIdAndStatus(@Param("chapterId") Long chapterId, @Param("status") String status);
    
    /**
     * 根据卡片类型查询内容卡片列表
     */
    @Select("SELECT * FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND card_type = #{cardType} AND deleted_at IS NULL ORDER BY sort_order ASC")
    List<ChapterContentCard> selectByChapterIdAndCardType(@Param("chapterId") Long chapterId, @Param("cardType") String cardType);
    
    /**
     * 获取指定章节的下一个排序号
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND deleted_at IS NULL")
    Integer getNextSortOrder(@Param("chapterId") Long chapterId);
    
    /**
     * 更新卡片状态
     */
    @Update("UPDATE chapter_content_cards SET status = #{status}, updated_at = NOW() WHERE id = #{cardId}")
    int updateStatus(@Param("cardId") Long cardId, @Param("status") String status);
    
    /**
     * 批量更新卡片排序
     */
    @Update("UPDATE chapter_content_cards SET sort_order = #{sortOrder}, updated_at = NOW() WHERE id = #{cardId}")
    int updateSortOrder(@Param("cardId") Long cardId, @Param("sortOrder") Integer sortOrder);
    
    /**
     * 统计指定章节的卡片数量
     */
    @Select("SELECT COUNT(*) FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND deleted_at IS NULL")
    long countByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 统计指定章节活跃状态的卡片数量
     */
    @Select("SELECT COUNT(*) FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND status = 'active' AND deleted_at IS NULL")
    long countActiveByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 根据卡片类型统计数量
     */
    @Select("SELECT COUNT(*) FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND card_type = #{cardType} AND deleted_at IS NULL")
    long countByChapterIdAndCardType(@Param("chapterId") Long chapterId, @Param("cardType") String cardType);
    
    /**
     * 查询指定章节的最大排序号
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM chapter_content_cards WHERE chapter_id = #{chapterId} AND deleted_at IS NULL")
    Integer getMaxSortOrderByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 批量删除章节的所有卡片（软删除）
     */
    @Update("UPDATE chapter_content_cards SET deleted_at = NOW() WHERE chapter_id = #{chapterId} AND deleted_at IS NULL")
    int deleteByChapterId(@Param("chapterId") Long chapterId);
} 