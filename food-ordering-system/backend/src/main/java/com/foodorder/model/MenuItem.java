package com.foodorder.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(length = 500)
    private String description;

    @NotNull
    @Positive
    private Double price;

    private String category;

    private String imageUrl;

    private boolean available = true;

    private Double rating = 0.0;

    private Integer reviewCount = 0;

    private boolean popular = false;

    private boolean vegetarian = false;

    private Integer prepTimeMinutes = 20;
}
