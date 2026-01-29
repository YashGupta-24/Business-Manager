package com.business.manager.repository;

import com.business.manager.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {

    // Find all "Pending" orders for your dashboard
    List<Order> findByStatus(String status);

    // To get the last order ID (for auto-increment logic later)
    Order findTopByOrderByReadableOrderIdDesc();
}