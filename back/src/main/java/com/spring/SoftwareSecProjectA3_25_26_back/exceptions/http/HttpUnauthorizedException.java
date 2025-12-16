package com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
public class HttpUnauthorizedException extends RuntimeException {
  public HttpUnauthorizedException(String message) {
    super(message);
  }

  public HttpUnauthorizedException(String message, Throwable cause) {
    super(message, cause);
  }
}
