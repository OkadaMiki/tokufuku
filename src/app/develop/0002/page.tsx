"use client";

import { useState } from "react";

type Tag = {
  name: string,
  color?: string
}

type Todo = {
  name: string,
  isCompleted: boolean,
  createdAt: Date,
  tagList: Tag[]
}

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [todoList, setTodoList] = useState<Todo[]>([
    {
      name: "todo1",
      isCompleted: true,
      createdAt: new Date(),
      tagList: []
    },
    {
      name: "todo1",
      isCompleted: true,
      createdAt: new Date(),
      tagList: []
    },
  ])
  // set〇〇は箱にものを入れるやつ、useStateは更新したら画面を書き換えてくれるやつ


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
            <div key={index}>
              <li>{todo.name}</li>
              <input type="checkbox" name="" id="" checked={todo.isCompleted}
                onChange={() => {
                  setTodoList(
                    todoList.map((t, i) => (
                      // 押したやつだったら{}の中のことをして、違ったら子要素そのままお返し
                      i === index
                        ? {
                          ...t,
                          // isCompletedのことだけ書いて、中身がそれだけに更新されないように、一旦全部返す。
                          isCompleted: !t.isCompleted
                        }
                        : t
                      // ? = だったら
                      // : = 違ったら
                    ))
                  )
                }}
              />
            </div>
          ))}
        </ul>
      </div>
    </>
  );
}
