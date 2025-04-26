const questions = [
  { question: "What's your mood?", options: ["Relaxed", "Adventurous", "Romantic", "Social"], multiSelect: false },
  { 
    question: "Pick activity types:", 
    options: ["Park", "Museum", "Night-life", "Food tour", "Shopping", "Historic Sites"], 
    multiSelect: true, 
    minSelect: 1, 
    maxSelect: 3 
  },
  { question: "Crowd preference?", options: ["Busy", "Moderate", "Calm"], multiSelect: false },
  { question: "Your budget?", options: ["Free", "Cheap $", "Moderate $$", "Expensive $$$", "Luxury $$$$"], multiSelect: false },
  { question: "Time available?", options: ["Half Day", "Full Day"], multiSelect: false },
  { question: "Time preference?", options: ["Early Morning", "Morning", "Afternoon", "Night"], multiSelect: false },
  { 
    question: "Interests?", 
    options: ["Art", "Architecture", "History", "Outdoors", "Tech", "Fashion"], 
    multiSelect: true, 
    minSelect: 1, 
    maxSelect: 3 
  },
  { question: "Vibe?", options: ["Modern", "Traditional"], multiSelect: false },
  { question: "State?", options: [], multiSelect: false },
  { question: "City?", options: [], multiSelect: false },
  { question: "How many activities?", options: ["2", "3", "4", "5", "6"], multiSelect: false }
];

let currentQuestion = 0;
let answers = {};
let selectedOptions = [];

document.addEventListener('DOMContentLoaded', () => {
  try {
    const page = document.body.classList.contains('quiz') ? 'quiz' : 
                 document.body.classList.contains('results') ? 'results' : 'landing';
    console.log('Page detected:', page);
    if (page === 'landing') initLanding();
    if (page === 'quiz') initQuiz();
    if (page === 'results') generateResults();
  } catch (error) {
    console.error('Page initialization failed:', error);
    showError('Failed to load the page. Please refresh.');
  }
});

function initLanding() {
  if (typeof gsap !== 'undefined') {
    const title = document.querySelector('.animate-title');
    title.innerHTML = title.textContent
      .split('')
      .map(char => `<span>${char}</span>`)
      .join('');
    
    gsap.from('.animate-title span', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out'
    });
    gsap.from('.animate-subtitle', {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 0.5,
      ease: 'back.out(1.7)'
    });
    gsap.from('.pulse', {
      scale: 0.95,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
    gsap.from('.wave', {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    });

    const particleContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${Math.random() * 5 + 5}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particleContainer.appendChild(particle);
    }
  }
}

function initQuiz() {
  try {
    const requiredElements = ['total-questions', 'question', 'options', 'nextBtn', 'current-question', 'progress', 'selection-info'];
    if (!requiredElements.every(id => document.getElementById(id))) {
      throw new Error('Missing required DOM elements');
    }
    document.getElementById('total-questions').innerText = questions.length;
    console.log('Quiz initialized with', questions.length, 'questions');
    showQuestion();
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
  } catch (error) {
    console.error('Quiz initialization failed:', error);
    showError('Failed to start the quiz. Please refresh.');
  }
}

