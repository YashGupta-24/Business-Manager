package com.business.manager.repository;

import com.business.manager.model.Item;
import com.business.manager.model.ItemType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ItemRepository extends MongoRepository<Item, String> {

    // Custom query to find all Bulk items (for your dashboard)
    List<Item> findByType(ItemType type);

    // Search items by name (e.g., "Rice")
    List<Item> findByNameContainingIgnoreCase(String name);
}