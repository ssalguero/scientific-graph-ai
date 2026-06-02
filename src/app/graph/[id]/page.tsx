"use client";

import { useParams } from "next/navigation";
import { GraphEditor } from "../../page";

export default function SharedGraphPage() {
  const params = useParams();
  const rawId = params.id;
  const shareGraphId = Array.isArray(rawId) ? rawId[0] : rawId;

  return <GraphEditor shareGraphId={shareGraphId} />;
}
