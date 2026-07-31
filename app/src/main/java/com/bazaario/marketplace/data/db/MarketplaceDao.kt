package com.bazaario.marketplace.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.bazaario.marketplace.model.OrderEntity
import com.bazaario.marketplace.model.WalletTransactionEntity
import com.bazaario.marketplace.model.WishlistEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MarketplaceDao {
    // Orders
    @Query("SELECT * FROM orders ORDER BY dateString DESC")
    fun getAllOrders(): Flow<List<OrderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: OrderEntity)

    // Wallet Transactions
    @Query("SELECT * FROM wallet_transactions ORDER BY dateString DESC")
    fun getAllTransactions(): Flow<List<WalletTransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: WalletTransactionEntity)

    // Wishlist
    @Query("SELECT productId FROM wishlist_items")
    fun getWishlistProductIds(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addToWishlist(item: WishlistEntity)

    @Query("DELETE FROM wishlist_items WHERE productId = :productId")
    suspend fun removeFromWishlist(productId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM wishlist_items WHERE productId = :productId)")
    suspend fun isWishlisted(productId: String): Boolean
}
