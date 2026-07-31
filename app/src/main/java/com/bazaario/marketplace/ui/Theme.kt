package com.bazaario.marketplace.ui

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

val BazaarioCream = Color(0xFFFDFCF8)
val BazaarioOlive = Color(0xFF5A5A40)
val BazaarioOliveDark = Color(0xFF484833)
val BazaarioCharcoal = Color(0xFF3D3D35)
val BazaarioSage = Color(0xFF6B705C)
val BazaarioGold = Color(0xFFD4C8BA)
val BazaarioBorder = Color(0xFFE0D8CC)
val BazaarioLightGray = Color(0xFFF5F2EC)
val BazaarioEcoGreen = Color(0xFF2E7D32)
val BazaarioEcoBackground = Color(0xFFE8F5E9)

private val LightColorScheme = lightColorScheme(
    primary = BazaarioOlive,
    onPrimary = Color.White,
    primaryContainer = BazaarioLightGray,
    onPrimaryContainer = BazaarioCharcoal,
    secondary = BazaarioSage,
    onSecondary = Color.White,
    background = BazaarioCream,
    onBackground = BazaarioCharcoal,
    surface = Color.White,
    onSurface = BazaarioCharcoal,
    outline = BazaarioBorder
)

private val AppTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        color = BazaarioCharcoal
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        color = BazaarioCharcoal
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        color = BazaarioCharcoal
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        color = BazaarioCharcoal
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        color = BazaarioCharcoal
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        color = BazaarioCharcoal
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        color = BazaarioSage
    )
)

private val AppShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp)
)

@Composable
fun BazaarioTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = AppTypography,
        shapes = AppShapes,
        content = content
    )
}
