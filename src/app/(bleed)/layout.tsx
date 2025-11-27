import "../globals.css";

import type { Metadata } from "next";




export const metadata: Metadata = {
    title: "Tokufuku",
    description: "徳を記録してハッピーに生きる",
};

export default function BleedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="siteShell siteShell--bleed">
            <main className="siteContent">
                {children}
            </main>
        </div>
    );
}