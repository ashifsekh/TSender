import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
      <h1 className="text-xl font-bold text-white tracking-wide">
        TSender
      </h1>
       
      <div className="flex items-center gap-6">
        <a
          href="https://github.com/ashifsekh/TSender"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <FaGithub size={32} />
        </a>

        <ConnectButton />
      </div>
    </header>
  );
}
