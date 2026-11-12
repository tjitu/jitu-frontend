import { redirect } from "next/navigation";

export default function SoalAsliRedirect() {
  redirect("/arsip-soal?from=landing");
}
