export default function SettingsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
      <p className="text-sm text-zinc-600">
        Connect Supabase (URL, anon, service role) and optional AI provider keys in your environment. This shell will use
        the in-memory store when variables are not set.
      </p>
    </div>
  );
}
