import { Capacitor } from "@capacitor/core";

/** True when running inside the Capacitor iOS/Android shell (not my.pupchef.ae in a browser). */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
