package com.foodorder.config;

import com.foodorder.model.MenuItem;
import com.foodorder.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) {
        if (menuItemRepository.count() > 0) return;

        List<MenuItem> items = List.of(
            // Burgers
            makeItem("Classic Beef Burger", "Juicy beef patty with lettuce, tomato, onion and our house sauce", 199.0, "Burgers", "🍔", true, true, false, 20),
            makeItem("BBQ Bacon Burger", "Smoky BBQ sauce, crispy bacon, cheddar and caramelized onions", 249.0, "Burgers", "🍔", true, false, false, 22),
            makeItem("Veggie Delight Burger", "Grilled portobello, roasted peppers, avocado spread and greens", 179.0, "Burgers", "🍔", false, true, true, 18),
            makeItem("Spicy Jalapeño Burger", "Pepper jack cheese, jalapeños, sriracha aioli and crispy onions", 229.0, "Burgers", "🍔", false, false, false, 20),

            // Pizza
            makeItem("Margherita Pizza", "San Marzano tomato, fresh mozzarella, basil and extra virgin olive oil", 299.0, "Pizza", "🍕", true, true, true, 25),
            makeItem("Pepperoni Feast", "Double pepperoni, mozzarella and our classic tomato base", 349.0, "Pizza", "🍕", true, false, false, 25),
            makeItem("BBQ Chicken Pizza", "Grilled chicken, BBQ sauce, red onions and coriander", 369.0, "Pizza", "🍕", false, false, false, 28),
            makeItem("Farmhouse Veggie Pizza", "Bell peppers, mushrooms, olives, corn and jalapeños on herb crust", 319.0, "Pizza", "🍕", false, true, true, 25),

            // Pasta
            makeItem("Spaghetti Carbonara", "Creamy egg sauce, pancetta, parmesan and black pepper", 259.0, "Pasta", "🍝", true, true, false, 20),
            makeItem("Penne Arrabbiata", "Spicy tomato sauce with garlic, red chilli and fresh basil", 219.0, "Pasta", "🍝", false, true, true, 18),
            makeItem("Fettuccine Alfredo", "Rich cream sauce with parmesan, butter and fresh parsley", 249.0, "Pasta", "🍝", false, true, true, 20),

            // Biryani & Rice
            makeItem("Chicken Biryani", "Fragrant basmati rice with tender chicken, saffron and whole spices", 279.0, "Biryani", "🍛", true, false, false, 35),
            makeItem("Veg Dum Biryani", "Seasonal vegetables slow-cooked with aromatic basmati and spices", 229.0, "Biryani", "🍛", false, true, true, 30),
            makeItem("Mutton Biryani", "Slow-cooked mutton in layered saffron rice with caramelized onions", 349.0, "Biryani", "🍛", false, false, false, 45),

            // Chinese
            makeItem("Chicken Fried Rice", "Wok-tossed rice with chicken, eggs and spring onions", 199.0, "Chinese", "🥡", true, false, false, 20),
            makeItem("Veg Hakka Noodles", "Stir-fried noodles with crispy vegetables in soy sauce", 169.0, "Chinese", "🥡", false, true, true, 15),
            makeItem("Manchurian Gravy", "Crispy chicken dumplings in a tangy, spicy gravy", 229.0, "Chinese", "🥡", false, false, false, 20),

            // Starters
            makeItem("Chicken Wings (6pcs)", "Crispy wings tossed in your choice of sauce — BBQ, buffalo or garlic", 219.0, "Starters", "🍗", true, false, false, 20),
            makeItem("Paneer Tikka", "Marinated cottage cheese cubes grilled in tandoor with mint chutney", 199.0, "Starters", "🍗", false, true, true, 20),
            makeItem("Spring Rolls (4pcs)", "Crispy rolls filled with spiced vegetables and glass noodles", 149.0, "Starters", "🍗", false, true, true, 15),

            // Desserts
            makeItem("Chocolate Lava Cake", "Warm chocolate cake with a molten centre and vanilla ice cream", 149.0, "Desserts", "🍰", true, true, true, 15),
            makeItem("Gulab Jamun (4pcs)", "Soft milk-solid balls soaked in rose-flavoured sugar syrup", 89.0, "Desserts", "🍰", false, true, true, 10),
            makeItem("Mango Panna Cotta", "Creamy panna cotta with fresh mango coulis", 129.0, "Desserts", "🍰", false, true, true, 10),

            // Drinks
            makeItem("Mango Lassi", "Thick and creamy mango yoghurt drink with a hint of cardamom", 79.0, "Drinks", "🥤", false, true, true, 5),
            makeItem("Fresh Lime Soda", "Chilled lime soda — sweet, salted or mixed", 59.0, "Drinks", "🥤", false, true, true, 5),
            makeItem("Cold Coffee", "Rich cold brew coffee blended with milk and ice cream", 99.0, "Drinks", "🥤", false, true, true, 5)
        );

        menuItemRepository.saveAll(items);
        System.out.println("✅ Seeded " + items.size() + " menu items.");
    }

    private MenuItem makeItem(String name, String desc, Double price, String category,
                               String emoji, boolean popular, boolean available,
                               boolean vegetarian, int prepTime) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(desc);
        item.setPrice(price);
        item.setCategory(category);
        item.setImageUrl(emoji);
        item.setPopular(popular);
        item.setAvailable(available);
        item.setVegetarian(vegetarian);
        item.setPrepTimeMinutes(prepTime);
        item.setRating(3.5 + Math.random() * 1.5);
        item.setReviewCount((int)(20 + Math.random() * 200));
        return item;
    }
}
