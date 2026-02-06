"use client";

import HomeContent from "../components/HomeContant";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <main style={{ padding: "2rem" }}>
      <div>
        {!isConnected ? (
          <div> <h1>Please connect your wallet</h1></div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end" }}></div>
            <div>
              <h1>Welcome to TSender</h1>
              <HomeContent />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
