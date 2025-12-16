package com.spring.SoftwareSecProjectA3_25_26_back.mapper;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.UserResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserResponseDto toDto(User user);
}