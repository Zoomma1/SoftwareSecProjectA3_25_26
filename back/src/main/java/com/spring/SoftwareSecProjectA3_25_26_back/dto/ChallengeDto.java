package com.spring.SoftwareSecProjectA3_25_26_back.dto;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChallengeDto {
    private Long id;
    private User user;
    private String title;
    private String description;
    private String solution;
    private String attachmentUrl;
    private String category;
    private Difficulty difficulty;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
