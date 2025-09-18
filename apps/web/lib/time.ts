const TIME_ZONE = 'America/New_York';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const getTimeZoneOffset = (date: Date) => {
  const parts = partsFormatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUTC - date.getTime();
};

const toZonedDate = (date: Date) => {
  const offset = getTimeZoneOffset(date);
  return new Date(date.getTime() - offset);
};

export const nowLocalNY = () => {
  const now = new Date();
  return {
    readingDate: dateFormatter.format(now),
    readingTime: timeFormatter.format(now),
  };
};

export const toISO_UTC = (date: Date) => date.toISOString();

export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return toZonedDate(utcDate);
};

export const toLocalNYDate = (date: Date) => toZonedDate(date);
