package com.spring.SoftwareSecProjectA3_25_26_back.controller;

import com.spring.SoftwareSecProjectA3_25_26_back.annotation.PublicEndpoint;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.RefreshTokenDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.AuthRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.RegisterRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.AuthResponseDto;
import com.spring.SoftwareSecProjectA3_25_26_back.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Auth")

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PublicEndpoint
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PublicEndpoint
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody RegisterRequestDto request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PublicEndpoint
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@RequestBody RefreshTokenDto request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }
}
