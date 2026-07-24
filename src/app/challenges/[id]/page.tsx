import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChallenge, listChallenges } from "@/challenges/registry";
import { introDescription } from "@/challenges/introCopy";
import { ChallengeIntroLayout } from "@/components/challenges/ChallengeIntroLayout";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return listChallenges().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = getChallenge(id);
  if (!meta) return { title: "挑战局 · 一局" };
  return {
    title: `${meta.title} · 一局`,
    description: introDescription(meta),
  };
}

export default async function ChallengeIntroPage({ params }: Props) {
  const { id } = await params;
  const meta = getChallenge(id);
  if (!meta) notFound();
  return <ChallengeIntroLayout meta={meta} />;
}
