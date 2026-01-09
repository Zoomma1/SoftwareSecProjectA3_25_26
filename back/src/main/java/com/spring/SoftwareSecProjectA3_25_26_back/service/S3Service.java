package com.spring.SoftwareSecProjectA3_25_26_back.service;

import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.s3.bucket}")
    private String bucketName;

    private final S3Client s3Client;
    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String upload(MultipartFile file, String keyPrefix) throws IOException {
        String key = keyPrefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            System.err.println("Error uploading file to S3: " + e.getMessage());
            throw new IOException("Failed to upload file to S3", e);
        }

        return s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(key)).toExternalForm();
    }

    public void delete(@NotBlank String imageUrl) {
        String key = imageUrl.substring(imageUrl.indexOf(bucketName) + bucketName.length() + 1);
        try {
            s3Client.deleteObject(b -> b.bucket(bucketName).key(key));
        } catch (Exception e) {
            System.err.println("Error deleting file from S3: " + e.getMessage());
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }
}
