'use client'

export default function Test() {
    return (
        <>
            <div>
                <input
                    type="text"
                    onBlur={(e) => {
                        console.log(e.target.value);
                    }}

                />
                <button
                    onClick={(e) => {
                        console.log(e);
                    }}
                >おくる</button>
            </div>
            <div>
                <ul>
                    <li>
                        なんかでる
                        <button>さくじょ</button>
                    </li>
                    <li>
                        なんかでる
                        <button>さくじょ</button>
                    </li>
                    <li>
                        なんかでる
                        <button>さくじょ</button>
                    </li>
                </ul>
            </div>
        </>
    );
}
