package com.learning.carelink.config;

import org.springframework.http.HttpMethod;
import com.learning.carelink.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Exact required annotations applied
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Deactivates CSRF safely for token-based APIs
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Binds CORS bean
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // PUBLIC SPLIT
                        .requestMatchers(HttpMethod.GET, "/api/doctors").permitAll() // Added leading slash
                        .requestMatchers(HttpMethod.GET, "/api/schedule/slots/**").permitAll() // Added leading slash
                        .requestMatchers("/api/**").authenticated() // PROTECTED SPLIT
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // STATELESS CONFIG
                )
                // Places your custom extraction filter ahead of standard form processing
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() { // Checked explicitly by runtime string name
        CorsConfiguration configuration = new CorsConfiguration();

        // Apply exact allowed whitelist mappings
        configuration
                .setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5174", "http://localhost:5500",
                        "http://127.0.0.1:5500"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}