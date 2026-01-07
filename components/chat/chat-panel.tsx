"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Bot, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply = data?.content || "Sorry, I couldn't generate a reply.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "There was an error contacting the AI." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background text-foreground">
      {/* Sidebar (reuse look) */}
      <aside className="flex h-screen flex-col border-r border-border">
        <div className="px-4 py-4">
          <div className="text-xl font-semibold">NextPanel</div>
          <div className="text-xs text-muted-foreground">AI Assistant</div>
        </div>
      </aside>

      <main className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold">Chat</h1>
            <p className="text-sm text-muted-foreground">Ask anything and get instant help.</p>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Card className="flex h-full flex-col rounded-none">
            <ScrollArea className="flex-1 p-4">
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} />
                ))}
                <div ref={endRef} />
              </div>
            </ScrollArea>
            <div className="border-t border-border p-3">
              <div className="mx-auto flex max-w-3xl items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type your message..."
                  className="rounded-none"
                />
                <Button onClick={send} disabled={loading} className="rounded-none">
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "")}>
      <Avatar className="rounded-none">
        <AvatarFallback className="rounded-none">
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap border px-3 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
          "rounded-none"
        )}
      >
        {content}
      </div>
    </div>
  );
}
