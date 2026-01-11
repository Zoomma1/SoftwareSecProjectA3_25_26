package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.Challenge;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.ChallengeRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.ChallengeDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.ChallengeUploadRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.response.UserResponseDto;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpUnauthorizedException;
import com.spring.SoftwareSecProjectA3_25_26_back.mapper.ChallengeMapper;
import com.spring.SoftwareSecProjectA3_25_26_back.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
//HM
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
        return challengeRepository.findTop10ByUser_IdOrderByCreatedAtDesc(userId).stream()
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
        return challengeRepository.findAllByUser_Id(userId)
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
        challenge.setUser(user);

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
                uploadDto.getZipFile(),
                uploadDto.getMultipleFiles()
        );

        // Create Challenge entity
        Challenge challenge = new Challenge();
        challenge.setUser(user);
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

        Long ownerId = existing.getUser() != null ? existing.getUser().getId() : null;
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

        Long ownerId = existing.getUser() != null ? existing.getUser().getId() : null;
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

        // Correct => on crédite le user connecté.
        completeChallenge(challenge);
        return true;
    }

    /**
     * Crédite des points au user connecté pour un challenge donné (utilisée quand la réponse est correcte).
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

        userRepository.save(user);
    }

    private String normalizeAnswer(String s) {
        if (s == null) return null;
        // Normalisation simple: trim + collapse whitespace + lowercase
        return s.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private int pointsForDifficulty(Difficulty difficulty) {
        if (difficulty == null) return 0;
        return switch (difficulty) {
            case EASY -> 10;
            case MEDIUM -> 25;
            case HARD -> 50;
        };
    }

    private void validateChallengeDto(ChallengeDto dto) {
        if (dto == null) {
            throw new HttpBadRequestException("challenge is required");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new HttpBadRequestException("title is required");
        }

        // Normalisation légère
        dto.setTitle(dto.getTitle().trim());
        dto.setDescription(trimToNull(dto.getDescription()));
        dto.setSolution(trimToNull(dto.getSolution()));
        dto.setAttachmentUrl(trimToNull(dto.getAttachmentUrl()));
        dto.setCategory(trimToNull(dto.getCategory()));
    }

    private String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * Valide le DTO d'upload de challenge
     */
    private void validateChallengeUploadDto(ChallengeUploadRequestDto dto) {
        if (dto == null) {
            throw new HttpBadRequestException("Upload request is required");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new HttpBadRequestException("Title is required");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new HttpBadRequestException("Description is required");
        }
        if (dto.getSolution() == null || dto.getSolution().isBlank()) {
            throw new HttpBadRequestException("Solution is required");
        }
        if (dto.getCategory() == null || dto.getCategory().isBlank()) {
            throw new HttpBadRequestException("Category is required");
        }

        // Verify at least one file is provided
        if ((dto.getZipFile() == null || dto.getZipFile().isEmpty()) &&
            (dto.getMultipleFiles() == null || dto.getMultipleFiles().isEmpty())) {
            throw new HttpBadRequestException("Either a ZIP file or multiple files must be provided");
        }
    }
}
