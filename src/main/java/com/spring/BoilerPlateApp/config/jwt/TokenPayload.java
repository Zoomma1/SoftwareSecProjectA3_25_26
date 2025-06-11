package com.spring.BoilerPlateApp.config.jwt;

import lombok.Data;

@Data
public class TokenPayload {
    private Long id;
    private String role;
}
