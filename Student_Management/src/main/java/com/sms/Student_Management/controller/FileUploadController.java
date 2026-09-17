package com.sms.Student_Management.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/files")
public class FileUploadController {

    private static final Path UPLOAD_DIRECTORY = Path.of("uploads").toAbsolutePath().normalize();

    @PostMapping("/upload")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a file to upload");
        }

        String originalName = file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename();
        String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "-" + safeName;
        try {
            Files.createDirectories(UPLOAD_DIRECTORY);
            Files.copy(file.getInputStream(), UPLOAD_DIRECTORY.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the attachment", exception);
        }
        return Map.of("fileName", originalName, "fileUrl", "http://localhost:8080/files/download/" + storedName);
    }

    @GetMapping("/download/{storedName:.+}")
    public ResponseEntity<Resource> download(
            @org.springframework.web.bind.annotation.PathVariable String storedName,
            @RequestParam(defaultValue = "true") boolean download) {
        if (storedName.contains("/") || storedName.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }
        Path file = UPLOAD_DIRECTORY.resolve(storedName).normalize();
        if (!file.startsWith(UPLOAD_DIRECTORY) || !Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found");
        }
        Resource resource = new FileSystemResource(file);
        String downloadName = storedName.replaceFirst("^[0-9a-fA-F-]{36}-", "");
        MediaType contentType;
        try {
            String type = Files.probeContentType(file);
            contentType = type == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(type);
        } catch (IOException exception) {
            contentType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, (download
                        ? ContentDisposition.attachment()
                        : ContentDisposition.inline()).filename(downloadName).build().toString())
                .body(resource);
    }
}
