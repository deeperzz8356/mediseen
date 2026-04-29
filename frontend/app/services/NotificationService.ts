import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  async requestPermissions() {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    return true;
  },

  async scheduleRepeatingNotifications() {
    // Clear existing notifications first to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const tips = [
      "Stay hydrated! Drinking water is key to good health.",
      "Time for a quick checkup? Scan your reports with MediSeen.",
      "Eating balanced meals helps maintain your energy levels.",
      "Don't forget to take a break and stretch today.",
      "Knowledge is power. Read about common health conditions in our Library.",
      "Early detection saves lives. Regular screenings are important.",
      "Your mental health matters. Take a moment for mindfulness today."
    ];

    const notifications = [];
    const now = new Date();

    // Schedule for the next 48 hours, every 5 hours
    for (let i = 1; i <= 10; i++) {
      const scheduledTime = new Date(now.getTime() + i * 5 * 60 * 60 * 1000);
      notifications.push({
        title: "MediSeen Health Tip",
        body: tips[Math.floor(Math.random() * tips.length)],
        id: 100 + i,
        schedule: { 
          at: scheduledTime,
          allowWhileIdle: true 
        },
        extra: { data: 'health-tip' }
      });
    }

    // Also add one daily repeating one as a fallback
    notifications.push({
      title: "MediSeen Daily Reminder",
      body: "Keep track of your health journey with MediSeen.",
      id: 1,
      schedule: { 
        every: 'day' as any,
        allowWhileIdle: true 
      }
    });

    await LocalNotifications.schedule({ notifications });
    console.log("Notifications scheduled successfully");
  }
};
