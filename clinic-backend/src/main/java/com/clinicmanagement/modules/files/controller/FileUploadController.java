package com.clinicmanagement.modules.files.controller;
import com.clinicmanagement.shared.exception.AppException;
import com.clinicmanagement.shared.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@RestController @RequestMapping("/files")
public class FileUploadController {
    private static final Set<String> ALLOWED = Set.of(".jpg", ".jpeg", ".png", ".pdf");
    private static final Pattern SAFE_FILENAME = Pattern.compile("^[a-zA-Z0-9._-]+$");

    @Value("${file.upload-dir}") private String uploadDir;
    @Value("${file.base-url}") private String baseUrl;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw AppException.badRequest("File is empty");
        Path dir = uploadRoot();
        Files.createDirectories(dir);
        String ext = extension(file.getOriginalFilename());
        if (!ALLOWED.contains(ext)) throw AppException.badRequest("File type not allowed. Use PDF, JPG, or PNG.");
        String stored = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
        String url = baseUrl + "/files/" + stored;
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url, "filename", stored)));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> download(@PathVariable String filename) throws IOException {
        if (!SAFE_FILENAME.matcher(filename).matches()) return ResponseEntity.badRequest().build();
        Path file = resolveStoredFile(filename);
        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        String contentType = Files.probeContentType(file);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .body(resource);
    }

    private Path uploadRoot() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private Path resolveStoredFile(String filename) {
        Path base = uploadRoot();
        Path resolved = base.resolve(filename).normalize();
        if (!resolved.startsWith(base)) throw AppException.forbidden("Invalid file path");
        return resolved;
    }

    private static String extension(String original) {
        if (original == null || !original.contains(".")) return "";
        return original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT);
    }
}
