// supabase-auth.js

const SUPABASE_URL = 'https://foboerxshnkxpdqkkefa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYm9lcnhzaG5reHBkcWtrZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjA5MzMsImV4cCI6MjEwNTM5NjkzM30.Xpf_OoYZHvQRg89tjRueMp-Cox58PMc8l51ZugC-ctw';

let supabaseClient = null;
if (SUPABASE_URL.startsWith('http')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Default to Sign Up
let isSignUp = true; 

window.openAuthModal = function(mode = 'signup') {
    document.getElementById('auth-modal').classList.remove('hidden');
    setAuthMode(mode === 'signup');
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-form').reset();
    document.getElementById('auth-error-msg').textContent = '';
};

// Expose setAuthMode globally for the tab buttons
window.setAuthMode = function(signup) {
    isSignUp = signup;
    document.getElementById('tab-signup').classList.toggle('active', signup);
    document.getElementById('tab-login').classList.toggle('active', !signup);
    document.getElementById('group-signup-name').style.display = signup ? 'block' : 'none';
    
    document.getElementById('auth-modal-title').textContent = signup ? 'Create Account' : 'Welcome Back';
    document.getElementById('auth-modal-subtitle').textContent = signup ? 'Join to save and sync your professional resume.' : 'Log in to save and sync your professional resume.';
    document.getElementById('auth-btn-label').textContent = signup ? 'Create Account' : 'Log In';
    document.getElementById('auth-error-msg').textContent = '';
};

function initAuth() {
    const form = document.getElementById('auth-form');
    const errorMsg = document.getElementById('auth-error-msg');
    const btnCloseAuth = document.getElementById('btn-close-auth');
    
    // Tab Listeners
    document.getElementById('tab-signup')?.addEventListener('click', () => setAuthMode(true));
    document.getElementById('tab-login')?.addEventListener('click', () => setAuthMode(false));
    btnCloseAuth?.addEventListener('click', window.closeAuthModal);

    // Form Submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabaseClient) return alert("Supabase is not configured yet!");

        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const username = document.getElementById('auth-name') ? document.getElementById('auth-name').value.trim() : '';
        
        const submitBtn = document.getElementById('btn-auth-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        errorMsg.textContent = '';

        try {
            let result;
            if (isSignUp) {
                // Pass the Username into Supabase metadata
                result = await supabaseClient.auth.signUp({ 
                    email, 
                    password, 
                    options: { data: { full_name: username } } 
                });
                if (!result.error && !result.data.session) {
                    alert("Account created! Check your email for the confirmation link.");
                    window.closeAuthModal();
                }
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;
            if (result.data.session) window.closeAuthModal();

        } catch (error) {
            errorMsg.textContent = error.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span id="auth-btn-label">${isSignUp ? 'Create Account' : 'Log In'}</span>`;
        }
    });

    // Logout Handlers (Desktop & Mobile)
    const handleLogout = async () => { if (supabaseClient) await supabaseClient.auth.signOut(); };
    document.getElementById('btn-logout-desktop')?.addEventListener('click', handleLogout);
    document.getElementById('btn-logout-mobile')?.addEventListener('click', handleLogout);

    // Dynamic UI Update
    function updateUI(user) {
        // Desktop elements
        const desktopAuthBtns = document.getElementById('btn-open-login-desktop');
        const desktopSignupBtn = document.getElementById('btn-open-auth-desktop');
        const desktopDashboard = document.getElementById('user-dashboard-desktop');
        const desktopNameDisplay = document.getElementById('user-email-display-desktop');

        // Mobile elements
        const mobileLoggedOut = document.getElementById('m-logged-out-view');
        const mobileLoggedIn = document.getElementById('m-logged-in-view');
        const mobileNameDisplay = document.getElementById('user-email-display-mobile');

        if (user) {
            // Extract the Username from metadata, fallback to email prefix if not set
            const displayName = user.user_metadata?.full_name || user.email.split('@')[0];

            // Update Desktop
            if (desktopAuthBtns) desktopAuthBtns.style.display = 'none';
            if (desktopSignupBtn) desktopSignupBtn.style.display = 'none';
            if (desktopDashboard) desktopDashboard.classList.remove('hidden');
            if (desktopNameDisplay) desktopNameDisplay.textContent = displayName;

            // Update Mobile
            if (mobileLoggedOut) mobileLoggedOut.classList.add('hidden');
            if (mobileLoggedIn) mobileLoggedIn.classList.remove('hidden');
            if (mobileNameDisplay) mobileNameDisplay.textContent = displayName;
        } else {
            // Revert Desktop
            if (desktopAuthBtns) desktopAuthBtns.style.display = 'inline-flex';
            if (desktopSignupBtn) desktopSignupBtn.style.display = 'inline-flex';
            if (desktopDashboard) desktopDashboard.classList.add('hidden');

            // Revert Mobile
            if (mobileLoggedOut) mobileLoggedOut.classList.remove('hidden');
            if (mobileLoggedIn) mobileLoggedIn.classList.add('hidden');
        }
    }

    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => updateUI(session?.user));
        supabaseClient.auth.onAuthStateChange((event, session) => updateUI(session?.user));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
