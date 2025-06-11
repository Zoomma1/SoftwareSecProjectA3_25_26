package com.spring.BoilerPlateApp.dal.model.dto;


import com.spring.BoilerPlateApp.dal.model.enums.Role;
import lombok.Data;

@Data
public class UserDto {
    Long id;
    Role role;
}
