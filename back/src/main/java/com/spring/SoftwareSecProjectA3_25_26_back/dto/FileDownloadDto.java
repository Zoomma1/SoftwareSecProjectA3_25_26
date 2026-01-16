package com.spring.SoftwareSecProjectA3_25_26_back.dto;

import java.io.InputStream;

/**
 * DTO to hold file download information including the stream and metadata.
 */
public class FileDownloadDto {
    private InputStream inputStream;
    private String contentType;
    private String fileName;
    private Long contentLength;

    public FileDownloadDto() {
    }

    public FileDownloadDto(InputStream inputStream, String contentType, String fileName, Long contentLength) {
        this.inputStream = inputStream;
        this.contentType = contentType;
        this.fileName = fileName;
        this.contentLength = contentLength;
    }

    public InputStream getInputStream() {
        return inputStream;
    }

    public void setInputStream(InputStream inputStream) {
        this.inputStream = inputStream;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getContentLength() {
        return contentLength;
    }

    public void setContentLength(Long contentLength) {
        this.contentLength = contentLength;
    }
}

