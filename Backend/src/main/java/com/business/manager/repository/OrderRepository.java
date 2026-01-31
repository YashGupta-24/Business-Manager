package com.business.manager.repository;

import com.business.manager.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByBusinessId(String businessId); // 👈 The Filter

    Order findTopByOrderByReadableOrderIdDesc();
}