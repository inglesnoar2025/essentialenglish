// ===================================================================================
// ⚠️ COLE AQUI A SUA URL BLINDADA DO GOOGLE APPS SCRIPT
// ===================================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbwS8MljNhwEKSLNYP4X9-85LDOSvZd_KAHmvmuETqrlBWcYRmyfbayxF14_EHjiExos7Q/exec";

// Motor de conexão com a API do Google (BLINDADO E COM TRIAGEM DE ERROS)
async function apiCall(action, data) {
    if (!navigator.onLine) {
        console.error("❌ Erro: Usuário sem conexão de rede.");
        return { success: false, msg: "ERR_OFFLINE" }; 
    }

    try {
        let res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({action: action, payload: {type: action, data: data, email: userEmailCache}})
        });
        
        const textoBruto = await res.text();
        
        try {
            return JSON.parse(textoBruto);
        } catch (errParsing) {
            console.error("❌ O Google bloqueou e devolveu HTML/Lixo:", textoBruto);
            return { success: false, msg: "ERR_SERVER_BLOCK" }; 
        }
    } catch(e) {
        console.error("❌ Falha de Fetch:", e);
        return { success: false, msg: "ERR_FETCH_FAIL" }; 
    }
}

// LÓGICA DE VÍDEO INTRO
document.addEventListener('DOMContentLoaded', function() {
    const ov = document.getElementById('intro-overlay');
    const vd = document.getElementById('vid-player');
    
    function fecharIntro() {
        if(!ov) return;
        ov.style.transition = "opacity 0.5s";
        ov.style.opacity = "0";
        setTimeout(() => { ov.style.display = "none"; }, 500);
    }

    if(vd) {
        vd.playbackRate = 2.0; 
        var playPromise = vd.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => { fecharIntro(); });
        }
        vd.onended = fecharIntro;
        setTimeout(fecharIntro, 6000); 
    } else {
        fecharIntro(); 
    }
});

// --- VARIÁVEIS GLOBAIS DO SISTEMA (CORRIGIDAS PARA RECUPERAÇÃO DE SENHA) ---
const urlParams = new URLSearchParams(window.location.search);
const urlAction = urlParams.get('ac') || "";
const urlEmail = urlParams.get('em') || ""; // <--- AGORA ELE PUXA O E-MAIL DO LINK!

let I18N = {}; 
let detectedLang = (navigator.language || "en").split("-")[0];
let userEmailCache = urlEmail; // <--- SALVA O E-MAIL NA MEMÓRIA MESMO EM ABA NOVA
const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const FALLBACK = {
    "ERR_NET": "Sem internet. Verifique sua conexão.",
    "ERR_OFFLINE": "Sem internet de verdade. Verifique seu Wi-Fi ou 4G.",
    "ERR_SERVER_BLOCK": "O servidor bloqueou a conexão. O Google não retornou dados válidos.",
    "ERR_FETCH_FAIL": "Falha ao alcançar o servidor da API.",
    "ERR_UNKNOWN": "Falha no sistema. Tente novamente."
};

function initApp() {
    console.log("🔄 Buscando traduções...");
    
    apiCall('getI18nData', {}).then(dadosPlanilha => {
        if(dadosPlanilha && dadosPlanilha.pt) {
            console.log("✅ Traduções carregadas!");
            I18N = dadosPlanilha;
        } else {
            I18N = { "pt": FALLBACK, "en": FALLBACK }; 
        }
        if(!I18N[detectedLang]) I18N[detectedLang] = {};
        aplicarTraducoes(); 
        
        // Se a URL mandar abrir o reset, ele abre direto
        if (urlAction === 'reset') {
            show_sec('sec-reset');
        }
    });
}

