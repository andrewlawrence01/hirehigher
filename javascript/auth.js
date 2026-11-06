// ==========================================
// Hire Higher - Authentication
// Supabase Authentication
// ==========================================

// Replace these with your actual Supabase credentials.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

// Initialize Supabase.
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Website URLs.
const BASE_URL = "https://andrewlawrence01.github.io/hirehigher/";

// Display messages on the page.
function showMessage(form, message, type = "error") {
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

// Disable a button while processing.
function setLoading(button, loading, originalText) {
    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : originalText;
}

// ==========================================
// SIGN UP
// ==========================================

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
            showMessage(signupForm, "Your password must contain at least 8 characters.");
            return;
        }

        if (!document.getElementById("terms").checked) {
            showMessage(signupForm, "Please agree to the Terms and Privacy Policy.");
            return;
        }

        setLoading(button, true, originalText);

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
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
                    window.location.href = BASE_URL + "child-pages/profile.html";
                }, 1500);
            } else {
                showMessage(
                    signupForm,
                    "Account created! Please check your email to confirm your account.",
                    "success"
                );

                button.disabled = true;
            }

        } catch (error) {
            showMessage(signupForm, error.message);
        } finally {
            if (button.disabled !== true || !button.textContent.includes("Please wait")) {
                button.textContent = originalText;
            } else {
                button.textContent = originalText;
            }
        }
    });
}

// ==========================================
// SIGN IN
// ==========================================

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
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            showMessage(signinForm, "Sign in successful! Welcome back.", "success");

            setTimeout(() => {
                window.location.href = BASE_URL + "child-pages/profile.html";
            }, 1000);

        } catch (error) {
            showMessage(signinForm, error.message);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPasswordLink = document.querySelector(".forgot-password");

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("signin-email");
        const email = emailInput.value.trim();

        if (!email) {
            showMessage(signinForm, "Please enter your email address first.");
            emailInput.focus();
            return;
        }

        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: BASE_URL + "signin.html?reset=true"
                }
            );

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

// ==========================================
// SESSION CHECK
// ==========================================

async function checkAuthSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error.message);
        return;
    }

    if (data.session) {
        console.log("Currently signed in:", data.session.user.email);
    } else {
        console.log("No active user session.");
    }
}

checkAuthSession();