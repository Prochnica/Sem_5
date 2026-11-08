CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`cart_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	CONSTRAINT `fk_cart_items_cart_id_carts_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`),
	CONSTRAINT `fk_cart_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
	CONSTRAINT `cart_items_cart_product_unique` UNIQUE(`cart_id`,`product_id`),
	CONSTRAINT "cart_items_quantity_positive" CHECK("quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL UNIQUE,
	CONSTRAINT `fk_carts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`quantity` integer NOT NULL,
	CONSTRAINT `fk_order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
	CONSTRAINT `fk_order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
	CONSTRAINT "order_items_price_non_negative" CHECK("unit_price_cents" >= 0),
	CONSTRAINT "order_items_quantity_positive" CHECK("quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`recipient_name` text NOT NULL,
	`address_line` text NOT NULL,
	`postal_code` text NOT NULL,
	`city` text NOT NULL,
	`total_cents` integer NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT "orders_status_known" CHECK("status" in ('zlozone', 'w_realizacji', 'wyslane', 'anulowane')),
	CONSTRAINT "orders_total_non_negative" CHECK("total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text NOT NULL,
	`price_cents` integer NOT NULL,
	`stock` integer NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT `fk_products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
	CONSTRAINT "products_price_non_negative" CHECK("price_cents" >= 0),
	CONSTRAINT "products_stock_non_negative" CHECK("stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`is_admin` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "users_is_admin_flag" CHECK("is_admin" in (0, 1))
);
