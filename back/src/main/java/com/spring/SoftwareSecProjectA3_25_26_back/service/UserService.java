package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.Challenge;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.ChallengeRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.UserResponseDto;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpUnauthorizedException;
import com.spring.SoftwareSecProjectA3_25_26_back.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    SecurityService securityService;

    public List<UserResponseDto> findAll() {
        return userRepository.findAll().stream()
                .map(UserMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
}
