package com.business.manager.repository;

import com.business.manager.model.Business;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface BusinessRepository extends MongoRepository<Business, String> {
    Optional<Business> findByBusinessName(String businessName);
}