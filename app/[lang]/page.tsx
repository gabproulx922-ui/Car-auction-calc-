import LangAppClient from "@/components/LangAppClient";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: "fr" | "en" }>;
}) {
  const { lang } = await params;
  if (lang !== "fr" && lang !== "en") notFound();
  return <LangAppClient lang={lang} />;
}