function showQuestion() {
  try {
    const q = questions[currentQuestion];
    const elements = {
      question: document.getElementById('question'),
      options: document.getElementById('options'),
      selectionInfo: document.getElementById('selection-info'),
      nextBtn: document.getElementById('nextBtn'),
      currentQuestion: document.getElementById('current-question')
    };

    if (Object.values(elements).some(el => !el)) {
      throw new Error('Required DOM elements not found');
    }

    elements.question.innerText = q.question;
    elements.options.innerHTML = '';
    elements.selectionInfo.innerHTML = '';
    selectedOptions = [];
    elements.nextBtn.disabled = true;
    elements.currentQuestion.innerText = currentQuestion + 1;

    console.log('Rendering question:', q.question);

    if (q.options.length > 0) {
      q.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<span class="option-icon">✔</span>${opt}`;
        div.onclick = () => selectOption(opt, q.multiSelect);
        elements.options.appendChild(div);
      });
      if (q.multiSelect) {
        elements.selectionInfo.innerHTML = `Select ${q.minSelect} to ${q.maxSelect} options`;
      }
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'option input-field';
      input.placeholder = 'Type here...';
      input.id = 'freeInput';
      input.oninput = () => {
        elements.nextBtn.disabled = !input.value.trim();
      };
      elements.options.appendChild(input);
    }

    updateProgress();

    if (typeof gsap !== 'undefined') {
      gsap.from('.question-card', { opacity: 0, scale: 0.95, duration: 0.2, ease: 'back.out(1.7)' });
      gsap.from('.option, .input-field', {
        opacity: 0,
        y: 20,
        duration: 0.2,
        stagger: 0.1,
        ease: 'power3.out'
      });
      gsap.from('.progress-glow', { width: 0, duration: 0.2, ease: 'power2.inOut' });
    }
  } catch (error) {
    console.error('Failed to show question:', error);
    showError('Failed to display question. Please refresh.');
  }
}

function selectOption(option, multiSelect) {
  try {
    const q = questions[currentQuestion];
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) throw new Error('Next button not found');

    if (multiSelect) {
      const index = selectedOptions.indexOf(option);
      if (index === -1 && selectedOptions.length < q.maxSelect) {
        selectedOptions.push(option);
        document.querySelector(`.option:nth-child(${q.options.indexOf(option) + 1})`).classList.add('selected');
      } else if (index !== -1) {
        selectedOptions.splice(index, 1);
        document.querySelector(`.option:nth-child(${q.options.indexOf(option) + 1})`).classList.remove('selected');
      }
      nextBtn.disabled = selectedOptions.length < q.minSelect;
      document.getElementById('selection-info').innerHTML = `Selected ${selectedOptions.length} of ${q.minSelect}-${q.maxSelect} options`;
    } else {
      answers[q.question] = option;
      nextBtn.disabled = false;
      document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
      document.querySelector(`.option:nth-child(${q.options.indexOf(option) + 1})`).classList.add('selected');
      setTimeout(nextQuestion, 300);
    }

    if (typeof gsap !== 'undefined') {
      gsap.to('.option.selected', { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
    }
  } catch (error) {
    console.error('Option selection failed:', error);
  }
}

function nextQuestion() {
  try {
    const q = questions[currentQuestion];
    if (q.multiSelect) {
      if (selectedOptions.length < q.minSelect) {
        alert(`Please select at least ${q.minSelect} options`);
        return;
      }
      answers[q.question] = selectedOptions;
    } else if (q.options.length === 0) {
      const input = document.getElementById('freeInput');
      if (!input || !input.value.trim()) {
        alert('Please fill the input');
        return;
      }
      answers[q.question] = input.value.trim();
    }
    currentQuestion++;
    if (currentQuestion >= questions.length) {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      window.location.href = 'results.html';
    } else {
      showQuestion();
    }
  } catch (error) {
    console.error('Failed to proceed to next question:', error);
    showError('Failed to proceed. Please try again.');
  }
}

function updateProgress() {
  try {
    const progressEl = document.getElementById('progress');
    if (!progressEl) return;
    const percent = (currentQuestion / questions.length) * 100;
    progressEl.style.width = `${percent}%`;
  } catch (error) {
    console.error('Progress update failed:', error);
  }
}

function showError(message) {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `<p style="color: #c0392b;">${message}</p>`;
  }
}

// Function to attempt repairing incomplete JSON
function repairJSON(jsonString) {
  let repaired = jsonString.trim();
  
  // Ensure the string starts with a bracket
  if (!repaired.startsWith('[')) {
    repaired = '[' + repaired;
  }

  // Count open and close braces/brackets to balance them
  let openBrackets = 0;
  let openBraces = 0;
  let inString = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (char === '"' && repaired[i - 1] !== '\\') {
      inString = !inString;
    }
    if (!inString) {
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }
  }

  // Close any open strings
  if (inString) {
    repaired += '"';
  }

  // Close any open objects
  while (openBraces > 0) {
    repaired += '}';
    openBraces--;
  }

  // Close any open arrays
  while (openBrackets > 0) {
    repaired += ']';
    openBrackets--;
  }

  // If the JSON ends prematurely, add default values for remaining fields
  if (repaired.includes('"time"') && !repaired.includes('"score"')) {
    repaired = repaired.slice(0, -1); // Remove last character (likely a comma or brace)
    repaired += `,"phone":"-","price":"$$","score":"80%"}]`;
  }

  return repaired;
}

async function generateResults() {
  try {
    const elements = {
      results: document.getElementById('results'),
      loading: document.getElementById('loading')
    };
    if (!elements.results || !elements.loading) throw new Error('Results or loading elements not found');

    const userData = JSON.parse(localStorage.getItem('quizAnswers'));
    if (!userData) {
      elements.results.innerHTML = '<p>No data found! Please complete the quiz.</p>';
      elements.loading.style.display = 'none';
      elements.results.style.display = 'block';
      return;
    }

    userData['Country'] = 'USA';
    elements.loading.innerText = 'Crafting your adventure...';

    const prompt = `You are an expert travel planner. Based on the following user preferences:
${JSON.stringify(userData, null, 2)}

Create a full-day itinerary for a trip in the USA, in the user's selected city and state. The itinerary must:
- Include exactly ${userData['How many activities?']} activities in the list. One element in the JSON array for each activity.
- Match the user's mood (${userData["What's your mood?"]}), activity types (${userData['Pick activity types:']}), interests (${userData['Interests?']}), crowd preference (${userData['Crowd preference?']}), budget (${userData['Your budget?']}), time available (${userData['Time available?']}), time preference (${userData['Time preference?']}), and vibe (${userData['Vibe?']}).
- Schedule activities realistically, considering travel time and time preferences.
- Provide real-world locations with exact addresses, contact info, and official websites where available.
- Ensure all activities are feasible in the specified city and state.

Return **only** a JSON array in this exact format, with no extra text, markdown, or explanations:
[
  {
    "time": "9:00 AM",
    "name": "Activity Name",
    "address": "Full Address",
    "phone": "Phone number (or '-' if unavailable)",
    "website": "Official website URL (or '-' if unavailable)",
    "price": "Price (e.g. Free, $, $$, $$$, $$$$)",
    "score": "How well it matches user preferences, as a percentage (e.g., 95%)"
  },
  ...
]
**Return **only** a JSON array in this exact format, with no extra text, markdown, or explanations:**
**Ensure the response is complete and not truncated. Make sure every value in the JSON is included, and that it is complete.**
I do not want anything other than the JSON array, no explination nothing else at all, just the JSON arrays in the specified format`;

    const maxRetries = 6;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`Attempting Hugging Face API call #${attempt + 1}`);
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 100000,
              return_full_text: true,
              temperature: 0.5,
              top_p: 0.9
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        if (!data || !data[0]?.generated_text) {
          throw new Error('Invalid API response: No generated text found');
        }

        // const final_resp = data[0].generated_text.split('```')[1]?.trim();
        const match = data[0].generated_text.match(/```json\s*([\s\S]*?)\s*```/);
        const final_resp = match ? match[1].trim() : null;

        let activities;
        try {
          console.log('Generated text:', final_resp);

          // Try to match JSON array, including markdown cases
          const jsonMatch = final_resp.match(/```json\n([\s\S]*?)\n```/) || 
                           final_resp.match(/$$ [\s\S]* $$/);
          let jsonString;
          if (jsonMatch) {
            jsonString = jsonMatch[1] || jsonMatch[0];
          } else {
            // If no match, attempt to repair the JSON
            jsonString = repairJSON(final_resp);
          }

          console.log('Extracted JSON string:', jsonString);

          activities = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Parse error:', parseError.message);
          throw new Error('Failed to parse API response as JSON: ' + parseError.message);
        }

        if (!Array.isArray(activities) || activities.length === 0) {
          throw new Error('API response is empty or not an array');
        }

        activities.forEach((act, index) => {
          if (!act.time || !act.name || !act.address || !act.phone || !act.price || !act.score || !act.website) {
            throw new Error(`Invalid activity at index ${index}: Missing required fields`);
          }
        });

        elements.loading.style.display = 'none';
        elements.results.style.display = 'block';

        let html = `<h2>Your Perfect Day in ${userData['City?']}</h2><table><thead><tr><th>Time</th><th>Name</th><th>Address</th><th>Phone</th><th>Website</th><th>Price</th><th>Match</th></tr></thead><tbody>`;
        activities.forEach(act => {
          const websiteLink = act.website === '-' ? '-' : `<a href="${act.website}" target="_blank" rel="noopener noreferrer">Visit Site</a>`;
          html += `<tr><td>${act.time}</td><td>${act.name}</td><td>${act.address}</td><td>${act.phone}</td><td>${websiteLink}</td><td>${act.price}</td><td>${act.score}</td></tr>`;
        });
        html += `</tbody></table>`;
        elements.results.innerHTML = html;

        if (typeof gsap !== 'undefined') {
          gsap.from('#results table tr', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power3.out'
          });
          gsap.from('#results h2', { opacity: 0, x: -50, duration: 0.8, ease: 'power3.out' });
        }

        console.log('Itinerary generated successfully:', activities);
        return;

      } catch (error) {
        console.error(`API attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        if (attempt >= maxRetries) {
          console.warn('Max retries reached. Using fallback mock response.');
          const mockActivities = [
            {
              time: "9:00 AM",
              name: "City Park Stroll",
              address: `${userData['City?']}, ${userData['State?']}`,
              phone: "-",
              price: "Free",
              score: "90%",
              website: "-"
            },
            {
              time: "12:00 PM",
              name: "Local Museum Visit",
              address: `${userData['City?']}, ${userData['State?']}`,
              phone: "-",
              price: "$$  ",
              score: "85%",
              website: "-"
            },
            {
              time: "3:00 PM",
              name: "Downtown Food Tour",
              address: `${userData['City?']}, ${userData['State?']}`,
              phone: "-",
              price: "  $$$",
              score: "80%",
              website: "-"
            }
          ];

          elements.loading.style.display = 'none';
          elements.results.style.display = 'block';

          let html = `<h2>Your Perfect Day in ${userData['City?']}</h2><p>Note: Unable to fetch real-time itinerary. Showing sample activities.</p><table><thead><tr><th>Time</th><th>Name</th><th>Address</th><th>Phone</th><th>Price</th><th>Match</th><th>Website</th></tr></thead><tbody>`;
          mockActivities.forEach(act => {
            const websiteLink = act.website === '-' ? '-' : `<a href="${act.website}" target="_blank" rel="noopener noreferrer">Visit Site</a>`;
            html += `<tr><td>${act.time}</td><td>${act.name}</td><td>${act.address}</td><td>${act.phone}</td><td>${act.price}</td><td>${act.score}</td><td>${websiteLink}</td></tr>`;
          });
          html += `</tbody></table>`;
          elements.results.innerHTML = html;

          if (typeof gsap !== 'undefined') {
            gsap.from('#results table tr', {
              opacity: 0,
              y: 30,
              duration: 0.6,
              stagger: 0.2,
              ease: 'power3.out'
            });
          }

          elements.loading.innerText = 'Failed to connect to API. Showing sample itinerary.';
          elements.loading.style.color = '#c0392b';
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
  } catch (error) {
    console.error('Results generation failed:', error);
    showError('Failed to generate itinerary. Please refresh.');
  }
}