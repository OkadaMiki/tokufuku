'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // すでにログインしている場合はホームへ
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) router.push('/home');
            setChecking(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            // Firebase Auth に登録
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // Firestore にユーザー情報を保存
            await setDoc(doc(db, 'users', uid), {
                username,
                email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            //  ホームへ遷移
            router.push('/home');
        } catch (err: any) {
            console.error(err);
            setError('登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (checking) return <p className="p-4">ログイン状態を確認中...</p>;

    return (
        <div className="flex flex-col items-center justify-center h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">新規登録</h1>

            <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded p-2 w-64 mb-2"
            />
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded p-2 w-64 mb-2"
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded p-2 w-64 mb-4"
            />

            <button
                onClick={handleSignup}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                {loading ? '登録中…' : '登録'}
            </button>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <p className="mt-4 text-sm">
                すでにアカウントをお持ちの方は{' '}
                <button
                onClick={() => router.push('/login')}
                className="text-blue-500 underline"
                >
                    ログイン
                </button>
            </p>
        </div>
    );
}
