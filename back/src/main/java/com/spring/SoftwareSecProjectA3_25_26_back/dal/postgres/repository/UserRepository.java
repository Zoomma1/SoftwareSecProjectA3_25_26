package com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository;


import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@Hidden
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
}

