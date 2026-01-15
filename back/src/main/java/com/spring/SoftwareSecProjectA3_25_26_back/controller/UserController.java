package com.spring.SoftwareSecProjectA3_25_26_back.controller;


import com.spring.SoftwareSecProjectA3_25_26_back.annotation.PublicEndpoint;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.UserResponseDto;
import com.spring.SoftwareSecProjectA3_25_26_back.service.SecurityService;
import com.spring.SoftwareSecProjectA3_25_26_back.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User")

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    SecurityService service;

    @GetMapping()
    @PublicEndpoint
    public List<UserResponseDto> findAll(){
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public  UserResponseDto findById(@PathVariable Long id){
        return userService.findById(id);
    }

    @GetMapping("/me")
    public UserResponseDto getCurrentUser() {
        return userService.getCurrentUser();
    }

}
