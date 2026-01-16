package com.spring.SoftwareSecProjectA3_25_26_back.service;

import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
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

    /**
     * Generate a download URL for a file stored in S3.
     * For now, this returns the public S3 URL.
     * In production with private buckets, you would need to use AWS SDK Presigners.
     */
    public String generatePresignedDownloadUrl(@NotBlank String s3Key) {
        try {
            // Return the public S3 URL for the object
            return s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(s3Key)).toExternalForm();
        } catch (Exception e) {
            System.err.println("Error generating download URL: " + e.getMessage());
            throw new RuntimeException("Failed to generate download URL for file: " + s3Key, e);
        }
    }

    /**
     * Extract S3 key from a full S3 URL.
     * Handles URLs in format: https://bucket.s3.region.amazonaws.com/key or https://s3.region.amazonaws.com/bucket/key
     */
    public String extractKeyFromUrl(@NotBlank String s3Url) {
        try {
            // Validate input
            if (s3Url == null || s3Url.isBlank() || !s3Url.contains("s3") || !s3Url.contains("amazonaws")) {
                throw new RuntimeException("URL is not a valid AWS S3 URL: " + s3Url);
            }

            String url = s3Url.trim();

            // Handle virtual-hosted-style URLs: https://bucket.s3.region.amazonaws.com/key
            if (url.contains(bucketName + ".s3")) {
                int keyStart = url.indexOf(bucketName + ".s3");
                keyStart = url.indexOf("/", keyStart);
                if (keyStart == -1) {
                    throw new RuntimeException("No key found in virtual-hosted URL: " + s3Url);
                }
                keyStart++; // Skip the slash
                String key = url.substring(keyStart);
                if (key.isEmpty()) {
                    throw new RuntimeException("Empty key extracted from URL: " + s3Url);
                }
                return key;
            }

            // Handle path-style URLs: https://s3.region.amazonaws.com/bucket/key
            if (url.contains("/" + bucketName + "/")) {
                int keyStart = url.indexOf("/" + bucketName + "/");
                keyStart += bucketName.length() + 2; // Skip /bucket/
                if (keyStart >= url.length()) {
                    throw new RuntimeException("No key found in path-style URL: " + s3Url);
                }
                String key = url.substring(keyStart);
                if (key.isEmpty()) {
                    throw new RuntimeException("Empty key extracted from URL: " + s3Url);
                }
                return key;
            }

            // Fallback: if bucketName is in URL, extract everything after it
            if (url.contains(bucketName)) {
                int keyStart = url.indexOf(bucketName) + bucketName.length();
                // Skip the slash if present
                while (keyStart < url.length() && (url.charAt(keyStart) == '/' || url.charAt(keyStart) == '?')) {
                    keyStart++;
                }
                if (keyStart >= url.length()) {
                    throw new RuntimeException("No key found after bucket name: " + s3Url);
                }
                String key = url.substring(keyStart);
                // Remove query parameters if present
                if (key.contains("?")) {
                    key = key.substring(0, key.indexOf("?"));
                }
                if (key.isEmpty()) {
                    throw new RuntimeException("Empty key extracted from URL: " + s3Url);
                }
                return key;
            }

            throw new RuntimeException("Bucket name '" + bucketName + "' not found in URL: " + s3Url);
        } catch (Exception e) {
            System.err.println("Error extracting S3 key from URL: " + s3Url + " - " + e.getMessage());
            throw new RuntimeException("Invalid S3 URL format: " + s3Url, e);
        }
    }
}
