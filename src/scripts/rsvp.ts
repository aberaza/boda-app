import type { RsvpGuest, RsvpSnapshot } from '../server/rsvp/domain';

type ApiResult = { ok: true; data: RsvpSnapshot } | { ok: false; error: string };

const root = document.querySelector<HTMLElement>('[data-rsvp-app]');
const form = document.querySelector<HTMLFormElement>('[data-rsvp-form]');
const guestList = document.querySelector<HTMLElement>('[data-rsvp-guests]');
const addButton = document.querySelector<HTMLButtonElement>('[data-add-companion]');
const status = document.querySelector<HTMLElement>('[data-rsvp-status]');
const template = document.querySelector<HTMLTemplateElement>('#rsvp-guest-template');
let snapshot: RsvpSnapshot | null = null;

if (root && form && guestList && status && template) void initialize();

async function initialize() {
  try {
    const response = await fetch('/api/rsvp', { headers: { Accept: 'application/json' } });
    const result = (await response.json()) as ApiResult;
    if (!result.ok) throw new Error(result.error);
    snapshot = result.data;
    renderSnapshot(snapshot);
    root?.removeAttribute('aria-busy');
    form?.removeAttribute('hidden');
  } catch {
    root?.removeAttribute('aria-busy');
    document.querySelector<HTMLElement>('[data-rsvp-auth-error]')?.removeAttribute('hidden');
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!snapshot || !form) return;
  setStatus(form.dataset.saving ?? 'Saving…', false);
  setDisabled(true);
  const payload = collectPayload();
  try {
    const response = await fetch('/api/rsvp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as ApiResult;
    if (!result.ok) {
      setStatus(
        result.error === 'revision_conflict'
          ? (form.dataset.conflict ?? '')
          : (form.dataset.error ?? ''),
        true,
      );
      return;
    }
    snapshot = result.data;
    renderSnapshot(snapshot);
    setStatus(form.dataset.saved ?? 'Saved', false);
  } catch {
    setStatus(form.dataset.error ?? 'Could not save', true);
  } finally {
    setDisabled(false);
  }
});

addButton?.addEventListener('click', () => {
  if (!snapshot || !guestList) return;
  const companions = guestList.querySelectorAll('[data-guest-role="open_companion"]');
  if (companions.length >= snapshot.invitation.maxCompanions) return;
  guestList.append(
    createGuestCard(
      {
        invitationPersonId: null,
        role: 'open_companion',
        firstName: '',
        lastName: '',
        attendance: 'unknown',
        dietaryNeeds: '',
        transportNeeded: 'unknown',
        message: '',
        position: guestList.children.length,
      },
      true,
    ),
  );
  updateCompanionButton();
});

guestList?.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-remove-guest]');
  if (!button) return;
  button.closest('[data-guest]')?.remove();
  updateCompanionButton();
});

function renderSnapshot(data: RsvpSnapshot) {
  if (!guestList || !form) return;
  guestList.replaceChildren();
  const guests = data.guests.length ? data.guests : defaultGuests(data);
  guests.forEach((guest) =>
    guestList.append(createGuestCard(guest, guest.role === 'open_companion')),
  );
  setInputValue('contactEmail', data.contactEmail ?? '');
  setInputValue('contactPhone', data.contactPhone ?? '');
  const updated = document.querySelector<HTMLElement>('[data-last-updated]');
  if (updated && data.updatedAt) {
    updated.textContent = new Intl.DateTimeFormat(document.documentElement.lang, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(data.updatedAt));
    updated.parentElement?.removeAttribute('hidden');
  }
  document
    .querySelector<HTMLElement>('[data-companion-limit]')
    ?.replaceChildren(
      document.createTextNode(
        (form.dataset.companionLimit ?? '').replace(
          '{count}',
          String(data.invitation.maxCompanions),
        ),
      ),
    );
  updateCompanionButton();
}

function defaultGuests(data: RsvpSnapshot): RsvpGuest[] {
  const primaryPerson = data.invitation.people.find((person) => person.role === 'primary');
  const primary: RsvpGuest = {
    invitationPersonId: primaryPerson?.id ?? null,
    role: 'primary',
    firstName: primaryPerson?.firstName ?? data.invitation.primaryFirstName ?? '',
    lastName: primaryPerson?.lastName ?? data.invitation.primaryLastName ?? '',
    attendance: 'unknown',
    dietaryNeeds: '',
    transportNeeded: 'unknown',
    message: '',
    position: 0,
  };
  return [
    primary,
    ...data.invitation.people
      .filter((person) => person.role !== 'primary')
      .map((person, index) => ({
        invitationPersonId: person.id,
        role: person.role,
        firstName: person.firstName,
        lastName: person.lastName,
        attendance: 'unknown' as const,
        dietaryNeeds: '',
        transportNeeded: 'unknown' as const,
        message: '',
        position: index + 1,
      })),
  ];
}

