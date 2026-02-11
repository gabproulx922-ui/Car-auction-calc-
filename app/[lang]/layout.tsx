import { notFound } from "next/navigation";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang;
  if (lang !== "fr" && lang !== "en") notFound();
  return <>{children}</>;
}
