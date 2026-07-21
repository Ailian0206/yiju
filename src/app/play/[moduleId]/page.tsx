import { notFound } from "next/navigation";
import { GameScreen } from "@/components/game/GameScreen";
import { getModule, getModuleBundle } from "@/content/registry";

interface PlayPageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { moduleId } = await params;
  const meta = getModule(moduleId);
  if (!meta) notFound();
  // preview 模组不允许直接开玩,避免糟糕的空壳体验
  if (meta.status !== "playable" || !getModuleBundle(moduleId)) {
    notFound();
  }

  return (
    <main>
      <GameScreen moduleId={moduleId} />
    </main>
  );
}
