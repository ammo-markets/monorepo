import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function snowtraceUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

export function snowtraceAddressUrl(address: string): string {
  return `https://testnet.snowtrace.io/address/${address}`;
}
