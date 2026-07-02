package co.bankme.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.*;
import android.widget.LinearLayout;
import android.widget.Button;
import android.graphics.Color;
import android.content.Context;
import android.webkit.ValueCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout offlineLayout;
    private ValueCallback<Uri[]> filePathCallback;

    // ── App URL ──
    private static final String URL     = "https://bankme.co.in/app.html";
    private static final String UA_SUFFIX = " BankMeApp/2.0";
    private static final int    CAMERA_PERMISSION_REQUEST = 100;
    private static final int    FILE_CHOOSER_REQUEST      = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView       = findViewById(R.id.webview);
        swipeRefresh  = findViewById(R.id.swipe_refresh);
        offlineLayout = findViewById(R.id.offline_layout);
        Button retryBtn = findViewById(R.id.retry_button);

        setupWebView();
        requestPermissions();

        if (isOnline()) {
            loadWebsite();
        } else {
            showOffline();
        }

        swipeRefresh.setColorSchemeColors(
            Color.parseColor("#00d4aa"),
            Color.parseColor("#0099ff")
        );
        swipeRefresh.setOnRefreshListener(() -> {
            if (isOnline()) {
                webView.reload();
            } else {
                showOffline();
                swipeRefresh.setRefreshing(false);
            }
        });

        retryBtn.setOnClickListener(v -> {
            if (isOnline()) loadWebsite();
        });
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setGeolocationEnabled(true);
        settings.setUserAgentString(settings.getUserAgentString() + UA_SUFFIX);

        // Enable mixed content for API calls
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                swipeRefresh.setRefreshing(true);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
                offlineLayout.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode,
                                        String description, String failingUrl) {
                swipeRefresh.setRefreshing(false);
                if (errorCode != ERROR_UNKNOWN) showOffline();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view,
                                                    WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Keep bankme and paype URLs inside webview
                if (url.contains("bankme.co.in") || url.contains("paype.co.in")) {
                    return false;
                }

                // Open WhatsApp, tel, mailto, intent in native apps
                if (url.startsWith("whatsapp://") || url.startsWith("tel:")
                        || url.startsWith("mailto:") || url.startsWith("intent:")
                        || url.startsWith("upi:")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }

                // Open other HTTP links in external browser
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                }

                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Grant camera, mic, etc. for OTP/KYC features
                request.grant(request.getResources());
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onShowFileChooser(WebView webView,
                                             ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                filePathCallback = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                String[] mimeTypes = {"image/*", "application/pdf"};
                intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
                startActivityForResult(
                    Intent.createChooser(intent, "Select File"),
                    FILE_CHOOSER_REQUEST
                );
                return true;
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (newProgress == 100) {
                    swipeRefresh.setRefreshing(false);
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    results = new Uri[]{data.getData()};
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        }
    }

    private void loadWebsite() {
        offlineLayout.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(URL);
    }

    private void showOffline() {
        webView.setVisibility(View.GONE);
        offlineLayout.setVisibility(View.VISIBLE);
        swipeRefresh.setRefreshing(false);
    }

    private boolean isOnline() {
        ConnectivityManager cm = (ConnectivityManager)
            getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo netInfo = cm.getActiveNetworkInfo();
        return netInfo != null && netInfo.isConnected();
    }

    private void requestPermissions() {
        String[] permissions = {
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.USE_BIOMETRIC,
        };
        ActivityCompat.requestPermissions(this, permissions, CAMERA_PERMISSION_REQUEST);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
