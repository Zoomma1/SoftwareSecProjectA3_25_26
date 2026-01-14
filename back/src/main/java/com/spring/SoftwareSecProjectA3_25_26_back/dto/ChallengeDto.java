package com.spring.SoftwareSecProjectA3_25_26_back.dto;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChallengeDto {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String solution;
    private String attachmentUrl;
    private String category;
    private Difficulty difficulty;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
