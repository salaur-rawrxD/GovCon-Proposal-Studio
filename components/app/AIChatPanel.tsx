"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProposalChatMessage, ProposalSectionModel } from "@/lib/mock/types";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  section: ProposalSectionModel | null;
  messages: ProposalChatMessage[];
  onSend: (text: string) => void;
  onApplyRevision: (text: string) => void;
  onInsertAsNote: (text: string) => void;
  onRegenerate: () => void;
  onReject: () => void;
  className?: string;
};

export function AIChatPanel({
  title = "Proposal Assistant",
  section,
  messages,
  onSend,
  onApplyRevision,
  onInsertAsNote,
  onRegenerate,
  onReject,
  className,
}: Props) {
  const [text, setText] = useState("");

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.suggestedRevision);
  return (
    <Card className={cn("flex h-full min-h-0 flex-col border-border/60", className)}>
      <CardHeader className="shrink-0 border-b border-border/50 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {section ? (
          <p className="text-xs text-muted-foreground">Editing: {section.title}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Select a section to use the assistant.</p>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <ScrollArea className="h-[280px] p-3">
          <ul className="space-y-3 pr-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn("rounded-lg border px-2.5 py-2 text-sm", m.role === "user" ? "ml-4 border-primary/20 bg-primary/5" : "mr-2 border-border/50 bg-muted/30")}
              >
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{m.role === "user" ? "You" : "Assistant"}</p>
                <p className="mt-1 leading-relaxed">{m.content}</p>
                {m.suggestedRevision && m.role === "assistant" ? (
                  <div className="mt-2 space-y-2 border-t border-border/40 pt-2">
                    <p className="text-[10px] font-medium text-muted-foreground">Suggested revision</p>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{m.suggestedRevision}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => m.suggestedRevision && onApplyRevision(m.suggestedRevision)}
                      >
                        Apply revision
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => m.suggestedRevision && onInsertAsNote(m.suggestedRevision)}
                      >
                        Insert as note
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onRegenerate}>
                        Regenerate
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onReject}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </ScrollArea>
        {lastAssistant?.suggestedRevision && (
          <div className="border-t border-border/50 px-3 py-2 text-xs text-muted-foreground">
            Quick action on last suggested revision: use buttons above, or type below for follow-up.
          </div>
        )}
        <div className="mt-auto space-y-2 border-t border-border/50 p-2">
          <p className="px-1 text-[10px] text-muted-foreground">Try: “Use more government proposal tone” · “Tie to Section M” · “Shorten 30%”</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message about the current section…"
            className="min-h-[72px] text-sm"
            disabled={!section}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim() && section) {
                  onSend(text.trim());
                  setText("");
                }
              }
            }}
          />
          <Button
            type="button"
            className="w-full gap-1.5"
            size="sm"
            disabled={!text.trim() || !section}
            onClick={() => {
              onSend(text.trim());
              setText("");
            }}
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
