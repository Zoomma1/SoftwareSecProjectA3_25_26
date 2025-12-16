package com.spring.SoftwareSecProjectA3_25_26_back.exceptions;

import org.springframework.security.core.AuthenticationException;

public class JwtTokenInvalidException extends AuthenticationException {
    public JwtTokenInvalidException(String msg) {
        super(msg);
    }
}