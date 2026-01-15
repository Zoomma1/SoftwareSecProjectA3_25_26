package com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.Challenge;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Hidden
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    Optional<List<Challenge>> findAllByUserId(Long userId);

    Optional<List<Challenge>> findAllByCategoryIgnoreCase(String category);

    Optional<List<Challenge>> findAllByDifficulty(Difficulty difficulty);

    Optional<List<Challenge>> findAllByCategoryIgnoreCaseAndDifficulty(String category, Difficulty difficulty);

    Optional<List<Challenge>> findAllByTitleContainingIgnoreCase(String title);
    List<Challenge> findTop10ByOrderByCreatedAtDesc();

    List<Challenge> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
