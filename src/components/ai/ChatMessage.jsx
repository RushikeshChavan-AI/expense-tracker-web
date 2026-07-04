import { Sparkles, User } from "lucide-react";

export default function ChatMessage({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-violet-soft text-violet" : "bg-gold-soft text-gold"
        }`}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser ? "glass-strong text-ink" : "glass text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
