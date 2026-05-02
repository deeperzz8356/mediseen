import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize, AdOptions } from '@capacitor-community/admob';
import { admobConfig } from './firebase';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

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
      margin: 64, // Adjust this to be above the bottom navbar (approx 64px)
      isTesting: !admobConfig.bannerId,
    };
    await AdMob.showBanner(options);
    console.log('Banner Ad shown');
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

export async function showInterstitial() {
  try {
    const adId = admobConfig.interstitialId || TEST_INTERSTITIAL_ID;
    const options: AdOptions = {
      adId,
      isTesting: !admobConfig.interstitialId,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    console.log('Interstitial Ad shown');
  } catch (error) {
    console.error('Interstitial Ad error:', error);
  }
}
