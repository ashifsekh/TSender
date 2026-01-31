import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ConnectButton />
      </div>
      <h1>Welcome to TSender</h1>
    </main>
  );
}
