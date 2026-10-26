package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.User;
import com.pasindu.ecommerce_backend.repository.UserRepository;
import com.pasindu.ecommerce_backend.security.JwtService;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtService = jwtService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public Map<String, Object> register(
            @RequestBody User user) {

        // Check if email already exists
        if (userRepository
                .findByEmail(user.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        // Public registration must never grant administrative access.
        user.setRole("USER");

        // Save user
        User savedUser =
                userRepository.save(user);

        // Response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                savedUser.getId()
        );

        response.put(
                "name",
                savedUser.getName()
        );

        response.put(
                "email",
                savedUser.getEmail()
        );

        response.put(
                "role",
                savedUser.getRole()
        );

        response.put(
                "message",
                "Registration successful"
        );

        return response;
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody User loginRequest) {

        // Find user by email
        User user =
                userRepository
                        .findByEmail(
                                loginRequest.getEmail()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"
                                )
                        );


        // Check password
        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        // =====================================================
        // GENERATE JWT WITH EMAIL + ROLE
        // =====================================================

        String token =
                jwtService.generateToken(user);


        // =====================================================
        // LOGIN RESPONSE
        // =====================================================

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                user.getId()
        );

        response.put(
                "name",
                user.getName()
        );

        response.put(
                "email",
                user.getEmail()
        );

        response.put(
                "role",
                user.getRole()
        );

        response.put(
                "token",
                token
        );

        response.put(
                "message",
                "Login successful"
        );

        return response;
    }
}