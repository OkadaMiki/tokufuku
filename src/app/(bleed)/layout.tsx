import "../globals.css";
import { Zen_Maru_Gothic } from "next/font/google";
import type { Metadata } from "next";


const zenMaru = Zen_Maru_Gothic({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Tokufuku",
    description: "徳を記録してハッピーに生きる",
};

export default function BleedLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body className={zenMaru.className}>
                <div className="siteShell siteShell--bleed">
                    <main className="siteContent">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}