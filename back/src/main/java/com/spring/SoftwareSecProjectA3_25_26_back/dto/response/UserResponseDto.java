package com.spring.SoftwareSecProjectA3_25_26_back.dto.response;

import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String username;
    private String role;
}