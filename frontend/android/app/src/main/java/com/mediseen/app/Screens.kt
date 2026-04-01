package com.mediseen.app

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider

@Composable
fun GetStartedScreen(onNext: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primaryContainer)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.splash),
                contentDescription = "Mediseen logo",
                modifier = Modifier.size(160.dp),
                contentScale = ContentScale.Crop
            )
            Text(
                text = I18nState.t("app_tagline"),
                style = MaterialTheme.typography.headlineMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Text(
                text = I18nState.t("app_intro"),
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Button(onClick = onNext, modifier = Modifier.fillMaxWidth()) {
                Text(text = I18nState.t("get_started"))
            }
        }
    }
}

@Composable
fun AuthScreen(
    googleSignInClient: GoogleSignInClient,
    firebaseAuth: FirebaseAuth,
    onAuthenticated: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as ComponentActivity
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selectedMethod by remember { mutableStateOf("google") }
    var isCreatingAccount by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            try {
                val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
                val account = task.getResult(ApiException::class.java)
                val credential = GoogleAuthProvider.getCredential(account.idToken, null)
                isLoading = true
                firebaseAuth.signInWithCredential(credential)
                    .addOnCompleteListener(activity) { authResult ->
                        isLoading = false
                        if (authResult.isSuccessful) {
                            onAuthenticated()
                        } else {
                            error = authResult.exception?.localizedMessage ?: I18nState.t("auth_failed")
                        }
                    }
            } catch (apiException: ApiException) {
                error = apiException.localizedMessage
            }
        } else {
            error = I18nState.t("auth_cancelled")
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = I18nState.t("auth_title"),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        Text(
            text = I18nState.t("auth_subtitle"),
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))
        OutlinedButton(
            onClick = { selectedMethod = "email" },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = I18nState.t("continue_email"))
        }
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedButton(
            onClick = { selectedMethod = "google" },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Google")
        }
        Spacer(modifier = Modifier.height(20.dp))
        if (selectedMethod == "email") {
            if (isCreatingAccount) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text(I18nState.t("name_label")) },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(I18nState.t("email_label")) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(I18nState.t("password_label")) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    error = null
                    isLoading = true
                    val trimmedEmail = email.trim()
                    val request = if (isCreatingAccount) {
                        firebaseAuth.createUserWithEmailAndPassword(trimmedEmail, password)
                    } else {
                        firebaseAuth.signInWithEmailAndPassword(trimmedEmail, password)
                    }
                    request.addOnCompleteListener(activity) { authResult ->
                        isLoading = false
                        if (authResult.isSuccessful) {
                            onAuthenticated()
                        } else {
                            error = authResult.exception?.localizedMessage ?: I18nState.t("auth_failed")
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isCreatingAccount) {
                        I18nState.t("email_submit_sign_up")
                    } else {
                        I18nState.t("email_submit_sign_in")
                    }
                )
            }
            TextButton(
                onClick = {
                    isCreatingAccount = !isCreatingAccount
                    error = null
                }
            ) {
                Text(
                    text = if (isCreatingAccount) {
                        I18nState.t("switch_sign_in")
                    } else {
                        I18nState.t("switch_sign_up")
                    }
                )
            }
        } else {
            OutlinedButton(
                onClick = {
                    error = null
                    launcher.launch(googleSignInClient.signInIntent)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = I18nState.t("continue_google"))
            }
        }
        if (isLoading) {
            Spacer(modifier = Modifier.height(16.dp))
            CircularProgressIndicator()
        }
        error?.let {
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = it, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
        }
    }
}

@Composable
fun LanguageSelectionScreen(onLanguageSelected: (String) -> Unit) {
    val context = LocalContext.current
    val languages = listOf("English", "Hindi")
    val prefs = context.getSharedPreferences("mediseen_prefs", Context.MODE_PRIVATE)
    var selectedLanguage by remember {
        mutableStateOf(
            prefs.getString("preferred_language", languages.first()) ?: languages.first()
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = I18nState.t("choose_language"),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxWidth().height(240.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(languages) { language ->
                val isSelected = language == selectedLanguage
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedLanguage = language }
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                            shape = RoundedCornerShape(12.dp)
                        )
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = language,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
        Button(
            onClick = {
                prefs.edit().putString("preferred_language", selectedLanguage).apply()
                I18nState.currentLanguage = selectedLanguage
                onLanguageSelected(selectedLanguage)
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = I18nState.tf("use_language", selectedLanguage))
        }
    }
}

@Composable
fun DashboardScreen() {
    val metrics = listOf(
        Metric("Heart Rate", "72 bpm", "Resting"),
        Metric("Steps", "8,400", "Goal: 10,000"),
        Metric("Logs", "3 new notes", "AI flagged anomalies"),
        Metric("Hydration", "62%", "Target 70%"),
        Metric("Sleep", "7h 25m", "Deep sleep: 1h 30m"),
        Metric("Recovery", "Fair", "Consistency up 12%")
    )
    val cameraPreview = remember { mutableStateOf<ImageBitmap?>(null) }
    val context = LocalContext.current
    var cameraPermissionError by remember { mutableStateOf<String?>(null) }

    val cameraLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        cameraPreview.value = bitmap?.asImageBitmap()
    }
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            cameraPermissionError = null
            cameraLauncher.launch(null)
        } else {
            cameraPermissionError = I18nState.t("camera_permission_denied")
        }
    }

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = I18nState.tf("hello_speaker", I18nState.currentLanguage),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = I18nState.t("dashboard_intro"),
                style = MaterialTheme.typography.bodyMedium
            )
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = I18nState.t("agent_title"),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = I18nState.t("agent_copy"),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier
                    .height(220.dp)
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(metrics) { metric ->
                    MetricCard(metric = metric)
                }
            }
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = I18nState.t("scan_report"),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = I18nState.t("scan_copy"),
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = {
                                if (ContextCompat.checkSelfPermission(
                                        context,
                                        Manifest.permission.CAMERA
                                    ) == PackageManager.PERMISSION_GRANTED
                                ) {
                                    cameraPermissionError = null
                                    cameraLauncher.launch(null)
                                } else {
                                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                                }
                            }
                        ) {
                            Text(text = I18nState.t("capture"))
                        }
                        cameraPreview.value?.let { bitmap ->
                            Image(
                                bitmap = bitmap,
                                contentDescription = "Scan preview",
                                modifier = Modifier.size(80.dp),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                    cameraPermissionError?.let {
                        Text(
                            text = it,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MetricCard(metric: Metric) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(text = metric.title, fontWeight = FontWeight.Bold)
            Text(text = metric.value, fontSize = 20.sp)
            Text(text = metric.subtitle, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

data class Metric(val title: String, val value: String, val subtitle: String)
