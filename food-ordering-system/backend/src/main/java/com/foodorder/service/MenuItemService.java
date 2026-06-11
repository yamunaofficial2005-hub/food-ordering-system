package com.foodorder.service;

import com.foodorder.model.MenuItem;
import com.foodorder.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllAvailableItems() {
        return menuItemRepository.findByAvailableTrue();
    }

    public List<MenuItem> getItemsByCategory(String category) {
        return menuItemRepository.findByCategoryAndAvailableTrue(category);
    }

    public List<MenuItem> getPopularItems() {
        return menuItemRepository.findByPopularTrue();
    }

    public List<MenuItem> searchItems(String keyword) {
        return menuItemRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Optional<MenuItem> getItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    public MenuItem createItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem updateItem(Long id, MenuItem updatedItem) {
        return menuItemRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setDescription(updatedItem.getDescription());
            item.setPrice(updatedItem.getPrice());
            item.setCategory(updatedItem.getCategory());
            item.setImageUrl(updatedItem.getImageUrl());
            item.setAvailable(updatedItem.isAvailable());
            item.setVegetarian(updatedItem.isVegetarian());
            item.setPopular(updatedItem.isPopular());
            item.setPrepTimeMinutes(updatedItem.getPrepTimeMinutes());
            return menuItemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + id));
    }

    public void deleteItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public List<String> getAllCategories() {
        return menuItemRepository.findAll()
                .stream()
                .map(MenuItem::getCategory)
                .distinct()
                .sorted()
                .toList();
    }
}
