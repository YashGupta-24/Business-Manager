package com.business.manager.controller;

import com.business.manager.model.Item;
import com.business.manager.service.ItemService;
import com.business.manager.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. Get All Items (Filtered by Business)
    @GetMapping("/all")
    public List<Item> getAllItems(@CookieValue("jwt") String token) {
        String businessId = jwtUtil.extractBusinessId(token);
        log.info("Fetching all items for businessId: {}", businessId);
        return itemService.getAllItems(businessId);
    }

    // 2. Add New Item (Stamped with Business ID)
    @PostMapping("/add")
    public Item addItem(@RequestBody Item item, @CookieValue("jwt") String token) {
        String businessId = jwtUtil.extractBusinessId(token);
        log.info("Adding new item '{}' for businessId: {}", item.getName(), businessId);
        return itemService.addItem(item, businessId);
    }

    // 3. Restock Bulk Item (Update Quantity)
    @PutMapping("/{id}/stock-in")
    public ResponseEntity<?> addStock(@PathVariable String id, @RequestParam Double quantity) {
        log.info("Adding stock {} to item ID: {}", quantity, id);
        try {
            Item updatedItem = itemService.addStock(id, quantity);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            log.error("Failed to add stock to item ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Delete Item
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        log.info("Attempting to delete item ID: {}", id);
        try {
            itemService.deleteItem(id);
            log.debug("Successfully deleted item ID: {}", id);
            return ResponseEntity.ok("Item deleted successfully");
        } catch (RuntimeException e) {
            log.error("Failed to delete item ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}