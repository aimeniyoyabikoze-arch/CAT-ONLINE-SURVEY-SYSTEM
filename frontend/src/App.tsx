import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Survey {
  id?: string;
  title: string;
  description: string;
  questions: string[];
}

function App() {
  const [survey, setSurvey] = useState<Survey>({
    title: '',
    description: '',
    questions: ['']
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSurvey(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...survey.questions];
    newQuestions[index] = value;
    setSurvey(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, ''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/surveys', survey);
      setMessage('Survey created successfully!');
      setSurvey({ title: '', description: '', questions: [''] });
    } catch (error) {
      setMessage('Error creating survey. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Online Survey System</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Survey Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={survey.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={survey.description}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Questions</label>
          {survey.questions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="question-input"
              required
            />
          ))}
          <button type="button" onClick={addQuestion} className="btn-secondary">
            + Add Question
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Survey'}
        </button>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default App;
