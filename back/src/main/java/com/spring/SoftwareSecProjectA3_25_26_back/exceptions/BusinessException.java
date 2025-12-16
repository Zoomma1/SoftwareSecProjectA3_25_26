package com.spring.SoftwareSecProjectA3_25_26_back.exceptions;

import lombok.Data;

@Data
public class BusinessException extends RuntimeException {
    public BusinessException() {
    }

    public BusinessException(String message) {
        super(message);
    }
}
