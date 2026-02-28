import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { explorerTxUrl, explorerAddressUrl } from "@/lib/chain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function snowtraceUrl(txHash: string): string {
  return explorerTxUrl(txHash);
}

export function snowtraceAddressUrl(address: string): string {
  return explorerAddressUrl(address);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
