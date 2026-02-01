package com.business.manager.service;

import com.business.manager.model.Business;
import com.business.manager.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 👈 Import
import org.springframework.security.crypto.password.PasswordEncoder; // 👈 Import
import org.springframework.stereotype.Service;

@Service
public class BusinessService {

    @Autowired
    private BusinessRepository businessRepository;

    // Create the tool that handles encryption
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Business registerBusiness(Business business) {
        if (businessRepository.findByBusinessName(business.getBusinessName()).isPresent()) {
            throw new RuntimeException("Business Name already exists! Please choose another.");
        }

        // 🔒 ENCRYPT PASSWORD BEFORE SAVING
        business.setPassword(passwordEncoder.encode(business.getPassword()));

        return businessRepository.save(business);
    }

    public Business authenticate(String businessName, String rawPassword) {
        Business business = businessRepository.findByBusinessName(businessName)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        // 🔒 COMPARE RAW PASSWORD WITH ENCRYPTED HASH
        if (!passwordEncoder.matches(rawPassword, business.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return business;
    }
}