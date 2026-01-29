"use client";

import {getDefaultConfig} from "@rainbow-me/rainbowkit";
import {anvil, zksync} from "wagmi/chains";

export default getDefaultConfig({
    appName: "TSender",
    projectId: "null",
    chains: [anvil, zksync],
    ssr: false
})