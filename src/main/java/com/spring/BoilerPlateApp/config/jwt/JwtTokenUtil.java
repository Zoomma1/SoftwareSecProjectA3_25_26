package com.spring.BoilerPlateApp.config.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.spring.BoilerPlateApp.dal.model.postgres.User;
import com.spring.BoilerPlateApp.dal.postgres.repository.UserRepository;
import com.spring.BoilerPlateApp.exceptions.BusinessException;
import com.spring.BoilerPlateApp.exceptions.http.HttpBadRequestException;
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
    Long id = Long.parseLong(jwt.getClaim("id").asString());
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
      return generateTokenSet(user);
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
    Map<String, String> payload = new HashMap<>();
    payload.put("id", tokenPayload.getId().toString());
    payload.put("role", tokenPayload.getRole());

    return JWT.create()
            .withIssuer(jwtProperties.getIssuer())
            .withIssuedAt(Calendar.getInstance(locale).getTime())
            .withExpiresAt(calendar.getTime())
            .withPayload(payload)
            .sign(standardAlgorithm);
  }

  String generateRefreshToken(TokenPayload tokenPayload) {
      Calendar calendar = Calendar.getInstance(locale);
      calendar.add(Calendar.SECOND, jwtProperties.getRefreshTokenDuration());
      Map<String, String> payload = new HashMap<>();
      payload.put("id", tokenPayload.getId().toString());

      String jwt = JWT.create()
              .withIssuer(jwtProperties.getIssuer())
              .withIssuedAt(Calendar.getInstance(locale).getTime())
              .withExpiresAt(calendar.getTime())
              .withPayload(payload)
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
