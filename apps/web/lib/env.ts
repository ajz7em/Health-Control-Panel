export const isDemoModeEnabled = () => {
  const raw = process.env.NEXT_PUBLIC_DEMO_MODE;
  return raw === '1' || raw === undefined;
};