function aplicarTraducoes() {
    const MSGS = I18N[detectedLang] || I18N["en"] || I18N[Object.keys(I18N)[0]];
    if (!MSGS) return; 

    const textMap = { 
        "t-login": MSGS.t_login, "b-login": MSGS.b_login, 
        "t-reg": MSGS.t_reg, "b-reg": MSGS.b_reg, 
        "t-forgot": MSGS.t_forgot, "b-forgot": MSGS.b_forgot, 
        "t-reset": MSGS.t_reset, "b-reset": MSGS.b_reset,
        "dash-title": MSGS.t_dash, "b-logout": MSGS.b_out, "dash-mod-1": MSGS.mod_1,
        "link-reg": MSGS.link_reg, "link-forgot": MSGS.link_forgot,
        "link-back": MSGS.link_back, "link-back-2": MSGS.link_back,
        "link-back-3": MSGS.link_back
    };

    for (let id in textMap) { 
        const el = document.getElementById(id);
        if(el && textMap[id]) el.innerText = textMap[id]; 
    }

    const placeMap = {
        "l-email": MSGS.p_email, "l-pass": MSGS.p_pass,
        "r-name": MSGS.p_name, "r-email": MSGS.p_email, "r-pass": MSGS.p_pass, "r-pass-confirm": MSGS.p_conf,
        "f-email": MSGS.p_email,
        "rs-token": MSGS.p_tok, "rs-pass": MSGS.p_pass, "rs-pass-confirm": MSGS.p_conf
    };

    for (let id in placeMap) {
        const el = document.getElementById(id);
        if(el && placeMap[id]) el.placeholder = placeMap[id];
    }
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme-pref');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('theme-icon');
        if(icon) icon.innerText = '☀️';
    }
    initApp();
};

function show_sec(id) {
    const campos = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    campos.forEach(campo => { campo.value = ''; });

    const secoes = ['sec-login', 'sec-register', 'sec-forgot', 'sec-reset', 'sec-dashboard', 'sec-profile'];
    secoes.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });

    const destino = document.getElementById(id);
    if (destino) { destino.style.display = 'flex'; }
}

function run_login(btn) {
    const e = document.getElementById('l-email').value, p = document.getElementById('l-pass').value;
    const msgs = I18N[detectedLang] || I18N["en"] || FALLBACK;

    if(!e || !p) return notify(msgs.EMPTY || "Preencha tudo");

    btn.disabled = true; 
    btn.innerText = msgs.WAIT || "AGUARDE";

    apiCall('user_manager', {email: e, pass: p}).then(res => {
        btn.disabled = false; 
        btn.innerText = msgs.b_login || "ENTRAR";

        if(res.success) {
            userEmailCache = res.user.email;
            document.getElementById('main-auth').style.display = 'none';
            document.getElementById('sec-dashboard').style.display = 'flex';
            document.body.style.alignItems = 'stretch';
            document.getElementById('dash-welcome').innerText = (msgs.HELLO || "Olá ") + res.user.name + "!";
            document.getElementById('dash-intro').innerText = msgs.INTRO || "";
            limparCampos(['l-email', 'l-pass']);
        } else {
            let msgFinal = msgs[res.msg] || res.msg || msgs.ERR_UNKNOWN || "Erro";
            if (res.remaining) { msgFinal = msgFinal.replace("{n}", res.remaining); }
            notify(msgFinal);
            limparCampos(['l-email', 'l-pass']);
        }
    });
}

