package com.spring.SoftwareSecProjectA3_25_26_back.utils;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public final class FileUtils {

    // Whitelist MIME types for cybersecurity context
    private static final Set<String> ALLOWED_MIME_TYPES = new HashSet<>();
    private static final Pattern UNSAFE_FILENAME_PATTERN = Pattern.compile("[^a-zA-Z0-9._-]");
    private static final long MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per file
    private static final long MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500MB total
    private static final long MAX_ZIP_SIZE_BYTES = 500 * 1024 * 1024; // 500MB for single ZIP

    static {
        // Archive formats
        ALLOWED_MIME_TYPES.add("application/zip");
        ALLOWED_MIME_TYPES.add("application/x-zip-compressed");
        ALLOWED_MIME_TYPES.add("application/x-tar");
        ALLOWED_MIME_TYPES.add("application/gzip");
        ALLOWED_MIME_TYPES.add("application/x-7z-compressed");
        ALLOWED_MIME_TYPES.add("application/x-rar-compressed");

        // Text/Code files
        ALLOWED_MIME_TYPES.add("text/plain");
        ALLOWED_MIME_TYPES.add("text/x-python");
        ALLOWED_MIME_TYPES.add("text/x-c");
        ALLOWED_MIME_TYPES.add("text/x-java");

        // Binary executables
        ALLOWED_MIME_TYPES.add("application/x-msdownload");
        ALLOWED_MIME_TYPES.add("application/x-msdos-program");
        ALLOWED_MIME_TYPES.add("application/x-executable");
        ALLOWED_MIME_TYPES.add("application/x-elf");
        ALLOWED_MIME_TYPES.add("application/octet-stream");

        // Documents
        ALLOWED_MIME_TYPES.add("application/pdf");
        ALLOWED_MIME_TYPES.add("application/msword");
        ALLOWED_MIME_TYPES.add("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        ALLOWED_MIME_TYPES.add("application/vnd.ms-excel");
        ALLOWED_MIME_TYPES.add("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        ALLOWED_MIME_TYPES.add("application/vnd.ms-powerpoint");
        ALLOWED_MIME_TYPES.add("application/vnd.openxmlformats-officedocument.presentationml.presentation");

        // Images
        ALLOWED_MIME_TYPES.add("image/png");
        ALLOWED_MIME_TYPES.add("image/jpeg");
        ALLOWED_MIME_TYPES.add("image/gif");
        ALLOWED_MIME_TYPES.add("image/webp");
        ALLOWED_MIME_TYPES.add("image/bmp");

        // JSON/XML
        ALLOWED_MIME_TYPES.add("application/json");
        ALLOWED_MIME_TYPES.add("application/xml");
        ALLOWED_MIME_TYPES.add("text/xml");
    }

    public static String getExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "";
        }
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * Valide le type MIME du fichier contre la whitelist
     */
    public static boolean isAllowedMimeType(String contentType) {
        if (contentType == null || contentType.isEmpty()) {
            return false;
        }
        // Utiliser le MIME type principal (avant le point-virgule)
        String mainType = contentType.split(";")[0].trim();
        return ALLOWED_MIME_TYPES.contains(mainType);
    }

    /**
     * Vérifie si le fichier est un ZIP
     */
    public static boolean isZipFile(String contentType) {
        if (contentType == null) return false;
        String mainType = contentType.split(";")[0].trim();
        return mainType.equals("application/zip") || mainType.equals("application/x-zip-compressed");
    }

    /**
     * Valide la taille d'un fichier unique
     */
    public static void validateFileSize(long fileSize, boolean isZip) {
        long maxSize = isZip ? MAX_ZIP_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
        if (fileSize > maxSize) {
            throw new IllegalArgumentException("File exceeds maximum size of " + (maxSize / (1024 * 1024)) + "MB");
        }
    }

    /**
     * Valide la taille totale des fichiers
     */
    public static void validateTotalSize(long totalSize) {
        if (totalSize > MAX_TOTAL_SIZE_BYTES) {
            throw new IllegalArgumentException("Total file size exceeds maximum of " + (MAX_TOTAL_SIZE_BYTES / (1024 * 1024)) + "MB");
        }
    }

    /**
     * Nettoie et valide le nom de fichier pour éviter les injections
     */
    public static String sanitizeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "file";
        }
        // Supprimer les caractères non sûrs
        String sanitized = UNSAFE_FILENAME_PATTERN.matcher(originalFilename).replaceAll("_");
        // Limiter la longueur
        if (sanitized.length() > 255) {
            sanitized = sanitized.substring(0, 255);
        }
        return sanitized.isEmpty() ? "file" : sanitized;
    }
}
