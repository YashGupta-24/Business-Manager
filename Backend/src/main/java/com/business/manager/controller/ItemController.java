package com.business.manager.controller;

import com.business.manager.model.Item;
import com.business.manager.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // 1. Get All Items (Filtered by Business)
    @GetMapping("/all")
    public List<Item> getAllItems(@RequestHeader("X-Business-Id") String businessId) {
        return itemService.getAllItems(businessId);
    }

    // 2. Add New Item (Stamped with Business ID)
    @PostMapping("/add")
    public Item addItem(@RequestBody Item item, @RequestHeader("X-Business-Id") String businessId) {
        return itemService.addItem(item, businessId);
    }

    // 3. Restock Bulk Item (Update Quantity)
    @PutMapping("/{id}/stock-in")
    public ResponseEntity<?> addStock(@PathVariable String id, @RequestParam Double quantity) {
        try {
            Item updatedItem = itemService.addStock(id, quantity);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Delete Item
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.ok("Item deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}