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


// ============================================
// PROFILE PAGE AND PHOTO UPLOAD
// ============================================

const profileForm = document.getElementById("profile-form");

if (profileForm) {

    const photoInput = document.getElementById("profile-photo");
    const photoPreview = document.getElementById("profile-photo-preview");
    const photoPlaceholder = document.getElementById("profile-photo-placeholder");

    let currentUser = null;
    let selectedPhoto = null;

    // Display a profile photo
    function displayProfilePhoto(url) {
        if (!url) {
            photoPreview.hidden = true;
            photoPlaceholder.hidden = false;
            photoPreview.removeAttribute("src");
            return;
        }

        photoPreview.src = url;
        photoPreview.hidden = false;
        photoPlaceholder.hidden = true;
    }

    // Load the user's profile
    async function loadProfile() {
        try {
            const { data: { user }, error: userError } =
                await supabaseClient.auth.getUser();

            if (userError || !user) {
                window.location.href = BASE_URL + "signin.html";
                return;
            }

            currentUser = user;

            const { data, error } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (error) throw error;

            document.getElementById("profile-name").value =
                data?.full_name ||
                [
                    user.user_metadata?.first_name,
                    user.user_metadata?.last_name
                ].filter(Boolean).join(" ") || "";

            document.getElementById("profile-email").value =
                user.email || "";

            document.getElementById("profile-location").value =
                data?.location || "";

            document.getElementById("profile-bio").value =
                data?.bio || "";

            if (data?.avatar_url) {
                displayProfilePhoto(data.avatar_url);
            }

        } catch (error) {
            console.error("Profile loading error:", error);
            showMessage(profileForm, error.message);
        }
    }

    // Preview selected photo
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showMessage(
                profileForm,
                "Please choose a JPG, PNG, or WebP image."
            );
            photoInput.value = "";
            selectedPhoto = null;
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(
                profileForm,
                "Your profile photo must be smaller than 5 MB."
            );
            photoInput.value = "";
            selectedPhoto = null;
            return;
        }

        selectedPhoto = file;

        const previewURL = URL.createObjectURL(file);
        displayProfilePhoto(previewURL);
    });

    // Upload profile photo to Supabase Storage
    async function uploadProfilePhoto() {
        if (!selectedPhoto) return null;

        const extension = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }[selectedPhoto.type];

        const filePath = `${currentUser.id}/avatar.${extension}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("profile-photos")
            .upload(filePath, selectedPhoto, {
                upsert: true,
                contentType: selectedPhoto.type
            });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient
            .storage
            .from("profile-photos")
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    // Save profile information
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) return;

        const button = profileForm.querySelector(
            'button[type="submit"]'
        );

        const originalText = button.textContent;

        setLoading(button, true, originalText);

        try {
            let avatarURL = null;

            // Preserve existing photo unless a new one is selected
            const { data: existingProfile, error: existingError } =
                await supabaseClient
                    .from("profiles")
                    .select("avatar_url")
                    .eq("id", currentUser.id)
                    .maybeSingle();

            if (existingError) throw existingError;

            avatarURL = existingProfile?.avatar_url || null;

            // Upload a new photo if selected
            if (selectedPhoto) {
                avatarURL = await uploadProfilePhoto();
            }

            const profileData = {
                id: currentUser.id,
                full_name: document.getElementById("profile-name").value.trim(),
                email: currentUser.email,
                location: document.getElementById("profile-location").value.trim(),
                bio: document.getElementById("profile-bio").value.trim(),
                avatar_url: avatarURL,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabaseClient
                .from("profiles")
                .upsert(profileData, {
                    onConflict: "id"
                });

            if (error) throw error;

            selectedPhoto = null;
            photoInput.value = "";

            showMessage(
                profileForm,
                "Your profile has been saved successfully!",
                "success"
            );

            if (avatarURL) {
                displayProfilePhoto(avatarURL);
            }

        } catch (error) {
            console.error("Profile save error:", error);

            showMessage(
                profileForm,
                error.message
            );

        } finally {
            setLoading(button, false, originalText);
        }
    });

    // Initialize profile page
    loadProfile();
}