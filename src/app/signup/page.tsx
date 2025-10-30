'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

import AuthInput from "@/components/AuthInput";
import PrimaryButton from "@/components/PrimaryButton";
import LoadingMessage from "@/components/LoadingMessage";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loading: checking } = useAuthGuard({ requireLogin: false, redirectTo: "/home" });
    if (checking) return <LoadingMessage text="ログイン状態を確認中..." />;

    const handleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;
            await setDoc(doc(db, 'users', uid), {
                username,
                email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            router.push('/home');
        } catch (err: any) {
            console.error(err);
            setError('登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">新規登録</h1>

            <AuthInput placeholder="ユーザー名" value={username} onChange={setUsername} />
            <AuthInput type="email" placeholder="メールアドレス" value={email} onChange={setEmail} />
            <AuthInput type="password" placeholder="パスワード" value={password} onChange={setPassword} />

            <PrimaryButton
                text="登録"
                onClick={handleSignup}
                loading={loading}
                disabled={loading}
                color="green"
            />

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <p className="mt-4 text-sm">
                すでにアカウントをお持ちの方は{" "}
                <button onClick={() => router.push('/login')} className="text-blue-500 underline">
                    ログイン
                </button>
            </p>
        </div>
    );
}
