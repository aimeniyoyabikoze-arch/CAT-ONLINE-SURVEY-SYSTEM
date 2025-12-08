async function fetchSurveys() {
  const res = await fetch('/api/surveys');
  const json = await res.json();
  return json.surveys || [];
}

function renderSurveys(list) {
  const ul = document.getElementById('surveys');
  ul.innerHTML = '';
  if (!list.length) {
    ul.innerHTML = '<li><small>No surveys yet</small></li>';
    return;
  }
  for (const s of list) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(s.title)}</strong><div><small>${escapeHtml(s.question)}</small> <em>#${s.id}</em></div>`;
    ul.appendChild(li);
  }
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>'']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',''':'&quot;',''':'&#39;'}[m]));
}

async function init() {
  const surveys = await fetchSurveys();
  renderSurveys(surveys);

  const form = document.getElementById('survey-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = { title: fd.get('title'), question: fd.get('question') };
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      form.reset();
      renderSurveys(await fetchSurveys());
    } else {
      alert('Failed to create survey');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
