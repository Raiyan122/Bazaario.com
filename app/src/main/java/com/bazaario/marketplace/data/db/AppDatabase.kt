package com.bazaario.marketplace.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.bazaario.marketplace.model.OrderEntity
import com.bazaario.marketplace.model.WalletTransactionEntity
import com.bazaario.marketplace.model.WishlistEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [OrderEntity::class, WalletTransactionEntity::class, WishlistEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun marketplaceDao(): MarketplaceDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "bazaario_marketplace_db"
                )
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            INSTANCE?.let { database ->
                                CoroutineScope(Dispatchers.IO).launch {
                                    populateInitialData(database.marketplaceDao())
                                }
                            }
                        }
                    })
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private suspend fun populateInitialData(dao: MarketplaceDao) {
            // Seed sample orders
            dao.insertOrder(
                OrderEntity(
                    id = "ORD-8834",
                    dateString = "Jul 28, 2026",
                    totalAmount = 64.00,
                    status = "Delivered",
                    itemCount = 1,
                    itemsSummary = "Handcrafted Ceramic Matcha Bowl & Whisk Set (x1)"
                )
            )
            dao.insertOrder(
                OrderEntity(
                    id = "ORD-9102",
                    dateString = "Jul 30, 2026",
                    totalAmount = 233.00,
                    status = "Shipped",
                    itemCount = 2,
                    itemsSummary = "Botanical Nourishing Rosehip Serum (x1), Organic Linen Blazer (x1)"
                )
            )

            // Seed sample wallet transactions
            dao.insertTransaction(
                WalletTransactionEntity(
                    id = "TX-01",
                    title = "Welcome Reward Bonus",
                    dateString = "Jul 25, 2026",
                    amount = 50.00,
                    isCredit = true
                )
            )
            dao.insertTransaction(
                WalletTransactionEntity(
                    id = "TX-02",
                    title = "Eco-Cashback on Kyoto Matcha Bowl",
                    dateString = "Jul 28, 2026",
                    amount = 6.40,
                    isCredit = true
                )
            )
            dao.insertTransaction(
                WalletTransactionEntity(
                    id = "TX-03",
                    title = "Order Payment #ORD-9102",
                    dateString = "Jul 30, 2026",
                    amount = 45.00,
                    isCredit = false
                )
            )
        }
    }
}
