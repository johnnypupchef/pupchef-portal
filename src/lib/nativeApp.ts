import { Capacitor } from "@capacitor/core";

/** True when running inside the Capacitor iOS/Android shell (not the browser). */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
