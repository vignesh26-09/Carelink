package com.learning.carelink.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.Instant;
import java.time.Duration;
import java.net.URI;
import java.net.http.*;
import java.util.Map;
import java.util.List;
import java.io.IOException;

@Service @RequiredArgsConstructor @Slf4j
public class AccountMailService {
    private final ObjectMapper json;
    @Value("${carelink.mail.enabled:false}") private boolean enabled;
    @Value("${carelink.mail.from:}") private String from;
    @Value("${carelink.mail.api-key:}") private String apiKey;
    protected HttpClient createClient() {
        return HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }
    public String notifyAccount(String email, String role, boolean welcome) {
        if (!enabled || from.isBlank() || apiKey.isBlank()) return "NOT_CONFIGURED";
        if (List.of("cardiologist@carelink.com", "dermatologist@carelink.com", "physician@carelink.com", "admin@carelink.com").contains(email)
                || email.endsWith(".test")) return "DEVELOPMENT_ACCOUNT";
        String message = (welcome ? "Your CareLink account has been created successfully." : "Your CareLink account was signed in successfully.")
                + "\n\nAccount: " + email + "\nRole: " + role + "\nTime (UTC): " + Instant.now()
                + "\n\nOpen CareLink to view your appointments and care team."
                + "\nIf you did not perform this action, contact your clinic administrator."
                + "\n\nCareLink will never ask you to send your password by email.";
        try (HttpClient client = createClient()) {
            HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofSeconds(10)).header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of(
                    "from", from, "to", List.of(email),
                    "subject", welcome ? "Welcome to CareLink" : "New sign-in to your CareLink account", "text", message))))
                .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300 ? "ACCEPTED" : "FAILED";
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return "FAILED";
        } catch (IOException | java.io.UncheckedIOException ex) {
            log.warn("Account notification could not reach the email provider.");
            return "FAILED";
        }
    }
}
