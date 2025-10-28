'use client';

import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';import { auth } from '@/lib/firebase';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

  // ✅ すでにログインしている場合はホームへリダイレクト
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home'); // ログイン済み → ホームへ
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

    const handleLogin = async () => {
            setError('');
            setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/home'); // ログイン後にホームへ
        } catch (err: any) {
            console.error(err);
            setError('ログインに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (checking) return <p className="p-4">ログイン状態を確認中...</p>;

    return (
        <div className="flex flex-col items-center justify-center h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">ログイン</h1>

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
                onClick={handleLogin}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            {loading ? 'ログイン中…' : 'ログイン'}
            </button>

            {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>
    );
}
