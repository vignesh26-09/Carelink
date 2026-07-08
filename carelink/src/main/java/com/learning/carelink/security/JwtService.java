package com.learning.carelink.security; // Ensured package matches checklist

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Exact field name injected via @Value as required by your checklist
    @Value("${carelink.jwt.secret}")
    private String secretKey;

    // A private field to safely hold the compiled cryptographic key in memory
    private SecretKey parsedSecretKey;

    private static final long JWT_EXPIRATION = 1000L * 60 * 60 * 24; // 24 hours

    // Initializes the key safely ONCE at startup using native Java 17 Hex handling
    @PostConstruct
    public void init() {
        byte[] keyBytes = java.util.HexFormat.of().parseHex(secretKey.trim());
        this.parsedSecretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // Exact method signature requirement 1: accepts UserDetails, returns String
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims) 
                .subject(userDetails.getUsername()) 
                .issuedAt(new Date(System.currentTimeMillis())) 
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION)) 
                .signWith(parsedSecretKey) // Uses the cached key optimized at startup
                .compact(); 
    }

    // Exact method signature requirement 3: parses JWT subject and returns email String
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Exact method signature requirement 2: accepts String and UserDetails, returns boolean
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(parsedSecretKey) // Verifies signatures smoothly using cached key
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}