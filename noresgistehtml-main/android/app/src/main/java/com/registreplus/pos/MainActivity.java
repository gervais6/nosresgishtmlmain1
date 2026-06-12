package com.registreplus.pos;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private WizarPOSBridge posBridge;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create WebView programmatically
        webView = new WebView(this);
        setContentView(webView);

        // WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Disable page caching for development
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Keep app in webview
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Initialize and bind bridge
        posBridge = new WizarPOSBridge(this, webView);
        webView.addJavascriptInterface(posBridge, "WizarPOSBridge");

        // Load URL (Change this to your local Next.js IP address during dev)
        // By default, loads localhost (10.0.2.2 is host loopback for emulator) or production URL
        webView.loadUrl("http://10.0.2.2:3000/login");
    }

    @Override
    protected void onDestroy() {
        if (posBridge != null) {
            posBridge.closeDevices();
        }
        super.onDestroy();
    }
}
