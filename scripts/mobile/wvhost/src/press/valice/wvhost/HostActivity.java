package press.valice.wvhost;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

/**
 * A deliberately minimal Android System WebView host.
 *
 * WHY IT EXISTS
 * Phase 9 requires an in-app-browser check. No app on the reference device
 * exposes a debuggable WebView, so there was nothing to attach CDP to. This
 * host is the smallest thing that makes the real WebView observable: it turns
 * on WebView contents debugging, renders one full-bleed WebView with no browser
 * chrome at all, and loads whatever URL the launching intent carries.
 *
 * Deliberately NOT configured: no forced dark mode, no custom user agent, no
 * zoom controls, no desktop-mode override. The point is to observe the WebView
 * defaults an ordinary in-app browser would give the site, not a tuned one.
 */
public class HostActivity extends Activity {
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    WebView.setWebContentsDebuggingEnabled(true);
    WebView w = new WebView(this);
    WebSettings s = w.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    w.setWebViewClient(new WebViewClient());
    setContentView(w, new ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    w.loadUrl(url(getIntent()));
  }

  @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); recreate(); }

  private String url(Intent i) {
    Uri d = i != null ? i.getData() : null;
    if (d != null) return d.toString();
    String e = i != null ? i.getStringExtra("url") : null;
    return e != null ? e : "about:blank";
  }
}
