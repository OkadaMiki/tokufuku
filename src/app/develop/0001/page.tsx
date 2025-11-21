"use client";

import { useState } from "react";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  // set〇〇は箱にものを入れるやつ、useStateは更新したら画面を書き換えてくれるやつ
  const todoList = ["todo1", "ueeei", "uhuhu"];

  return (
    <>
      <div>
        <input
          type="text"
          onBlur={(e) => {
            // onChangeは代わった瞬間に動かすやつ、onBlurはフォーカスが外れたときに動くやつ
            setInputValue(e.target.value);
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            // console.log(e);
            // setTodo(inputValue)
          }}
        >
          おくる
        </button>
      </div>
      <div>
        <ul>
          {todoList.map((todo, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <li key={index}>{todo}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
