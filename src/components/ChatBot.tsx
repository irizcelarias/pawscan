import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Loader2, Sparkles, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
      content: "Hi there! I'm your pet care assistant. Ask me anything about pet nutrition, health, training, or care tips. I'm here to help! 🐾",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("pet-ai", {
        body: { type: "chat", message: textToSend },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an issue. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
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
                <p className="text-primary-foreground/80 text-xs">
                  Ask me anything about pets!
                </p>
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
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

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Try asking:
                </span>
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
