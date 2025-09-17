import { kcalFromMet, rmrMifflinStJeor, thermicEffectOfFood } from '@core';

const demoRmr = rmrMifflinStJeor('male', 85, 180, 35);
const demoTef = thermicEffectOfFood(2400);
const demoWorkout = kcalFromMet(6, 82, 1.25);

export default function HomePage() {
  return (
    <section className="space-y-6">
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="mt-2 text-sm text-slate-300">
          This workspace is ready for the Health Tracking Control Panel. Shared domain
          logic already lives in <code className="font-mono">packages/core</code> and validation
          schemas inside <code className="font-mono">packages/validation</code>.
        </p>
      </article>
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Sample calculations</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Estimated resting metabolic rate: {demoRmr} kcal</li>
          <li>Thermic effect of food for 2,400 kcal: {demoTef} kcal</li>
          <li>90 minute tempo run (MET 6) expenditure: {demoWorkout.toFixed(0)} kcal</li>
        </ul>
      </article>
    </section>
  );
}
