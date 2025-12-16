package com.spring.SoftwareSecProjectA3_25_26_back.dto.request;

import lombok.Data;

@Data
public class RegisterRequestDto {
    private String email;
    private String password;
    private String username;
    private String fullName;
}