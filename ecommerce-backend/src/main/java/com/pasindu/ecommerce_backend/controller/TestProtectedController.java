package com.pasindu.ecommerce_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestProtectedController {

    @GetMapping("/api/test-protected")
    public String testProtected() {

        return "JWT authentication is working!";
    }
}