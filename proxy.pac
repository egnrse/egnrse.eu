// proxy file for firefox
// by egnrse

// Activate under:
// Network Settings > Automatic proxy configuration URL: https://www.egnrse.eu/proxy.pac

function FindProxyForURL(url, host) {
	// proxy .i2p domains through i2p
	if (dnsDomainIs(host, ".i2p")) {
		return "PROXY 127.0.0.1:4444";
	}
	// everything else connects directly
	return "DIRECT";
}

// Also See:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_PAC_file
