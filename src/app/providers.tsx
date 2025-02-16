// app/providers.tsx
"use client";

import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const customTheme = extendTheme({
  config,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? "black" : "white",
        color: props.colorMode === "dark" ? "white" : "black",
      },
    }),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={customTheme}>{children}</ChakraProvider>
    </SessionProvider>
  );
}
