package com.bazaario.marketplace.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bazaario.marketplace.model.UserRole
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioCream
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioOliveDark
import com.bazaario.marketplace.ui.BazaarioSage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketplaceHeader(
    currentRole: UserRole,
    onRoleSelected: (UserRole) -> Unit,
    activeTab: String,
    onTabSelected: (String) -> Unit,
    searchQuery: String,
    onSearchChanged: (String) -> Unit,
    selectedCategory: String,
    categories: List<String>,
    onCategorySelected: (String) -> Unit,
    cartItemCount: Int,
    wishlistCount: Int,
    onOpenCart: () -> Unit,
    onOpenAiChat: () -> Unit,
    onOpenAiVisual: () -> Unit
) {
    val focusManager = LocalFocusManager.current

    Surface(
        color = Color.White,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp)) {
            // Row 1: Logo, Role Switcher, Quick Action Icons
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Logo
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BazaarioOlive),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "B",
                            color = BazaarioCream,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            fontSize = 20.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Bazaario",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = BazaarioCharcoal
                        )
                        Text(
                            text = "Sustainable Marketplace",
                            style = MaterialTheme.typography.labelMedium,
                            fontSize = 10.sp,
                            color = BazaarioSage
                        )
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2E7D32))
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Synced • Web & App DB",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF2E7D32)
                            )
                        }
                    }
                }

                // AI Buttons & Cart/Wishlist actions
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    // AI Concierge button
                    IconButton(
                        onClick = onOpenAiChat,
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(BazaarioLightGray)
                            .testTag("ai_concierge_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI Shopping Concierge",
                            tint = BazaarioOlive,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Visual Search button
                    IconButton(
                        onClick = onOpenAiVisual,
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(BazaarioLightGray)
                            .testTag("ai_visual_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "Visual Image Search",
                            tint = BazaarioOlive,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    if (currentRole == UserRole.CUSTOMER) {
                        // Wishlist Icon
                        IconButton(
                            onClick = { onTabSelected("wishlist") },
                            modifier = Modifier.testTag("wishlist_tab_button")
                        ) {
                            Icon(
                                imageVector = if (activeTab == "wishlist" || wishlistCount > 0) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Wishlist",
                                tint = if (wishlistCount > 0) Color(0xFFC62828) else BazaarioSage,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Cart Button with badge
                        BadgedBox(
                            badge = {
                                if (cartItemCount > 0) {
                                    Badge(containerColor = BazaarioOliveDark) {
                                        Text(text = cartItemCount.toString(), color = Color.White)
                                    }
                                }
                            }
                        ) {
                            IconButton(
                                onClick = onOpenCart,
                                modifier = Modifier.testTag("open_cart_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ShoppingCart,
                                    contentDescription = "Shopping Cart",
                                    tint = BazaarioCharcoal,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Row 2: Role Switcher Chips & Customer Tab Switcher
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Role pills
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(BazaarioLightGray)
                        .border(1.dp, BazaarioBorder, RoundedCornerShape(20.dp))
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    UserRole.values().forEach { role ->
                        val isSelected = currentRole == role
                        val label = when (role) {
                            UserRole.CUSTOMER -> "Customer"
                            UserRole.SELLER -> "Seller"
                            UserRole.ADMIN -> "Admin"
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) BazaarioOlive else Color.Transparent)
                                .clickable { onRoleSelected(role) }
                                .padding(horizontal = 14.dp, vertical = 6.dp)
                                .testTag("role_switch_${label.lowercase()}"),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                color = if (isSelected) Color.White else BazaarioCharcoal,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                if (currentRole == UserRole.CUSTOMER) {
                    Spacer(modifier = Modifier.width(12.dp))
                    // Customer main tabs: Home, Orders, Wallet, Wishlist
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf("home" to "Catalog", "orders" to "Orders", "wallet" to "Wallet", "wishlist" to "Wishlist").forEach { (tabKey, label) ->
                            val active = activeTab == tabKey
                            TextButton(
                                onClick = { onTabSelected(tabKey) },
                                colors = ButtonDefaults.textButtonColors(
                                    contentColor = if (active) BazaarioOlive else BazaarioSage
                                )
                            ) {
                                Text(
                                    text = label,
                                    fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }

            // Row 3: Search Bar & Category Chips (only visible in Customer Home)
            if (currentRole == UserRole.CUSTOMER && activeTab == "home") {
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchChanged,
                    placeholder = {
                        Text(
                            "Search 1000+ curated products, sustainable crafts...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = BazaarioSage
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = BazaarioSage
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("search_input"),
                    shape = RoundedCornerShape(24.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BazaarioOlive,
                        unfocusedBorderColor = BazaarioBorder,
                        focusedContainerColor = BazaarioCream,
                        unfocusedContainerColor = BazaarioCream
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Category Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categories.forEach { cat ->
                        val selected = selectedCategory == cat
                        FilterChip(
                            selected = selected,
                            onClick = { onCategorySelected(cat) },
                            label = {
                                Text(
                                    text = cat,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 12.sp
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BazaarioOlive,
                                selectedLabelColor = Color.White
                            ),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.testTag("category_chip_$cat")
                        )
                    }
                }
            }
        }
    }
}
