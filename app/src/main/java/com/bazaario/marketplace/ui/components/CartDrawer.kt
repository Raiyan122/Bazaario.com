package com.bazaario.marketplace.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.bazaario.marketplace.model.CartItem
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioCream
import com.bazaario.marketplace.ui.BazaarioEcoGreen
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun CartDrawer(
    isOpen: Boolean,
    items: List<CartItem>,
    subtotal: Double,
    onClose: () -> Unit,
    onUpdateQty: (String, Int) -> Unit,
    onProceedToCheckout: () -> Unit
) {
    if (!isOpen) return

    val totalItems = items.sumOf { it.quantity }
    val ecoCashback = subtotal * 0.05

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(24.dp))
                .testTag("cart_drawer_modal"),
            color = BazaarioCream
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BazaarioOlive)
                        .padding(horizontal = 20.dp, vertical = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Your Sustainable Cart ($totalItems)",
                                style = MaterialTheme.typography.titleLarge,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        IconButton(onClick = onClose, modifier = Modifier.testTag("close_cart_drawer")) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                    }
                }

                if (items.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = null,
                                tint = BazaarioSage,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Your cart is empty",
                                style = MaterialTheme.typography.titleLarge,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                color = BazaarioCharcoal
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Add handcrafted ceramics, organic linen, or eco-friendly goods from our artisans.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = BazaarioSage
                            )
                        }
                    }
                } else {
                    // Items list
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(items, key = { it.product.id }) { item ->
                            CartItemRow(item = item, onUpdateQty = onUpdateQty)
                        }
                    }

                    // Footer subtotal & checkout button
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shadowElevation = 8.dp,
                        color = Color.White
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            // Subtotal row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Subtotal",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = BazaarioCharcoal
                                )
                                Text(
                                    text = "$${String.format("%.2f", subtotal)}",
                                    style = MaterialTheme.typography.headlineMedium,
                                    fontFamily = FontFamily.Serif,
                                    fontWeight = FontWeight.Bold,
                                    color = BazaarioOlive
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Eco-cashback row
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFFE8F5E9))
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Eco,
                                        contentDescription = null,
                                        tint = BazaarioEcoGreen,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "5% Eco-Cashback on purchase",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = BazaarioEcoGreen
                                    )
                                }

                                Text(
                                    text = "+$${String.format("%.2f", ecoCashback)}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BazaarioEcoGreen
                                )
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Button(
                                onClick = onProceedToCheckout,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("proceed_to_checkout_button"),
                                shape = RoundedCornerShape(24.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = BazaarioOlive,
                                    contentColor = Color.White
                                )
                            ) {
                                Text("Proceed to Sustainable Checkout", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onUpdateQty: (String, Int) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BazaarioBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = item.product.image,
                contentDescription = item.product.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(12.dp))
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.product.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioCharcoal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "$${String.format("%.2f", item.product.price)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = BazaarioOlive,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Quantity Controls
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { onUpdateQty(item.product.id, item.quantity - 1) },
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(BazaarioLightGray)
                    ) {
                        Icon(imageVector = Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(14.dp))
                    }

                    Text(
                        text = "${item.quantity}",
                        modifier = Modifier.padding(horizontal = 12.dp),
                        fontWeight = FontWeight.Bold,
                        color = BazaarioCharcoal
                    )

                    IconButton(
                        onClick = { onUpdateQty(item.product.id, item.quantity + 1) },
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(BazaarioLightGray)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(14.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Delete button
            IconButton(
                onClick = { onUpdateQty(item.product.id, 0) },
                modifier = Modifier.testTag("remove_cart_item_${item.product.id}")
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Remove",
                    tint = BazaarioSage
                )
            }
        }
    }
}
