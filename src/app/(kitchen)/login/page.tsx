"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store";
import { LoginResponse } from "@/types";

export default function KitchenLogin() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
            const res = await api.login(user, pass) as LoginResponse;
            const { accessToken, username } = res;
            setAuth(accessToken, username);
            api.useToken(accessToken);
            router.push("/kitchen/dashboard");
        } catch (e: any) {  
            setErr(e.message ?? "Login failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1
                        style={{ fontFamily: "'Playfair Display',serif" }}
                        className="text-[#F0C050] text-3xl font-bold tracking-widest"
                    >
                        EMBER
                    </h1>
                    <p className="text-stone-400 text-sm mt-1">
                        Kitchen dashboard
                    </p>
                </div>
                <form
                    onSubmit={handleLogin}
                    className="bg-[#2D2420] rounded-2xl p-6 space-y-4 border border-white/10"
                >
                    {(["Username", "Password"] as const).map((label, i) => (
                        <div key={label}>
                            <label className="text-xs font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
                                {label}
                            </label>
                            <input
                                type={i === 1 ? "password" : "text"}
                                value={i === 0 ? user : pass}
                                onChange={(e) =>
                                    i === 0
                                        ? setUser(e.target.value)
                                        : setPass(e.target.value)
                                }
                                placeholder={i === 0 ? "admin" : "••••••••"}
                                required
                                className="w-full px-4 py-3 bg-[#1A1410] border border-white/10 rounded-lg text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C8410A]/50 focus:border-[#C8410A] text-sm"
                            />
                        </div>
                    ))}
                    {err && (
                        <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
                            {err}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={busy || !user || !pass}
                        className="w-full bg-[#C8410A] hover:bg-[#A33508] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {busy && (
                            <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                        )}
                        {busy ? "Signing in…" : "Sign in"}
                    </button>
                    <p className="text-center text-xs text-stone-500">
                        Default: admin / ember2024!
                    </p>
                </form>
            </div>
        </div>
    );
}
