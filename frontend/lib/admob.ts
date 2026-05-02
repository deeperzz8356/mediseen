import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize, AdOptions } from '@capacitor-community/admob';

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
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 64, // Adjust this to be above the bottom navbar (approx 64px)
      isTesting: true,
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
    const options: AdOptions = {
      adId: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial ID
      isTesting: true,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    console.log('Interstitial Ad shown');
  } catch (error) {
    console.error('Interstitial Ad error:', error);
  }
}
