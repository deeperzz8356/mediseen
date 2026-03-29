package com.mediseen.app

import android.content.Context.MODE_PRIVATE
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import com.mediseen.app.ui.theme.MediseenTheme

class MainActivity : ComponentActivity() {
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var googleSignInClient: GoogleSignInClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        firebaseAuth = FirebaseAuth.getInstance()
        val webClientId = getString(R.string.default_web_client_id)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(webClientId)
            .requestEmail()
            .build()

        googleSignInClient = GoogleSignIn.getClient(this, gso)
        val windowSizeClass = calculateWindowSizeClass(this)

        setContent {
            MediseenTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    MainNav(
                        googleSignInClient = googleSignInClient,
                        firebaseAuth = firebaseAuth,
                        windowSizeClass = windowSizeClass
                    )
                }
            }
        }
    }
}

@Composable
fun MainNav(
    googleSignInClient: GoogleSignInClient,
    firebaseAuth: FirebaseAuth,
    windowSizeClass: WindowSizeClass
) {
    val navController = rememberNavController()
    val context = navController.context

    LaunchedEffect(Unit) {
        val prefs = context.getSharedPreferences("mediseen_prefs", MODE_PRIVATE)
        I18nState.currentLanguage = prefs.getString("preferred_language", "English") ?: "English"
    }

    NavHost(navController = navController, startDestination = "language") {
        composable("language") {
            LanguageSelectionScreen(onLanguageSelected = { language ->
                I18nState.currentLanguage = language
                navController.navigate("get_started")
            })
        }
        composable("get_started") {
            GetStartedScreen(onNext = {
                navController.navigate("auth")
            })
        }
        composable("auth") {
            AuthScreen(
                googleSignInClient = googleSignInClient,
                firebaseAuth = firebaseAuth,
                onAuthenticated = {
                    navController.navigate("dashboard") {
                        popUpTo("language") { inclusive = false }
                    }
                }
            )
        }
        composable("dashboard") {
            DashboardScreen(windowSizeClass)
        }
    }
}
