package com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "challenges")
public class Challenge {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

     /** FK vers app_user(id) - NOT NULL dans la migration. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String solution;

    @NotBlank
    @Column(name="attachment_url")
    private String attachmentUrl;

    @NotBlank
    private String category;

    @NotBlank
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
