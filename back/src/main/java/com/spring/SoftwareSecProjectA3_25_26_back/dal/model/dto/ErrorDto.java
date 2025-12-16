package com.spring.SoftwareSecProjectA3_25_26_back.dal.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ErrorDto implements Serializable {

    HttpStatus status;
    String message;
}
