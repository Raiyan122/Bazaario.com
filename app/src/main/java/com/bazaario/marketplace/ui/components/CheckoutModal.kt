package com.bazaario.marketplace.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioCream
import com.bazaario.marketplace.ui.BazaarioEcoGreen
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun CheckoutModal(
    isOpen: Boolean,
    subtotal: Double,
    walletBalance: Double,
    onClose: () -> Unit,
    onConfirmOrder: (shippingAddress: String, useWallet: Boolean) -> Unit
) {
    if (!isOpen) return

    var shippingAddress by remember {
        mutableStateOf("742 Evergreen Terrace, Eco-District, Kyoto 604-8001")
    }
    var useWalletPayment by remember { mutableStateOf(walletBalance >= subtotal) }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(24.dp))
                .testTag("checkout_modal"),
            color = BazaarioCream
        ) {
            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Carbon-Neutral Checkout",
                            style = MaterialTheme.typography.headlineMedium,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            color = BazaarioCharcoal
                        )
                        Text(
                            text = "100% Biodegradable & Recyclable Packaging Guarantee",
                            style = MaterialTheme.typography.labelMedium,
                            color = BazaarioEcoGreen
                        )
                    }

                    IconButton(onClick = onClose, modifier = Modifier.testTag("close_checkout_modal")) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = BazaarioCharcoal)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Shipping address input
                Text(
                    text = "Shipping Address",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioCharcoal
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = shippingAddress,
                    onValueChange = { shippingAddress = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("shipping_address_input"),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BazaarioOlive,
                        unfocusedBorderColor = BazaarioBorder
                    ),
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.LocalShipping, contentDescription = null, tint = BazaarioSage)
                    }
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Payment Method selection
                Text(
                    text = "Payment Method",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioCharcoal
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Option 1: Bazaario Wallet
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (useWalletPayment) 2.dp else 1.dp,
                            color = if (useWalletPayment) BazaarioOlive else BazaarioBorder,
                            shape = RoundedCornerShape(16.dp)
                        )
                        .background(if (useWalletPayment) BazaarioLightGray else Color.White)
                        .clickable {
                            if (walletBalance >= subtotal) {
                                useWalletPayment = true
                            }
                        }
                        .padding(14.dp)
                        .testTag("payment_wallet_option"),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AccountBalanceWallet,
                            contentDescription = null,
                            tint = BazaarioOlive,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Bazaario Eco-Wallet",
                                fontWeight = FontWeight.Bold,
                                color = BazaarioCharcoal
                            )
                            Text(
                                text = "Balance: $${String.format("%.2f", walletBalance)}",
                                fontSize = 12.sp,
                                color = if (walletBalance >= subtotal) BazaarioEcoGreen else Color(0xFFC62828)
                            )
                        }
                    }

                    if (useWalletPayment) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(BazaarioOlive),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Option 2: Credit Card
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (!useWalletPayment) 2.dp else 1.dp,
                            color = if (!useWalletPayment) BazaarioOlive else BazaarioBorder,
                            shape = RoundedCornerShape(16.dp)
                        )
                        .background(if (!useWalletPayment) BazaarioLightGray else Color.White)
                        .clickable { useWalletPayment = false }
                        .padding(14.dp)
                        .testTag("payment_card_option"),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CreditCard,
                            contentDescription = null,
                            tint = BazaarioSage,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Credit / Debit Card",
                                fontWeight = FontWeight.Bold,
                                color = BazaarioCharcoal
                            )
                            Text(
                                text = "4242 •••• •••• 4242 (Expires 12/28)",
                                fontSize = 12.sp,
                                color = BazaarioSage
                            )
                        }
                    }

                    if (!useWalletPayment) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(BazaarioOlive),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                HorizontalDivider(color = BazaarioBorder)
                Spacer(modifier = Modifier.height(16.dp))

                // Order summary calculation
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Total Amount", style = MaterialTheme.typography.titleMedium, color = BazaarioCharcoal)
                    Text(
                        text = "$${String.format("%.2f", subtotal)}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioOlive
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Carbon Offset & Delivery", style = MaterialTheme.typography.bodyMedium, color = BazaarioSage)
                    Text(text = "FREE (Carbon-Neutral)", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = BazaarioEcoGreen)
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = { onConfirmOrder(shippingAddress, useWalletPayment) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .testTag("confirm_order_button"),
                    shape = RoundedCornerShape(26.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = BazaarioOlive,
                        contentColor = Color.White
                    )
                ) {
                    Icon(imageVector = Icons.Default.Eco, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Complete Sustainable Order", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    }
}
