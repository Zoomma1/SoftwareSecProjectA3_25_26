package com.spring.SoftwareSecProjectA3_25_26_back.dto.request;

import lombok.Data;

@Data
public class ChallengeSubmissionRequestDto {
    /** Réponse soumise par l'utilisateur (sera comparée à Challenge.solution). */
    private String answer;
}

