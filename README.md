# Encrypt & Decrypt (Ionic + Capacitor)

Midterm mobile app: encrypt and decrypt text with Caesar cipher or AES-GCM.

## Run in browser

```bash
npm start
```

Open http://localhost:4200

## Android (local)

```bash
npm run build:mobile
npx cap open android
```

Build a debug APK:

```bash
cd android
./gradlew assembleDebug
```

APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

On every push to `main`, the workflow **Build Android APK** builds a debug APK and uploads it as an artifact named `encrypt-decrypt-debug`.

Download it from the Actions run → Artifacts.

## Note (Windows path)

If your folder name contains `&` (for example `Encrypt&Decrypt`), use a drive subst or rename the folder before running Capacitor locally. CI on GitHub is unaffected.
