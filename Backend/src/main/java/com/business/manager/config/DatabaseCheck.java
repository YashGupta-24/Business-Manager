package com.business.manager.config;

import com.business.manager.model.Item;
import com.business.manager.model.ItemType;
import com.business.manager.repository.ItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class DatabaseCheck {

    @Bean
    CommandLineRunner checkConnection(ItemRepository repository, MongoTemplate mongoTemplate) {
        return args -> {
            System.out.println("------------------------------------------------");
            // 1. Tell us the DB name
            String dbName = mongoTemplate.getDb().getName();
            System.out.println("🔎 TARGET DATABASE: " + dbName);

            // 2. Force Write (This creates the DB if missing)
            if (repository.count() == 0) {
                System.out.println("📝 DB is empty. Creating test item...");
                Item testItem = new Item();
                testItem.setName("System Check Item");
                testItem.setType(ItemType.BULK);
                testItem.setStockQuantity(0.0);
                repository.save(testItem);
                System.out.println("✅ Test Item Saved. 'retail_db' should exist now.");
            } else {
                System.out.println("✅ Database connection verified. Items found: " + repository.count());
            }
            System.out.println("------------------------------------------------");
        };
    }
}