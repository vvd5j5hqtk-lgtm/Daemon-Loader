// ==UserScript==
// @name         ! ! Daemon Licence Premium v3
// @namespace    https://discord.com/invite/hRXJn97Keu
// @version      3.0.0
// @description  Advanced Crypto-Protected Loader for Moomoo.io
// @author       Bextiyar
// @match        *://*.moomoo.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      weathered-glade-61ab.sfzhr2sxgg.workers.dev
// @updateURL    https://github.com/vvd5j5hqtk-lgtm/Daemon-Loader/raw/refs/heads/main/daemon-loader.user.js
// @downloadURL  https://github.com/vvd5j5hqtk-lgtm/Daemon-Loader/raw/refs/heads/main/daemon-loader.user.js
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';

    const SERVER_URL = "https://weathered-glade-61ab.sfzhr2sxgg.workers.dev/";

    // =========================================================================
    // 1. ANTI-MONKEY-PATCHING (ORİJİNALLIQ YOXLAMASI)
    // =========================================================================
    // Hackerlərin fetch, atob və ya JSON.parse funksiyalarını saxtalaşdırmasını əngəlləyir.
    function verifyNativeFunctions() {
        const natives = [window.fetch, window.atob, JSON.parse, Function.prototype.toString];
        for (let fn of natives) {
            if (typeof fn !== 'function' || !Function.prototype.toString.call(fn).includes('[native code]')) {
                alert("Daemon Security: Tampering detected! Native functions modified.");
                window.location.href = "about:blank";
                return false;
            }
        }
        return true;
    }

    if (!verifyNativeFunctions()) return;

    // =========================================================================
    // 2. DEEP FINGERPRINT ENGINE (DAEMON ID YARADILMASI)
    // =========================================================================
    // Bu funksiya yalnız Canvas yox, həm də WebGL (Qrafik Kart) və Audio mühərrikindən data çəkir.
    function generateDeepFingerprint() {
        let savedFP = GM_getValue('daemon_v3_fp');
        if (savedFP) return savedFP;

        let components = [];

        // A. Ekran və Prosessor detalları
        components.push(screen.width + "x" + screen.height);
        components.push(navigator.hardwareConcurrency || 4);
        components.push(navigator.deviceMemory || 4);

        // B. Canvas Render Detalları
        try {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.textBaseline = "top";
            ctx.font = "16px 'Arial' 3D";
            ctx.fillStyle = "#f60"; ctx.fillRect(10, 10, 50, 50);
            ctx.fillStyle = "#069"; ctx.fillText("Daemonv3-Sec-Alpha", 5, 5);
            components.push(canvas.toDataURL());
        } catch(e) {}

        // C. WebGL (Qrafik Kartın unikal ID-si) - Əvvəlki çökmə problemini həll edən əsas bənd
        try {
            let canvasWebgl = document.createElement('canvas');
            let gl = canvasWebgl.getContext('webgl') || canvasWebgl.getContext('experimental-webgl');
            if (gl) {
                let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            }
        } catch(e) {}

        // D. Audio Context (Səs kartının unikal tezlik strukturu)
        try {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let oscillator = audioCtx.createOscillator();
            let analyser = audioCtx.createAnalyser();
            oscillator.connect(analyser);
            components.push(analyser.fftSize);
        } catch(e) {}

        // Super-Hash Alqoritmi (Milyardda bir təkrarlanma ehtimalı)
        let rawString = components.join('||');
        let hash = 0;
        for (let i = 0; i < rawString.length; i++) {
            hash = (hash << 5) - hash + rawString.charCodeAt(i);
            hash |= 0;
        }

        let daemonID = "DM-V3-" + Math.abs(hash).toString(36).toUpperCase() + "-" + btoa(screen.width).substring(0,4);
        GM_setValue('daemon_v3_fp', daemonID);
        return daemonID;
    }

    const daemonHWID = generateDeepFingerprint();

    // Oyun ekranını lisenziya yoxlanana qədər gizlədirik
    document.documentElement.style.display = 'none';

    // Anti-Debug qoruması (F12 və Sağ klik bloklanması)
    window.addEventListener('contextmenu', e => e.preventDefault(), true);
    window.addEventListener('keydown', e => {
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) || (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
        }
    }, true);

    // =========================================================================
    // 3. LİSENZİYA EKOSİSTEMİ VƏ UI
    // =========================================================================
    function checkLicense() {
        GM_xmlhttpRequest({
            method: "POST",
            url: SERVER_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ hwid: daemonHWID }),
            onload: function(res) {
                if (res.status === 200) {
                    try {
                        let data = JSON.parse(res.responseText);
                        if (data.success && data.encryptedPayload) {
                            // Əgər Cloudflare-dən təsdiq və şifrəli mod gəlibsə, Go Game ekranını açırıq
                            showGoGameScreen(data.encryptedPayload);
                            return;
                        }
                    } catch(e) {}
                }
                showLockScreen(false); // Lisenziya yoxdursa kilid ekranı
            },
            onerror: function() {
                showLockScreen(false);
            }
        });
    }

    // --- KİLİD EKRANI (DİZAYN) ---
