import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('WARNING: GEMINI_API_KEY is not configured or contains a placeholder. Backend will fallback to mock responses.');
}

const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;

export const explainStructure = async (partName, context = 'medical student') => {
  if (!genAI) {
    return {
      name: partName,
      description: `**${partName}** is a vital structural component of the organ. *(Please configure a valid GEMINI_API_KEY in the backend .env to fetch live clinical insights)*.`,
      function: 'Maintains circulatory pressure and coordinates biological flow vectors throughout the body systems.',
      clinicalImportance: 'Often targeted in diagnostic assessments. Functional anomalies can lead to cellular hypoxia.',
      diseases: 'Ischemia, congenital structural defects, atherosclerosis, and inflammatory diseases.',
      facts: 'Calculated using real-time spatial properties. Visualized dynamically using React Three Fiber.'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Explain the anatomical structure "${partName}" for a ${context}.
    Return your response strictly as a JSON object with the following keys:
    - name: The clean, formal name of the structure.
    - description: A detailed overview of what the structure is, using markdown for formatting (bold text, lists).
    - function: Its biological function inside the organ/body, formatted in markdown.
    - clinicalImportance: Why it is clinically significant for medical studies, formatted in markdown.
    - diseases: Key pathologies or medical conditions associated with this structure, formatted in markdown.
    - facts: Interesting facts or clinical trivia about this structure, formatted in markdown.
    
    Ensure your explanation is informative, accurate, and suitable for a university medical student. Return only the raw JSON.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const text = result.response.text();
    const parsedData = JSON.parse(text);
    return parsedData;
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};

export const generateQuiz = async (organName, difficulty = 'Medium') => {
  if (!genAI) {
    // Graceful fallback fallback quiz if no Gemini API Key is configured
    return [
      {
        id: 1,
        type: 'mcq',
        question: 'Which chamber of the heart pumps oxygenated blood to the body systems?',
        options: ['Left Atrium', 'Left Ventricle', 'Right Atrium', 'Right Ventricle'],
        answer: 'Left Ventricle',
        explanation: 'The left ventricle has thick muscular walls to pump oxygenated blood under high pressure through the aorta to the systemic circulation.'
      },
      {
        id: 2,
        type: 'boolean',
        question: 'The Aorta is the largest artery in the human body.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'True. The aorta is the largest artery, carrying oxygenated blood from the left ventricle to all body parts.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'What is the function of the superior vena cava?',
        options: ['Carry blood to the lungs', 'Return blood from the upper body to the heart', 'Pump blood to the body', 'Carry oxygenated blood from lungs'],
        answer: 'Return blood from the upper body to the heart',
        explanation: 'The superior vena cava returns deoxygenated venous blood from the head, neck, arms, and chest to the right atrium.'
      },
      {
        id: 4,
        type: 'boolean',
        question: 'The pulmonary artery is the only artery that carries oxygen-depleted blood.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'True. Unlike other arteries that carry oxygenated blood, the pulmonary artery carries deoxygenated blood from the right ventricle to the lungs.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'Which node located in the right atrium acts as the heart\'s natural pacemaker?',
        options: ['AV Node', 'SA Node', 'Purkinje Fibers', 'Bundle of His'],
        answer: 'SA Node',
        explanation: 'The Sinoatrial (SA) node, situated in the upper wall of the right atrium, generates electrical impulses that spread through cardiac muscle to set the pace.'
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate an academic quiz about the organ/system "${organName}" at a "${difficulty}" difficulty level.
    You MUST output exactly 5 questions. Ensure there is a mix of Multiple Choice Questions (MCQs) and True/False (boolean) questions.
    Return your response strictly as a JSON array where each object has these exact keys:
    - id: A sequential number from 1 to 5.
    - type: The string "mcq" or "boolean".
    - question: The question text (aimed at a medical student).
    - options: An array of strings representing the options (exactly 4 options for "mcq", and exactly ["True", "False"] for "boolean").
    - answer: The correct answer (string, which MUST exactly match one of the strings inside the options array).
    - explanation: A detailed one-to-two sentence explanation of why this answer is correct.

    Do not output markdown code blocks. Output raw JSON.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const text = result.response.text();
    const parsedQuiz = JSON.parse(text);
    return parsedQuiz;
  } catch (error) {
    console.error('Error generating quiz from Gemini:', error.message);
    throw new Error(`Quiz Generation failed: ${error.message}`);
  }
};
