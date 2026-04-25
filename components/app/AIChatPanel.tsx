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
  /** Shown under the title when set; overrides the default “Active section” line. */
  contextCaption?: string;
  /** Allow send when no draft section is selected (e.g. opportunity analysis tab). */
  allowSendWithoutSection?: boolean;
  applyButtonLabel?: string;
  noteButtonLabel?: string;
  messages: ProposalChatMessage[];
  onSend: (text: string) => void;
  onApplyRevision: (text: string) => void;
  onInsertAsNote: (text: string) => void;
  onRegenerate: () => void;
  onReject: () => void;
  inputPlaceholder?: string;
  promptExamples?: string;
  className?: string;
};

export function AIChatPanel({
  title = "Proposal copilot",
  section,
  contextCaption,
  allowSendWithoutSection = false,
  applyButtonLabel = "Apply to draft",
  noteButtonLabel = "Add to notes",
  messages,
  onSend,
  onApplyRevision,
  onInsertAsNote,
  onRegenerate,
  onReject,
  inputPlaceholder = "Instruct the copilot about this section…",
  promptExamples = 'Examples: “Align to Section M factors” · “Tighten executive tone” · “Add 508 language”',
  className,
}: Props) {
  const [text, setText] = useState("");

  const canSend = allowSendWithoutSection || !!section;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.suggestedRevision);
  return (
    <Card className={cn("flex h-full min-h-0 flex-col border-border/60", className)}>
      <CardHeader className="shrink-0 border-b border-border/50 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {contextCaption ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{contextCaption}</p>
        ) : section ? (
          <p className="text-xs text-muted-foreground">Active section: {section.title}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Select a section in the list to begin.</p>
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
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {m.role === "user" ? "You" : "Copilot"}
                </p>
                <p className="mt-1 leading-relaxed">{m.content}</p>
                {m.suggestedRevision && m.role === "assistant" ? (
                  <div className="mt-2 space-y-2 border-t border-border/40 pt-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Suggested text</p>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{m.suggestedRevision}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => m.suggestedRevision && onApplyRevision(m.suggestedRevision)}
                      >
                        {applyButtonLabel}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => m.suggestedRevision && onInsertAsNote(m.suggestedRevision)}
                      >
                        {noteButtonLabel}
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
          <div className="border-t border-border/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            Use the actions above, or ask a follow-up. Shift+Enter adds a new line; Enter sends.
          </div>
        )}
        <div className="mt-auto space-y-2 border-t border-border/50 p-2">
          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">{promptExamples}</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={inputPlaceholder}
            className="min-h-[72px] text-sm"
            disabled={!canSend}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim() && canSend) {
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
            disabled={!text.trim() || !canSend}
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
