package com.spring.SoftwareSecProjectA3_25_26_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private String refreshToken;
}