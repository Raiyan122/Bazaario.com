package com.bazaario.marketplace

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bazaario.marketplace.data.db.AppDatabase
import com.bazaario.marketplace.ui.BazaarioCream
import com.bazaario.marketplace.ui.BazaarioTheme
import com.bazaario.marketplace.ui.MarketplaceViewModel
import com.bazaario.marketplace.ui.components.AIChatModal
import com.bazaario.marketplace.ui.components.AIImageAnalyzerModal
import com.bazaario.marketplace.ui.components.AdminConsoleView
import com.bazaario.marketplace.ui.components.CartDrawer
import com.bazaario.marketplace.ui.components.CheckoutModal
import com.bazaario.marketplace.ui.components.CustomerHome
import com.bazaario.marketplace.ui.components.MarketplaceHeader
import com.bazaario.marketplace.ui.components.OrdersView
import com.bazaario.marketplace.ui.components.ProductDetailModal
import com.bazaario.marketplace.ui.components.SellerDashboardView
import com.bazaario.marketplace.ui.components.WalletView
import com.bazaario.marketplace.ui.components.WishlistView
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val dao = AppDatabase.getDatabase(applicationContext).marketplaceDao()
        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return MarketplaceViewModel(dao) as T
            }
        }

        setContent {
            BazaarioTheme {
                val viewModel: MarketplaceViewModel = viewModel(factory = factory)
                BazaarioApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun BazaarioApp(
    viewModel: MarketplaceViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    var isCartOpen by remember { mutableStateOf(false) }
    var isCheckoutOpen by remember { mutableStateOf(false) }
    var isAiChatOpen by remember { mutableStateOf(false) }
    var isVisualSearchOpen by remember { mutableStateOf(false) }

    val categories = listOf("All", "Pottery", "Apparel", "Audio", "Home & Living")
    val totalCartItems = uiState.cartItems.sumOf { it.quantity }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BazaarioCream)
        ) {
            // Persistent Marketplace Header (Navbar)
            MarketplaceHeader(
                userRole = uiState.userRole,
                selectedTab = uiState.selectedTab,
                selectedCategory = uiState.selectedCategory,
                categories = categories,
                searchQuery = uiState.searchQuery,
                cartItemCount = totalCartItems,
                onSelectRole = { viewModel.setUserRole(it) },
                onSelectTab = { viewModel.selectTab(it) },
                onSelectCategory = { viewModel.selectCategory(it) },
                onSearchQueryChange = { viewModel.updateSearchQuery(it) },
                onOpenCart = { isCartOpen = true },
                onOpenAiChat = { isAiChatOpen = true },
                onOpenAiVisual = { isVisualSearchOpen = true }
            )

            // Main View Container based on Role & Tab
            Box(modifier = Modifier.weight(1f)) {
                when (uiState.userRole) {
                    "Seller" -> {
                        SellerDashboardView(
                            metrics = uiState.sellerMetrics,
                            products = uiState.products
                        )
                    }
                    "Admin" -> {
                        AdminConsoleView(
                            metrics = uiState.adminMetrics
                        )
                    }
                    else -> {
                        // Customer view
                        when (uiState.selectedTab) {
                            "Orders" -> {
                                OrdersView(
                                    orders = uiState.orders,
                                    onExploreCatalog = { viewModel.selectTab("Explore") }
                                )
                            }
                            "Wallet" -> {
                                WalletView(
                                    balance = uiState.walletBalance,
                                    transactions = uiState.walletTransactions
                                )
                            }
                            "Wishlist" -> {
                                WishlistView(
                                    products = uiState.products,
                                    wishlistIds = uiState.wishlistIds,
                                    onSelectProduct = { viewModel.selectProduct(it) },
                                    onAddToCart = { prod ->
                                        viewModel.addToCart(prod)
                                        coroutineScope.launch {
                                            snackbarHostState.showSnackbar("Added ${prod.title} to sustainable cart")
                                        }
                                    },
                                    onToggleWishlist = { viewModel.toggleWishlist(it) },
                                    onExploreCatalog = { viewModel.selectTab("Explore") }
                                )
                            }
                            else -> {
                                CustomerHome(
                                    products = uiState.products,
                                    selectedCategory = uiState.selectedCategory,
                                    searchQuery = uiState.searchQuery,
                                    wishlistIds = uiState.wishlistIds,
                                    onSelectProduct = { viewModel.selectProduct(it) },
                                    onAddToCart = { prod ->
                                        viewModel.addToCart(prod)
                                        coroutineScope.launch {
                                            snackbarHostState.showSnackbar("Added ${prod.title} to cart • +5% Eco-Cashback eligible")
                                        }
                                    },
                                    onToggleWishlist = { viewModel.toggleWishlist(it) },
                                    onOpenAiChat = { isAiChatOpen = true },
                                    onOpenAiVisual = { isVisualSearchOpen = true },
                                    onClearFilters = {
                                        viewModel.selectCategory("All")
                                        viewModel.updateSearchQuery("")
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        // Product Detail Modal
        uiState.selectedProduct?.let { product ->
            ProductDetailModal(
                product = product,
                isWishlisted = uiState.wishlistIds.contains(product.id),
                onClose = { viewModel.selectProduct(null) },
                onAddToCart = { prod ->
                    viewModel.addToCart(prod)
                    coroutineScope.launch {
                        snackbarHostState.showSnackbar("Added ${prod.title} to cart")
                    }
                },
                onBuyNow = { prod ->
                    viewModel.buyNow(prod)
                    isCheckoutOpen = true
                },
                onToggleWishlist = { viewModel.toggleWishlist(it) }
            )
        }

        // Cart Drawer
        if (isCartOpen) {
            CartDrawer(
                isOpen = isCartOpen,
                items = uiState.cartItems,
                subtotal = uiState.cartSubtotal,
                onClose = { isCartOpen = false },
                onUpdateQty = { productId, qty ->
                    viewModel.updateCartQuantity(productId, qty)
                },
                onProceedToCheckout = {
                    isCartOpen = false
                    isCheckoutOpen = true
                }
            )
        }

        // Checkout Modal
        if (isCheckoutOpen) {
            CheckoutModal(
                isOpen = isCheckoutOpen,
                subtotal = uiState.cartSubtotal,
                walletBalance = uiState.walletBalance,
                onClose = { isCheckoutOpen = false },
                onConfirmOrder = { address, useWallet ->
                    viewModel.completeCheckout(address, useWallet)
                    isCheckoutOpen = false
                    coroutineScope.launch {
                        snackbarHostState.showSnackbar("Sustainable order placed! 5% Eco-Cashback added to your wallet.")
                    }
                }
            )
        }

        // AI Concierge Chat Modal
        if (isAiChatOpen) {
            AIChatModal(
                isOpen = isAiChatOpen,
                messages = uiState.aiChatMessages,
                isLoading = uiState.isAiChatLoading,
                onSendMessage = { prompt ->
                    viewModel.sendAiChatMessage(prompt)
                },
                onClose = { isAiChatOpen = false }
            )
        }

        // AI Visual Search Modal
        if (isVisualSearchOpen) {
            AIImageAnalyzerModal(
                isOpen = isVisualSearchOpen,
                analysisResult = uiState.aiVisualAnalysisResult,
                isAnalyzing = uiState.isAiVisualAnalyzing,
                onAnalyze = { imageBase64, note ->
                    viewModel.runVisualSearch(imageBase64, note)
                },
                onClose = {
                    isVisualSearchOpen = false
                    viewModel.closeVisualAnalysis()
                }
            )
        }
    }
}
