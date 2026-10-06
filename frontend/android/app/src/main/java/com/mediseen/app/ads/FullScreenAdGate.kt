package com.mediseen.app.ads

import android.app.Activity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import java.util.concurrent.atomic.AtomicBoolean

/** Prevents interstitial, rewarded, and app-open formats from overlapping. */
internal object FullScreenAdGate {
    private val inUse = AtomicBoolean(false)

    @Volatile
    private var suppressedUntilMillis = 0L

    fun tryAcquire(): Boolean {
        if (System.currentTimeMillis() < suppressedUntilMillis) return false
        return inUse.compareAndSet(false, true)
    }

    fun release(suppressForMillis: Long = 30_000L) {
        suppressedUntilMillis = System.currentTimeMillis() + suppressForMillis
        inUse.set(false)
    }

    fun isAvailable(): Boolean = !inUse.get() && System.currentTimeMillis() >= suppressedUntilMillis
}

internal fun Activity.isReadyForFullScreenAd(): Boolean =
    !isFinishing &&
        !isDestroyed &&
        (this as? LifecycleOwner)?.lifecycle?.currentState?.isAtLeast(Lifecycle.State.RESUMED) == true
