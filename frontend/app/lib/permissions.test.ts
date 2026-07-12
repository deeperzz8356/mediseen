import { requestGalleryPermission } from "./permissions";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";

// Mock Capacitor and Camera
jest.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: jest.fn(),
    getPlatform: jest.fn(),
  },
  registerPlugin: jest.fn(() => ({})),
}));

jest.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    checkPermissions: jest.fn(),
    requestPermissions: jest.fn(),
  }
}));

jest.mock("@capacitor/camera", () => ({
  Camera: {
    checkPermissions: jest.fn(),
    requestPermissions: jest.fn(),
  },
}));

describe("requestGalleryPermission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup: Native Android device
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
    (Capacitor.getPlatform as jest.Mock).mockReturnValue("android");
    
    // Mock userAgent for Android 13 (so it doesn't skip permission like Android 14+ does)
    Object.defineProperty(global.navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36",
      configurable: true,
    });
  });

  it("should directly call Camera.requestPermissions for photos when permission is not granted", async () => {
    // Arrange: Mock the initial permission check to return 'prompt' (meaning it's not granted yet)
    (Camera.checkPermissions as jest.Mock).mockResolvedValue({
      photos: "prompt",
    });

    // Arrange: Mock the actual request to return 'granted'
    (Camera.requestPermissions as jest.Mock).mockResolvedValue({
      photos: "granted",
    });

    // Act
    const result = await requestGalleryPermission();

    // Assert: Verify checkPermissions was called
    expect(Camera.checkPermissions).toHaveBeenCalled();
    
    // Assert: Verify requestPermissions was called specifically for "photos"
    expect(Camera.requestPermissions).toHaveBeenCalledWith({
      permissions: ["photos"],
    });

    // Assert: Verify the result format
    expect(result).toEqual({ granted: true, permanentlyDenied: false });
  });

  it("should not ask for permission again if already granted", async () => {
    // Arrange: Mock the initial permission check to already be 'granted'
    (Camera.checkPermissions as jest.Mock).mockResolvedValue({
      photos: "granted",
    });

    // Act
    const result = await requestGalleryPermission();

    // Assert: Verify checkPermissions was called
    expect(Camera.checkPermissions).toHaveBeenCalled();
    
    // Assert: Verify requestPermissions was NOT called
    expect(Camera.requestPermissions).not.toHaveBeenCalled();

    // Assert: Verify the result format
    expect(result).toEqual({ granted: true, permanentlyDenied: false });
  });
});
