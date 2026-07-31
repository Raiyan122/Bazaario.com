package com.bazaario.marketplace.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

enum class UserRole {
    CUSTOMER, SELLER, ADMIN
}

@Serializable
@Entity(tableName = "products")
data class Product(
    @PrimaryKey val id: String,
    val title: String,
    val price: Double,
    val category: String,
    val image: String,
    val vendorId: String,
    val vendorName: String,
    val rating: Double,
    val reviewsCount: Int,
    val description: String,
    val badge: String = "",
    val inStock: Boolean = true,
    val stockCount: Int = 20,
    val ecoCertified: Boolean = false,
    val sustainabilityScore: Int = 85
)

data class CartItem(
    val product: Product,
    val quantity: Int
)

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey val id: String,
    val dateString: String,
    val totalAmount: Double,
    val status: String, // "Processing", "Shipped", "Delivered"
    val itemCount: Int,
    val itemsSummary: String
)

@Entity(tableName = "wallet_transactions")
data class WalletTransactionEntity(
    @PrimaryKey val id: String,
    val title: String,
    val dateString: String,
    val amount: Double,
    val isCredit: Boolean
)

@Entity(tableName = "wishlist_items")
data class WishlistEntity(
    @PrimaryKey val productId: String
)

data class SellerMetrics(
    val totalRevenue: Double = 14850.75,
    val activeOrdersCount: Int = 24,
    val listedProductsCount: Int = 38,
    val ratingAverage: Double = 4.88
)

data class AdminMetricCard(
    val title: String,
    val value: String,
    val change: String,
    val isPositive: Boolean
)
