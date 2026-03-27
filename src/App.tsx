import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getChatSession } from "./lib/gemini";
import type { GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Gemini. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<ReturnType<typeof getChatSession> | null>(null);

  useEffect(() => {
    chatSessionRef.current = getChatSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = getChatSession();
      }

      const result = await chatSessionRef.current.sendMessage({
        message: userMessage.content,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat cleared. How else can I help you?",
        timestamp: new Date(),
      },
    ]);
    chatSessionRef.current = getChatSession();
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Gemini AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear chat"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-100 text-blue-600" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-[10px] mt-1 block opacity-60 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center bg-white border border-neutral-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span className="text-sm text-neutral-500 font-medium">Gemini is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Gemini anything..."
              className="w-full pl-4 pr-12 py-3.5 bg-neutral-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-medium uppercase tracking-widest">
            <Sparkles size={10} />
            Powered by Gemini AI
          </div>
        </div>
      </footer>
    </div>
  );
}
