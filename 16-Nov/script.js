document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const calculator = document.getElementById("calculator");
    const screenElement = document.getElementById("calculator-screen");
    const previousOperandTextElement = document.getElementById("previous-operand");
    const currentOperandTextElement = document.getElementById("current-operand");
    const angleBadge = document.getElementById("angle-badge");
    const btnAngleToggle = document.getElementById("btn-angle-toggle");
    const copyToast = document.getElementById("copy-toast");
    const soundToggle = document.getElementById("sound-toggle");
    const soundIcon = document.getElementById("sound-icon");
    const historyToggle = document.getElementById("history-toggle");
    const historyBadge = document.getElementById("history-badge");
    const historyPanel = document.getElementById("history-panel");
    const historyList = document.getElementById("history-list");
    const btnClearHistory = document.getElementById("btn-clear-history");
    const btnCloseHistory = document.getElementById("btn-close-history");
    const shortcutsToggle = document.getElementById("shortcuts-toggle");
    const shortcutsModal = document.getElementById("shortcuts-modal");
    const btnCloseShortcuts = document.getElementById("btn-close-shortcuts");
    const shortcutsBackdrop = document.getElementById("shortcuts-backdrop");
    const btnModeSci = document.getElementById("btn-mode-sci");
    const btnModeBasic = document.getElementById("btn-mode-basic");

    // Constants
    const MAX_DIGITS = 15;

    // State
    let currentOperand = "270";
    let previousOperand = "";
    let operation = undefined;
    let lastEquation = "260 + 10 =";
    let isCalculated = true;
    let isErrorState = false;
    let errorMessage = "";
    let soundEnabled = true;
    let angleMode = "DEG"; // 'DEG' or 'RAD'
    let history = [
        { equation: "260 + 10 =", result: "270" }
    ];

    // Web Audio Synthesizer
    let audioCtx = null;

    function initAudio() {
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    audioCtx = new AudioContext();
                }
            }
            if (audioCtx && audioCtx.state === "suspended") {
                audioCtx.resume();
            }
        } catch (e) {}
    }

    function playSound(type = "number") {
        if (!soundEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            switch (type) {
                case "number":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(680, now);
                    osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                case "operator":
                case "sci":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    osc.start(now);
                    osc.stop(now + 0.06);
                    break;
                case "clear":
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.07);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                    osc.start(now);
                    osc.stop(now + 0.07);
                    break;
                case "delete":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(480, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                case "equals":
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.setValueAtTime(659.25, now + 0.06);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                    osc.start(now);
                    osc.stop(now + 0.16);
                    break;
                case "error":
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(180, now);
                    gain.gain.setValueAtTime(0.14, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
            }
        } catch (e) {}
    }

    // Ripple click wave effect
    function createRipple(event, button) {
        try {
            const circle = document.createElement("span");
            circle.classList.add("ripple");
            const rect = button.getBoundingClientRect();

            const x = event && event.clientX ? event.clientX - rect.left : rect.width / 2;
            const y = event && event.clientY ? event.clientY - rect.top : rect.height / 2;
            const size = Math.max(rect.width, rect.height);

            circle.style.width = circle.style.height = `${size}px`;
            circle.style.left = `${x - size / 2}px`;
            circle.style.top = `${y - size / 2}px`;

            const existingRipple = button.querySelector(".ripple");
            if (existingRipple) existingRipple.remove();

            button.appendChild(circle);
            setTimeout(() => circle.remove(), 450);
        } catch (e) {}
    }

    // Toast Notification Handler
    let toastTimeout = null;
    function showToast(message, isError = false) {
        if (!copyToast) return;
        copyToast.textContent = message;
        copyToast.classList.toggle("error", isError);
        copyToast.classList.add("show");

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            copyToast.classList.remove("show");
            copyToast.classList.remove("error");
        }, 1500);
    }

    // Error State Management
    function setCalculationError(message, equation = "") {
        isErrorState = true;
        errorMessage = message;
        currentOperand = message;
        previousOperand = "";
        operation = undefined;
        lastEquation = equation;
        isCalculated = true;

        updateDisplay();
        triggerErrorShake();
    }

    function clearErrorState() {
        if (isErrorState) {
            isErrorState = false;
            errorMessage = "";
            screenElement.classList.remove("is-error");
            currentOperandTextElement.classList.remove("error-text");
        }
    }

    function triggerErrorShake() {
        screenElement.classList.remove("shake");
        void screenElement.offsetWidth;
        screenElement.classList.add("shake");
        playSound("error");
        setTimeout(() => screenElement.classList.remove("shake"), 360);
    }

    function triggerResultPop() {
        currentOperandTextElement.classList.remove("pop");
        void currentOperandTextElement.offsetWidth;
        currentOperandTextElement.classList.add("pop");
        playSound("equals");
        setTimeout(() => currentOperandTextElement.classList.remove("pop"), 250);
    }

    // Dynamic Font Resizing for Long Numbers
    function adjustFontSize() {
        if (isErrorState) {
            currentOperandTextElement.style.fontSize = "20px";
            currentOperandTextElement.style.lineHeight = "48px";
            return;
        }

        const len = (currentOperand || "").length;
        if (len > 14) {
            currentOperandTextElement.style.fontSize = "24px";
            currentOperandTextElement.style.lineHeight = "48px";
        } else if (len > 10) {
            currentOperandTextElement.style.fontSize = "32px";
            currentOperandTextElement.style.lineHeight = "48px";
        } else {
            currentOperandTextElement.style.fontSize = "46px";
            currentOperandTextElement.style.lineHeight = "48px";
        }
    }

    // Highlight Active Operator
    function updateActiveOperator() {
        document.querySelectorAll("[data-operator]").forEach((btn) => {
            if (operation && btn.getAttribute("data-operator") === operation && currentOperand === "" && !isErrorState) {
                btn.classList.add("operator-active");
            } else {
                btn.classList.remove("operator-active");
            }
        });
    }

    // Display Update
    function updateDisplay() {
        if (isErrorState) {
            screenElement.classList.add("is-error");
            currentOperandTextElement.classList.add("error-text");
            previousOperandTextElement.textContent = lastEquation;
            currentOperandTextElement.textContent = errorMessage;
        } else {
            screenElement.classList.remove("is-error");
            currentOperandTextElement.classList.remove("error-text");

            if (lastEquation) {
                previousOperandTextElement.textContent = lastEquation;
            } else if (operation != null) {
                previousOperandTextElement.textContent = `${previousOperand} ${operation}`;
            } else {
                previousOperandTextElement.textContent = "";
            }

            currentOperandTextElement.textContent = currentOperand || "0";
        }

        adjustFontSize();
        updateActiveOperator();
    }

    function getDigitCount(val) {
        return (val || "").toString().replace(/[^0-9]/g, "").length;
    }

    function formatNumber(num) {
        if (!isFinite(num)) return null;
        if (Math.abs(num) > 1e14 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6).replace(/\.?0+e/, "e");
        }
        const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
        return rounded.toString();
    }

    // Angle Mode Toggle (DEG / RAD)
    function toggleAngleMode() {
        angleMode = angleMode === "DEG" ? "RAD" : "DEG";
        angleBadge.textContent = angleMode;
        btnAngleToggle.textContent = angleMode === "DEG" ? "RAD" : "DEG";
        showToast(`Angle Mode: ${angleMode}`);
        playSound("operator");
    }

    angleBadge.addEventListener("click", toggleAngleMode);
    btnAngleToggle.addEventListener("click", toggleAngleMode);

    // Mode Switcher (Scientific vs Basic)
    btnModeSci.addEventListener("click", () => {
        calculator.classList.remove("mode-basic");
        calculator.classList.add("mode-scientific");
        btnModeSci.classList.add("active");
        btnModeBasic.classList.remove("active");
        playSound("operator");
    });

    btnModeBasic.addEventListener("click", () => {
        calculator.classList.remove("mode-scientific");
        calculator.classList.add("mode-basic");
        btnModeBasic.classList.add("active");
        btnModeSci.classList.remove("active");
        playSound("operator");
    });

    // Calculator Basic Operations
    function clear() {
        playSound("clear");
        clearErrorState();
        currentOperand = "0";
        previousOperand = "";
        operation = undefined;
        lastEquation = "";
        isCalculated = false;
        updateDisplay();
    }

    function deleteDigit() {
        playSound("delete");

        if (isErrorState) {
            clear();
            return;
        }

        if (isCalculated) {
            lastEquation = "";
            isCalculated = false;
        }

        if (currentOperand === "0" || currentOperand === "") return;

        currentOperand = currentOperand.slice(0, -1);
        if (currentOperand === "" || currentOperand === "-") {
            currentOperand = "0";
        }
        updateDisplay();
    }

    function appendNumber(number) {
        if (isErrorState) {
            clearErrorState();
            currentOperand = number;
            previousOperand = "";
            operation = undefined;
            lastEquation = "";
            isCalculated = false;
            playSound("number");
            updateDisplay();
            return;
        }

        if (isCalculated) {
            currentOperand = number;
            previousOperand = "";
            operation = undefined;
            lastEquation = "";
            isCalculated = false;
            playSound("number");
            updateDisplay();
            return;
        }

        if (getDigitCount(currentOperand) >= MAX_DIGITS) {
            triggerErrorShake();
            showToast(`Max ${MAX_DIGITS} digits reached`, true);
            return;
        }

        playSound("number");
        if (currentOperand === "0") {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        updateDisplay();
    }

    function appendDecimal() {
        if (isErrorState) {
            clearErrorState();
            currentOperand = "0.";
            previousOperand = "";
            operation = undefined;
            lastEquation = "";
            isCalculated = false;
            playSound("number");
            updateDisplay();
            return;
        }

        if (isCalculated) {
            currentOperand = "0.";
            previousOperand = "";
            operation = undefined;
            lastEquation = "";
            isCalculated = false;
            playSound("number");
            updateDisplay();
            return;
        }

        if (currentOperand.includes(".")) {
            triggerErrorShake();
            showToast("Decimal already added", true);
            return;
        }

        playSound("number");
        if (!currentOperand || currentOperand === "0") {
            currentOperand = "0.";
        } else {
            currentOperand += ".";
        }
        updateDisplay();
    }

    // Insert Constants (Pi and e)
    function insertConstant(type) {
        clearErrorState();
        playSound("sci");

        if (type === "pi") {
            currentOperand = Math.PI.toString();
        } else if (type === "e") {
            currentOperand = Math.E.toString();
        }

        isCalculated = false;
        updateDisplay();
    }

    // Scientific Single-Argument (Unary) Functions
    function executeSciFunction(fn) {
        if (isErrorState) {
            triggerErrorShake();
            showToast("Clear error first", true);
            return;
        }

        const val = parseFloat(currentOperand);
        if (isNaN(val)) return;

        let result;
        let eqName;

        switch (fn) {
            case "sin": {
                eqName = `sin(${currentOperand})`;
                const rad = angleMode === "DEG" ? (val * Math.PI) / 180 : val;
                if (angleMode === "DEG" && val % 180 === 0) {
                    result = 0;
                } else {
                    result = Math.sin(rad);
                }
                break;
            }
            case "cos": {
                eqName = `cos(${currentOperand})`;
                const rad = angleMode === "DEG" ? (val * Math.PI) / 180 : val;
                if (angleMode === "DEG" && (val - 90) % 180 === 0) {
                    result = 0;
                } else {
                    result = Math.cos(rad);
                }
                break;
            }
            case "tan": {
                eqName = `tan(${currentOperand})`;
                if (angleMode === "DEG" && (val - 90) % 180 === 0) {
                    setCalculationError("Undefined (tan 90°)", `${eqName} =`);
                    return;
                }
                const rad = angleMode === "DEG" ? (val * Math.PI) / 180 : val;
                result = Math.tan(rad);
                break;
            }
            case "sqrt": {
                eqName = `√(${currentOperand})`;
                if (val < 0) {
                    setCalculationError("Cannot take √ of negative", `${eqName} =`);
                    return;
                }
                result = Math.sqrt(val);
                break;
            }
            case "sqr": {
                eqName = `sqr(${currentOperand})`;
                result = val * val;
                break;
            }
            case "reciprocal": {
                eqName = `1/(${currentOperand})`;
                if (val === 0) {
                    setCalculationError("Cannot divide by 0", `${eqName} =`);
                    return;
                }
                result = 1 / val;
                break;
            }
            case "log": {
                eqName = `log(${currentOperand})`;
                if (val <= 0) {
                    setCalculationError("Log requires positive value", `${eqName} =`);
                    return;
                }
                result = Math.log10(val);
                break;
            }
            case "ln": {
                eqName = `ln(${currentOperand})`;
                if (val <= 0) {
                    setCalculationError("Ln requires positive value", `${eqName} =`);
                    return;
                }
                result = Math.log(val);
                break;
            }
            case "factorial": {
                eqName = `${currentOperand}!`;
                if (!Number.isInteger(val) || val < 0) {
                    setCalculationError("Factorial requires integer ≥ 0", `${eqName} =`);
                    return;
                }
                if (val > 170) {
                    setCalculationError("Overflow Error (n > 170)", `${eqName} =`);
                    return;
                }
                let fact = 1;
                for (let i = 2; i <= val; i++) {
                    fact *= i;
                }
                result = fact;
                break;
            }
            default:
                return;
        }

        const formatted = formatNumber(result);
        if (formatted === null) {
            setCalculationError("Overflow Error", `${eqName} =`);
            return;
        }

        lastEquation = `${eqName} =`;
        currentOperand = formatted;
        isCalculated = true;
        addHistoryItem(lastEquation, currentOperand);
        triggerResultPop();
        updateDisplay();
    }

    // Binary Operation Selection
    function chooseOperation(op) {
        if (isErrorState) {
            triggerErrorShake();
            showToast("Clear error first", true);
            return;
        }

        playSound("operator");

        if (currentOperand === "" && previousOperand !== "") {
            operation = op;
            lastEquation = "";
            updateDisplay();
            return;
        }

        if (currentOperand === "") return;

        if (previousOperand !== "") {
            const success = compute(false);
            if (!success) return;
        }

        operation = op;
        previousOperand = currentOperand;
        currentOperand = "";
        lastEquation = "";
        isCalculated = false;
        updateDisplay();
    }

    function compute(isFinal = true) {
        if (isErrorState) {
            triggerErrorShake();
            return false;
        }

        if (previousOperand !== "" && (currentOperand === "" || currentOperand == null)) {
            currentOperand = previousOperand;
        }

        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (isNaN(prev) || isNaN(current)) {
            if (isFinal) triggerResultPop();
            return false;
        }

        let computation;
        switch (operation) {
            case "+":
                computation = prev + current;
                break;
            case "-":
                computation = prev - current;
                break;
            case "×":
            case "*":
                computation = prev * current;
                break;
            case "÷":
            case "/":
                if (current === 0) {
                    if (prev === 0) {
                        setCalculationError("Result is undefined", "0 ÷ 0 =");
                    } else {
                        setCalculationError("Cannot divide by 0", `${prev} ÷ 0 =`);
                    }
                    return false;
                }
                computation = prev / current;
                break;
            case "^":
                computation = Math.pow(prev, current);
                if (isNaN(computation)) {
                    setCalculationError("Invalid Calculation (Complex)", `${prev} ^ ${current} =`);
                    return false;
                }
                break;
            default:
                return false;
        }

        if (!isFinite(computation) || Math.abs(computation) > Number.MAX_VALUE) {
            setCalculationError("Overflow Error", `${prev} ${operation} ${current} =`);
            return false;
        }

        if (isNaN(computation)) {
            setCalculationError("Invalid Calculation", `${prev} ${operation} ${current} =`);
            return false;
        }

        const roundedStr = formatNumber(computation);
        if (roundedStr === null) {
            setCalculationError("Overflow Error", `${prev} ${operation} ${current} =`);
            return false;
        }

        if (isFinal) {
            const equationStr = `${previousOperand} ${operation} ${currentOperand} =`;
            lastEquation = equationStr;
            currentOperand = roundedStr;
            previousOperand = "";
            operation = undefined;
            isCalculated = true;

            addHistoryItem(equationStr, currentOperand);
            triggerResultPop();
        } else {
            currentOperand = roundedStr;
            previousOperand = "";
            operation = undefined;
        }

        updateDisplay();
        return true;
    }

    // Calculation History
    function renderHistory() {
        try {
            historyList.innerHTML = "";
            if (history.length === 0) {
                historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
                historyBadge.style.display = "none";
                return;
            }

            historyBadge.textContent = history.length;
            historyBadge.style.display = "inline-block";

            history.forEach((item) => {
                const el = document.createElement("div");
                el.className = "history-item";
                el.innerHTML = `
                    <div class="history-item-equation">${item.equation}</div>
                    <div class="history-item-result">${item.result}</div>
                `;
                el.addEventListener("click", () => {
                    clearErrorState();
                    currentOperand = item.result;
                    lastEquation = item.equation;
                    previousOperand = "";
                    operation = undefined;
                    isCalculated = true;
                    updateDisplay();
                    playSound("number");
                    historyPanel.classList.remove("open");
                    historyToggle.classList.remove("active");
                });
                historyList.appendChild(el);
            });
        } catch (e) {}
    }

    function addHistoryItem(equation, result) {
        try {
            history.unshift({ equation, result });
            if (history.length > 25) history.pop();
            renderHistory();
        } catch (e) {}
    }

    btnClearHistory.addEventListener("click", (e) => {
        e.stopPropagation();
        history = [];
        renderHistory();
        playSound("clear");
    });

    historyToggle.addEventListener("click", () => {
        const isOpen = historyPanel.classList.toggle("open");
        historyToggle.classList.toggle("active", isOpen);
        playSound("operator");
    });

    btnCloseHistory.addEventListener("click", () => {
        historyPanel.classList.remove("open");
        historyToggle.classList.remove("active");
        playSound("operator");
    });

    // Sound Toggle Feature
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
        soundToggle.classList.toggle("active", soundEnabled);
        if (soundEnabled) playSound("number");
    });

    // Keyboard Shortcuts Dialog
    shortcutsToggle.addEventListener("click", () => {
        shortcutsModal.classList.add("open");
        playSound("operator");
    });

    function closeShortcuts() {
        shortcutsModal.classList.remove("open");
        playSound("operator");
    }

    btnCloseShortcuts.addEventListener("click", closeShortcuts);
    shortcutsBackdrop.addEventListener("click", closeShortcuts);

    // Resilient Clipboard Copy
    function copyValueToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Copied! ✨");
                playSound("equals");
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand("copy");
            document.body.removeChild(textarea);

            if (successful) {
                showToast("Copied! ✨");
                playSound("equals");
            } else {
                showToast("Copy failed", true);
            }
        } catch (e) {
            showToast("Copy not supported", true);
        }
    }

    screenElement.addEventListener("click", () => {
        initAudio();
        if (isErrorState) {
            triggerErrorShake();
            return;
        }

        const textToCopy = currentOperand || "0";
        copyValueToClipboard(textToCopy);
    });

    // Clipboard Paste Validation
    window.addEventListener("paste", (e) => {
        try {
            const pastedText = (e.clipboardData || window.clipboardData).getData("text").trim();
            if (!pastedText) return;

            const parsedNum = Number(pastedText);
            if (!isNaN(parsedNum) && isFinite(parsedNum) && pastedText.length <= 20) {
                clearErrorState();
                currentOperand = parsedNum.toString();
                isCalculated = false;
                lastEquation = "";
                updateDisplay();
                showToast(`Pasted: ${currentOperand}`);
                playSound("number");
            } else {
                triggerErrorShake();
                showToast("Invalid number format pasted", true);
            }
        } catch (err) {
            triggerErrorShake();
            showToast("Paste failed", true);
        }
    });

    // Button Click Listeners with Ripple Wave
    document.querySelectorAll(".btn").forEach((button) => {
        button.addEventListener("pointerdown", (e) => {
            initAudio();
            createRipple(e, button);
        });
    });

    document.querySelectorAll("[data-number]").forEach((button) => {
        button.addEventListener("click", () => {
            appendNumber(button.getAttribute("data-number"));
        });
    });

    document.querySelectorAll("[data-operator]").forEach((button) => {
        button.addEventListener("click", () => {
            chooseOperation(button.getAttribute("data-operator"));
        });
    });

    document.querySelectorAll("[data-sci-fn]").forEach((button) => {
        button.addEventListener("click", () => {
            executeSciFunction(button.getAttribute("data-sci-fn"));
        });
    });

    document.querySelectorAll("[data-constant]").forEach((button) => {
        button.addEventListener("click", () => {
            insertConstant(button.getAttribute("data-constant"));
        });
    });

    document.querySelector('[data-action="decimal"]').addEventListener("click", () => {
        appendDecimal();
    });

    document.querySelector('[data-action="equals"]').addEventListener("click", () => {
        compute(true);
    });

    document.getElementById("btn-clear").addEventListener("click", clear);
    document.getElementById("btn-delete").addEventListener("click", deleteDigit);

    // Keyboard Navigation with Visual Feedback
    function triggerButtonFeedback(selector) {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.classList.add("active");
            createRipple({}, btn);
            setTimeout(() => btn.classList.remove("active"), 120);
        }
    }

    window.addEventListener("keydown", (e) => {
        initAudio();

        if (e.key === "Escape") {
            if (shortcutsModal.classList.contains("open")) {
                closeShortcuts();
                return;
            }
            if (historyPanel.classList.contains("open")) {
                historyPanel.classList.remove("open");
                historyToggle.classList.remove("active");
                return;
            }
            clear();
            triggerButtonFeedback("#btn-clear");
            return;
        }

        if (e.key === "h" || e.key === "H") {
            historyToggle.click();
            return;
        }

        if (e.key === "m" || e.key === "M") {
            soundToggle.click();
            return;
        }

        if (e.key === "d" || e.key === "D") {
            toggleAngleMode();
            return;
        }

        if (e.key === "?") {
            shortcutsToggle.click();
            return;
        }

        // Scientific shortcuts
        const lowerKey = e.key.toLowerCase();
        if (lowerKey === "s") {
            executeSciFunction("sin");
            triggerButtonFeedback('[data-sci-fn="sin"]');
            return;
        }
        if (lowerKey === "o") {
            executeSciFunction("cos");
            triggerButtonFeedback('[data-sci-fn="cos"]');
            return;
        }
        if (lowerKey === "t") {
            executeSciFunction("tan");
            triggerButtonFeedback('[data-sci-fn="tan"]');
            return;
        }
        if (lowerKey === "r") {
            executeSciFunction("sqrt");
            triggerButtonFeedback('[data-sci-fn="sqrt"]');
            return;
        }
        if (lowerKey === "q") {
            executeSciFunction("sqr");
            triggerButtonFeedback('[data-sci-fn="sqr"]');
            return;
        }
        if (lowerKey === "l") {
            executeSciFunction("log");
            triggerButtonFeedback('[data-sci-fn="log"]');
            return;
        }
        if (lowerKey === "n") {
            executeSciFunction("ln");
            triggerButtonFeedback('[data-sci-fn="ln"]');
            return;
        }
        if (lowerKey === "p") {
            insertConstant("pi");
            triggerButtonFeedback('[data-constant="pi"]');
            return;
        }
        if (lowerKey === "e" && !e.ctrlKey && !e.metaKey) {
            insertConstant("e");
            triggerButtonFeedback('[data-constant="e"]');
            return;
        }
        if (e.key === "!") {
            executeSciFunction("factorial");
            triggerButtonFeedback('[data-sci-fn="factorial"]');
            return;
        }
        if (e.key === "^") {
            chooseOperation("^");
            triggerButtonFeedback('[data-operator="^"]');
            return;
        }

        // Standard Numbers & Operators
        if (e.key >= "0" && e.key <= "9") {
            appendNumber(e.key);
            triggerButtonFeedback(`[data-number="${e.key}"]`);
        } else if (e.key === ".") {
            appendDecimal();
            triggerButtonFeedback('[data-action="decimal"]');
        } else if (e.key === "+") {
            chooseOperation("+");
            triggerButtonFeedback('[data-operator="+"]');
        } else if (e.key === "-") {
            chooseOperation("-");
            triggerButtonFeedback('[data-operator="-"]');
        } else if (e.key === "*") {
            chooseOperation("×");
            triggerButtonFeedback('[data-operator="×"]');
        } else if (e.key === "/") {
            e.preventDefault();
            chooseOperation("÷");
            triggerButtonFeedback('[data-operator="÷"]');
        } else if (e.key === "Enter" || e.key === "=") {
            e.preventDefault();
            compute(true);
            triggerButtonFeedback('[data-action="equals"]');
        } else if (e.key === "Backspace") {
            e.preventDefault();
            deleteDigit();
            triggerButtonFeedback("#btn-delete");
        } else if (lowerKey === "c") {
            clear();
            triggerButtonFeedback("#btn-clear");
        }
    });

    // Initialize display and history
    updateDisplay();
    renderHistory();
});
