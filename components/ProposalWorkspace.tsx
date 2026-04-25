"use client";

type Props = {
  sectionTitle: string;
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
};

export function ProposalWorkspace({ sectionTitle, value, onChange, readOnly }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-zinc-900">{sectionTitle}</h2>
      <textarea
        className="min-h-[220px] w-full rounded-lg border border-zinc-200 p-3 text-sm text-zinc-800 outline-none focus:border-cyan-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck
      />
    </div>
  );
}
