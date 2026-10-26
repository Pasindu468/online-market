package com.pasindu.ecommerce_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(
            JwtService jwtService) {

        this.jwtService = jwtService;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        // =====================================================
        // GET AUTHORIZATION HEADER
        // =====================================================

        String authorizationHeader =
                request.getHeader("Authorization");


        // No token
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =====================================================
        // EXTRACT TOKEN
        // =====================================================

        String token =
                authorizationHeader.substring(7);


        try {

            // =================================================
            // EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(token);


            // =================================================
            // EXTRACT ROLE
            // =================================================

            String role =
                    jwtService.extractRole(token);


            // =================================================
            // CREATE AUTHORITY
            // =================================================

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(
                            "ROLE_" + role
                    );


            // =================================================
            // CREATE AUTHENTICATION
            // =================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(
                                    authority
                            )
                    );


            // =================================================
            // SET SECURITY CONTEXT
            // =================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


        } catch (Exception e) {
                e.printStackTrace();

                SecurityContextHolder.clearContext();

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(
            "{\"message\":\"Invalid or expired token\"}");
                return;
        }


        // Continue request
        filterChain.doFilter(
                request,
                response
        );
    }
}