package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        // Return 401 when authentication is missing/invalid (not 403)
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Authentication token is missing or invalid");
    }
}
