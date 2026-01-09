package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.JwtTokenInvalidException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(JwtAuthenticationTokenFilter.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = request.getHeader("Authorization");

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                chain.doFilter(request, response);
                return;
            }

            token = token.substring(7);
            if (token.isEmpty()) {
                throw new JwtTokenInvalidException("No token found");
            }

            DecodedJWT jwt;
            try {
                jwt = jwtTokenUtil.decodeToken(token);
            } catch (Exception e) {
                throw new JwtTokenInvalidException("Invalid or expired token: " + e.getMessage());
            }

            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                String role = jwt.getClaim("role").asString();
                if (role == null || role.isBlank()) {
                    throw new JwtTokenInvalidException("Role not present in token");
                }

                
                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
                
                JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt, authorities);
                authentication.setAuthenticated(true);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (AuthenticationException e) {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