function run_register(btn) {
    const n = document.getElementById('r-name').value.trim();
    const e = document.getElementById('r-email').value.trim();
    const p = document.getElementById('r-pass').value;
    const p2 = document.getElementById('r-pass-confirm').value;
    const msgs = I18N[detectedLang] || I18N["en"] || FALLBACK;

    if(!n || !e || !p || !p2) return notify(msgs.EMPTY || "Preencha tudo");
    const nomePartes = n.split(/\s+/).filter(parte => parte.length >= 2);
    if (nomePartes.length < 2) return notify(msgs.ERR_NAME || "Nome inválido");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return notify(msgs.ERR_EMAIL || "Email inválido");
    if(p !== p2) return notify(msgs.NO_MATCH || "Senhas não conferem");
    if(!passRegex.test(p)) return notify(msgs.WEAK_PASS || "Senha fraca");

    btn.disabled = true;
    btn.innerText = msgs.WAIT || "AGUARDE";

    apiCall('user_manager', {name: n, email: e, pass: p, lang: detectedLang}).then(res => {
        btn.disabled = false;
        btn.innerText = msgs.b_reg || "REGISTRAR"; 
        if(res.success) {
            notify(msgs.SUCCESS || "Sucesso");
            limparCampos(['r-name', 'r-email', 'r-pass', 'r-pass-confirm']);
            setTimeout(() => { show_sec('sec-login'); }, 1500);
        } else {
            let msgFinal = msgs[res.msg] || res.msg || msgs.ERR_UNKNOWN || "Erro";
            if (res.remaining) { msgFinal = msgFinal.replace("{n}", res.remaining); }
            notify(msgFinal);
        }
    });
}

function run_forgot(btn) {
    const emailInput = document.getElementById('f-email');
    const e = emailInput.value.trim();
    const msgs = I18N[detectedLang] || I18N["en"] || FALLBACK;
    
    if(!e) return notify(msgs.EMPTY || "Preencha o e-mail");
    userEmailCache = e; 
    btn.disabled = true; 
    btn.innerText = msgs.WAIT || "AGUARDE";

    apiCall('user_manager', {email: e, lang: detectedLang}).then(res => {
        btn.disabled = false; 
        btn.innerText = msgs.b_forgot || "RECUPERAR SENHA";

        if(res.success) { 
            let msgFinal = msgs[res.msg] || msgs.SUCCESS_TOKEN || "Sucesso"; 
            if (res.remaining) msgFinal = msgFinal.replace("{n}", res.remaining);
            notify(msgFinal); 
            
            const okBtn = document.getElementById('modal-btn-ok');
            okBtn.onclick = function() {
                closeModal(); show_sec('sec-reset'); okBtn.onclick = closeModal; 
            };
        } else {
            let msgFinal = msgs[res.msg] || res.msg || "Erro";
            if (res.remaining) { msgFinal = msgFinal.replace("{n}", res.remaining); }
            notify(msgFinal); 

            if (res.msg === "TOKEN_ACTIVE") {
               const okBtn = document.getElementById('modal-btn-ok');
               okBtn.onclick = function() {
                   closeModal(); show_sec('sec-reset'); okBtn.onclick = closeModal;
               };
            } else { emailInput.value = ""; }
        }
    });
}

function run_reset(btn) {
    const t = document.getElementById('rs-token').value;
    const p = document.getElementById('rs-pass').value;
    const c = document.getElementById('rs-pass-confirm').value;
    const msgs = I18N[detectedLang] || I18N["en"] || FALLBACK;

    if(!t || !p || !c) return notify(msgs.EMPTY || "Preencha tudo");
    if(p !== c) return notify(msgs.NO_MATCH || "Senhas não conferem");
    if(!passRegex.test(p)) return notify(msgs.WEAK_PASS || "Senha fraca");

    btn.disabled = true; 
    btn.innerText = msgs.WAIT || "AGUARDE";

    apiCall('user_manager', {email: userEmailCache, token: t, new_pass: p}).then(res => {
        btn.disabled = false; 
        btn.innerText = msgs.b_reset || "REDEFINIR";
        
        if(res.success) { 
            notify(msgs.SUCCESS || "Sucesso"); 
            limparCampos(['rs-token', 'rs-pass', 'rs-pass-confirm']); 
            show_sec('sec-login'); 
        } else {
            let msgFinal = msgs[res.msg] || res.msg || msgs.ERR_UNKNOWN || "Erro";
            if (res.remaining) { msgFinal = msgFinal.replace("{n}", res.remaining); }
            notify(msgFinal);
            limparCampos(['rs-token', 'rs-pass', 'rs-pass-confirm']);

            if (res.msg === "TOKEN_EXPIRED_5MIN") {
               show_sec('sec-forgot');
               if (userEmailCache) { document.getElementById('f-email').value = userEmailCache; }
            }
        }
    });
}

