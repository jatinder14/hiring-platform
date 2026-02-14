"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function TokenTestPage() {
    const { data: session } = useSession();
    const [googleToken, setGoogleToken] = useState<string | null>(null);

    // Fetch Google Token from a server action or API (we'll mock the API call here for simplicity 
    // or you can create a simple API route if needed, but for now let's just show instructions)

    const [tokenInput, setTokenInput] = useState("");
    const [decryptedToken, setDecryptedToken] = useState<string | null>(null);

    // Dynamic import for the server action to avoid issues in client component during build if not handled correctly, 
    // but in Next.js 14+ we can just import. For safety/simplicity in this specific setup:
    // We will assume actions.ts is set up correctly.

    const handleDecrypt = async () => {
        if (!tokenInput) return;
        const { decryptToken } = await import("./actions");
        const result = await decryptToken(tokenInput);
        setDecryptedToken(result);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Token Inspector</h1>

            <section className="p-4 border rounded bg-yellow-50 border-yellow-200">
                <h2 className="font-semibold text-lg mb-2">🕵️ JWE Token Decrypter</h2>
                <p className="text-sm mb-4">
                    Your token is an <strong>Encrypted JWT (JWE)</strong>, which is why <code>jwt.io</code> cannot read it.
                    Paste it below to decrypt it using your app's secret key.
                </p>
                <div className="space-y-4">
                    <textarea
                        className="w-full p-2 border rounded font-mono text-sm h-24"
                        placeholder="Paste your eyJ... token here"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                    />
                    <button
                        onClick={handleDecrypt}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Decrypt Token
                    </button>
                    {decryptedToken && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm mb-1">Decrypted Payload:</h3>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs font-mono">
                                {decryptedToken}
                            </pre>
                        </div>
                    )}
                </div>
            </section>

            <section className="p-4 border rounded bg-gray-50">
                <h2 className="font-semibold text-lg mb-2">1. App Session Token (Browser Cookie)</h2>
                <p className="mb-2">
                    <strong>Status:</strong> {session ? "✅ Logged In" : "❌ Logged Out"}
                </p>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>To see and test this token:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Press <strong>F12</strong> to open DevTools.</li>
                        <li>Go to <strong>Application</strong> (Chrome) or <strong>Storage</strong> (Firefox) tab.</li>
                        <li>Expand <strong>Cookies</strong> on the left.</li>
                        <li>Click on your domain (e.g., <code>localhost:3000</code>).</li>
                        <li>Find the cookie named <code>next-auth.session-token</code>.</li>
                        <li>
                            <strong>Test:</strong> Double-click the <em>Value</em>, change one character, and press Enter.
                            Then refresh this page. You should be instantly logged out.
                        </li>
                    </ol>
                </div>
            </section>

            <section className="p-4 border rounded bg-gray-50">
                <h2 className="font-semibold text-lg mb-2">2. Google Access Token (Database)</h2>
                <p className="mb-2">There is no "Google Token" in your browser. It is stored securely in your MongoDB.</p>
                <p className="text-sm text-gray-600">
                    To see it, you would need to query your MongoDB <code>accounts</code> collection.
                </p>
            </section>
        </div>
    );
}
