package com.business.manager.service;

import com.business.manager.model.Item;
import com.business.manager.model.ItemType;
import com.business.manager.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    // 1. Add a new Item (Bulk or Packet)
    public Item addItem(Item item, String businessId) {
        // Basic validation: If it's a PACKET, it MUST have a sourceId
        if (item.getType() == ItemType.PACKET && (item.getSourceId() == null || item.getWeightMultiplier() == null)) {
            throw new IllegalArgumentException("Packet items must have a Source ID and Weight Multiplier!");
        }
        item.setBusinessId(businessId);
        return itemRepository.save(item);
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
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }
        itemRepository.deleteById(id);
    }

    public Item addStock(String itemId, Double quantity) {
        return itemRepository.findById(itemId)
                .map(item -> {
                    item.setStockQuantity(item.getStockQuantity() + quantity);
                    return itemRepository.save(item);
                })
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }
}