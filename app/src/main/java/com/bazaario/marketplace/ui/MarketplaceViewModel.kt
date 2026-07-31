package com.bazaario.marketplace.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bazaario.marketplace.data.MockCatalog
import com.bazaario.marketplace.data.db.AppDatabase
import com.bazaario.marketplace.model.AdminMetricCard
import com.bazaario.marketplace.model.CartItem
import com.bazaario.marketplace.model.OrderEntity
import com.bazaario.marketplace.model.Product
import com.bazaario.marketplace.model.SellerMetrics
import com.bazaario.marketplace.model.UserRole
import com.bazaario.marketplace.model.WalletTransactionEntity
import com.bazaario.marketplace.model.WishlistEntity
import com.bazaario.marketplace.network.CloudSyncService
import com.bazaario.marketplace.network.GeminiService
import com.bazaario.marketplace.network.SyncChannelMetric
import com.bazaario.marketplace.network.SyncState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val isUser: Boolean,
    val text: String,
    val timestamp: String = SimpleDateFormat("HH:mm", Locale.US).format(Date())
)

class MarketplaceViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val dao = db.marketplaceDao()

    // Bazaario Unified Cloud Backend & Database Sync Bridge
    val syncState: StateFlow<SyncState> = CloudSyncService.syncState
    val lastSyncedTime: StateFlow<String> = CloudSyncService.lastSyncedTime
    val syncMetrics: StateFlow<List<SyncChannelMetric>> = CloudSyncService.syncMetrics

    // Role state
    private val _currentRole = MutableStateFlow(UserRole.CUSTOMER)
    val currentRole: StateFlow<UserRole> = _currentRole.asStateFlow()

    // Customer Navigation Tab ("home", "orders", "wallet", "wishlist")
    private val _activeTab = MutableStateFlow("home")
    val activeTab: StateFlow<String> = _activeTab.asStateFlow()

    // Catalog filtering
    val categories = MockCatalog.categories
    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _products = MutableStateFlow(MockCatalog.products)
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    // Wishlist IDs from local Room DB
    val wishlistIds: StateFlow<List<String>> = dao.getWishlistProductIds()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Cart state
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    // Orders from local Room DB
    val orders: StateFlow<List<OrderEntity>> = dao.getAllOrders()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Wallet transactions from local Room DB
    val walletTransactions: StateFlow<List<WalletTransactionEntity>> = dao.getAllTransactions()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Compute wallet balance dynamically
    val walletBalance: StateFlow<Double> = walletTransactions.combine(_cartItems) { txList, _ ->
        txList.sumOf { if (it.isCredit) it.amount else -it.amount }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 101.40)

    // Modals & Drawers
    private val _selectedProductModal = MutableStateFlow<Product?>(null)
    val selectedProductModal: StateFlow<Product?> = _selectedProductModal.asStateFlow()

    private val _isCartOpen = MutableStateFlow(false)
    val isCartOpen: StateFlow<Boolean> = _isCartOpen.asStateFlow()

    private val _isCheckoutModalOpen = MutableStateFlow(false)
    val isCheckoutModalOpen: StateFlow<Boolean> = _isCheckoutModalOpen.asStateFlow()

    private val _isAiChatOpen = MutableStateFlow(false)
    val isAiChatOpen: StateFlow<Boolean> = _isAiChatOpen.asStateFlow()

    private val _isAiVisualOpen = MutableStateFlow(false)
    val isAiVisualOpen: StateFlow<Boolean> = _isAiVisualOpen.asStateFlow()

    // AI Concierge Chat State
    private val _chatMessages = MutableStateFlow(
        listOf(
            ChatMessage(
                isUser = false,
                text = "Hello! I am Aria, your Bazaario AI Shopping Concierge. Ask me for recommendations, sustainability insights, or gift ideas!"
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()
    private val _isAiLoading = MutableStateFlow(false)
    val isAiLoading: StateFlow<Boolean> = _isAiLoading.asStateFlow()

    // AI Visual Analyzer State
    private val _visualAnalysisResult = MutableStateFlow<String?>(null)
    val visualAnalysisResult: StateFlow<String?> = _visualAnalysisResult.asStateFlow()
    private val _isVisualAnalyzing = MutableStateFlow(false)
    val isVisualAnalyzing: StateFlow<Boolean> = _isVisualAnalyzing.asStateFlow()

    // Seller & Admin Dashboard Metrics
    val sellerMetrics = SellerMetrics()
    val adminMetrics = listOf(
        AdminMetricCard("Gross Merchandise Value", "$124,580.00", "+18.4% vs last month", true),
        AdminMetricCard("Active Vendors", "148 Sellers", "+12 new this week", true),
        AdminMetricCard("Eco-Certified Catalog", "84% Certified", "+5% sustainability index", true),
        AdminMetricCard("Average Order Value", "$82.50", "+4.2% YoY", true)
    )

    fun setRole(role: UserRole) {
        _currentRole.value = role
        if (role == UserRole.CUSTOMER) {
            _activeTab.value = "home"
        }
    }

    fun setActiveTab(tab: String) {
        _activeTab.value = tab
    }

    fun setCategory(category: String) {
        _selectedCategory.value = category
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun openProductDetail(product: Product) {
        _selectedProductModal.value = product
    }

    fun closeProductDetail() {
        _selectedProductModal.value = null
    }

    fun toggleCart(open: Boolean) {
        _isCartOpen.value = open
    }

    fun toggleCheckoutModal(open: Boolean) {
        _isCheckoutModalOpen.value = open
    }

    fun toggleAiChat(open: Boolean) {
        _isAiChatOpen.value = open
    }

    fun toggleAiVisualModal(open: Boolean) {
        _isAiVisualOpen.value = open
        if (!open) {
            _visualAnalysisResult.value = null
        }
    }

    // Cart operations
    fun addToCart(product: Product) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == product.id }
        if (index >= 0) {
            val existing = current[index]
            current[index] = existing.copy(quantity = existing.quantity + 1)
        } else {
            current.add(CartItem(product, 1))
        }
        _cartItems.value = current
        viewModelScope.launch { CloudSyncService.triggerCrossPlatformSync("cart_add") }
    }

    fun updateQuantity(productId: String, newQty: Int) {
        if (newQty <= 0) {
            _cartItems.value = _cartItems.value.filter { it.product.id != productId }
        } else {
            _cartItems.value = _cartItems.value.map {
                if (it.product.id == productId) it.copy(quantity = newQty) else it
            }
        }
        viewModelScope.launch { CloudSyncService.triggerCrossPlatformSync("cart_update") }
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun calculateSubtotal(): Double {
        return _cartItems.value.sumOf { it.product.price * it.quantity }
    }

    // Wishlist DB toggle
    fun toggleWishlist(product: Product) {
        viewModelScope.launch {
            val isSaved = dao.isWishlisted(product.id)
            if (isSaved) {
                dao.removeFromWishlist(product.id)
            } else {
                dao.addToWishlist(WishlistEntity(product.id))
            }
            CloudSyncService.triggerCrossPlatformSync("wishlist_update")
        }
    }

    // Checkout Order Placement
    fun checkoutOrder(shippingAddress: String, useWalletBalance: Boolean) {
        viewModelScope.launch {
            val currentCart = _cartItems.value
            if (currentCart.isEmpty()) return@launch

            val total = calculateSubtotal()
            val orderId = "ORD-" + (1000..9999).random()
            val dateStr = SimpleDateFormat("MMM dd, yyyy", Locale.US).format(Date())
            val summary = currentCart.joinToString(", ") { "${it.product.title} (x${it.quantity})" }

            val newOrder = OrderEntity(
                id = orderId,
                dateString = dateStr,
                totalAmount = total,
                status = "Processing",
                itemCount = currentCart.sumOf { it.quantity },
                itemsSummary = summary
            )
            dao.insertOrder(newOrder)

            // Add wallet debit if paid via wallet
            if (useWalletBalance && walletBalance.value >= total) {
                dao.insertTransaction(
                    WalletTransactionEntity(
                        id = "TX-" + UUID.randomUUID().toString().take(6).uppercase(),
                        title = "Payment for Order $orderId",
                        dateString = dateStr,
                        amount = total,
                        isCredit = false
                    )
                )
            } else {
                // Award 5% eco-cashback!
                val cashback = total * 0.05
                dao.insertTransaction(
                    WalletTransactionEntity(
                        id = "TX-" + UUID.randomUUID().toString().take(6).uppercase(),
                        title = "5% Eco-Cashback on Order $orderId",
                        dateString = dateStr,
                        amount = cashback,
                        isCredit = true
                    )
                )
            }

            _cartItems.value = emptyList()
            _isCheckoutModalOpen.value = false
            _isCartOpen.value = false
            _activeTab.value = "orders"
            CloudSyncService.triggerCrossPlatformSync("checkout_order")
        }
    }

    // AI Concierge prompt
    fun sendAiChatMessage(userText: String) {
        if (userText.isBlank()) return
        val userMsg = ChatMessage(isUser = true, text = userText)
        _chatMessages.value = _chatMessages.value + userMsg
        _isAiLoading.value = true

        viewModelScope.launch {
            val aiResponseText = GeminiService.askConcierge(userText, _products.value)
            val aiMsg = ChatMessage(isUser = false, text = aiResponseText)
            _chatMessages.value = _chatMessages.value + aiMsg
            _isAiLoading.value = false
        }
    }

    // AI Visual Analyzer
    fun analyzeImageWithGemini(base64Image: String, prompt: String) {
        _isVisualAnalyzing.value = true
        _visualAnalysisResult.value = null
        viewModelScope.launch {
            val report = GeminiService.analyzeProductImage(base64Image, prompt, _products.value)
            _visualAnalysisResult.value = report
            _isVisualAnalyzing.value = false
        }
    }
}