// --- KİLİD EKRANI (DİZAYN) ---
    function showLockScreen(isVerifiedButNeedsDiscord = false) {
        document.documentElement.style.display = '';
        if (document.getElementById('daemon-v3-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'daemon-v3-overlay';
        overlay.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:#070709; display:flex; align-items:center; justify-content:center; z-index:99999999; font-family:'Segoe UI',sans-serif; color:#fff;`;

        overlay.innerHTML = `
            <div style="background:#101014; border:1px solid #1f1f24; padding:40px; border-radius:8px; width:420px; box-shadow:0 20px 50px rgba(0,0,0,0.7);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1f1f24; padding-bottom:15px; margin-bottom:20px;">
                    <h2 style="margin:0; font-size:20px; letter-spacing:1px; color:#ff3b3b;">DAEMON V3 ENGINE</h2>
                    <span style="font-size:10px; background:#2a1111; color:#ff4444; padding:4px 8px; border-radius:3px; font-weight:bold;">LOCKED</span>
                </div>
                <p style="color:#8a8a93; font-size:13px; line-height:1.6; margin-bottom:20px;">
                    Please send your Daemon ID to the administrator for access. Discord login will be enabled after license activation.
                </p>
                <div style="background:#000; padding:15px; border-radius:4px; border:1px solid #1f1f24; margin-bottom:20px;">
                    <span style="font-size:9px; color:#52525b; display:block; text-transform:uppercase;">Your Daemon ID (HWID)</span>
                    <div id="hwid-val" style="font-family:monospace; font-size:13px; color:#e4e4e7; margin-top:5px; word-break:break-all; user-select:all;">${daemonHWID}</div>
                </div>
                <button id="copy-hwid-btn" style="width:100%; background:#fff; color:#000; border:none; padding:12px; font-weight:bold; border-radius:4px; cursor:pointer; margin-bottom:10px; font-size:13px;">Copy Daemon ID</button>
                <button id="discord-login-btn" disabled style="width:100%; background:#242528; color:#52525b; border:none; padding:12px; font-weight:bold; border-radius:4px; cursor:not-allowed; font-size:13px;">Login with Discord (Coming Soon)</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('copy-hwid-btn').onclick = function() {
            navigator.clipboard.writeText(daemonHWID).then(() => {
                this.innerText = "Copied!";
                setTimeout(() => this.innerText = "Copy Daemon ID", 2000);
            });
        };
    }

    // --- GO GAME EKRANI (DİZAYN) ---
    // Konsoldan qırılmasın deyə bu düymə yalnız şifrəli kod gələndə yaradılır.
// --- GO GAME EKRANI (DİZAYN) ---
    function showGoGameScreen(encryptedPayload) {
        document.documentElement.style.display = '';
        const existing = document.getElementById('daemon-v3-overlay');
        if (existing) existing.remove();

        const goScreen = document.createElement('div');
        goScreen.id = 'daemon-v3-overlay';
        goScreen.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:#070709; display:flex; align-items:center; justify-content:center; z-index:99999999; font-family:'Segoe UI',sans-serif; color:#fff;`;

        goScreen.innerHTML = `
            <div style="background:#101014; border:1px solid #1f1f24; padding:40px; border-radius:8px; width:420px; text-align:center;">
                <h2 style="margin:0 0 10px 0; color:#4ade80; letter-spacing:1px;">DAEMON SECURE: ONLINE</h2>
                <p style="color:#8a8a93; font-size:13px; margin-bottom:25px;">License verified successfully. Mod is ready to inject.</p>

                <button id="go-game-btn" style="background:#4ade80; color:#000; border:none; width:100%; padding:15px; font-weight:bold; font-size:16px; border-radius:4px; cursor:pointer; box-shadow:0 0 20px rgba(74,222,128,0.3); margin-bottom:12px;">GO GAME</button>

                <button id="back-license-btn" style="background:transparent; color:#8a8a93; border:1px solid #2a2a2e; width:100%; padding:12px; font-weight:bold; font-size:13px; border-radius:4px; cursor:pointer; transition:background 0.2s;">Return to License Screen</button>
            </div>
        `;
        document.body.appendChild(goScreen);

        // Modu işə salan düymə
        document.getElementById('go-game-btn').onclick = function() {
            goScreen.remove();
            decryptAndLaunchMod(encryptedPayload);
        };

        // Lisenziya ekranına qayıtmaq düyməsi
        document.getElementById('back-license-btn').onclick = function() {
            goScreen.remove();
            // Parametr olaraq "true" göndərə bilərik (gələcəkdə verified statusunu göstərmək üçün)
            showLockScreen(true);
        };

        // Hover effekti əlavə edirik ki, düymə daha qəşəng görünsün
        document.getElementById('back-license-btn').onmouseover = function() { this.style.background = "#1a1a1f"; this.style.color = "#fff"; };
        document.getElementById('back-license-btn').onmouseout = function() { this.style.background = "transparent"; this.style.color = "#8a8a93"; };
    }
function decryptAndLaunchMod(encryptedPayload) {
        try {
            // 1. Şifrəli mətni Base64-dən geri çeviririk
            let decoded = decodeURIComponent(escape(atob(encryptedPayload)));
            let decryptedCode = "";

            // 2. Açma əməliyyatı: Açar olaraq Cihazın öz ID-sini (daemonHWID) istifadə edirik!
            for (let i = 0; i < decoded.length; i++) {
                decryptedCode += String.fromCharCode(decoded.charCodeAt(i) ^ daemonHWID.charCodeAt(i % daemonHWID.length));
            }

            // 3. Modun brauzerə yüklənməsi
            const script = document.createElement('script');
            script.textContent = `
                try {
                    ${decryptedCode}
                } catch(e) {
                    console.error("Daemon Fatal Error: Module crash.");
                }
            `;
            (document.head || document.documentElement).appendChild(script);
            script.remove(); // Kodu DOM-dan dərhal silirik ki, iz qalmasın

            console.log("Daemon Engine: Injected Successfully!");

        } catch (e) {
            alert("Daemon Security: Payload Decryption Failed! Potential tampering detected.");
            window.location.href = "about:blank";
        }
    }

    checkLicense();
})();
