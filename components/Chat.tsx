"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { useRef, ComponentRef } from "react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";

/* -------------------------------------------------------------------------- */
/* 1 · Props – discriminated union: exactly one credential must be supplied.  */
/* -------------------------------------------------------------------------- */
export type ChatProps =
  | { accessToken: string; apiKey?: never } // production / clean IP
  | { apiKey: string; accessToken?: never }; // local dev / VPN fallback

export default function Chat(props: ChatProps) {
  /* ------------------------------------------------------------------------ */
  /* 2 · Refs for scroll-to-bottom when a new message arrives                 */
  /* ------------------------------------------------------------------------ */
  const messagesRef = useRef<ComponentRef<typeof Messages> | null>(null);
  const scrollTimeout = useRef<number | null>(null);

  /* Optional: use a pre-saved config from your Hume dashboard                */
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  /* ------------------------------------------------------------------------ */
  /* 3 · Normalise the auth object for <VoiceProvider>                        */
  /* ------------------------------------------------------------------------ */
  const auth =
    "accessToken" in props
      ? { type: "accessToken" as const, value: props.accessToken }
      : { type: "apiKey" as const, value: props.apiKey };

  return (
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden">
      <VoiceProvider
        auth={auth}
        configId={configId}
        /* Auto-scroll chat window a moment after each incoming message */
        onMessage={() => {
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
          scrollTimeout.current = window.setTimeout(() => {
            if (messagesRef.current) {
              messagesRef.current.scrollTo({
                top: messagesRef.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
        <Messages ref={messagesRef} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}
