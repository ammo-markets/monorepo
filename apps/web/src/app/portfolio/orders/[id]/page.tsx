import type { Metadata } from "next";
import { Navbar } from "@/components/ammo/navbar";
import { Footer } from "@/components/ammo/footer";
import { OrderDetailView } from "@/components/ammo/order-detail";

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

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Navbar />
      <main className="flex-1">
        <OrderDetailView orderId={id} />
      </main>
      <Footer />
    </div>
  );
}
