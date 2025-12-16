package com.spring.SoftwareSecProjectA3_25_26_back.config.jwt;

import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.*;
import java.util.stream.Collectors;

public class JwtAuthenticationToken implements Authentication {

  private final TokenPayload tokenPayload;
  private final List<GrantedAuthority> authorities;
  private final Map<String, Claim> claims;
  private boolean isAuthenticated;

  public JwtAuthenticationToken(DecodedJWT jwt, List<GrantedAuthority> authorities) {
    this.tokenPayload = new TokenPayload();
    this.tokenPayload.setId(jwt.getClaim("id").asLong());
    this.tokenPayload.setRole(jwt.getClaim("role").asString());

    List<GrantedAuthority> tmp = getUserRoles(this.tokenPayload.getRole())
            .stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

    this.authorities = Collections.unmodifiableList(tmp);
    this.claims = jwt.getClaims();
    this.isAuthenticated = false;
  }

  private List<String> getUserRoles(String role) {
    Role roleEnum = Role.valueOf(role);
    var roles = Arrays.asList(Role.values());
    return roles.subList(0, roles.indexOf(roleEnum) + 1)
            .stream()
            .map(Enum::toString)
            .collect(Collectors.toList());
  }

  @Override
  public List<GrantedAuthority> getAuthorities() {
    return authorities;
  }

  @Override
  public Object getCredentials() {
    return "";
  }

  @Override
  public Object getDetails() {
    return claims;
  }

  @Override
  public Object getPrincipal() {
    return tokenPayload;
  }

  @Override
  public boolean isAuthenticated() {
    return isAuthenticated;
  }

  @Override
  public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
    this.isAuthenticated = isAuthenticated;
  }

  @Override
  public String getName() {
    return "User-" + tokenPayload.getId(); // optionnel mais utile
  }
}
