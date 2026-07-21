"use client";

// 封面图失败时隐藏 img,露出父级渐变底图,避免破图图标。
import { useState } from "react";
import { publicUrl } from "@/lib/base-path";

interface ModuleCoverProps {
  src: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ModuleCover({ src, className, width = 640, height = 400 }: ModuleCoverProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={publicUrl(src)}
      alt=""
      width={width}
      height={height}
      onError={() => setFailed(true)}
    />
  );
}
