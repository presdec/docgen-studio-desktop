export function extractTokens(value: string) {
  const matches = value.match(/{{[^}]+}}/g) ?? [];
  return [...new Set(matches)];
}

export function tokenName(token: string) {
  return token.replace(/[{}]/g, '').replace(/\|.*$/, '');
}

function ordinalSuffix(value: string): string {
  const n = parseInt(value, 10);
  if (isNaN(n)) return value;
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${(['th', 'st', 'nd', 'rd'] as const)[abs % 10] ?? 'th'}`;
}

function applyModifier(value: string, modifier: string | undefined): string {
  if (modifier === 'ordinal') return ordinalSuffix(value);
  if (modifier === 'upper') return value.toUpperCase();
  if (modifier === 'lower') return value.toLowerCase();
  if (modifier === 'title') return value.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  if (modifier === 'trim') return value.trim();
  return value;
}

export function renderTemplate(value: string, sampleValues: Record<string, string>) {
  return value.replace(/{{([A-Z0-9_]+)(?:\|([a-z]+))?}}/g, (_match, field: string, modifier?: string) => {
    const raw = sampleValues[field];
    if (raw === undefined) return `{{${field}}}`;
    return applyModifier(raw, modifier);
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function plainTextToHtml(value: string) {
  const normalized = value.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return '<p></p>';
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) =>
      `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('');
}

export function normalizeEmailBody(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '<p></p>';
  }

  return /<[^>]+>/.test(trimmed) ? value : plainTextToHtml(value);
}

export function renderTemplateHtml(value: string, sampleValues: Record<string, string>) {
  return value.replace(/{{([A-Z0-9_]+)(?:\|([a-z]+))?}}/g, (_match, field: string, modifier?: string) => {
    const raw = sampleValues[field];
    if (!raw) return `{{${field}}}`;
    return escapeHtml(applyModifier(raw, modifier));
  });
}

export function usageForVariable(
  variable: string,
  emailVariables: string[],
  contractVariables: string[],
) {
  const usedInEmail = emailVariables.includes(variable);
  const usedInContract = contractVariables.includes(variable);

  if (usedInEmail && usedInContract) {
    return 'both' as const;
  }
  if (usedInEmail) {
    return 'email' as const;
  }
  if (usedInContract) {
    return 'contract' as const;
  }
  return 'unused' as const;
}
