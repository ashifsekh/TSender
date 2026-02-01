"use client";

import { useState } from "react";
import InputField from "./ui/InputField";

export default function MyComponent() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState(""); // State for recipients
  const [amounts, setAmounts] = useState("");     // State for amounts



async function handleSubmit() {
    console.log("Token Address:", tokenAddress);
    console.log("Recipients:", recipients);
    console.log("Amounts:", amounts);
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


