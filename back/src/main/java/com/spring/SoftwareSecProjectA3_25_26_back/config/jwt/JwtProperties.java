package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {
    private String secret;
    private String refreshSecret;
    private int tokenDuration;
    private int refreshTokenDuration;
    private String issuer;
}