function notify(m) {
    const msgs = I18N[detectedLang] || I18N["en"] || {};
    document.getElementById('modal-text').innerText = m;
    document.getElementById('modal-btn-ok').innerText = "OK";
    document.getElementById('modal-btn-confirm').style.display = "none";
    document.getElementById('wl-modal').style.display = 'flex';
}

function askLogout() {
    const msgs = I18N[detectedLang] || I18N["en"] || {};
    document.getElementById('modal-text').innerText = msgs.LOGOUT_Q || "Sair?";
    document.getElementById('modal-btn-ok').innerText = msgs.b_back ? msgs.b_back.toUpperCase() : "VOLTAR"; 
    document.getElementById('modal-btn-confirm').style.display = "inline-block";
    document.getElementById('modal-btn-confirm').innerText = msgs.b_yes || "SIM";
    document.getElementById('wl-modal').style.display = 'flex';
}

function doLogout() { closeModal(); show_sec('sec-login'); }
function closeModal() { document.getElementById('wl-modal').style.display = 'none'; }

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    icon.innerText = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme-pref', isDark ? 'dark' : 'light');
}

function toggle_pass(id, icon) {
    const input = document.getElementById(id);
    input.type = (input.type === 'password') ? 'text' : 'password';
    icon.classList.toggle('slash');
}

function limparCampos(ids) {
    if (!Array.isArray(ids)) return;
    ids.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) { campo.value = ""; }
    });
}

let photoBase64 = "";
let photoMimeType = "";

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            notify("A foto deve ter no máximo 5MB.");
            input.value = ""; 
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('preview-img');
            img.src = e.target.result;
            img.style.display = 'block';
            document.querySelector('.cam-icon').style.display = 'none';
            photoBase64 = e.target.result.split(',')[1];
            photoMimeType = file.type;
        }
        reader.readAsDataURL(file);
    }
}

function run_activation(btn) {
    const key = document.getElementById('lic-key-input').value.trim();
    if(!key) return notify("Digite uma chave.");
    btn.disabled = true; btn.innerText = "AGUARDE...";

    apiCall('activateLicense', {key: key}).then(res => {
        btn.disabled = false; btn.innerText = "ATIVAR";
        if(res.success) { 
            notify("Sucesso!"); 
            document.getElementById('lic-key-input').value = ""; 
        } else { notify("Erro: Chave inválida ou usada."); }
    });
}

function saveProfile(btn) {
    const fullName = document.getElementById('prof-fullname').value.trim();
    const birth = document.getElementById('prof-birth').value;
    const gender = document.getElementById('prof-gender').value;
    const phone = document.getElementById('prof-phone').value.trim();
    
    if (!fullName || !birth || !gender || !phone) {
        notify("Por favor, preencha os campos obrigatórios.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "SALVANDO...";

    const formData = {
        email: userEmailCache, 
        full_name: fullName,
        birth_date: birth,
        gender: gender,
        phone: phone,
        check_whatsapp: document.getElementById('chk-wa').checked ? 'on' : 'off',
        check_telegram: document.getElementById('chk-tg').checked ? 'on' : 'off',
        check_sms: document.getElementById('chk-sms').checked ? 'on' : 'off',
        alt_email: document.getElementById('prof-alt-email').value.trim(),
        photoData: photoBase64, 
        photoMime: photoMimeType
    };

    apiCall('saveNewProfile', formData).then(res => {
        btn.disabled = false;
        btn.innerText = "SALVAR E CONTINUAR";
        if (res.success) {
            show_sec('sec-dashboard');
            notify("Perfil atualizado com sucesso!");
        } else {
            notify("Erro ao salvar: " + res.msg);
        }
    });
}

function abrirPerfilPeloDashboard() { show_sec('sec-profile'); }
