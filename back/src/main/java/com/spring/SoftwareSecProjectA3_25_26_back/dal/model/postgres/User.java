package com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "app_user")
public class User {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String username;

    @Min(0)
    @Column(name = "total_challenge_points", nullable = false)
    private int totalChallengePoints;

    @ElementCollection
    @CollectionTable(name = "user_completed_challenges", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "challenge_id")
    private Set<Long> completedChallenges = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
