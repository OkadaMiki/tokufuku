"use client";

import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  // set〇〇は箱にものを入れるやつ、useStateは更新したら画面を書き換えてくれるやつ
  const [todoList, setTodoList] = useState<string[]>([]);
  // 配列が空で、どんな物が入るかわからないとエラーが出る = 型安全
  // <string[]> 　= 型定義

  return (
    <>
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
    </>
  );
}
