package com.spring.SoftwareSecProjectA3_25_26_back.dto.request;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * HM
 * DTO for uploading challenges with files.
 * Supports either a single ZIP file OR multiple files (auto-zipped).
 */
@Data
public class ChallengeUploadRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Solution is required")
    private String solution;

    @NotBlank(message = "Category is required")
    private String category;

    private Difficulty difficulty;

    /**
     * Single ZIP file upload
     * If provided, this takes precedence over multipleFiles.
     */
    private MultipartFile zipFile;

    /**
     * Multiple files to upload
     * They will be automatically zipped before S3 upload.
     * If zipFile is also provided, this is ignored.
     */
    private List<MultipartFile> multipleFiles;
}

