
package com.pasindu.ecommerce_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    public FileStorageService(
            @Value("${app.upload.dir:uploads/products}")
            String uploadDir) {

        this.uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create image upload directory", e);
        }
    }

    public String saveImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        if (file.getSize() > 5L * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed.");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null && originalName.lastIndexOf('.') >= 0) {
            extension = originalName.substring(
                    originalName.lastIndexOf('.')).toLowerCase();
        }

        String filename = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(filename).normalize();

        if (!destination.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid filename.");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Could not save image.", e);
        }
    }
}
