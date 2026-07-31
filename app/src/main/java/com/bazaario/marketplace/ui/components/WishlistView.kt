package com.bazaario.marketplace.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.bazaario.marketplace.model.Product
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun WishlistView(
    products: List<Product>,
    wishlistIds: List<String>,
    onSelectProduct: (Product) -> Unit,
    onAddToCart: (Product) -> Unit,
    onToggleWishlist: (Product) -> Unit,
    onExploreCatalog: () -> Unit,
    modifier: Modifier = Modifier
) {
    val savedProducts = products.filter { wishlistIds.contains(it.id) }

    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 160.dp),
        modifier = modifier
            .fillMaxSize()
            .testTag("wishlist_view"),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = "Wishlist",
                            tint = Color(0xFFC62828),
                            modifier = Modifier.size(22.dp)
                        )
                        Text(
                            text = " My Wishlist & Saved Items (${savedProducts.size})",
                            style = MaterialTheme.typography.headlineMedium,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            color = BazaarioCharcoal
                        )
                    }
                    Text(
                        text = "Save products for price alerts or bundle orders with Bazaario Wallet.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = BazaarioSage
                    )
                }
            }
        }

        if (savedProducts.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(BazaarioLightGray)
                        .border(1.dp, BazaarioBorder, RoundedCornerShape(20.dp))
                        .padding(36.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = null,
                        tint = BazaarioSage,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Your wishlist is currently empty",
                        style = MaterialTheme.typography.titleLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioCharcoal
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Browse our catalog and tap the heart icon to save your favorite sustainable items.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = BazaarioSage
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onExploreCatalog,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BazaarioOlive,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text("Browse Catalog")
                    }
                }
            }
        } else {
            items(savedProducts, key = { it.id }) { prod ->
                ProductCard(
                    product = prod,
                    isWishlisted = true,
                    onProductClick = onSelectProduct,
                    onAddToCart = onAddToCart,
                    onToggleWishlist = onToggleWishlist
                )
            }
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}
