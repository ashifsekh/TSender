"use client";

import { useState } from "react";
import InputField from "./ui/InputField";
import { chainsToTSender, erc20Abi } from "../constants";
import { useChainId, useConfig, useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';


export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState(""); // State for recipients
  const [amounts, setAmounts] = useState("");     // State for amounts

  const account = useAccount();
  const chainId = useChainId();
  const config = useConfig(); // Required for core actions like readContract

  async function getApprovedAmount(
    tSenderAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    userAddress: `0x${string}`
  ): Promise<bigint> {
    console.log(`Checking allowance for token ${tokenAddress}`);
    console.log("Owner Address:", userAddress);
    console.log("Spender (TSender) Address:", tSenderAddress);

    try {
      const allowance = (await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, tSenderAddress],
      })) as bigint;
      console.log("Raw Allowance:", allowance.toString());
      return allowance;
    } catch (error) {
      console.error("Error reading allowance from contract:", error);
      throw new Error("Failed to read allowance from contract.");
    }
  }

  async function handleSubmit() {
    console.log("Submitting Airdrop");
    console.log("Token Address:", tokenAddress);
    console.log("Recipients:", recipients);
    console.log("Amounts:", amounts);

    const tSenderConfig = chainsToTSender[chainId];
    console.log("Current chainId:", chainId);
    console.log("TSender Config:", tSenderConfig);

    if (!account.address) {
      alert("Please connect your wallet.");
      return;
    }
    if (!tSenderConfig || !tSenderConfig.tsender) {
      alert("TSender contract not found for the connected network. Please switch to another network.");
      return;
    }
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      alert("Please enter a valid ERC20 token address.");
      return;
    }
    try {
      const approvedAmount = await getApprovedAmount(
        tSenderConfig.tsender as `0x${string}`,
        tokenAddress as `0x${string}`,
        account.address
      );
      console.log("Approved Amount:", approvedAmount.toString());
    } catch (error) {
      console.error("Error during submission process:", error);
      alert("An error occurred. Please check the console for details.");
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <InputField
      label="Token Address"
      placeholder="0x..."
      value={tokenAddress}
      type="text"
      onChange={(e) => setTokenAddress(e.target.value)}
    />

    <InputField
      label="Recipients"
      placeholder="0x123..., 0x456..."
      value={recipients}
      type="text"
      onChange={(e) => setRecipients(e.target.value)}
      large={true}
    />

    <InputField
      label="Amounts"
      placeholder="100, 200"
      value={amounts}
      type="text"
      onChange={(e) => setAmounts(e.target.value)}
      large={true}
    />

    <button type="submit">Send Tokens</button>
  </form>
    );
}


