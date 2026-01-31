package com.business.manager.repository;

import com.business.manager.model.Item;
import com.business.manager.model.ItemType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ItemRepository extends MongoRepository<Item, String> {
    List<Item> findByBusinessId(String businessId); // 👈 The Filter

    List<Item> findByNameContainingIgnoreCase(String keyword);
}