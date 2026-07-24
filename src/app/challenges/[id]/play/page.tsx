import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChallenge, listChallenges } from "@/challenges/registry";
import { listPlayableGameIds } from "@/challenges/playIds";
import { ChallengePlayMount } from "@/components/challenges/ChallengePlayMount";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  const playable = new Set(listPlayableGameIds());
  return listChallenges()
    .filter((c) => playable.has(c.id))
    .map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = getChallenge(id);
  if (!meta) return { title: "挑战中 · 一局" };
  return {
    title: `${meta.title}进行中 · 一局`,
    description: `${meta.title}挑战进行中。`,
  };
}

export default async function ChallengePlayPage({ params }: Props) {
  const { id } = await params;
  const meta = getChallenge(id);
  if (!meta || !listPlayableGameIds().includes(id)) notFound();
  return (
    <main>
      <ChallengePlayMount id={id} />
    </main>
  );
}
