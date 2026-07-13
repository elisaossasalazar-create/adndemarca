"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BrandSteinTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/brandstein")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // placeholder for streaming response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/brandstein", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Lo siento, ocurrió un error. Intenta de nuevo." },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantText },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Lo siento, ocurrió un error. Intenta de nuevo." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await fetch("/api/brandstein", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    if (!confirm("¿Empezar una nueva conversación? Se borrará el historial guardado.")) return;
    await fetch("/api/brandstein", { method: "DELETE" });
    setMessages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20 text-sm text-neutral-400">
        Cargando Brand-Stein…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>

      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-neutral-900">Brand-Stein ✦</p>
          <p className="text-xs text-neutral-400">tu mentor estratégico de marca</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleClear}
                disabled={isStreaming}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-medium text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-40"
              >
                nueva sesión
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isStreaming}
                className="rounded-full px-3 py-1.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "var(--brand-pink)" }}
              >
                {isSaving ? "guardando…" : savedNotice ? "¡guardado! ✓" : "pausar y continuar después"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: "var(--brand-yellow)" }}
            >
              ✦
            </div>
            <p className="text-sm font-bold text-neutral-900">Helouuuu! Soy Brand-Stein 🙌</p>
            <p className="max-w-xs text-xs text-neutral-500 leading-relaxed">
              Tu mentor estratégico de marca. Para arrancar, escribe:
            </p>
            <button
              onClick={() => {
                setInput("estoy readyyy para crear mi ADN de marca");
                textareaRef.current?.focus();
              }}
              className="rounded-full px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--brand-pink)" }}
            >
              estoy readyyy para crear mi ADN de marca
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: "var(--brand-yellow)" }}
              >
                ✦
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white"
                  : "text-neutral-900 bg-neutral-50 border border-neutral-100"
              }`}
              style={msg.role === "user" ? { backgroundColor: "var(--brand-pink)" } : {}}
            >
              {msg.content === "" && msg.role === "assistant" ? (
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                </span>
              ) : (
                <MessageContent content={msg.content} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-end gap-2 border-t border-neutral-100 pt-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Escribe aquí… (Enter para enviar)"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#FF63A6] transition-colors disabled:opacity-50"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 rounded-2xl px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: "var(--brand-pink)" }}
        >
          →
        </button>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <span>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </span>
  );
}