function createGuestCard(guest: RsvpGuest, removable: boolean): HTMLElement {
  const fragment = template?.content.cloneNode(true) as DocumentFragment;
  const card = fragment.querySelector<HTMLElement>('[data-guest]')!;
  card.dataset.guestRole = guest.role;
  card.dataset.invitationPersonId = guest.invitationPersonId ?? '';
  card.querySelector<HTMLElement>('[data-guest-title]')!.textContent =
    guest.role === 'primary'
      ? (template?.dataset.primaryLabel ?? 'Primary guest')
      : (template?.dataset.companionLabel ?? 'Companion');
  const remove = card.querySelector<HTMLButtonElement>('[data-remove-guest]')!;
  remove.hidden = !removable;
  setCardValue(card, 'firstName', guest.firstName);
  setCardValue(card, 'lastName', guest.lastName);
  setCardValue(card, 'attendance', guest.attendance);
  setCardValue(card, 'dietaryNeeds', guest.dietaryNeeds);
  setCardValue(card, 'transportNeeded', guest.transportNeeded);
  setCardValue(card, 'message', guest.message);
  const lockedPerson = snapshot?.invitation.people.find(
    (person) => person.id === guest.invitationPersonId,
  );
  const namesEditable =
    guest.role === 'primary'
      ? snapshot?.invitation.primaryNameEditable
      : lockedPerson?.nameEditable;
  card
    .querySelectorAll<HTMLInputElement>('[data-field="firstName"], [data-field="lastName"]')
    .forEach((input) => {
      input.readOnly = namesEditable === false;
    });
  return card;
}

function collectPayload() {
  if (!form || !snapshot || !guestList) throw new Error('RSVP not initialized');
  const guests = Array.from(guestList.querySelectorAll<HTMLElement>('[data-guest]')).map(
    (card, position) => ({
      invitationPersonId: card.dataset.invitationPersonId || null,
      role: card.dataset.guestRole as RsvpGuest['role'],
      firstName: cardValue(card, 'firstName'),
      lastName: cardValue(card, 'lastName'),
      attendance: cardValue(card, 'attendance') as RsvpGuest['attendance'],
      dietaryNeeds: cardValue(card, 'dietaryNeeds'),
      transportNeeded: cardValue(card, 'transportNeeded') as RsvpGuest['transportNeeded'],
      message: cardValue(card, 'message'),
      position,
    }),
  );
  return {
    revision: snapshot.revision,
    contactEmail: formValue('contactEmail') || null,
    contactPhone: formValue('contactPhone') || null,
    guests,
  };
}

function updateCompanionButton() {
  if (!snapshot || !guestList || !addButton) return;
  const companions = guestList.querySelectorAll(
    '[data-guest-role]:not([data-guest-role="primary"])',
  ).length;
  addButton.hidden = snapshot.invitation.companionPolicy === 'none';
  addButton.disabled = companions >= snapshot.invitation.maxCompanions;
}

function cardValue(card: HTMLElement, field: string) {
  return (
    card
      .querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[data-field="${field}"]`,
      )
      ?.value.trim() ?? ''
  );
}
function setCardValue(card: HTMLElement, field: string, value: string) {
  const input = card.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[data-field="${field}"]`,
  );
  if (input) input.value = value;
}
function formValue(name: string) {
  const item = form?.elements.namedItem(name);
  return item instanceof HTMLInputElement ? item.value.trim() : '';
}
function setInputValue(name: string, value: string) {
  const item = form?.elements.namedItem(name);
  if (item instanceof HTMLInputElement) item.value = value;
}
function setStatus(message: string, error: boolean) {
  if (status) {
    status.textContent = message;
    status.dataset.error = String(error);
  }
}
function setDisabled(disabled: boolean) {
  form
    ?.querySelectorAll<
      HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('button, input, select, textarea')
    .forEach((element) => {
      element.disabled = disabled;
    });
}
