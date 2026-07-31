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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.bazaario.marketplace.model.Product
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioCream
import com.bazaario.marketplace.ui.BazaarioEcoGreen
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun ProductDetailModal(
    product: Product,
    isWishlisted: Boolean,
    onClose: () -> Unit,
    onAddToCart: (Product) -> Unit,
    onBuyNow: (Product) -> Unit,
    onToggleWishlist: (Product) -> Unit
) {
    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f)
                .clip(RoundedCornerShape(24.dp))
                .testTag("product_detail_modal"),
            color = BazaarioCream
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(bottom = 90.dp)
                ) {
                    // Image banner
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp)
                            .background(BazaarioLightGray)
                    ) {
                        AsyncImage(
                            model = product.image,
                            contentDescription = product.title,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )

                        // Close button
                        IconButton(
                            onClick = onClose,
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(16.dp)
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.9f))
                                .testTag("close_product_modal")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = BazaarioCharcoal
                            )
                        }

                        // Wishlist button
                        IconButton(
                            onClick = { onToggleWishlist(product) },
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(16.dp)
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.9f))
                        ) {
                            Icon(
                                imageVector = if (isWishlisted) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Wishlist",
                                tint = if (isWishlisted) Color(0xFFC62828) else BazaarioSage
                            )
                        }
                    }

                    // Content details
                    Column(modifier = Modifier.padding(20.dp)) {
                        // Category & Vendor
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Store,
                                    contentDescription = "Vendor",
                                    tint = BazaarioSage,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = product.vendorName,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = BazaarioSage
                                )
                            }

                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(BazaarioLightGray)
                                    .padding(horizontal = 10.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Eco,
                                    contentDescription = "Eco",
                                    tint = BazaarioEcoGreen,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Eco-Score: ${product.sustainabilityScore}/100",
                                    color = BazaarioEcoGreen,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Title
                        Text(
                            text = product.title,
                            style = MaterialTheme.typography.headlineMedium,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            color = BazaarioCharcoal
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Price and rating
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "$${String.format("%.2f", product.price)}",
                                style = MaterialTheme.typography.headlineLarge,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                color = BazaarioOlive
                            )

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = "Rating",
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${product.rating} (${product.reviewsCount} reviews)",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BazaarioCharcoal
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        HorizontalDivider(color = BazaarioBorder)
                        Spacer(modifier = Modifier.height(16.dp))

                        // Description
                        Text(
                            text = "Artisanal Story & Details",
                            style = MaterialTheme.typography.titleLarge,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            color = BazaarioCharcoal
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = product.description,
                            style = MaterialTheme.typography.bodyLarge,
                            lineHeight = 22.sp,
                            color = BazaarioCharcoal.copy(alpha = 0.85f)
                        )

                        Spacer(modifier = Modifier.height(18.dp))

                        // Eco assurance banner
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFFE8F5E9))
                                .border(1.dp, Color(0xFFC8E6C9), RoundedCornerShape(16.dp))
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = "Certified",
                                tint = BazaarioEcoGreen,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Bazaario Ethical Guarantee",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = BazaarioEcoGreen
                                )
                                Text(
                                    text = "100% verified sustainable sourcing. 5% Eco-Cashback awarded to your Bazaario Wallet on purchase.",
                                    fontSize = 11.sp,
                                    color = BazaarioCharcoal.copy(alpha = 0.8f)
                                )
                            }
                        }
                    }
                }

                // Sticky Bottom CTA Bar
                Surface(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth(),
                    shadowElevation = 8.dp,
                    color = Color.White
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = {
                                onAddToCart(product)
                                onClose()
                            },
                            shape = RoundedCornerShape(24.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = BazaarioLightGray,
                                contentColor = BazaarioOlive
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("modal_add_to_cart_button")
                        ) {
                            Text("Add to Cart", fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = {
                                onBuyNow(product)
                                onClose()
                            },
                            shape = RoundedCornerShape(24.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = BazaarioOlive,
                                contentColor = Color.White
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("modal_buy_now_button")
                        ) {
                            Text("Buy Now", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
