package com.business.manager.service;

import com.business.manager.model.Item;
import com.business.manager.model.ItemType;
import com.business.manager.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    // 1. Add a new Item (Bulk or Packet)
    public Item addItem(Item item, String businessId) {
        log.info("Adding new item '{}' of type {} to businessId: {}", item.getName(), item.getType(), businessId);
        // Basic validation: If it's a PACKET, it MUST have a sourceId
        if (item.getType() == ItemType.PACKET && (item.getSourceId() == null || item.getWeightMultiplier() == null)) {
            log.warn("Validation failed: PACKET item '{}' is missing sourceId or weightMultiplier", item.getName());
            throw new IllegalArgumentException("Packet items must have a Source ID and Weight Multiplier!");
        }
        item.setBusinessId(businessId);
        Item saved = itemRepository.save(item);
        log.debug("Successfully created item '{}' with ID: {}", saved.getName(), saved.getId());
        return saved;
    }

    // 2. Get all items
    public List<Item> getAllItems(String businessId) {
        return itemRepository.findByBusinessId(businessId);
    }

    // 3. Search Items
    public List<Item> searchItems(String keyword) {
        return itemRepository.findByNameContainingIgnoreCase(keyword);
    }

    public void deleteItem(String id) {
        log.info("Deleting item ID: {}", id);
        if (!itemRepository.existsById(id)) {
            log.warn("Failed to delete item: Item ID {} not found", id);
            throw new RuntimeException("Item not found");
        }
        itemRepository.deleteById(id);
        log.debug("Deleted item ID: {}", id);
    }

    public Item addStock(String itemId, Double quantity) {
        log.info("Adding {} units to stock of item ID: {}", quantity, itemId);
        return itemRepository.findById(itemId)
                .map(item -> {
                    item.setStockQuantity(item.getStockQuantity() + quantity);
                    Item updated = itemRepository.save(item);
                    log.debug("Updated stock for item '{}' to {}", item.getName(), updated.getStockQuantity());
                    return updated;
                })
                .orElseThrow(() -> {
                    log.warn("Failed to add stock: Item ID {} not found", itemId);
                    return new RuntimeException("Item not found");
                });
    }
}