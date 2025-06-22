import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

export default function StartCall() {
  const { status, connect } = useVoice();

  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <ShootingStars />
        <StarsBackground />
      </div>

      <AnimatePresence>
        {status.value !== "connected" ? (
          <motion.div
            className={
              "fixed inset-0 p-4 flex flex-col items-center justify-center bg-background bg-opacity-80"
            }
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{
              initial: { opacity: 0, filter: "blur(10px)" },
              enter: { opacity: 1, filter: "blur(0px)" },
              exit: { opacity: 0, filter: "blur(10px)" },
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl mb-6 text-center text-primary"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              Chat now!
            </motion.h1>
            <AnimatePresence>
              <motion.div
                variants={{
                  initial: { scale: 0.5, filter: "blur(10px)" },
                  enter: { scale: 1, filter: "blur(0px)" },
                  exit: { scale: 0.5, filter: "blur(10px)" },
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <Button
                  className={"z-50 flex items-center gap-1.5"}
                  onClick={() => {
                    connect()
                      .then(() => {})
                      .catch(() => {})
                      .finally(() => {});
                  }}
                >
                  <span>
                    <Mic
                      className={"size-5 opacity-50"}
                      strokeWidth={2}
                      stroke={"currentColor"}
                    />
                  </span>
                  <span>Speak</span>
                </Button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
