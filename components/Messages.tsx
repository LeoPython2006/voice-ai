"use client";
import { cn } from "@/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentRef, forwardRef, useEffect, useRef } from "react";
import { detectLanguage } from "@/utils/languageDetector";

const Messages = forwardRef<
  ComponentRef<typeof motion.div>,
  Record<never, never>
>(function Messages(_, ref) {
  const { messages, sendSessionSettings } = useVoice();
  const lastLang = useRef<string>("eng");

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.type === "user_message" && last.message.content) {
      const code = detectLanguage(last.message.content);
      if (code && code !== lastLang.current) {
        lastLang.current = code;
        if (code === "rus") {
          sendSessionSettings({ system_prompt: "Продолжай диалог на русском языке." });
        } else {
          sendSessionSettings({ system_prompt: "Continue the conversation in the language used by the user." });
        }
      }
    }
  }, [messages, sendSessionSettings]);

  return (
    <motion.div
      layoutScroll
      className={"grow rounded-md overflow-auto p-4"}
      ref={ref}
    >
      <motion.div
        className={"max-w-2xl mx-auto w-full flex flex-col gap-4 pb-24"}
      >
        <AnimatePresence mode={"popLayout"}>
          {messages.map((msg: any, index: number) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              return (
                <motion.div
                  key={msg.type + index}
                  className={cn(
                    "w-[80%]",
                    "bg-card",
                    "border border-border rounded",
                    msg.type === "user_message" ? "ml-auto" : ""
                  )}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 0,
                  }}
                >
                  <div
                    className={cn(
                      "text-xs capitalize font-medium leading-none opacity-50 pt-4 px-3"
                    )}
                  >
                    {msg.message.role}
                  </div>
                  <div className={"pb-3 px-3"}>{msg.message.content}</div>
                  <Expressions values={{ ...msg.models.prosody?.scores }} />
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

export default Messages;
