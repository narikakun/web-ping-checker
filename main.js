function updateWithFade(el, val) {
    el.classList.remove("show");
    setTimeout(() => {
        el.textContent = val;
        el.classList.add("show");
    }, 100);
}

async function fetchIPsAndHosts() {
    try {
        const ipv4 = await fetch("https://ipv4.nakn.jp/").then(r => r.text());
        updateWithFade(document.getElementById("ipv4"), ipv4.trim());
        await fetchHostname(ipv4.trim(), "host4");
        await fetchGeolocation(ipv4.trim());
    } catch {
        updateWithFade(document.getElementById("ipv4"), "取得失敗");
        updateWithFade(document.getElementById("host4"), "取得失敗");
    }

    try {
        const ipv6 = await fetch("https://ipv6.nakn.jp/").then(r => r.text());
        updateWithFade(document.getElementById("ipv6"), ipv6.trim());
        await fetchHostname(ipv6.trim(), "host6");
    } catch {
        updateWithFade(document.getElementById("ipv6"), "取得失敗");
        updateWithFade(document.getElementById("host6"), "取得失敗");
    }
}

async function fetchHostname(ip, targetId) {
    try {
        const res = await fetch(`https://api-v3-jp.nakn.jp/ipreverse/${ip}`);
        const data = await res.json();
        if (data.status === "success") {
            updateWithFade(document.getElementById(targetId), `${data.ip}`);
        } else {
            updateWithFade(document.getElementById(targetId), "不明");
        }
    } catch {
        updateWithFade(document.getElementById(targetId), "取得失敗");
    }
}

async function fetchGeolocation(ip) {
    try {
        const res = await fetch(`https://geolocation-api.nakn.jp/${ip}`);
        const data = await res.json();
        if (data.org) {
            updateWithFade(document.getElementById("org"), `${data.org}`);
        } else {
            updateWithFade(document.getElementById("org"), "不明");
        }
        if (data.asname) {
            updateWithFade(document.getElementById("as"), `${data.asname}`);
        } else {
            updateWithFade(document.getElementById("as"), "不明");
        }
        if (data.as) {
            updateWithFade(document.getElementById("asn"), `${data.as}`);
        } else {
            updateWithFade(document.getElementById("asn"), "");
        }
        if (data.country) {
            updateWithFade(document.getElementById("region"), `${data.country || ""} ${data.regionName || ""}`);
        } else {
            updateWithFade(document.getElementById("region"), "不明");
        }
    } catch {
        updateWithFade(document.getElementById(targetId), "取得失敗");
    }
}

function setPingColor(el, ms) {
    el.style.color = ms < 50 ? "var(--success)"
        : ms < 150 ? "var(--warning)"
            : "var(--error)";
}

async function measurePing(url, el) {
    const start = performance.now();
    try {
        await fetch(url, { mode: "no-cors", method: "HEAD" });
        const end = performance.now();
        const ping = Math.round(end - start);
        setPingColor(el, ping);
        updateWithFade(el, ping + " ms");
    } catch {
        el.style.color = "var(--error)";
        updateWithFade(el, "タイムアウト");
    }
}

// === 全更新 ===
function refreshAll() {
    fetchIPsAndHosts();
    measurePing("https://8.8.8.8", document.getElementById("ping4"));
}

let refreshInterval = 5; // 秒
let countdown = refreshInterval;
let countdownTimer;

function startAutoRefresh() {
    const btn = document.getElementById("refreshBtn");
    btn.textContent = `更新 (${countdown})`;

    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        countdown--;
        btn.textContent = `更新 (${countdown})`;

        if (countdown <= 0) {
            countdown = refreshInterval;
            refreshAll();
        }
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("refreshBtn");

    btn.addEventListener("click", () => {
        countdown = refreshInterval;
        refreshAll();
        startAutoRefresh();
    });

    document.querySelectorAll(".fade-update").forEach(el => el.classList.add("show"));
    refreshAll();
    startAutoRefresh();
});
