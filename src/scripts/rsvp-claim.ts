const form = document.querySelector<HTMLFormElement>('[data-claim-form]');
const statusElement = document.querySelector<HTMLElement>('[data-claim-status]');
const result = document.querySelector<HTMLElement>('[data-claim-result]');
const urlInput = document.querySelector<HTMLInputElement>('[data-private-url]');
const continueLink = document.querySelector<HTMLAnchorElement>('[data-continue-url]');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submit) submit.disabled = true;
  if (statusElement) statusElement.textContent = form.dataset.saving ?? '';
  const data = new FormData(form);
  try {
    const response = await fetch('/api/rsvp/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: data.get('code'),
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        locale: data.get('locale'),
      }),
    });
    const body = (await response.json()) as { ok: boolean; accessUrl?: string; error?: string };
    if (!body.ok || !body.accessUrl) throw new Error(body.error);
    const accessUrl = new URL(body.accessUrl, window.location.origin).toString();
    if (urlInput) urlInput.value = accessUrl;
    if (continueLink) continueLink.href = accessUrl;
    result?.removeAttribute('hidden');
    if (statusElement) statusElement.textContent = '';
  } catch {
    if (statusElement) statusElement.textContent = form.dataset.error ?? '';
  } finally {
    if (submit) submit.disabled = false;
  }
});

document.querySelector('[data-copy-url]')?.addEventListener('click', async () => {
  if (urlInput) await navigator.clipboard.writeText(urlInput.value);
});
