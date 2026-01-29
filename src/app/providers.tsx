"use client";

import {type ReactNode} from "react";
import config from "../rainbowKitConfig";
import { wagmiProvider} from "wagmi";
import {RainboKitProvider} from "@rainbow-me/rainbowkit";

export function Providers (props: {children: ReactNode }) {
    return (
        <WagmiProvider config={config.wagmi}>
            <RainbowKitProvider config={config.rainbowKit}>
                {props.children}
            </RainbowKitProvider>
        </WagmiProvider>
    )
}