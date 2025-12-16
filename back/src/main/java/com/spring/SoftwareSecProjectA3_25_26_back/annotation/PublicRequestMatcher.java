package com.spring.SoftwareSecProjectA3_25_26_back.annotation;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.List;


@Component
public class PublicRequestMatcher implements RequestMatcher {

    private final RequestMappingHandlerMapping handlerMapping;

    @Autowired
    public PublicRequestMatcher(
            @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping handlerMapping
    ) {
        this.handlerMapping = handlerMapping;
    }

    @Override
    public boolean matches(HttpServletRequest request) {
        try {
            var handlerExecutionChain = handlerMapping.getHandler(request);
            if (handlerExecutionChain == null || !(handlerExecutionChain.getHandler() instanceof HandlerMethod handlerMethod)) {
                return false;
            }

            PublicEndpoint annotation = handlerMethod.getMethodAnnotation(PublicEndpoint.class);
            if (annotation == null) {
                annotation = handlerMethod.getBeanType().getAnnotation(PublicEndpoint.class);
            }

            if (annotation != null) {
                RequestMethod[] allowedMethods = annotation.methods();
                return allowedMethods.length == 0 || List.of(allowedMethods).contains(RequestMethod.valueOf(request.getMethod()));
            }
        } catch (Exception e) {
            return false;
        }

        return false;
    }
}