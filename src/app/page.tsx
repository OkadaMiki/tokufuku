// コーディング用
// 起動したら home へ
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/home");
}
