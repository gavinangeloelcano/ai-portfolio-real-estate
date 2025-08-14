// Minimal Follow Up Boss (FUB) stub: formats lead payload for webhook or API use.
export type FubLead = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
};

export function toFubPayload(lead: FubLead) {
  const payload = {
    person: {
      firstName: lead.firstName,
      lastName: lead.lastName || '',
      emails: lead.email ? [{ value: lead.email, isPrimary: true }] : [],
      phones: lead.phone ? [{ value: lead.phone, isPrimary: true }] : []
    },
    source: lead.source || 'AI Widget',
    note: lead.message || ''
  };
  return payload;
}
