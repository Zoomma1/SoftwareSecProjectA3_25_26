package com.spring.SoftwareSecProjectA3_25_26_back.dto.request;

import lombok.Data;

@Data
public class AuthRequestDto {
    private String email;
    private String password;
}