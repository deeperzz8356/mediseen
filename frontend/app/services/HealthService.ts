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
    if (!Capacitor.isNativePlatform()) {
      console.warn("Health Connect is only available on native Android.");
      // Simulate connection for web/dev
      this.isConnected = true;
      return true;
    }

    try {
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Error requesting health permissions:", error);
      return false;
    }
  }

  async fetchRealTimeData(): Promise<HealthData> {
    if (!this.isConnected) {
      throw new Error("Device not synced. Please connect first.");
    }

    if (!Capacitor.isNativePlatform()) {
      // Simulate real-time data fetching for development
      return {
        sleepHours: 6.5 + (Math.random() * 1.5),
        steps: 8432 + Math.floor(Math.random() * 100),
        caloriesBurned: 1850 + Math.floor(Math.random() * 200),
        activityTime: 45 + Math.floor(Math.random() * 5),
      };
    }

    try {
      // Real implementation would fetch from Health Connect API
      // Example: const steps = await HealthConnect.getSteps({ ... });
      
      // For the hackathon demo, we provide a sophisticated mock that 
      // mimics the response structure of a real health plugin
      return {
        heartRate: 72, 
        steps: 8432,
        oxygenLevel: 98,
        activityTime: 45,
      };
    } catch (error) {
      console.error("Error fetching health data:", error);
      throw error;
    }
  }

  getSyncStatus(): boolean {
    return this.isConnected;
  }
}

export const healthService = new HealthService();
