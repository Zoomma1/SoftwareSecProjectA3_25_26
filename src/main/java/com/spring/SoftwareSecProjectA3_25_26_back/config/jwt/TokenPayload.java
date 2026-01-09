package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import lombok.Data;

@Data
public class TokenPayload {
    private Long id;
    private String role;
}
