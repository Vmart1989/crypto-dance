export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const userId = auth.user.id;
    const { coinId, coinSymbol, amount, price, fiatCost, fiatCurrency } = await request.json();
    const cryptoAmount = Number(amount), unitPrice = Number(price), totalCost = Number(fiatCost);
    if (!coinId || !coinSymbol || !Number.isFinite(cryptoAmount) || cryptoAmount <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(totalCost) || totalCost <= 0 || !["EUR", "USD"].includes(fiatCurrency)) return NextResponse.json({ error: "Invalid transaction details" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("WALLET_NOT_FOUND");
      const debit = await tx.wallet.updateMany({ where: { userId, fiatBalance: { gte: totalCost } }, data: { fiatBalance: { decrement: totalCost } } });
      if (!debit.count) throw new Error("INSUFFICIENT_FUNDS");
      const updatedWallet = await tx.wallet.findUnique({ where: { userId } });
      const transaction = await tx.transaction.create({ data: { type: "buy", cryptoSymbol: coinSymbol, coinId, amount: cryptoAmount, price: unitPrice, fiatAmount: totalCost, fiatCurrency, userId } });
      const asset = await tx.cryptoAsset.findFirst({ where: { userId, coinId } });
      if (asset) await tx.cryptoAsset.update({ where: { id: asset.id }, data: { balance: { increment: cryptoAmount } } });
      else await tx.cryptoAsset.create({ data: { symbol: coinSymbol, coinId, balance: cryptoAmount, userId } });
      const updatedCryptoAssets = await tx.cryptoAsset.findMany({ where: { userId }, orderBy: { balance: "desc" } });
      return { updatedWallet, transaction, updatedCryptoAssets };
    });
    await recordActivity({ request, event: "trading.buy", category: "trading", summary: `Bought ${cryptoAmount} ${coinSymbol}`, userId, metadata: { transactionId: result.transaction.id, coinId, symbol: coinSymbol, amount: cryptoAmount, fiatAmount: totalCost, fiatCurrency } });
    return NextResponse.json({ message: "Purchase successful", ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    if (error instanceof Error && error.message === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Insufficient fiat funds" }, { status: 400 });
    console.error("Error processing purchase:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}
