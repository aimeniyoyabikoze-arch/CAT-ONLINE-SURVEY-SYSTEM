(async function () {
  const surveysEl = document.getElementById('surveys');
  const createBtn = document.getElementById('createBtn');
  const titleInput = document.getElementById('title');
  const questionsInput = document.getElementById('questions');
  const createMsg = document.getElementById('createMsg');

  async function loadSurveys() {
    surveysEl.innerHTML = 'Loading...';
    try {
      const res = await fetch('/api/surveys');
      const data = await res.json();
      const items = (data.surveys || []);
      if (items.length === 0) {
        surveysEl.innerHTML = '<li class="muted">No surveys yet</li>';
        return;
      }
      surveysEl.innerHTML = '';
      items.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.title || 'Untitled'} — ${Array.isArray(s.questions) ? s.questions.join(', ') : ''}`;
        surveysEl.appendChild(li);
      });
    } catch (err) {
      surveysEl.innerHTML = '<li class="error">Failed to load surveys</li>';
    }
  }

  createBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const questions = questionsInput.value.split(',').map(q => q.trim()).filter(Boolean);
    if (!title) {
      createMsg.textContent = 'Title required';
      return;
    }
    createMsg.textContent = 'Creating...';
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions })
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      createMsg.textContent = `Created survey id ${created.id}`;
      titleInput.value = '';
      questionsInput.value = '';
      loadSurveys();
      setTimeout(() => (createMsg.textContent = ''), 2000);
    } catch (err) {
      createMsg.textContent = 'Create failed';
    }
  });

  // initial load
  loadSurveys();
})();
