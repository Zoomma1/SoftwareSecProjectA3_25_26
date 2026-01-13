package com.spring.SoftwareSecProjectA3_25_26_back.controller;

import com.spring.SoftwareSecProjectA3_25_26_back.annotation.PublicEndpoint;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.ChallengeDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.ChallengeSubmissionRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.request.ChallengeUploadRequestDto;
import com.spring.SoftwareSecProjectA3_25_26_back.service.ChallengeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//HM
@Tag(name = "Challenges")
@RestController
@RequestMapping("/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    /** Derniers challenges (home). */
    @GetMapping("/latest")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> latest() {
        return ResponseEntity.ok(challengeService.getLatest());
    }

    /** Derniers challenges d'un utilisateur. */
    @GetMapping("/latest/{userId}")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> latestByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(challengeService.getLatestByUserId(userId));
    }

    /** Liste des challenges d'un utilisateur. */
    @GetMapping("/user/{userId}")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(challengeService.findAllByUserId(userId));
    }

    /** Filtre par catégorie. */
    @GetMapping("/category/{category}")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(challengeService.findAllByCategory(category));
    }

    /** Filtre par difficulté. */
    @GetMapping("/difficulty/{difficulty}")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> byDifficulty(@PathVariable Difficulty difficulty) {
        return ResponseEntity.ok(challengeService.findAllByDifficulty(difficulty));
    }

    /** Filtre combiné catégorie + difficulté via query params. */
    @GetMapping("/search")
    @PublicEndpoint
    public ResponseEntity<List<ChallengeDto>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Difficulty difficulty
    ) {
        if (title != null && !title.isBlank()) {
            return ResponseEntity.ok(challengeService.searchByTitle(title));
        }
        if (category != null && !category.isBlank() && difficulty != null) {
            return ResponseEntity.ok(challengeService.findAllByCategoryAndDifficulty(category, difficulty));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(challengeService.findAllByCategory(category));
        }
        if (difficulty != null) {
            return ResponseEntity.ok(challengeService.findAllByDifficulty(difficulty));
        }
        return ResponseEntity.ok(challengeService.getLatest());
    }

    /** Création: utilisateur connecté uniquement (déduit du JWT côté service). */
    @PostMapping
    public ResponseEntity<ChallengeDto> create(@RequestBody ChallengeDto dto) {
        return ResponseEntity.ok(challengeService.createForLoggedUser(dto));
    }


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChallengeDto> createWithFiles(
            @ModelAttribute ChallengeUploadRequestDto uploadDto
    ) {
        return ResponseEntity.ok(challengeService.createWithFiles(uploadDto));
    }

    /** Mise à jour: owner ou admin/super-admin. */
    @PutMapping("/{challengeId}")
    public ResponseEntity<ChallengeDto> update(@PathVariable Long challengeId, @RequestBody ChallengeDto dto) {
        return ResponseEntity.ok(challengeService.update(challengeId, dto));
    }

    /** Suppression: owner ou admin/super-admin. */
    @DeleteMapping("/{challengeId}")
    public ResponseEntity<Void> delete(@PathVariable Long challengeId) {
        challengeService.delete(challengeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Soumet une réponse pour un challenge. Si correct, le challenge est compté comme complété et le user gagne des points.
     */
    @PostMapping("/{challengeId}/submit")
    public ResponseEntity<Boolean> submit(
            @PathVariable Long challengeId,
            @RequestBody ChallengeSubmissionRequestDto body
    ) {
        return ResponseEntity.ok(challengeService.submitAnswerAndComplete(challengeId, body.getAnswer()));
    }
}
