package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private static final Logger LOG = LoggerFactory.getLogger(CustomAccessDeniedHandler.class);

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            LOG.warn("Access denied to request {} principal={} authorities={}", request.getRequestURI(), auth.getPrincipal(), auth.getAuthorities());
        } else {
            LOG.warn("Access denied to request {} but authentication is null", request.getRequestURI());
        }

        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: You do not have the necessary permissions");

    }
}
