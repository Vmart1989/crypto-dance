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
    const { coinId, coinSymbol, amount, price, fiatRevenue, fiatCurrency } = await request.json();
    const cryptoAmount = Number(amount), unitPrice = Number(price), totalRevenue = Number(fiatRevenue);
    if (!coinId || !coinSymbol || !Number.isFinite(cryptoAmount) || cryptoAmount <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(totalRevenue) || totalRevenue <= 0 || !["EUR", "USD"].includes(fiatCurrency)) return NextResponse.json({ error: "Invalid transaction details" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("WALLET_NOT_FOUND");
      const asset = await tx.cryptoAsset.findFirst({ where: { userId, coinId } });
      if (!asset) throw new Error("ASSET_NOT_FOUND");
      const debit = await tx.cryptoAsset.updateMany({ where: { id: asset.id, balance: { gte: cryptoAmount } }, data: { balance: { decrement: cryptoAmount } } });
      if (!debit.count) throw new Error("INSUFFICIENT_ASSET");
      const updatedWallet = await tx.wallet.update({ where: { userId }, data: { fiatBalance: { increment: totalRevenue } } });
      const transaction = await tx.transaction.create({ data: { type: "sell", cryptoSymbol: coinSymbol, coinId, amount: cryptoAmount, price: unitPrice, fiatAmount: totalRevenue, fiatCurrency, userId } });
      await tx.cryptoAsset.deleteMany({ where: { id: asset.id, balance: { lte: Number.EPSILON } } });
      const updatedCryptoAssets = await tx.cryptoAsset.findMany({ where: { userId }, orderBy: { balance: "desc" } });
      return { updatedWallet, transaction, updatedCryptoAssets };
    });
    await recordActivity({ request, event: "trading.sell", category: "trading", summary: `Sold ${cryptoAmount} ${coinSymbol}`, userId, metadata: { transactionId: result.transaction.id, coinId, symbol: coinSymbol, amount: cryptoAmount, fiatAmount: totalRevenue, fiatCurrency } });
    return NextResponse.json({ message: "Sell successful", ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    if (error instanceof Error && error.message === "ASSET_NOT_FOUND") return NextResponse.json({ error: "You do not own this coin." }, { status: 400 });
    if (error instanceof Error && error.message === "INSUFFICIENT_ASSET") return NextResponse.json({ error: "Insufficient coin balance." }, { status: 400 });
    console.error("Error processing sale:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 });
  }
}
