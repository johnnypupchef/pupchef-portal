# Mobile app setup — checklist (keep in sync with onboarding)

Use this list in order. Details: [`MOBILE_APP.md`](./MOBILE_APP.md).

1. **Pull + install** — In `pupchef-portal`: `git pull origin main` and `npm install`.
2. **Build + sync** — After any web change you want in the app: `npm run mobile:build` (runs `vite build` + `cap sync`).
3. **Android** — Install Android Studio (JDK as needed). Run `npm run mobile:android`, pick emulator or device, run.
4. **iOS (Mac)** — Install **Xcode** from App Store. Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`. Install **CocoaPods** (`brew install cocoapods`). First time only: `cd ios/App && pod install && cd ../..`. Run `npm run mobile:ios`; open **`App.xcworkspace`** if opening manually.
5. **Shipping** — Apple Developer + Google Play accounts, icons/splash, privacy copy, signing (later).

**Note:** `cap sync` needs full Xcode + `pod install` for iOS on a given machine; Android can work without Xcode.
