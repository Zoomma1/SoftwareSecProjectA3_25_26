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
        String header = request.getHeader("Authorization");

        try {
            if (header == null) {
                chain.doFilter(request, response);
                return;
            }

            String headerTrimmed = header.trim();
            // case-insensitive check for 'bearer '
            if (!headerTrimmed.toLowerCase().startsWith("bearer ")) {
                chain.doFilter(request, response);
                return;
            }

            // Remove first 'Bearer ' prefix
            String token = headerTrimmed.substring(7);
            // Defensive normalization: trim and remove any accidental repeated 'Bearer ' prefixes
            if (token != null) {
                token = token.trim();
                while (token.toLowerCase().startsWith("bearer ")) {
                    token = token.substring(7).trim();
                }
            }

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
                // Debug logging: claims
                try {
                    String claimRole = jwt.getClaim("role").asString();
                    Long claimId = jwt.getClaim("id").asLong();
                    LOG.debug("Decoded JWT for request {} -> id={}, role={}", request.getRequestURI(), claimId, claimRole);
                } catch (Exception e) {
                    LOG.debug("Decoded JWT for request {} -> unable to read id/role claims: {}", request.getRequestURI(), e.getMessage());
                }

                String role = jwt.getClaim("role").asString();
                if (role == null || role.isBlank()) {
                    throw new JwtTokenInvalidException("Role not present in token");
                }

                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));

                JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt, authorities);
                authentication.setAuthenticated(true);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                LOG.debug("Authentication set in SecurityContext for request {} principal={}", request.getRequestURI(), authentication.getPrincipal());
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
