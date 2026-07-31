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
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SupervisedUserCircle
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
import com.bazaario.marketplace.model.AdminMetricCard
import com.bazaario.marketplace.ui.BazaarioBorder
import com.bazaario.marketplace.ui.BazaarioCharcoal
import com.bazaario.marketplace.ui.BazaarioEcoGreen
import com.bazaario.marketplace.ui.BazaarioLightGray
import com.bazaario.marketplace.ui.BazaarioOlive
import com.bazaario.marketplace.ui.BazaarioSage

@Composable
fun AdminConsoleView(
    metrics: List<AdminMetricCard>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("admin_console"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Platform Governance & Eco-Compliance",
                    style = MaterialTheme.typography.headlineMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = BazaarioCharcoal
                )
                Text(
                    text = "Monitor overall marketplace sustainability index, vendor audits, and GMV growth.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = BazaarioSage
                )
            }
        }

        // Metrics Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val chunks = metrics.chunked(2)
                chunks.forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        pair.forEach { metric ->
                            AdminMetricTile(metric = metric, modifier = Modifier.weight(1f))
                        }
                        if (pair.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        // Eco Compliance Audit Banner
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(BazaarioOlive)
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Eco, contentDescription = null, tint = Color.White, modifier = Modifier.size(26.dp))
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = "Carbon-Neutral Marketplace Policy",
                            style = MaterialTheme.typography.titleLarge,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "All listed products require a minimum sustainability score of 80/100. Verified audits run automatically every 30 days.",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.88f)
                        )
                    }
                }
            }
        }

        // Cross-Platform Backend & Database Sync Monitor
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, BazaarioBorder)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Unified Cloud DB & Web/App Sync",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = BazaarioCharcoal
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(BazaarioEcoGreen, shape = androidx.compose.foundation.shape.CircleShape)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Synced (api.bazaario.eco)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BazaarioEcoGreen
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Real-time bi-directional synchronization is active between Bazaario Web Storefront (Vite/React), Android Native App, and Kyoto Craft Studio Vendor DB.",
                        style = MaterialTheme.typography.bodySmall,
                        color = BazaarioSage
                    )
                }
            }
        }

        // Platform Audits Checklist
        item {
            Text(
                text = "Active Compliance Checklists",
                style = MaterialTheme.typography.titleLarge,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                color = BazaarioCharcoal
            )
        }

        items(
            listOf(
                "Vendor Kyoto Craft Studio: 100% organic ash glaze certified (Verified)" to true,
                "Aurora Atelier: European flax organic traceability doc approved (Verified)" to true,
                "Sonosense Audio: FSC Bamboo earcups sustainability inspection (Verified)" to true,
                "EarthFirst Collective: Zero-waste brass razor longevity test (Verified)" to true
            )
        ) { (itemText, isPassed) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, BazaarioBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Passed",
                        tint = BazaarioEcoGreen,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = itemText,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = BazaarioCharcoal
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

@Composable
fun AdminMetricTile(
    metric: AdminMetricCard,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, BazaarioBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = metric.title,
                style = MaterialTheme.typography.labelMedium,
                color = BazaarioSage
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = metric.value,
                style = MaterialTheme.typography.titleLarge,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                color = BazaarioCharcoal
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = metric.change,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (metric.isPositive) BazaarioEcoGreen else Color(0xFFC62828)
            )
        }
    }
}
