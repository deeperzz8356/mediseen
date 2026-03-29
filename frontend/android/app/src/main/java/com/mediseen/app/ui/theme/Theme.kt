package com.mediseen.app.ui.theme

import android.content.res.Configuration
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightColors = lightColorScheme(
    primary = md_theme_light_primary,
    secondary = md_theme_light_secondary,
    tertiary = md_theme_light_tertiary,
    background = md_theme_light_background,
    surface = md_theme_light_surface,
    outline = md_theme_light_outline,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onSurface = Color.Black,
    onBackground = Color.Black
)

private val DarkColors = darkColorScheme(
    primary = md_theme_dark_primary,
    secondary = md_theme_dark_secondary,
    tertiary = md_theme_dark_tertiary,
    background = md_theme_dark_background,
    surface = md_theme_dark_surface,
    outline = md_theme_dark_outline,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onSurface = Color.White,
    onBackground = Color.White
)

@Composable
fun MediseenTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val isNightMode = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK ==
        Configuration.UI_MODE_NIGHT_YES
    val colorScheme = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
        if (isNightMode) {
            dynamicDarkColorScheme(context)
        } else {
            dynamicLightColorScheme(context)
        }
    } else {
        if (isNightMode) DarkColors else LightColors
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = MediseenTypography,
        content = content
    )
}
