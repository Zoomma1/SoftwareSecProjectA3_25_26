package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.spring.SoftwareSecProjectA3_25_26_back.config.jwt.JwtTokenUtil;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Role;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.AuthRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.AuthResponseDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.RegisterRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.config.jwt.TokenSet;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public AuthResponseDto authenticate(AuthRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new HttpBadRequestException("Invalid credentials (wrong email)"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new HttpBadRequestException("Invalid credentials (wrong password)");
        }

        TokenSet tokenSet = jwtTokenUtil.generateTokenSet(user);
        return new AuthResponseDto(tokenSet.getToken(), tokenSet.getRefreshToken());
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new HttpBadRequestException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);

        TokenSet tokenSet = jwtTokenUtil.generateTokenSet(user);
        return new AuthResponseDto(tokenSet.getToken(), tokenSet.getRefreshToken());
    }

    public AuthResponseDto refreshToken(String refreshToken) {
        TokenSet tokenSet = jwtTokenUtil.refreshWithToken(refreshToken);
        return new AuthResponseDto(tokenSet.getToken(), tokenSet.getRefreshToken());
    }
}
