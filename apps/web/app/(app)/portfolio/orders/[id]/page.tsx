import type { Metadata } from "next";
import { OrderDetailView } from "@/features/portfolio";

export const metadata: Metadata = {
  title: "Order Detail | Ammo Exchange",
  description:
    "Track the status of your mint or redemption order on Ammo Exchange.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrderDetailView orderId={id} />;
}
