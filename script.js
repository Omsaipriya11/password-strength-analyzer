const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");

const strengthLabel = document.getElementById("strengthLabel");
const strengthProgress = document.getElementById("strengthProgress");
const scoreValue = document.getElementById("scoreValue");
const requirementCount = document.getElementById("requirementCount");

const warningText = document.getElementById("warningText");

const generatedPassword = document.getElementById("generatedPassword");
const copyPassword = document.getElementById("copyPassword");
const generatePassword = document.getElementById("generatePassword");

const passwordLength = document.getElementById("passwordLength");
const lengthValue = document.getElementById("lengthValue");

const includeUpper = document.getElementById("includeUpper");
const includeLower = document.getElementById("includeLower");
const includeNumbers = document.getElementById("includeNumbers");
const includeSymbols = document.getElementById("includeSymbols");

const historyContainer = document.getElementById("historyContainer");
const clearHistory = document.getElementById("clearHistory");
const toast = document.getElementById("toast");

const requirements = {
    length: document.getElementById("reqLength"),
    long: document.getElementById("reqLong"),
    upper: document.getElementById("reqUpper"),
    lower: document.getElementById("reqLower"),
    number: document.getElementById("reqNumber"),
    special: document.getElementById("reqSpecial")
};

let history = JSON.parse(
    localStorage.getItem("passguard_history")
) || [];


/* =========================
   PASSWORD ANALYSIS
========================= */

function analyzePassword(password) {

    const checks = {
        length: password.length >= 8,
        long: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    updateRequirements(checks);

    const passed = Object.values(checks).filter(Boolean).length;

    requirementCount.textContent = `${passed}/6`;

    if (!password) {

        updateStrength(0, "Enter Password");

        warningText.textContent =
            "Enter a password to begin the security analysis.";

        return;
    }

    let score = calculateScore(password, checks);

    const result = getStrength(score, password);

    updateStrength(score, result.label);

    warningText.textContent = result.message;

    saveHistory(password, score, result.label);
}


/* =========================
   SCORE CALCULATION
========================= */

function calculateScore(password, checks) {

    let score = 0;

    if (checks.length) score += 20;
    if (checks.long) score += 15;
    if (checks.upper) score += 15;
    if (checks.lower) score += 10;
    if (checks.number) score += 15;
    if (checks.special) score += 15;

    if (password.length >= 16) {
        score += 10;
    }

    if (hasCommonPassword(password)) {
        score -= 35;
    }

    if (hasRepeatedCharacters(password)) {
        score -= 10;
    }

    if (hasSequentialPattern(password)) {
        score -= 10;
    }

    return Math.max(0, Math.min(100, score));
}


/* =========================
   STRENGTH RESULT
========================= */

function getStrength(score, password) {

    if (hasCommonPassword(password)) {

        return {
            label: "Very Weak",
            message:
                "This password uses a commonly guessed pattern. Choose something more unique."
        };

    }

    if (score < 30) {

        return {
            label: "Weak",
            message:
                "Your password needs more characters and variety."
        };

    }

    if (score < 55) {

        return {
            label: "Fair",
            message:
                "Good start, but adding more length and character variety will improve it."
        };

    }

    if (score < 80) {

        return {
            label: "Strong",
            message:
                "Nice! Your password has good complexity. A longer password can make it even better."
        };

    }

    return {
        label: "Very Strong",
        message:
            "Excellent! This password has strong length and character diversity."
    };
}


/* =========================
   UPDATE STRENGTH UI
========================= */

function updateStrength(score, label) {

    strengthLabel.textContent = label;
    scoreValue.textContent = `${score}/100`;

    strengthProgress.style.width = `${score}%`;

    if (score < 30) {

        strengthProgress.style.background = "#ef4444";
        strengthLabel.style.color = "#ef4444";

    } else if (score < 55) {

        strengthProgress.style.background = "#f59e0b";
        strengthLabel.style.color = "#f59e0b";

    } else if (score < 80) {

        strengthProgress.style.background = "#3b82f6";
        strengthLabel.style.color = "#60a5fa";

    } else {

        strengthProgress.style.background = "#22c55e";
        strengthLabel.style.color = "#22c55e";
    }
}


/* =========================
   REQUIREMENTS
========================= */

function updateRequirements(checks) {

    Object.keys(checks).forEach(key => {

        if (checks[key]) {
            requirements[key].classList.add("valid");
        } else {
            requirements[key].classList.remove("valid");
        }

    });
}


/* =========================
   COMMON PASSWORD CHECK
========================= */

function hasCommonPassword(password) {

    const commonPasswords = [
        "password",
        "password123",
        "123456",
        "12345678",
        "123456789",
        "qwerty",
        "qwerty123",
        "admin",
        "admin123",
        "welcome",
        "welcome123",
        "letmein",
        "iloveyou",
        "abc123",
        "password1",
        "pass123",
        "000000",
        "111111"
    ];

    return commonPasswords.includes(password.toLowerCase());
}


/* =========================
   REPEATED CHARACTER CHECK
========================= */

function hasRepeatedCharacters(password) {

    return /(.)\1\1/.test(password);
}


/* =========================
   SEQUENTIAL PATTERN CHECK
========================= */

function hasSequentialPattern(password) {

    const sequences = [
        "123456",
        "234567",
        "345678",
        "456789",
        "abcdef",
        "bcdefg",
        "cdefgh",
        "qwerty",
        "asdfgh",
        "zxcvbn"
    ];

    const lower = password.toLowerCase();

    return sequences.some(sequence =>
        lower.includes(sequence)
    );
}


/* =========================
   PASSWORD VISIBILITY
========================= */

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.textContent =
        isPassword ? "🙈" : "👁";
});


