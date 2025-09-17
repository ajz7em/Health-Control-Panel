export default function HomePage() {
  return (
    <section className="space-y-6">
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="mt-2 text-sm text-slate-300">
          This workspace is ready for the Health Tracking Control Panel. You can begin by
          implementing the shared domain logic inside <code className="font-mono">packages/core</code>
          and connecting it to future onboarding and tracking flows.
        </p>
      </article>
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h3 className="text-lg font-semibold">What&apos;s included</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Next.js 14 App Router with Tailwind CSS configured.</li>
          <li>Workspace aliases targeting the upcoming shared packages.</li>
          <li>Placeholder testing commands for Vitest and Playwright.</li>
        </ul>
      </article>
    </section>
  );
}
