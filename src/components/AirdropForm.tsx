"use client";

import { useState, useMemo } from "react";
import InputField from "./ui/InputField";
import { chainsToTSender, erc20Abi, tsenderAbi } from "../constants";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useWriteContract } from "wagmi";
import { calculateTotal } from "../utils/calculateTotal/calculateTotal";
import { CgSpinner } from "react-icons/cg";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState(""); // State for recipients
  const [amounts, setAmounts] = useState(""); // State for amounts
  const [isConfirming, setIsConfirming] = useState(false); // Waiting for wallet confirmation
  const [isMining, setIsMining] = useState(false); // Waiting for transaction to be mined
  const [error, setError] = useState<string | null>(null); // Error message

  const account = useAccount();
  const chainId = useChainId();
  const config = useConfig(); // Required for core actions like readContract
  const { writeContractAsync } = useWriteContract(); // Hook for writing to contracts

  const totalAmountNeeded = useMemo(() => {
    return calculateTotal(amounts);
  }, [amounts]);

  async function getApprovedAmount(
    tSenderAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    userAddress: `0x${string}`,
  ): Promise<bigint> {
    console.log(`Checking allowance for token ${tokenAddress}`);
    console.log("Owner Address:", userAddress);
    console.log("Spender (TSender) Address:", tSenderAddress);

    try {
      const allowance = (await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
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

    // Reset error state
    setError(null);

    // Validate inputs first
    if (!account.address) {
      setError("Please connect your wallet.");
      return;
    }

    const tSenderConfig = chainsToTSender[chainId];
    console.log("Current chainId:", chainId);
    console.log("TSender Config:", tSenderConfig);

    if (!tSenderConfig || !tSenderConfig.tsender) {
      setError(
        "TSender contract not found for the connected network. Please switch to another network.",
      );
      return;
    }

    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      setError("Please enter a valid ERC20 token address.");
      return;
    }

    const tSenderAddress = tSenderConfig.tsender as `0x${string}`;
    const total = BigInt(Math.ceil(totalAmountNeeded * 10 ** 18));

    try {
      const approvedAmount = await getApprovedAmount(
        tSenderAddress,
        tokenAddress as `0x${string}`,
        account.address,
      );
      console.log("Approved Amount:", approvedAmount.toString());

      if (approvedAmount < total) {
        try {
          console.log(
            `Approval needed: Current ${approvedAmount}, Required ${total}`,
          );

          // Set confirming state before calling writeContractAsync
          setIsConfirming(true);

          // Initiate Approve Transaction
          const approvalHash = await writeContractAsync({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "approve",
            args: [tSenderAddress, total],
          });
          console.log("Approval transaction hash:", approvalHash);

          // Switch to mining state
          setIsConfirming(false);
          setIsMining(true);

          // Wait for the transaction to be mined
          console.log("Waiting for approval confirmation...");
          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
          });
          console.log("Approval confirmed:", approvalReceipt);

          // Check receipt status for success
          if (approvalReceipt.status !== "success") {
            console.error("Approval transaction failed:", approvalReceipt);
            setError("Approval transaction failed. Please try again.");
            setIsMining(false);
            return;
          }

          console.log("Approval successful, proceeding to airdrop.");
          await executeAirdrop(tSenderAddress);
        } catch (err) {
          console.error("Approval process error:", err);
          setError("Approval failed. Please try again.");
          setIsConfirming(false);
          setIsMining(false);
          return;
        }
      } else {
        console.log(`Sufficient allowance: ${approvedAmount}`);
        console.log("Sufficient allowance, proceeding directly to airdrop.");
        await executeAirdrop(tSenderAddress);
      }
    } catch (error) {
      console.error("Error during submission process:", error);
      setError("An error occurred. Please check the console for details.");
      setIsConfirming(false);
      setIsMining(false);
    }
  }

  async function executeAirdrop(tSenderAddress: `0x${string}`) {
    try {
      console.log("Executing airdropERC20...");

      // Parse user input for recipients
      const recipientAddresses = recipients
        .split(/[, \n]+/)
        .map((addr) => addr.trim())
        .filter((addr) => addr !== "")
        .map((addr) => addr as `0x${string}`);

      // Parse user input for amounts and convert to proper decimals (18 decimals for ERC20)
      const transferAmounts = amounts
        .split(/[, \n]+/)
        .map((amt) => amt.trim())
        .filter((amt) => amt !== "")
        .map((amount) => BigInt(Math.ceil(parseFloat(amount) * 10 ** 18))); // Apply 18 decimal places

      if (recipientAddresses.length !== transferAmounts.length) {
        throw new Error("Mismatch between number of recipients and amounts.");
      }

      // Calculate total from individual amounts to ensure consistency
      const calculatedTotal = transferAmounts.reduce(
        (sum, amount) => sum + amount,
        BigInt(0),
      );

      // Set confirming state before calling writeContractAsync
      setIsConfirming(true);

      // Initiate Airdrop Transaction
      const airdropHash = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress,
        functionName: "airdropERC20",
        args: [
          tokenAddress as `0x${string}`,
          recipientAddresses,
          transferAmounts,
          calculatedTotal, // Use calculated total from individual amounts
        ],
      });
      console.log("Airdrop transaction hash:", airdropHash);

      // Switch to mining state
      setIsConfirming(false);
      setIsMining(true);

      // Wait for airdrop confirmation
      console.log("Waiting for airdrop confirmation...");
      const airdropReceipt = await waitForTransactionReceipt(config, {
        hash: airdropHash,
      });
      console.log("Airdrop confirmed:", airdropReceipt);

      if (airdropReceipt.status === "success") {
        setError(null);
        alert("Airdrop successful! Tokens have been distributed.");
      } else {
        setError("Airdrop transaction failed. Please try again.");
      }

      setIsMining(false);
    } catch (err) {
      console.error("Airdrop failed:", err);
      setError("Airdrop failed. Please check the console for details.");
      setIsConfirming(false);
      setIsMining(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
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

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isConfirming || isMining}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200
             hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {/* Confirming State */}
        {isConfirming ? (
          <>
            <CgSpinner className="h-4 w-4 animate-spin" />
            Confirming in wallet...
          </>
        ) : /* Mining State */
        isMining ? (
          <>
            <CgSpinner className="h-4 w-4 animate-spin" />
            Mining transaction...
          </>
        ) : (
          /* Default State */
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              />
            </svg>
            Send Tokens
          </>
        )}
      </button>
    </form>
  );
}
