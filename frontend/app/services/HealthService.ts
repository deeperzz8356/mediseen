"use client"

import { Capacitor } from '@capacitor/core';

// We define the interface for Health Connect data
export interface HealthData {
  sleepHours: number;
  steps: number;
  caloriesBurned: number;
  activityTime: number; // in minutes
}

class HealthService {
  private isConnected = false;

  async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
      console.warn("Health Connect is only available on native Android.");
      this.isConnected = true;
      return true;
    }

    try {
      // @ts-ignore
      const { HealthConnect } = await import('@capacitor/core').then(m => ({ 
        HealthConnect: (window as any).Capacitor?.Plugins?.HealthConnect 
      }));
      
      if (!HealthConnect) {
        console.error("HealthConnect plugin not found on window.Capacitor");
        return false;
      }

      const availability = await HealthConnect.checkAvailability();
      if (availability.status !== 1) { // 1 = SDK_AVAILABLE
        console.error("Health Connect SDK not available");
        return false;
      }

      const result = await HealthConnect.requestPermissions();
      this.isConnected = result.granted;
      return result.granted;
    } catch (error) {
      console.error("Error requesting health permissions:", error);
      return false;
    }
  }

  async fetchRealTimeData(): Promise<HealthData> {
    if (!this.isConnected) {
      throw new Error("Device not synced. Please connect first.");
    }

    if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
      // Simulate real-time data fetching for development
      return {
        sleepHours: 6.5 + (Math.random() * 1.5),
        steps: 8432 + Math.floor(Math.random() * 100),
        caloriesBurned: 1850 + Math.floor(Math.random() * 200),
        activityTime: 45 + Math.floor(Math.random() * 5),
      };
    }

    try {
      // @ts-ignore
      const { HealthConnect } = await import('@capacitor/core').then(m => ({ 
        HealthConnect: (window as any).Capacitor?.Plugins?.HealthConnect 
      }));
      
      if (!HealthConnect) throw new Error("HealthConnect plugin not found");

      const data = await HealthConnect.fetchHealthData();
      
      return {
        sleepHours: data.sleepHours || 0,
        steps: data.steps || 0,
        caloriesBurned: data.caloriesBurned || 0,
        activityTime: data.activityTime || 45, // Fallback if not tracked
      };
    } catch (error) {
      console.error("Error fetching health data from native bridge:", error);
      throw error;
    }
  }

  getSyncStatus(): boolean {
    return this.isConnected;
  }
}

export const healthService = new HealthService();
