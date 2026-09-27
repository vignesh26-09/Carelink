package com.learning.carelink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.net.http.*;
import java.io.IOException;
import org.mockito.ArgumentCaptor;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AccountMailServiceTest {
    AccountMailService configured() {
        AccountMailService service = spy(new AccountMailService(new ObjectMapper()));
        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "from", "CareLink <sender@example.com>");
        ReflectionTestUtils.setField(service, "apiKey", "fake-unit-test-key");
        return service;
    }
    @Test void missingConfigurationDoesNotClaimDelivery() {
        AccountMailService service = configured();
        ReflectionTestUtils.setField(service, "apiKey", "");
        assertThat(service.notifyAccount("recipient@example.com", "PATIENT", true)).isEqualTo("NOT_CONFIGURED");
        verify(service, never()).createClient();
    }
    @Test void developmentAccountsNeverSendExternalMail() {
        AccountMailService service = configured();
        assertThat(service.notifyAccount("admin@carelink.com", "CLINIC_ADMIN", false)).isEqualTo("DEVELOPMENT_ACCOUNT");
        assertThat(service.notifyAccount("browser@carelink.test", "PATIENT", true)).isEqualTo("DEVELOPMENT_ACCOUNT");
        verify(service, never()).createClient();
    }
    @Test @SuppressWarnings("unchecked")
    void successfulProviderResponseMeansAcceptedNotDelivered() throws Exception {
        AccountMailService service = configured();
        HttpClient client = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        doReturn(client).when(service).createClient();
        when(response.statusCode()).thenReturn(200);
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        assertThat(service.notifyAccount("recipient@example.com", "PATIENT", false)).isEqualTo("ACCEPTED");
        ArgumentCaptor<HttpRequest> request = ArgumentCaptor.forClass(HttpRequest.class);
        verify(client).send(request.capture(), any(HttpResponse.BodyHandler.class));
        assertThat(request.getValue().uri().toString()).isEqualTo("https://api.resend.com/emails");
        assertThat(request.getValue().method()).isEqualTo("POST");
        assertThat(request.getValue().timeout()).contains(java.time.Duration.ofSeconds(10));
    }
    @Test @SuppressWarnings("unchecked")
    void providerRejectionDoesNotClaimSuccess() throws Exception {
        AccountMailService service = configured();
        HttpClient client = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        doReturn(client).when(service).createClient();
        when(response.statusCode()).thenReturn(403);
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        assertThat(service.notifyAccount("recipient@example.com", "PATIENT", false)).isEqualTo("FAILED");
    }
    @Test void networkFailureDoesNotBreakAccountLogin() throws Exception {
        AccountMailService service = configured();
        HttpClient client = mock(HttpClient.class);
        doReturn(client).when(service).createClient();
        when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenThrow(new IOException("Offline"));
        assertThat(service.notifyAccount("recipient@example.com", "PATIENT", false)).isEqualTo("FAILED");
    }
}
