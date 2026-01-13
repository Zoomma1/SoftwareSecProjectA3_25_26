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

    @Autowired
    private ChallengeRepository challengeRepository;

    public List<UserResponseDto> findAll() {
        return userRepository.findAll().stream()
                .map(UserMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    public UserResponseDto findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new HttpBadRequestException("User not found with id: " + id));
        return UserMapper.INSTANCE.toDto(user);
    }

    public UserResponseDto getCurrentUser() {
        Long currentUserId = securityService.getLoggedId();
        if (currentUserId == null) {
            throw new HttpUnauthorizedException("No authenticated user");
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new HttpUnauthorizedException("Authenticated user not found with id: " + currentUserId));
        return UserMapper.INSTANCE.toDto(user);
    }

    /**
     * Mark a challenge as completed for a user (adds the challengeId to the completedChallenges set).
     * Only the user themself or an allowed admin can perform this action.
     */
    public UserResponseDto markChallengeCompleted(Long userId, Long challengeId) {
        if (userId == null) {
            throw new HttpBadRequestException("userId is required");
        }
        if (challengeId == null) {
            throw new HttpBadRequestException("challengeId is required");
        }

        // Authorization: only the user or allowed admin
        if (!securityService.validUSERPerformAction(userId.toString())) {
            throw new HttpUnauthorizedException("Not allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HttpBadRequestException("User not found"));

        // Optional: validate challenge exists
        challengeRepository.findById(challengeId)
                .orElseThrow(() -> new HttpBadRequestException("Challenge not found"));

        boolean added = user.getCompletedChallenges().add(challengeId);
        if (added) {
            userRepository.save(user);
        }
        return UserMapper.INSTANCE.toDto(user);
    }

    /**
     * Unmark a challenge as completed for a user (removes the challengeId from the set).
     */
    public UserResponseDto unmarkChallengeCompleted(Long userId, Long challengeId) {
        if (userId == null) {
            throw new HttpBadRequestException("userId is required");
        }
        if (challengeId == null) {
            throw new HttpBadRequestException("challengeId is required");
        }

        if (!securityService.validUSERPerformAction(userId.toString())) {
            throw new HttpUnauthorizedException("Not allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new HttpBadRequestException("User not found"));

        boolean removed = user.getCompletedChallenges().remove(challengeId);
        if (removed) {
            userRepository.save(user);
        }
        return UserMapper.INSTANCE.toDto(user);
    }
}
