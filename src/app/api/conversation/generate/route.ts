import { NextResponse } from "next/server";

import { createProductContext, runConversationTurn } from "@/lib/conversation/experience";
import type {
  ConversationMessage,
  ProductContext,
} from "@/lib/conversation/experience";
import { isProductScreenId } from "@/lib/product-navigation";

export const runtime = "nodejs";

function parseProduct(value: unknown): ProductContext | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<ProductContext> & { productScreen?: unknown };
  if (
    typeof record.productScreen !== "string" ||
    !isProductScreenId(record.productScreen)
  ) {
    return null;
  }
  return createProductContext({
    ...record,
    productScreen: record.productScreen,
  });
}

export async function POST(request: Request) {
  let body: {
    text?: unknown;
    history?: unknown;
    product?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "empty-text" }, { status: 400 });
  }
  const product = parseProduct(body.product);
  if (!product) {
    return NextResponse.json({ error: "invalid-product" }, { status: 400 });
  }
  const history = Array.isArray(body.history)
    ? (body.history as ConversationMessage[]).filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
    : [];

  try {
    const result = await runConversationTurn({
      text,
      history,
      product,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "generation-failed" }, { status: 502 });
  }
}
