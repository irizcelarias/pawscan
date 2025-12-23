import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Loader2, Sparkles, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "Can dogs eat chocolate?",
  "Best food for senior cats?",
  "How often should I walk my dog?",
  "Signs of a healthy pet",
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm your pet care assistant. Ask me anything about pet nutrition, health, training, or care tips. I'm here to help! 🐾",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const FLOWISE_URL = import.meta.env.VITE_FLOWISE_API_URL as string | undefined;

  // ✅ follow-up prompts (ALWAYS array)
  const [followUps, setFollowUps] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, followUps]);

  // ✅ robust parser: supports array, JSON string, and double-encoded JSON string
  const normalizeFollowUps = (val: any): string[] => {
    if (!val) return [];

    // already array
    if (Array.isArray(val)) {
      return val.filter((x) => typeof x === "string" && x.trim());
    }

    // string -> parse 1x or 2x
    if (typeof val === "string") {
      let s = val.trim();
      if (!s) return [];

      // sometimes Flowise returns like: "\"[\\\"q1\\\",\\\"q2\\\"]\""
      // so parse repeatedly if needed
      for (let i = 0; i < 2; i++) {
        try {
          const parsed = JSON.parse(s);

          if (Array.isArray(parsed)) {
            return parsed.filter((x) => typeof x === "string" && x.trim());
          }

          // if still string after parsing, try parse again
          if (typeof parsed === "string") {
            s = parsed.trim();
            continue;
          }

          break;
        } catch {
          return [];
        }
      }
      return [];
    }

    return [];
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    // ✅ clear followups when sending a new message
    setFollowUps([]);

    if (!FLOWISE_URL) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: textToSend },
        {
          role: "assistant",
          content:
            "Flowise is not configured. Please set VITE_FLOWISE_API_URL in your .env and restart the dev server.",
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(FLOWISE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        console.error("Flowise error:", res.status, rawText);
        throw new Error(`Flowise error ${res.status}`);
      }

      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { text: rawText };
      }

      const answer =
        data.text ||
        data.answer ||
        data.response ||
        data?.data?.text ||
        "No response from Flowise.";

      // ✅ parse follow-ups (Flowise key is followUpPrompts)
      const ups = normalizeFollowUps(data.followUpPrompts);

      // ✅ debug (tan-awa sa Console)
      console.log("[Flowise] followUpPrompts raw:", data.followUpPrompts);
      console.log("[Flowise] parsed followUps:", ups);

      setMessages((prev) => [...prev, { role: "assistant", content: String(answer) }]);

      // ✅ show follow-ups after assistant reply
      if (ups.length > 0) setFollowUps(ups);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an issue connecting to the chatbot. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-warm rounded-full shadow-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center z-50 hover:scale-105 active:scale-95"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-card rounded-2xl shadow-soft border border-border flex flex-col z-50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-warm p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary-foreground">
                  Pet Care Assistant
                </h3>
                <p className="text-primary-foreground/80 text-xs">Ask me anything about pets!</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {/* ✅ Follow-up prompts (from Flowise) */}
            {!isLoading && followUps.length > 0 && (
              <div className="pt-1">
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Try these prompts:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-peach text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (initial only) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Try asking:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-peach text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about pet care..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
