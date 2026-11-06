// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = "https://oxxewesgoanhramereqef.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__uQDiyha0ZqotP70FSQp-Q_bKLHOoyq";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const BASE_URL = "https://andrewlawrence01.github.io/hirehigher/";

// ============================================
// HELPER FUNCTIONS
// ============================================

function showMessage(form, message, type = "error") {
    if (!form) return;

    let messageElement = form.querySelector(".auth-message");

    if (!messageElement) {
        messageElement = document.createElement("p");
        messageElement.className = "auth-message";
        messageElement.setAttribute("role", "status");
        form.prepend(messageElement);
    }

    messageElement.textContent = message;
    messageElement.dataset.type = type;
}

function setLoading(button, loading, originalText) {
    if (!button) return;

    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : originalText;
}

// ============================================
// SIGN UP
// ============================================

const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        const button = signupForm.querySelector(".auth-button");
        const originalText = "Create Account";

        if (password !== confirmPassword) {
            showMessage(signupForm, "Your passwords do not match.");
            return;
        }

        if (password.length < 8) {
            showMessage(
                signupForm,
                "Your password must contain at least 8 characters."
            );
            return;
        }

        if (!document.getElementById("terms").checked) {
            showMessage(
                signupForm,
                "Please agree to the Terms and Privacy Policy."
            );
            return;
        }

        setLoading(button, true, originalText);

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    },
                    emailRedirectTo: BASE_URL + "signin.html"
                }
            });

            if (error) throw error;

            if (data.session) {
                showMessage(
                    signupForm,
                    "Your account has been created successfully!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        BASE_URL + "child-pages/profile.html";
                }, 1500);
            } else {
                showMessage(
                    signupForm,
                    "Account created! Please check your email to confirm your account.",
                    "success"
                );
            }
        } catch (error) {
            showMessage(signupForm, error.message);
        } finally {
            setLoading(button, false, originalText);
        }
    });
}

// ============================================
// SIGN IN
// ============================================

const signinForm = document.getElementById("signin-form");

if (signinForm) {
    signinForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("signin-email").value.trim();
        const password = document.getElementById("signin-password").value;

        const button = signinForm.querySelector(".auth-button");
        const originalText = "Sign In";

        setLoading(button, true, originalText);

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            showMessage(
                signinForm,
                "Sign in successful! Welcome back.",
                "success"
            );

            setTimeout(() => {
                window.location.href =
                    BASE_URL + "child-pages/profile.html";
            }, 1000);

        } catch (error) {
            showMessage(signinForm, error.message);
        } finally {
            setLoading(button, false, originalText);
        }
    });
}

// ============================================
// FORGOT PASSWORD
// ============================================

const forgotPasswordLink = document.querySelector(".forgot-password");

if (forgotPasswordLink && signinForm) {
    forgotPasswordLink.addEventListener("click", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("signin-email");
        const email = emailInput.value.trim();

        if (!email) {
            showMessage(
                signinForm,
                "Please enter your email address first."
            );

            emailInput.focus();
            return;
        }

        try {
            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: BASE_URL + "signin.html?reset=true"
                });

            if (error) throw error;

            showMessage(
                signinForm,
                "If an account exists for that email, a password reset link will be sent.",
                "success"
            );

        } catch (error) {
            showMessage(signinForm, error.message);
        }
    });
}

// ============================================
// CHECK AUTHENTICATION SESSION
// ============================================

async function checkAuthSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error.message);
        return;
    }

    if (data.session) {
        console.log(
            "Currently signed in:",
            data.session.user.email
        );
    } else {
        console.log("No active user session.");
    }
}

checkAuthSession();