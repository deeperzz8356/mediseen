import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize, AdOptions, RewardAdOptions } from '@capacitor-community/admob';
import { admobConfig } from './firebase';

const TEST_BANNER_ID       = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID     = 'ca-app-pub-3940256099942544/5224354917';

// ─── Frequency cap: track last interstitial shown time ───────────────────────
const INTERSTITIAL_CAP_MS = 5 * 60 * 1000; // 5 minutes
let lastInterstitialTime = 0;

export async function initializeAdMob() {
  try {
    await AdMob.initialize();
    await AdMob.requestTrackingAuthorization();
    console.log('AdMob Initialized');
  } catch (error) {
    console.error('AdMob initialization error:', error);
  }
}

export async function showBanner() {
  try {
    const adId = admobConfig.bannerId || TEST_BANNER_ID;
    const options: BannerAdOptions = {
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 64,
      isTesting: !admobConfig.bannerId,
    };
    await AdMob.showBanner(options);
  } catch (error) {
    console.error('Banner Ad error:', error);
  }
}

export async function hideBanner() {
  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('Hide Banner error:', error);
  }
}

export async function showInterstitial(ignoreCap = false) {
  try {
    const now = Date.now();
    if (!ignoreCap && now - lastInterstitialTime < INTERSTITIAL_CAP_MS) {
      console.log('Interstitial skipped – frequency cap active');
      return;
    }
    const adId = admobConfig.interstitialId || TEST_INTERSTITIAL_ID;
    const options: AdOptions = {
      adId,
      isTesting: !admobConfig.interstitialId,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    lastInterstitialTime = Date.now();
  } catch (error) {
    console.error('Interstitial Ad error:', error);
  }
}

export async function showRewarded(): Promise<boolean> {
  try {
    const adId = (admobConfig as any).rewardedId || TEST_REWARDED_ID;
    const options: RewardAdOptions = {
      adId,
      isTesting: !(admobConfig as any).rewardedId,
    };
    await AdMob.prepareRewardVideoAd(options);
    const result = await AdMob.showRewardVideoAd();
    return !!result;
  } catch (error) {
    console.error('Rewarded Ad error:', error);
    return false;
  }
}
