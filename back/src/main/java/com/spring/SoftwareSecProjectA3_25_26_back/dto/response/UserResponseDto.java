package com.spring.SoftwareSecProjectA3_25_26_back.dto.response;

import lombok.Data;

import java.util.Set;
import java.util.HashSet;

@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String username;
    private String role;
    private Set<Long> completedChallenges = new HashSet<>();
}