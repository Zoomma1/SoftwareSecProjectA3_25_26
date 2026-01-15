package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.Challenge;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.ChallengeRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.ChallengeDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.ChallengeUploadRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpUnauthorizedException;
import com.spring.SoftwareSecProjectA3_25_26_back.mapper.ChallengeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class ChallengeService {

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Retourne les derniers challenges (tous users confondus).
     */
    @Transactional(readOnly = true)
    public List<ChallengeDto> getLatest() {
        return challengeRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    /**
     * Retourne les derniers challenges d'un user.
     */
    @Transactional(readOnly = true)
    public List<ChallengeDto> getLatestByUserId(Long userId) {
        if (userId == null) {
            throw new HttpBadRequestException("userId is required");
        }
        return challengeRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    /**
     * Liste les challenges d'un user.
     */
    @Transactional(readOnly = true)
    public List<ChallengeDto> findAllByUserId(Long userId) {
        if (userId == null) {
            throw new HttpBadRequestException("userId is required");
        }
        return challengeRepository.findAllByUserId(userId)
                .orElse(Collections.emptyList())
                .stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChallengeDto> findAllByCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new HttpBadRequestException("category is required");
        }
        return challengeRepository.findAllByCategoryIgnoreCase(category)
                .orElse(Collections.emptyList())
                .stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChallengeDto getById(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .map(ChallengeMapper.INSTANCE::toDto)
                .orElseThrow(() -> new HttpBadRequestException("Challenge not found"));
    }

    @Transactional(readOnly = true)
    public List<ChallengeDto> findAllByDifficulty(Difficulty difficulty) {
        if (difficulty == null) {
            throw new HttpBadRequestException("difficulty is required");
        }
        return challengeRepository.findAllByDifficulty(difficulty)
                .orElse(Collections.emptyList())
                .stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChallengeDto> findAllByCategoryAndDifficulty(String category, Difficulty difficulty) {
        if (category == null || category.isBlank()) {
            throw new HttpBadRequestException("category is required");
        }
        if (difficulty == null) {
            throw new HttpBadRequestException("difficulty is required");
        }
        return challengeRepository.findAllByCategoryIgnoreCaseAndDifficulty(category, difficulty)
                .orElse(Collections.emptyList())
                .stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChallengeDto> searchByTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new HttpBadRequestException("title is required");
        }
        return challengeRepository.findAllByTitleContainingIgnoreCase(title)
                .orElse(Collections.emptyList())
                .stream()
                .map(ChallengeMapper.INSTANCE::toDto)
                .toList();
    }

    /**
     * Crée un challenge pour l'utilisateur connecté.
     */
    public ChallengeDto createForLoggedUser(ChallengeDto dto) {
        Long loggedId = securityService.getLoggedId();
        if (loggedId == null) {
            throw new HttpUnauthorizedException("Authentication required");
        }
        validateChallengeDto(dto);

        User user = userRepository.findById(loggedId)
                .orElseThrow(() -> new HttpBadRequestException("Unknown user"));

        Challenge challenge = ChallengeMapper.INSTANCE.toEntity(dto);
        // la migration impose NOT NULL sur user_id
        challenge.setUserId(user.getId());

        Challenge saved = challengeRepository.save(challenge);
        return ChallengeMapper.INSTANCE.toDto(saved);
    }

    /**
     * Crée un challenge avec upload de fichiers pour l'utilisateur connecté.
     * Supporte soit un fichier ZIP unique, soit plusieurs fichiers (automatiquement zippés).
     */
    public ChallengeDto createWithFiles(ChallengeUploadRequestDto uploadDto) {
        Long loggedId = securityService.getLoggedId();
        if (loggedId == null) {
            throw new HttpUnauthorizedException("Authentication required");
        }

        validateChallengeUploadDto(uploadDto);

        User user = userRepository.findById(loggedId)
                .orElseThrow(() -> new HttpBadRequestException("Unknown user"));

        // Upload files and get S3 URL
        String s3Url = fileUploadService.handleChallengeFileUpload(
                uploadDto.getMultipleFiles()
        );

        // Create Challenge entity
        Challenge challenge = new Challenge();
        challenge.setUserId(user.getId());
        challenge.setTitle(uploadDto.getTitle());
        challenge.setDescription(uploadDto.getDescription());
        challenge.setSolution(uploadDto.getSolution());
        challenge.setCategory(uploadDto.getCategory());
        challenge.setDifficulty(uploadDto.getDifficulty() != null ? uploadDto.getDifficulty() : Difficulty.MEDIUM);
        challenge.setAttachmentUrl(s3Url);

        Challenge saved = challengeRepository.save(challenge);
        return ChallengeMapper.INSTANCE.toDto(saved);
    }

    /**
     * Met à jour un challenge (seul le propriétaire ou un admin/super-admin).
     */
    public ChallengeDto update(Long challengeId, ChallengeDto dto) {
        if (challengeId == null) {
            throw new HttpBadRequestException("challengeId is required");
        }
        validateChallengeDto(dto);

        Challenge existing = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new HttpBadRequestException("Challenge not found"));

        Long ownerId = existing.getUserId() != null ? existing.getUserId() : null;
        if (ownerId == null || !securityService.validUSERPerformAction(ownerId.toString())) {
            throw new HttpUnauthorizedException("Not allowed");
        }

        // On ne remplace pas l'entité (sinon perte du user/id/timestamps). On copie seulement les champs modifiables.
        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setSolution(dto.getSolution());
        existing.setAttachmentUrl(dto.getAttachmentUrl());
        existing.setCategory(dto.getCategory());
        existing.setDifficulty(dto.getDifficulty());

        Challenge saved = challengeRepository.save(existing);
        return ChallengeMapper.INSTANCE.toDto(saved);
    }

    public void delete(Long challengeId) {
        if (challengeId == null) {
            throw new HttpBadRequestException("challengeId is required");
        }

        Challenge existing = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new HttpBadRequestException("Challenge not found"));

        Long ownerId = existing.getUserId() != null ? existing.getUserId() : null;
        if (ownerId == null || !securityService.validUSERPerformAction(ownerId.toString())) {
            throw new HttpUnauthorizedException("Not allowed");
        }

        challengeRepository.delete(existing);
    }

    /**
     * Soumission d'une réponse: compare à la solution stockée en base.
     * Si correct, le challenge est considéré comme complété et on crédite des points au user connecté.
     *
     * @return true si la réponse est correcte, false sinon
     */
    public boolean submitAnswerAndComplete(Long challengeId, String submittedAnswer) {
        if (challengeId == null) {
            throw new HttpBadRequestException("challengeId is required");
        }
        if (submittedAnswer == null) {
            throw new HttpBadRequestException("answer is required");
        }

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new HttpBadRequestException("Challenge not found"));

        String expected = normalizeAnswer(challenge.getSolution());
        String actual = normalizeAnswer(submittedAnswer);

        // Si pas de solution en base, on ne peut pas valider.
        if (expected == null || expected.isEmpty()) {
            throw new HttpBadRequestException("Challenge has no solution configured");
        }

        if (!expected.equals(actual)) {
            return false;
        }

        // Correct => on crédite le user connecté et on marque le challenge comme complété.
        completeChallenge(challenge);
        return true;
    }

    /**
     * Crédite des points au user connecté pour un challenge donné (utilisée quand la réponse est correcte).
     * Ajoute aussi l'id du challenge à la collection completedChallenges de l'utilisateur et sauvegarde.
     */
    private void completeChallenge(Challenge challenge) {
        Long loggedId = securityService.getLoggedId();
        if (loggedId == null) {
            throw new HttpUnauthorizedException("Authentication required");
        }

        User user = userRepository.findById(loggedId)
                .orElseThrow(() -> new HttpBadRequestException("Unknown user"));

        int pointsToAdd = pointsForDifficulty(challenge.getDifficulty());
        user.setTotalChallengePoints(user.getTotalChallengePoints() + pointsToAdd);

        // Mark challenge as completed for the user (ensure set exists and persist if changed)
        if (challenge.getId() != null) {
            // add id to completedChallenges set (no-op if already present)
            user.getCompletedChallenges().add(challenge.getId());
            // persist changes (points and completed challenges)
            userRepository.save(user);
        } else {
            // Challenge id should normally be present; persist points regardless
            userRepository.save(user);
        }
    }

    // Normalize answer: trim, lowercase, collapse whitespace
    private String normalizeAnswer(String s) {
        if (s == null) return null;
        // Lowercase, trim, replace multiple whitespace with single space
        return s.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    // Convert difficulty to points
    private int pointsForDifficulty(Difficulty difficulty) {
        if (difficulty == null) return 10; // default
        return switch (difficulty) {
            case VERY_EASY -> 20;
            case EASY -> 40;
            case MEDIUM -> 60;
            case HARD -> 80;
            case VERY_HARD -> 100;
        };
    }

    // Basic DTO validation for challenge creation/update
    private void validateChallengeDto(ChallengeDto dto) {
        if (dto == null) throw new HttpBadRequestException("Challenge data is required");
        if (dto.getTitle() == null || dto.getTitle().isBlank()) throw new HttpBadRequestException("title is required");
        if (dto.getDescription() == null || dto.getDescription().isBlank()) throw new HttpBadRequestException("description is required");
        // solution may be optional depending on business rules, keep permissive
    }

    // Basic validation for upload DTO
    private void validateChallengeUploadDto(ChallengeUploadRequestDto dto) {
        if (dto == null) throw new HttpBadRequestException("Upload data is required");
        if (dto.getTitle() == null || dto.getTitle().isBlank()) throw new HttpBadRequestException("title is required");
        // either zipFile or multipleFiles should be provided
        if (dto.getMultipleFiles() == null || dto.getMultipleFiles().isEmpty()) {
            throw new HttpBadRequestException("Either zipFile or multipleFiles must be provided");
        }
    }

    // ... other helper methods if present ...
}
