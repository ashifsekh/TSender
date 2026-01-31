"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, zksync, mainnet } from "wagmi/chains";

const walletConnectProjectId =
  '56789012345678901234567890123456789';

if (!walletConnectProjectId) {
  throw new Error("Missing WalletConnect Project ID");
}

const config = getDefaultConfig({
  appName: "TSender",
  projectId: walletConnectProjectId,
  chains: [anvil, zksync, mainnet],
  ssr: false,
});

export default config;
