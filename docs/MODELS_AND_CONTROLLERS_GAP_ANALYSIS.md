# Models & Controllers – Gap Analysis

Comparison of your **required** models/controllers vs what is **currently implemented**.

---

## 1. Models (Prisma schema)

| Your model | In schema? | Notes |
|------------|------------|--------|
| **User** (email, password_hash, role, profile) | ✅ | User + Profile (linked). |
| **Address** (user_id, street, city, state, zip, country, is_default) | ⚠️ | Exists with street, city, state, country, postal_code, type (SHIPPING/BILLING). **Missing:** `is_default`. |
| **Session/RefreshToken** | ✅ | Implemented as `Token` (type REFRESH, blacklisted, expires). |
| **Product** (name, description, sku, base_price, stock_quantity, is_active) | ⚠️ | Exists; price/stock live on **ProductVariant**, not on Product. No single `sku` on Product. |
| **Category** (name, slug, parent_category_id) | ✅ | Category with `parentId` for nesting. |
| **ProductCategory** (many-to-many) | ❌ | Schema has **one** category per product (`Product.categoryId`), not many-to-many. |
| **ProductImage** (product_id, image_url, is_primary, sort_order) | ✅ | ProductImage with url, `order`. **Missing:** `is_primary` (can use order=0 as primary). |
| **ProductVariant** (product_id, sku, price, stock, attributes) | ✅ | Matches. |
| **Review** (user_id, product_id, rating, comment, verified_purchase) | ✅ | Review with `isVerified` (same idea). |
| **Cart** (user_id, session_id for guest) | ✅ | Cart with userId, sessionId, expiresAt. |
| **CartItem** (cart_id, product_id, variant_id, quantity) | ✅ | CartItem has cartId, variantId, quantity (no product_id; variant implies product). |
| **Order** (user_id, order_number, status, total_amount, shipping_address_id, billing_address_id) | ⚠️ | Order has userId, orderNumber, status, subtotal, tax, shipping, discount, total. **Missing:** `shippingAddressId`, `billingAddressId`. |
| **OrderItem** (order_id, product_id, variant_id, quantity, price_at_purchase) | ✅ | OrderItem has orderId, variantId, quantity, price. |
| **OrderStatus** (order_id, status, timestamp – history) | ❌ | Only `Order.status` exists; no separate **OrderStatus** history table. |
| **Payment** (order_id, payment_method, transaction_id, amount, status) | ✅ | Payment with method, transactionId, amount, status. |
| **Coupon** (code, discount_type, discount_value, expiry_date, usage_limit) | ❌ | Not in schema. |
| **OrderCoupon** (order_id, coupon_id) | ❌ | Not in schema. |
| **Inventory** (product_id, variant_id, quantity, warehouse_location) | ❌ | Stock is on ProductVariant only; no separate Inventory / warehouse model. |
| **Shipment** (order_id, tracking_number, carrier, status, shipped_at) | ✅ | Shipment model matches. |
| **Wishlist** (user_id, product_id) | ❌ | Not in schema. |
| **Notification** (user_id, type, message, read_at) | ❌ | Not in schema. |
| **AuditLog** (user_id, action, resource, timestamp) | ❌ | Not in schema. |

---

## 2. Controllers & endpoints

### Authentication
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| register | ✅ | POST `/auth/signup` |
| login | ✅ | POST `/auth/login` |
| logout | ✅ | POST `/auth/logout` |
| refresh-token | ✅ | POST `/auth/refresh` |
| forgot-password | ✅ | POST `/auth/forget-password` (+ verify-otp, reset-password) |
| reset-password | ✅ | POST `/auth/reset-password` |

### User management
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| get-profile | ✅ | GET `/auth/profile` |
| update-profile | ✅ | PATCH `/auth/profile` |
| delete-account | ❌ | No dedicated delete-account (users have DELETE `/users/:id` for admin). |
| **AddressController** (list, create, update, delete, set-default) | ❌ | No address module. |

### Product
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| list | ✅ | GET `/products` (paginated) |
| search | ✅ | GET `/products?search=...` |
| get-by-id | ✅ | GET `/products/:id`, GET `/products/slug/:slug` |
| filter-by-category | ✅ | GET `/products?category=...` |
| get-featured | ❌ | No “featured” flag or endpoint. |
| **CategoryController** list, get-tree, get-by-slug | ⚠️ | GET `/categories`, GET `/categories/:slug`. **Missing:** get-tree (nested). |
| **ReviewController** (create, list-by-product, update, delete) | ❌ | No review module. |

### Shopping
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| **CartController** (get-cart, add-item, update-quantity, remove-item, clear-cart) | ❌ | No cart module. |
| **WishlistController** (add, remove, list) | ❌ | No wishlist (no schema). |

### Checkout & orders
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| **CheckoutController** (validate-cart, apply-coupon, calculate-totals) | ❌ | No checkout module. |
| **OrderController** (create, list-my-orders, get-order-details, cancel-order) | ❌ | No order module. |
| **PaymentController** (create-payment-intent, confirm-payment, webhook-handler) | ❌ | No payment module. |

### Admin
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| AdminProductController (create, update, delete, manage-inventory) | ⚠️ | Products: POST/PATCH/DELETE exist (admin-only). No separate “manage-inventory” endpoint. |
| AdminOrderController (list-all, update-status, process-refund) | ❌ | No order/admin-order module. |
| AdminUserController (list, ban, manage-roles) | ⚠️ | Users: list (admin), create. **Missing:** ban, manage-roles. |
| AdminAnalyticsController (sales-reports, top-products, user-metrics) | ❌ | No analytics module. |

### Additional
| Required | Implemented? | Endpoint(s) |
|----------|--------------|-------------|
| SearchController (global-search, autocomplete) | ⚠️ | Product search in GET `/products?search=...`. No global search or autocomplete. |
| NotificationController (list, mark-read) | ❌ | No notification module (no schema). |

---

## 3. Summary

- **Models:** Most core models exist. **Missing:** ProductCategory (many-to-many), OrderStatus history, Coupon, OrderCoupon, Inventory, Wishlist, Notification, AuditLog. **Schema gaps:** Address.is_default, Order.shippingAddressId/billingAddressId.
- **Controllers:** **Done:** Auth (register, login, logout, refresh, forgot/reset password), profile get/update, Products CRUD + list/search/filter, Categories list + by-slug, Users admin list/create. **Not done:** Addresses, Reviews, Cart, Wishlist, Checkout, Orders, Payments, Admin Orders/Analytics, delete-account, get-featured, category tree, global search/autocomplete, Notifications.

**Answer: No – not all of these are completed.** The list you outlined is only partially implemented (auth, users, products, categories are in place; addresses, cart, orders, payments, reviews, wishlist, coupons, admin orders/analytics, and several schema additions are still missing).
