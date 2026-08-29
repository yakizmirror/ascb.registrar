/* =========================================================
   ASCB REGISTRAR SYSTEM
   HARDCODED LOGIN (NO DATABASE)
   ---------------------------------------------------------
   Walang database dito — ang mga account ay naka-hardcode
   lang sa ibaba. Para magdagdag/magbago ng account, i-edit
   lamang ang ASCB_USERS array.
   ========================================================= */

const ASCB_USERS = [
    {
        username: "admin",
        password: "amparo",
        displayName: "AMPARO",
        role: "ADMIN STAFF"
    },
    {
        username: "admin",
        password: "castillo",
        displayName: "CASTILLO",
        role: "ADMIN STAFF"
    },
    {
        username: "admin",
        password: "yasoña",
        displayName: "YASOÑA",
        role: "ADMIN STAFF"
    },
    {
        username: "admin",
        password: "salubre",
        displayName: "SALUBRE",
        role: "ADMIN STAFF"
    }
];

const ASCB_SESSION_KEY = "ascb_reg_session";


/* =========================================================
   SESSION HELPERS
   ========================================================= */

function ascbGetSession() {
    const raw =
        sessionStorage.getItem(ASCB_SESSION_KEY) ||
        localStorage.getItem(ASCB_SESSION_KEY);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function ascbSetSession(user, remember) {
    const payload = JSON.stringify({
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        loginTime: new Date().toISOString()
    });

    if (remember) {
        localStorage.setItem(ASCB_SESSION_KEY, payload);
    } else {
        sessionStorage.setItem(ASCB_SESSION_KEY, payload);
    }
}

function ascbClearSession() {
    sessionStorage.removeItem(ASCB_SESSION_KEY);
    localStorage.removeItem(ASCB_SESSION_KEY);
}


/* =========================================================
   PROTECTED-PAGE GUARD
   Call this as early as possible (before body renders) on
   every page that requires login.
   ========================================================= */

function ascbGuardPage() {
    if (!ascbGetSession()) {
        window.location.replace("login.html");
    }
}

/* Populate the "logged in as" badge in the header, once the
   DOM for it exists. */
function ascbInitHeaderSession() {
    const session = ascbGetSession();
    if (!session) return;

    const nameEl = document.getElementById("ascbCurrentUserName");
    const roleEl = document.getElementById("ascbCurrentUserRole");
    const avatarEl = document.getElementById("ascbUserAvatar");
    const dashboardNameEl = document.getElementById("dashboardUserName");

    if (nameEl) nameEl.textContent = session.displayName;
    if (roleEl) roleEl.textContent = session.role;
    if (avatarEl) avatarEl.textContent = session.displayName.trim().charAt(0).toUpperCase();
    if (dashboardNameEl) dashboardNameEl.textContent = ", " + session.displayName;
}

function ascbConfirmLogout() {
    const overlay = document.getElementById("ascbLogoutModal");
    if (overlay) overlay.classList.add("active");
}

function ascbCancelLogout() {
    const overlay = document.getElementById("ascbLogoutModal");
    if (overlay) overlay.classList.remove("active");
}

function ascbLogout() {
    ascbClearSession();
    window.location.replace("login.html");
}


/* =========================================================
   LOGIN PAGE LOGIC
   ========================================================= */

function ascbHandleLogin(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const rememberInput = document.getElementById("loginRemember");
    const errorBox = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmitBtn");
    const card = document.getElementById("loginCard");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const match = ASCB_USERS.find(function (u) {
        return (
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password
        );
    });

    if (!match) {
        errorBox.textContent = "Invalid username or password. Please try again.";
        errorBox.classList.add("show");

        passwordInput.value = "";
        passwordInput.focus();

        card.classList.remove("shake");
        void card.offsetWidth; /* restart animation */
        card.classList.add("shake");

        return false;
    }

    errorBox.classList.remove("show");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    ascbSetSession(match, !!(rememberInput && rememberInput.checked));

    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 350);

    return false;
}

/* If a session already exists and the user lands on the
   login page anyway, send them straight through. */
function ascbRedirectIfLoggedIn() {
    if (ascbGetSession()) {
        window.location.replace("dashboard.html");
    }
}

function ascbTogglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const toggleBtn = document.getElementById("loginTogglePw");
    if (!passwordInput || !toggleBtn) return;

    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "Hide" : "Show";
}


/* =========================================================
   LEFT NAVBAR — VIEW SWITCHING
   Dashboard, Certificates, and Form 137 are all shown/hidden
   in-place as pages — nothing opens as an overlay anymore.
   ========================================================= */

function ascbNavigate(view) {
    document.querySelectorAll(".main-nav-link[data-view]").forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.view === view);
    });

    document.querySelectorAll(".app-view").forEach(function (section) {
        section.classList.toggle("active-view", section.id === view + "View");
    });

    ascbToggleSidebar(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Actions panel (collapsible, on the Certificates view) ---------- */

function ascbToggleActionsPanel() {
    const panel = document.getElementById("actionsPanel");
    if (panel) panel.classList.toggle("collapsed");
}

/* ---------- Mobile off-canvas sidebar ---------- */

function ascbToggleSidebar(forceOpen) {
    const sidebar = document.getElementById("mainSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (!sidebar || !backdrop) return;

    const shouldOpen =
        typeof forceOpen === "boolean" ? forceOpen : !sidebar.classList.contains("open");

    sidebar.classList.toggle("open", shouldOpen);
    backdrop.classList.toggle("open", shouldOpen);
}


/* ---------- logout confirmation modal: dismiss helpers ---------- */

document.addEventListener("click", function (event) {
    const overlay = document.getElementById("ascbLogoutModal");
    if (overlay && event.target === overlay) {
        ascbCancelLogout();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    const overlay = document.getElementById("ascbLogoutModal");
    if (overlay && overlay.classList.contains("active")) {
        ascbCancelLogout();
    }
});
