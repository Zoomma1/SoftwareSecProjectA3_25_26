package com.spring.BoilerPlateApp.controller;


import com.spring.BoilerPlateApp.constants.Roles;
import com.spring.BoilerPlateApp.dal.model.dto.UserDto;

import com.spring.BoilerPlateApp.service.SecurityService;
import com.spring.BoilerPlateApp.service.UserService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    SecurityService service;

    @GetMapping()
    @RolesAllowed({Roles.ADMIN})
    public List<UserDto> findAll(){
        return userService.findAll();
    }


}
