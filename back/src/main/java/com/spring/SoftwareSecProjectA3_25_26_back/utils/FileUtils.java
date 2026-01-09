package com.spring.SoftwareSecProjectA3_25_26_back.utils;

public final class FileUtils {
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
}
