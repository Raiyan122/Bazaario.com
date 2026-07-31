package com.bazaario.marketplace.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import androidx.compose.ui.unit.sp
import com.bazaario.marketplace.model.OrderEntity
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioEcoGreen
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun OrdersView(
    orders: List<OrderEntity>,
    onExploreCatalog: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 16.dp)
            .testTag("orders_view"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "My Order History",
                    style = MaterialTheme.typography.headlineMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioCharcoal
                )
                Text(
                    text = "Track your sustainable shipments and carbon-neutral deliveries.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = BazaarioSage
                )
            }
        }

        if (orders.isEmpty()) {
            item {
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
                        imageVector = Icons.Default.ShoppingBag,
                        contentDescription = null,
                        tint = BazaarioSage,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "You have no orders yet",
                        style = MaterialTheme.typography.titleLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioCharcoal
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Every purchase supports artisan livelihoods and awards 5% Eco-Cashback.",
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
                        Text("Explore Catalog")
                    }
                }
            }
        } else {
            items(orders, key = { it.id }) { order ->
                OrderCard(order = order)
            }
        }

        item {
            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

@Composable
fun OrderCard(order: OrderEntity) {
    val (statusColor, statusIcon) = when (order.status.lowercase()) {
        "delivered" -> BazaarioEcoGreen to Icons.Default.CheckCircle
        "shipped" -> Color(0xFF1E88E5) to Icons.Default.LocalShipping
        else -> Color(0xFFF59E0B) to Icons.Default.Schedule
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("order_card_${order.id}"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BazaarioBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Top row: ID, Date, Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Order #${order.id}",
                        style = MaterialTheme.typography.titleLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioCharcoal
                    )
                    Text(
                        text = "Placed on ${order.dateString}",
                        style = MaterialTheme.typography.labelMedium,
                        color = BazaarioSage
                    )
                }

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(statusColor.copy(alpha = 0.12f))
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = statusIcon,
                        contentDescription = order.status,
                        tint = statusColor,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = order.status,
                        color = statusColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Items summary
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(BazaarioLightGray)
                    .padding(14.dp)
            ) {
                Column {
                    Text(
                        text = "${order.itemCount} items in shipment:",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioCharcoal
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = order.itemsSummary,
                        style = MaterialTheme.typography.bodyMedium,
                        color = BazaarioCharcoal.copy(alpha = 0.88f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Footer: Total & Eco-Cashback badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Total Paid: ",
                        style = MaterialTheme.typography.bodyMedium,
                        color = BazaarioSage
                    )
                    Text(
                        text = "$${String.format("%.2f", order.totalAmount)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = BazaarioOlive
                    )
                }

                Text(
                    text = "+$${String.format("%.2f", order.totalAmount * 0.05)} Eco-Cashback earned",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioEcoGreen
                )
            }
        }
    }
}