/* =========================
   LIVE ANALYSIS
========================= */

passwordInput.addEventListener("input", () => {

    analyzePassword(passwordInput.value);

});


/* =========================
   PASSWORD GENERATOR
========================= */

function generateStrongPassword() {

    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let numbers = "0123456789";
    let symbols = "!@#$%^&*()_+-=[]{}<>?";

    let available = "";
    let requiredCharacters = [];

    if (includeUpper.checked) {
        available += upper;
        requiredCharacters.push(randomCharacter(upper));
    }

    if (includeLower.checked) {
        available += lower;
        requiredCharacters.push(randomCharacter(lower));
    }

    if (includeNumbers.checked) {
        available += numbers;
        requiredCharacters.push(randomCharacter(numbers));
    }

    if (includeSymbols.checked) {
        available += symbols;
        requiredCharacters.push(randomCharacter(symbols));
    }

    if (!available) {

        showToast("Select at least one character type.");
        return;
    }

    const length = Number(passwordLength.value);

    let result = [...requiredCharacters];

    while (result.length < length) {
        result.push(randomCharacter(available));
    }

    result = secureShuffle(result);

    generatedPassword.value = result.join("");

    showToast("Strong password generated!");
}


/* =========================
   SECURE RANDOM CHARACTER
========================= */

function randomCharacter(characters) {

    const randomArray = new Uint32Array(1);

    crypto.getRandomValues(randomArray);

    return characters[
        randomArray[0] % characters.length
    ];
}


/* =========================
   SECURE SHUFFLE
========================= */

function secureShuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const randomArray = new Uint32Array(1);

        crypto.getRandomValues(randomArray);

        const j = randomArray[0] % (i + 1);

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


generatePassword.addEventListener(
    "click",
    generateStrongPassword
);


/* =========================
   LENGTH SLIDER
========================= */

passwordLength.addEventListener("input", () => {

    lengthValue.textContent =
        passwordLength.value;

});


/* =========================
   COPY PASSWORD
========================= */

copyPassword.addEventListener("click", async () => {

    const password =
        generatedPassword.value;

    if (!password) {

        showToast("Generate a password first.");
        return;
    }

    try {

        await navigator.clipboard.writeText(password);

        showToast("Password copied!");

    } catch (error) {

        generatedPassword.select();
        document.execCommand("copy");

        showToast("Password copied!");
    }
});


/* =========================
   HISTORY
========================= */

function saveHistory(password, score, label) {

    if (!password) return;

    const now = new Date();

    const item = {
        password: maskPassword(password),
        score: score,
        label: label,
        time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    const last =
        history[0];

    if (
        last &&
        last.password === item.password &&
        last.score === item.score
    ) {
        return;
    }

    history.unshift(item);

    history =
        history.slice(0, 8);

    localStorage.setItem(
        "passguard_history",
        JSON.stringify(history)
    );

    renderHistory();
}


/* =========================
   MASK PASSWORD
========================= */

function maskPassword(password) {

    if (password.length <= 4) {
        return "••••";
    }

    if (password.length <= 8) {
        return (
            password.slice(0, 2) +
            "••••" +
            password.slice(-1)
        );
    }

    return (
        password.slice(0, 3) +
        "••••••" +
        password.slice(-2)
    );
}


/* =========================
   RENDER HISTORY
========================= */

function renderHistory() {

    if (!history.length) {

        historyContainer.innerHTML = `
            <div class="empty-history">
                <span>📊</span>
                <p>No password checks yet.</p>
            </div>
        `;

        return;
    }

    historyContainer.innerHTML =
        history.map(item => {

            let scoreColor;

            if (item.score < 30) {
                scoreColor = "#ef4444";
            } else if (item.score < 55) {
                scoreColor = "#f59e0b";
            } else if (item.score < 80) {
                scoreColor = "#60a5fa";
            } else {
                scoreColor = "#22c55e";
            }

            return `
                <div class="history-item">

                    <div class="history-info">

                        <div class="history-password">
                            ${item.password}
                        </div>

                        <div class="history-time">
                            Checked at ${item.time}
                        </div>

                    </div>

                    <div class="history-score">

                        <strong style="color:${scoreColor}">
                            ${item.score}/100
                        </strong>

                        <span>
                            ${item.label}
                        </span>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================
   CLEAR HISTORY
========================= */

clearHistory.addEventListener("click", () => {

    if (!history.length) {

        showToast("History is already empty.");
        return;
    }

    history = [];

    localStorage.removeItem(
        "passguard_history"
    );

    renderHistory();

    showToast("History cleared.");
});


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}


/* =========================
   INITIALIZE
========================= */

renderHistory();