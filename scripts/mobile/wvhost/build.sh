#!/usr/bin/env bash
# Build, sign and install the WebView host used by `npm run mobile:webview`.
#
#   scripts/mobile/wvhost/build.sh            # build + install
#   scripts/mobile/wvhost/build.sh --build    # build only
#
# Needs the Android SDK (build-tools >= 35, any platform >= 33) and a JDK.
# The APK is debug-signed with the standard Android debug keystore, which is
# created if it does not exist. Nothing here touches the product build.
set -euo pipefail

SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
BT="$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)"
AJ="$(ls -d "$SDK"/platforms/android-* | sort -V | tail -1)/android.jar"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${TMPDIR:-/tmp}/valice-wvhost"
KS="$HOME/.android/debug.keystore"

rm -rf "$OUT"; mkdir -p "$OUT/classes"

javac -source 8 -target 8 -bootclasspath "$AJ" -classpath "$AJ" \
      -d "$OUT/classes" "$HERE"/src/press/valice/wvhost/*.java 2>&1 \
  | grep -v 'bootstrap class path\|source value 8\|target value 8\|deprecat' || true

"$BT/d8" --min-api 21 --output "$OUT" "$OUT"/classes/press/valice/wvhost/*.class
"$BT/aapt" package -f -M "$HERE/AndroidManifest.xml" -I "$AJ" -F "$OUT/base.apk"
( cd "$OUT" && "$BT/aapt" add base.apk classes.dex >/dev/null )

if [ ! -f "$KS" ]; then
  mkdir -p "$(dirname "$KS")"
  keytool -genkeypair -keystore "$KS" -storepass android -keypass android \
          -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
          -dname "CN=Android Debug,O=Android,C=US"
fi

"$BT/zipalign" -f 4 "$OUT/base.apk" "$OUT/aligned.apk"
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android \
                --ks-key-alias androiddebugkey --out "$OUT/wvhost.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify "$OUT/wvhost.apk"
echo "built $OUT/wvhost.apk"

[ "${1:-}" = "--build" ] && exit 0
"${ADB_BIN:-$SDK/platform-tools/adb}" install -r "$OUT/wvhost.apk"
echo "installed press.valice.wvhost — remove with: npm run mobile:webview -- --uninstall"
