"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DebugResetButton } from "@/components/features/debug/DebugResetButton";

export default function Page() {
  const { user } = useAuthGuard({ requireLogin: false, redirectIfLoggedIn: false });
  const [inputValue, setInputValue] = useState("");
  // set〇〇は箱にものを入れるやつ、useStateは更新したら画面を書き換えてくれるやつ
  const [todoList, setTodoList] = useState<string[]>([]);
  // 配列が空で、どんな物が入るかわからないとエラーが出る = 型安全
  // <string[]> 　= 型定義

  return (
    <>
      <div style={{ padding: "20px" }}>
        {user?.uid && (
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px dashed #ff6b6b" }}>
            <h3 style={{ marginBottom: "10px" }}>デモ用リセットボタン</h3>
            <p style={{ fontSize: "12px", marginBottom: "10px" }}>
              進捗を Lv1 / XP90 / 占い未実施 にリセットします。
            </p>
            <DebugResetButton uid={user.uid} />
          </div>
        )}

        <div>
          <input
            type="text"
            onChange={(e) => {
              // onChangeは代わった瞬間に動かすやつ、onBlurはフォーカスが外れたときに動くやつ
              setInputValue(e.target.value);
            }}
            value={inputValue}
            // 送ったら空にしたい、onBlurからonChangeに変更
          />
          <button
            type="button"
            onClick={(e) => {
              setTodoList([...todoList, inputValue]);
              // ...はスプレット構文、配列を展開してくれるやつ
              setInputValue("");
            }}
          >
            おくる
          </button>
        </div>
        <Link href={"/develop/0001"}>つぎ</Link>
        <div>
          <ul>
            {/* mapかく */}
            {todoList.map((todo, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: dev file
              <li key={index}>
                {todo}
                <button
                  type="button"
                  onClick={() => {
                    setTodoList(
                      todoList.filter(
                        (_, indexForDel) =>
                          // 条件にあてはまったやつだけ出してくれる
                          indexForDel !== index,
                      ),
                    );
                  }}
                >
                  さくじょ
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
