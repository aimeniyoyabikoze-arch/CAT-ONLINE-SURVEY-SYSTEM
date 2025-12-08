document.getElementById('surveyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const survey = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value
  };

  try {
    const response = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(survey)
    });

    if (response.ok) {
      document.getElementById('surveyForm').reset();
      loadSurveys();
    }
  } catch (error) {
    console.error('Error creating survey:', error);
  }
});

async function loadSurveys() {
  try {
    const response = await fetch('/api/surveys');
    const data = await response.json();
    const surveysList = document.getElementById('surveysList');

    if (data.surveys.length === 0) {
      surveysList.innerHTML = '<div class="empty-message">No surveys yet. Create one!</div>';
      return;
    }

    surveysList.innerHTML = data.surveys.map(survey => `
      <div class="survey-item">
        <h3>${survey.title}</h3>
        <p>${survey.description}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading surveys:', error);
  }
}

loadSurveys();
