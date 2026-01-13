package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.spring.SoftwareSecProjectA3_25_26_back.config.jwt.JwtTokenUtil;
import com.spring.SoftwareSecProjectA3_25_26_back.config.jwt.TokenPayload;
import com.spring.SoftwareSecProjectA3_25_26_back.config.jwt.TokenSet;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Role;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.BusinessException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {

    final private JwtTokenUtil jwtTokenUtil;
    final private HttpServletResponse response;
    @Value("${cors.insecure}")
    boolean corsInsecure;
    @Autowired
    UserRepository userRepository;
    @Value("${jwt.refresh-token-duration}")
    private int refreshTokenDuration;

    /**
     * Check if user has one of the roles listed
     *
     * @return
     */

    static public boolean isUserAnonymous() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return true;
        }
        Object principal = auth.getPrincipal();
        if (principal == null) {
            return true;
        }
        // Spring sets anonymous principal as the String "anonymousUser"
        if (principal instanceof String) {
            return "anonymousUser".equals(principal);
        }
        return false;
    }

    public Long getLoggedId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof TokenPayload) {
            return ((TokenPayload) principal).getId();
        }
        return null;
    }


    public boolean userHasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof TokenPayload) {
            return ((TokenPayload) principal).getRole().equals(role);
        }
        return false;
    }

    public TokenSet logUser(User user) {
        TokenSet set = jwtTokenUtil.generateTokenSet(user);
        return setRefreshTokenCookie(set);
    }

    public TokenSet refreshUserToken(String refreshToken) {
        try {
            TokenSet set = jwtTokenUtil.refreshWithToken(refreshToken);
            return setRefreshTokenCookie(set);
        } catch (JWTVerificationException e) {
            throw new BusinessException("refresh_token_invalid");
        }
    }

    private TokenSet setRefreshTokenCookie(TokenSet set) {
        Cookie cRefreshToken = new Cookie("refresh-token", set.getRefreshToken());
        cRefreshToken.setMaxAge(refreshTokenDuration);
        cRefreshToken.setPath("/auth/refresh");
        cRefreshToken.setSecure(corsInsecure);

        response.addCookie(cRefreshToken);

        return set;
    }

    public boolean validUSERPerformAction(String objectId) {
        // Allow admins first
        if (userHasRole(Role.ROLE_ADMIN.toString()) || userHasRole(Role.ROLE_SUPER_ADMIN.toString())) {
            return true;
        }

        Long loggedId = getLoggedId();
        if (loggedId == null) {
            return false;
        }

        try {
            Long objId = Long.valueOf(objectId);
            return objId.equals(loggedId);
        } catch (NumberFormatException e) {
            return false;
        }

    }

}
