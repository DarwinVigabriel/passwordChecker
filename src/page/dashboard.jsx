import React, { useEffect, useState, useRef } from "react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";
import { Progress, ProgressTrack } from "@/components/animate-ui/components/base/progress";
import { ProgressIndicator } from "@/components/animate-ui/primitives/base/progress";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function Dashboard() {
    const [showTerminal, setShowTerminal] = useState(false);
    const [inputValue, setInputValue] = useState("");
    // no terminal lines state — using TextAnimate for password reveal
    const [isPasswordReady, setIsPasswordReady] = useState(false);
    const passwordReadyTimerRef = useRef(null);
    const [lastGeneratedPassword, setLastGeneratedPassword] = useState("");
    useEffect(() => {
        // Keep track of previous styles if any code wants to restore later (not used now)
        const prevBg = document.body.style.backgroundColor;
        const prevHtmlBg = document.documentElement.style.backgroundColor;
        const rootEl = document.getElementById("root");
        const prevRootBorder = rootEl?.style?.border;
        const prevRootOutline = rootEl?.style?.outline;
        // Do not override body/html background inline — theme is handled globally
        if (rootEl) {
            rootEl.style.border = "0";
            rootEl.style.outline = "0";
        }
        // The global theme toggler will manage the `dark` class — do not force it here
        return () => {
            document.body.style.backgroundColor = prevBg;
            document.documentElement.style.backgroundColor = prevHtmlBg;
            if (rootEl) {
                rootEl.style.border = prevRootBorder ?? "";
                rootEl.style.outline = prevRootOutline ?? "";
            }
            // no-op: we don't toggle global theme from the Dashboard
            if (passwordReadyTimerRef.current) {
                clearTimeout(passwordReadyTimerRef.current);
            }
        };
    }, []);

    // Utility: create a secure random password
    const generatePassword = (length = 20) => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()_+-={}[];:,.<>/?';
        const charset = lower + upper + digits + symbols;
        let out = '';
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const values = new Uint32Array(length);
            window.crypto.getRandomValues(values);
            // ensure at least one of each class
            out += lower[values[0] % lower.length];
            out += upper[values[1] % upper.length];
            out += digits[values[2] % digits.length];
            out += symbols[values[3] % symbols.length];
            for (let i = 4; i < length; i++) {
                out += charset[values[i] % charset.length];
            }
        } else {
            // ensure at least one of each class
            out += lower[Math.floor(Math.random() * lower.length)];
            out += upper[Math.floor(Math.random() * upper.length)];
            out += digits[Math.floor(Math.random() * digits.length)];
            out += symbols[Math.floor(Math.random() * symbols.length)];
            for (let i = 4; i < length; i++) {
                out += charset[Math.floor(Math.random() * charset.length)];
            }
        }
        return out;
    }

    // When user clicks, toggle terminal and generate a new password when opening
    const handleGenerateClick = () => {
        const newPassword = generatePassword(20);
        // build sequence is no longer stored; we show a morphing text while generating
        setLastGeneratedPassword(newPassword);
        setShowTerminal(true);
        setIsPasswordReady(false);
        // ensure we clean previous timers (not strictly needed with morph reveal but safe)
        if (passwordReadyTimerRef.current) {
            clearTimeout(passwordReadyTimerRef.current);
            passwordReadyTimerRef.current = null;
        }
    }
    const maxChars = 20;
    const charCount = (inputValue || "").length;
    // compute a password strength score for Confiabilidad
    const computeStrength = (value) => {
        if (!value) return 0;
        const lengthScore = Math.min(40, value.length * 2); // up to 40
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasDigits = /[0-9]/.test(value);
        const hasSymbols = /[^A-Za-z0-9]/.test(value);
        const variety = [hasLower, hasUpper, hasDigits, hasSymbols].filter(Boolean).length;
        const varietyScore = (variety / 4) * 40; // up to 40
        const bonus = value.length >= 12 ? 20 : 0; // bonus if long
        let score = Math.round(lengthScore + varietyScore + bonus);
        // reduce score if only digits or only letters
        if (/^[0-9]+$/.test(value) || /^[A-Za-z]+$/.test(value)) {
            score = Math.round(score * 0.4);
        }
        return Math.min(100, Math.max(0, score));
    }
    const wordsProgress = computeStrength(inputValue);
    const charsProgress = Math.min(100, Math.round((charCount / maxChars) * 100));

    const strengthLabel = (score) => {
        if (score < 40) return 'Débil';
        if (score < 75) return 'Media';
        return 'Fuerte';
    }
    const strengthClass = (score) => {
        if (score < 40) return 'bg-red-500';
        if (score < 75) return 'bg-amber-400';
        return 'bg-emerald-400';
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-start md:items-center justify-center border-0 outline-0 py-8">
            <div className="rounded-xl border-0 outline-0 flex flex-col items-center gap-10 p-6">
                <h1>
                    <EncryptedText
                        text="Probemos tu contraseña"
                        className="text-5xl sm:text-6xl md:text-7xl leading-tight font-mono text-foreground"
                        encryptedClassName="text-gray-400"
                        revealedClassName="text-foreground"
                    />
                </h1>
                <PlaceholdersAndVanishInput
                    placeholders={["Ingresa tu contraseña", "Prueba con algo seguro", "No compartas con nadie"]}
                    onSubmit={(e, val) => {
                        // just log for now — could store in state if you want to display it
                        console.log("Submitted value:", val);
                    }}
                    onChange={(e, val) => setInputValue(val)}
                    className="bg-transparent dark:bg-transparent shadow-none border-none text-foreground w-full max-w-3xl h-20"
                    inputClassName="text-lg sm:text-xl pl-6 sm:pl-12 pr-28"
                />
                {/* Progress bars: words and characters */}
                <div className="w-full max-w-3xl mt-3 space-y-3">
                    <div className="flex items-center justify-between text-sm text-neutral-400">
                        <span>Confiabilidad</span>
                        <span>{strengthLabel(wordsProgress)} — {wordsProgress}%</span>
                    </div>
                    <Progress value={wordsProgress} className="w-full">
                        <ProgressTrack className="bg-neutral-800 h-3 rounded-full">
                            <ProgressIndicator className={`${strengthClass(wordsProgress)} h-3 rounded-full`} />
                        </ProgressTrack>
                    </Progress>

                    <div className="flex items-center justify-between text-sm text-neutral-400">
                        <span>Caracteres</span>
                        <span>{charCount} / {maxChars} — {charsProgress}%</span>
                    </div>
                    <Progress value={charsProgress} className="w-full">
                        <ProgressTrack className="bg-neutral-800 h-3 rounded-full">
                            <ProgressIndicator className="bg-sky-400 h-3 rounded-full" />
                        </ProgressTrack>
                    </Progress>
                </div>
                <div className="w-full flex justify-center mt-6">
                    <RippleButton
                        onClick={() => {
                                if (showTerminal) {
                                    setShowTerminal(false);
                                    // just clear the last generated password and hide
                                    setLastGeneratedPassword("");
                                    setIsPasswordReady(false);
                                    if (passwordReadyTimerRef.current) {
                                        clearTimeout(passwordReadyTimerRef.current);
                                        passwordReadyTimerRef.current = null;
                                    }
                                } else {
                                    handleGenerateClick();
                                }
                            }}
                        className="px-6 py-3"
                        variant="default">
                        {showTerminal ? 'Ocultar' : 'Generar Contraseña'}
                    </RippleButton>
                </div>
                {showTerminal && (
                    <div className="mt-6 w-full flex justify-center">
                        <div className="w-full max-w-3xl">
                            {/*
                                Use `TextAnimate` to show a blur-in placeholder and reveal the
                                password once its animation completes (onAnimationComplete).
                            */}
                            {!isPasswordReady && (
                                <TextAnimate
                                    as="p"
                                    animation="blurInUp"
                                    by="character"
                                    once={true}
                                    startOnView={false}
                                    className="text-foreground text-center text-2xl"
                                    onAnimationComplete={() => {
                                        // small setTimeout to let the appearance feel natural
                                        passwordReadyTimerRef.current = setTimeout(() => {
                                            setIsPasswordReady(true);
                                            passwordReadyTimerRef.current = null;
                                        }, 50);
                                    }}
                                >
                                    Generando contraseña...
                                </TextAnimate>
                            )}
                            {isPasswordReady && lastGeneratedPassword && (
                                <TextAnimate
                                    as="p"
                                    animation="blurInUp"
                                    by="character"
                                    once={true}
                                    startOnView={false}
                                    className="text-foreground text-center text-2xl"
                                >
                                    {lastGeneratedPassword}
                                </TextAnimate>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div> 
    );
}

