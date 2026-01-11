package com.spring.SoftwareSecProjectA3_25_26_back.service;

import com.spring.SoftwareSecProjectA3_25_26_back.exceptions.http.HttpBadRequestException;
import com.spring.SoftwareSecProjectA3_25_26_back.utils.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
//HM
@Service
public class FileUploadService {

    private final S3Service s3Service;

    public FileUploadService(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    /**
     * Handles file upload for challenges.
     * Can either:
     * 1. Upload a single ZIP file directly
     * 2. Zip multiple files and upload the result
     */
    public String handleChallengeFileUpload(MultipartFile zipFile, List<MultipartFile> multipleFiles) {
        if ((zipFile == null || zipFile.isEmpty()) && (multipleFiles == null || multipleFiles.isEmpty())) {
            throw new HttpBadRequestException("Either a ZIP file or multiple files must be provided");
        }

        if (zipFile != null && !zipFile.isEmpty()) {
            // Single ZIP file upload
            return handleSingleZipUpload(zipFile);
        } else {
            // Multiple files: create ZIP and upload
            return handleMultipleFilesUpload(multipleFiles);
        }
    }

    /**
     * Handle single ZIP file upload with validation
     */
    private String handleSingleZipUpload(MultipartFile zipFile) {
        validateZipFile(zipFile);

        try {
            return s3Service.upload(zipFile, "challenges");
        } catch (IOException e) {
            throw new HttpBadRequestException("Failed to upload ZIP file: " + e.getMessage());
        }
    }

    /**
     * Handle multiple files: create ZIP, then upload
     */
    private String handleMultipleFilesUpload(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new HttpBadRequestException("At least one file must be provided");
        }

        // Validate each file
        long totalSize = 0;
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new HttpBadRequestException("Empty files are not allowed");
            }
            validateUploadFile(file);
            totalSize += file.getSize();
        }

        // Validate total size
        FileUtils.validateTotalSize(totalSize);

        // Create ZIP file
        Path tempZipFile = null;
        try {
            tempZipFile = Files.createTempFile("challenge_", ".zip");
            zipFiles(files, tempZipFile);

            // Convert to MultipartFile and upload
            MultipartFile zippedFile = convertPathToMultipartFile(tempZipFile, "challenges.zip");
            return s3Service.upload(zippedFile, "challenges");
        } catch (IOException e) {
            throw new HttpBadRequestException("Failed to create or upload ZIP file: " + e.getMessage());
        } finally {
            // Cleanup temp file
            if (tempZipFile != null) {
                try {
                    Files.deleteIfExists(tempZipFile);
                } catch (IOException e) {
                    System.err.println("Failed to delete temp ZIP file: " + e.getMessage());
                }
            }
        }
    }

    /**
     * Validate a ZIP file
     */
    private void validateZipFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new HttpBadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (!FileUtils.isZipFile(contentType)) {
            throw new HttpBadRequestException("File must be a ZIP archive. Got: " + contentType);
        }

        FileUtils.validateFileSize(file.getSize(), true);
    }

    /**
     * Validate an upload file (non-ZIP)
     */
    private void validateUploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new HttpBadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (!FileUtils.isAllowedMimeType(contentType)) {
            throw new HttpBadRequestException("File type not allowed: " + contentType);
        }

        FileUtils.validateFileSize(file.getSize(), false);
    }

    /**
     * Create a ZIP archive from multiple files
     */
    private void zipFiles(List<MultipartFile> files, Path zipPath) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipPath.toFile()))) {
            for (MultipartFile file : files) {
                String fileName = FileUtils.sanitizeFilename(file.getOriginalFilename());
                ZipEntry entry = new ZipEntry(fileName);
                zos.putNextEntry(entry);

                try (InputStream is = file.getInputStream()) {
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = is.read(buffer)) > 0) {
                        zos.write(buffer, 0, len);
                    }
                }
                zos.closeEntry();
            }
        }
    }

    /**
     * Convert a Path to a MultipartFile for S3 upload
     */
    private MultipartFile convertPathToMultipartFile(Path path, String filename) throws IOException {
        byte[] content = Files.readAllBytes(path);
        return new InMemoryMultipartFile(content, filename, "application/zip");
    }

    /**
     * Simple in-memory implementation of MultipartFile
     */
    private static class InMemoryMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String filename;
        private final String contentType;

        public InMemoryMultipartFile(byte[] content, String filename, String contentType) {
            this.content = content;
            this.filename = filename;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return filename;
        }

        @Override
        public String getOriginalFilename() {
            return filename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content == null ? 0 : content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            try (FileOutputStream fos = new FileOutputStream(dest)) {
                fos.write(content);
            }
        }
    }
}

