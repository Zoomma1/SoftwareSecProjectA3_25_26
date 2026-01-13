package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.User;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.postgres.repository.UserRepository;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.BusinessException;
import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JwtTokenUtil {

  private final JwtProperties jwtProperties;
  private final UserRepository userRepository;

  private final static Logger LOG = LoggerFactory.getLogger(JwtTokenUtil.class);
  private final Locale locale = Locale.FRANCE;

  private Algorithm standardAlgorithm;
  private Algorithm refreshAlgorithm;

  @PostConstruct
  private void init() {
    standardAlgorithm = Algorithm.HMAC256(jwtProperties.getSecret());
    refreshAlgorithm = Algorithm.HMAC256(jwtProperties.getRefreshSecret());
  }

  public DecodedJWT decodeToken(String token){
    try {
      JWTVerifier verifier = JWT.require(standardAlgorithm)
              .withIssuer(jwtProperties.getIssuer())
              .build();
        return verifier.verify(token);
    } catch (JWTVerificationException e) {
      LOG.error("could not decode token (" + e.getMessage() + ")");
      throw new BusinessException("Failed to decode token");
    }
  }

  public TokenSet generateTokenSet(User user) {
    TokenPayload tokenPayload = generatePayload(user);
    String token = generateToken(tokenPayload);
    String refreshToken = generateRefreshToken(tokenPayload);
    return new TokenSet(token, refreshToken);
  }

  public TokenPayload getPayload(DecodedJWT jwt) {
    // Read numeric id consistently with how we write it
    Long id = jwt.getClaim("id").asLong();
    String role = jwt.getClaim("role").asString();

    var payload = new TokenPayload();
    payload.setId(id);
    payload.setRole(role);

    return payload;
  }

  public TokenSet refreshWithToken(String token){
    try {
      DecodedJWT decodedJWT = JWT.decode(token);
      var payload = getPayload(decodedJWT);

      Long id = payload.getId();
      var user = userRepository.findById(id).orElse(null);

      if(user == null){
        throw new BusinessException("Unable to find user with this id");
      }

      JWTVerifier verifier = JWT.require(refreshAlgorithm)
              .withIssuer(jwtProperties.getIssuer())
              .build();
      verifier.verify(token);
      return generateTokenSet((User) user);
    } catch (JWTVerificationException | HttpBadRequestException e) {
      LOG.error("could not refresh token (" + e.getMessage() + ")");
    }
    throw new BusinessException("Failed to refresh token");
  }

  public TokenPayload generatePayload(User user) {
    TokenPayload tokenPayload = new TokenPayload();
    tokenPayload.setRole(user.getRole().toString());
    tokenPayload.setId(user.getId());
    return tokenPayload;
  }

  private String generateToken(TokenPayload tokenPayload) {
    Calendar calendar = Calendar.getInstance(locale);
    calendar.add(Calendar.SECOND, jwtProperties.getTokenDuration());

    return JWT.create()
            .withIssuer(jwtProperties.getIssuer())
            .withIssuedAt(Calendar.getInstance(locale).getTime())
            .withExpiresAt(calendar.getTime())
            // write id as numeric claim and role as string claim
            .withClaim("id", tokenPayload.getId())
            .withClaim("role", tokenPayload.getRole())
            .sign(standardAlgorithm);
  }

  String generateRefreshToken(TokenPayload tokenPayload) {
      Calendar calendar = Calendar.getInstance(locale);
      calendar.add(Calendar.SECOND, jwtProperties.getRefreshTokenDuration());

      String jwt = JWT.create()
              .withIssuer(jwtProperties.getIssuer())
              .withIssuedAt(Calendar.getInstance(locale).getTime())
              .withExpiresAt(calendar.getTime())
              .withClaim("id", tokenPayload.getId())
              .sign(refreshAlgorithm);
      JWTVerifier verifier = JWT.require(refreshAlgorithm)
              .withIssuer(jwtProperties.getIssuer())
              .build();
      try {
          verifier.verify(jwt);
          return jwt;
      } catch (JWTVerificationException e) {
          LOG.error("could not refresh token (" + e.getMessage() + ") token: " + jwt);
          throw new BusinessException("Failed to refresh token");
      }
  }
}
