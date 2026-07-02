package co.bankme.app

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var offlineLayout: LinearLayout
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    companion object {
        private const val URL = "https://bankme.co.in/app.html"
        private const val UA_SUFFIX = " BankMeApp/2.0"
        private const val CAMERA_PERMISSION_REQUEST = 100
        private const val FILE_CHOOSER_REQUEST = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView       = findViewById(R.id.webview)
        swipeRefresh  = findViewById(R.id.swipe_refresh)
        offlineLayout = findViewById(R.id.offline_layout)
        val retryBtn: Button = findViewById(R.id.retry_button)

        setupWebView()
        requestPermissions()

        if (isOnline()) loadWebsite() else showOffline()

        swipeRefresh.setColorSchemeColors(
            Color.parseColor("#00d4aa"),
            Color.parseColor("#0099ff")
        )
        swipeRefresh.setOnRefreshListener {
            if (isOnline()) webView.reload() else {
                showOffline()
                swipeRefresh.isRefreshing = false
            }
        }

        retryBtn.setOnClickListener {
            if (isOnline()) loadWebsite()
        }
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.setSupportZoom(true)
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mediaPlaybackRequiresUserGesture = false
        settings.setGeolocationEnabled(true)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.userAgentString = settings.userAgentString + UA_SUFFIX

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                swipeRefresh.isRefreshing = true
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                swipeRefresh.isRefreshing = false
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
            }

            override fun onReceivedError(
                view: WebView, errorCode: Int,
                description: String, failingUrl: String
            ) {
                swipeRefresh.isRefreshing = false
                if (errorCode != WebViewClient.ERROR_UNKNOWN) showOffline()
            }

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url.toString()

                // Keep bankme and paype URLs inside WebView
                if (url.contains("bankme.co.in") || url.contains("paype.co.in")) {
                    return false
                }

                // Open deep links in native apps
                if (url.startsWith("whatsapp://") || url.startsWith("tel:")
                    || url.startsWith("mailto:") || url.startsWith("intent:")
                    || url.startsWith("upi:")
                ) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    return true
                }

                // Open external HTTP links in browser
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    return true
                }

                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                request.grant(request.resources)
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String,
                callback: GeolocationPermissions.Callback
            ) {
                callback.invoke(origin, true, false)
            }

            override fun onShowFileChooser(
                webView: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                filePathCallback = callback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf"))
                }
                startActivityForResult(
                    Intent.createChooser(intent, "Select File"),
                    FILE_CHOOSER_REQUEST
                )
                return true
            }

            override fun onProgressChanged(view: WebView, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                if (newProgress == 100) swipeRefresh.isRefreshing = false
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST) {
            val results = if (resultCode == Activity.RESULT_OK && data?.data != null)
                arrayOf(data.data!!) else null
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    private fun loadWebsite() {
        offlineLayout.visibility = View.GONE
        webView.visibility = View.VISIBLE
        webView.loadUrl(URL)
    }

    private fun showOffline() {
        webView.visibility = View.GONE
        offlineLayout.visibility = View.VISIBLE
        swipeRefresh.isRefreshing = false
    }

    private fun isOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = cm.activeNetwork ?: return false
            val caps = cm.getNetworkCapabilities(network) ?: return false
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } else {
            @Suppress("DEPRECATION")
            val netInfo = cm.activeNetworkInfo
            @Suppress("DEPRECATION")
            netInfo != null && netInfo.isConnected
        }
    }

    private fun requestPermissions() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.USE_BIOMETRIC
            ),
            CAMERA_PERMISSION_REQUEST
        )
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
