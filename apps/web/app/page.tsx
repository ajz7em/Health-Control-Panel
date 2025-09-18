import { kcalFromMet, rmrMifflinStJeor, thermicEffectOfFood } from '@hcp/core';

const SAMPLE_WEIGHT_KG = 70;
const SAMPLE_HEIGHT_CM = 170;
const SAMPLE_AGE = 29;
const SAMPLE_MET = 8.5;
const SAMPLE_DURATION_HOURS = 1;

export default function HomePage() {
  const femaleRmr = rmrMifflinStJeor('female', SAMPLE_WEIGHT_KG, SAMPLE_HEIGHT_CM, SAMPLE_AGE);
  const maleRmr = rmrMifflinStJeor('male', SAMPLE_WEIGHT_KG, SAMPLE_HEIGHT_CM, SAMPLE_AGE);
  const metCalories = Math.round(kcalFromMet(SAMPLE_MET, SAMPLE_WEIGHT_KG, SAMPLE_DURATION_HOURS));
  const tefCalories = Math.round(thermicEffectOfFood(2200));

  return (
    <section className="space-y-6">
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="mt-2 text-sm text-slate-300">
          Shared domain helpers from <code className="font-mono">@hcp/core</code> are wired into the
          homepage so you can validate real calculations before building the wider experience.
        </p>
      </article>
      <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Sample Calculations</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Female RMR</dt>
            <dd className="text-2xl font-semibold">{femaleRmr} kcal</dd>
            <p className="mt-1 text-xs text-slate-400">
              Mifflin-St Jeor for a {SAMPLE_AGE}-year-old at {SAMPLE_WEIGHT_KG}kg / {SAMPLE_HEIGHT_CM}cm.
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Male RMR</dt>
            <dd className="text-2xl font-semibold">{maleRmr} kcal</dd>
            <p className="mt-1 text-xs text-slate-400">Same profile, male constant applied.</p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Activity Burn</dt>
            <dd className="text-2xl font-semibold">{metCalories} kcal</dd>
            <p className="mt-1 text-xs text-slate-400">{SAMPLE_MET} MET for {SAMPLE_DURATION_HOURS} hour.</p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Thermic Effect</dt>
            <dd className="text-2xl font-semibold">{tefCalories} kcal</dd>
            <p className="mt-1 text-xs text-slate-400">10% of a 2200 kcal daily intake.</p>
          </div>
        </dl>
      </article>
    </section>
  );
}
