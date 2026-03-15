package com.business.manager.service;

import com.business.manager.model.Business;
import com.business.manager.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 👈 Import
import org.springframework.security.crypto.password.PasswordEncoder; // 👈 Import
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BusinessService {

    @Autowired
    private BusinessRepository businessRepository;

    // Create the tool that handles encryption
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Business registerBusiness(Business business) {
        log.info("Attempting to register new business: {}", business.getBusinessName());
        if (businessRepository.findByBusinessName(business.getBusinessName()).isPresent()) {
            log.warn("Business name '{}' already exists", business.getBusinessName());
            throw new RuntimeException("Business Name already exists! Please choose another.");
        }

        // 🔒 ENCRYPT PASSWORD BEFORE SAVING
        business.setPassword(passwordEncoder.encode(business.getPassword()));

        Business saved = businessRepository.save(business);
        log.debug("Successfully registered business: {} with ID: {}", saved.getBusinessName(), saved.getId());
        return saved;
    }

    public Business authenticate(String businessName, String rawPassword) {
        log.info("Authenticating business: {}", businessName);
        Business business = businessRepository.findByBusinessName(businessName)
                .orElseThrow(() -> {
                    log.warn("Authentication failed: Business '{}' not found", businessName);
                    return new RuntimeException("Business not found");
                });

        // 🔒 COMPARE RAW PASSWORD WITH ENCRYPTED HASH
        if (!passwordEncoder.matches(rawPassword, business.getPassword())) {
            log.warn("Authentication failed: Invalid credentials for '{}'", businessName);
            throw new RuntimeException("Invalid credentials");
        }

        log.debug("Authentication successful for '{}'", businessName);
        return business;
    }
}