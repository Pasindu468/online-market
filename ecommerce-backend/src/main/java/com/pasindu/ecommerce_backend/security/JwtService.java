package com.pasindu.ecommerce_backend.security;

import com.pasindu.ecommerce_backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final long EXPIRATION_TIME =
            1000 * 60 * 60; // 1 hour

    private final SecretKey signingKey;

    public JwtService(@Value("${app.jwt.secret}") String secret) {
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes long.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    private SecretKey getSigningKey() {
        return signingKey;
    }


    // =========================================================
    // GENERATE JWT TOKEN
    // =========================================================

    public String generateToken(User user) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + EXPIRATION_TIME
        );

        return Jwts.builder()

                // User email
                .subject(user.getEmail())

                // User role
                .claim("role", user.getRole())

                // Issued time
                .issuedAt(now)

                // Expiration time
                .expiration(expiration)

                // Sign token
                .signWith(getSigningKey())

                .compact();
    }


    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(String token) {

        return Jwts.parser()

                .verifyWith(getSigningKey())

                .build()

                .parseSignedClaims(token)

                .getPayload()

                .getSubject();
    }


    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(String token) {

        Claims claims =
                Jwts.parser()

                        .verifyWith(getSigningKey())

                        .build()

                        .parseSignedClaims(token)

                        .getPayload();

        return claims.get("role", String.class);
    }
}