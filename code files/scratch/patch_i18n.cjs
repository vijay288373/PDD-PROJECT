const fs = require('fs');
const path = require('path');

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", ur: "Urdu", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  or: "Odia", sw: "Swahili", am: "Amharic", ha: "Hausa", yo: "Yoruba",
  ig: "Igbo", zu: "Zulu", fr: "French", pt: "Portuguese", es: "Spanish",
  ar: "Arabic", id: "Indonesian", vi: "Vietnamese", th: "Thai",
};

const EXTRA_KEYS_TO_TRANSLATE = {
  fungal: "Fungal Infection",
  bacterial: "Bacterial Disease",
  pest: "Pest Damage",
  nutritional: "Nutritional Deficiency",
  healthy: "Healthy Plant",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
  none: "None",
  offline_title: "You're Offline",
  offline_desc: "No cached scan found. Connect to the internet and try again.",
  fail_title: "Analysis Failed",
  fail_desc: "Something went wrong. Please try again with a clearer photo.",
  loading_health: "Analyzing plant health...",
  loading_patterns: "Identifying disease patterns...",
  loading_treatment: "Generating treatment plan...",
  profile_acres: "Acres",
  profile_hectares: "Hectares",
  profile_member_since: "Member Since"
};

function loadApiKey() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return null;
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/);
  return match ? match[1].trim() : null;
}

const apiKey = loadApiKey();
if (!apiKey) {
  console.error("❌ VITE_GEMINI_API_KEY not found in .env");
  process.exit(1);
}

async function queryGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error: ${response.status} - ${errText}`);
  }

  const json = await response.json();
  const text = json.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

async function run() {
  console.log("🚀 Starting patch compiler for extra keys...");
  const prompt = `You are a translation assistant specializing in agricultural and farming terminology.
Translate the following English terms/labels of an agricultural app into these target languages:
Target Languages:
${Object.entries(LANGUAGE_NAMES).map(([code, name]) => `- ${code}: ${name}`).join('\n')}

Important Context:
- Swahili, Odia, Hausa, Yoruba, Igbo, Zulu are spoken by rural farmers, so use local, natural agricultural terms where possible.
- Keep translations concise as they are UI labels, buttons, and short hints.
- Retain emojis or styling if present.

English JSON data:
${JSON.stringify(EXTRA_KEYS_TO_TRANSLATE, null, 2)}

Respond with a JSON object where each key has a sub-object containing translations for ALL 24 languages listed above, including "en".
Response JSON format:
{
  "key_name": {
    "en": "...",
    "hi": "...",
    ...
  }
}`;

  let patchResult;
  let success = false;
  let retries = 3;
  while (!success && retries > 0) {
    try {
      patchResult = await queryGemini(prompt);
      Object.keys(EXTRA_KEYS_TO_TRANSLATE).forEach(k => {
        if (!patchResult[k]) throw new Error(`Missing key ${k} in response`);
      });
      success = true;
    } catch (err) {
      console.warn("⚠️ Patch failed, retrying...", err.message);
      retries--;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!success) {
    console.error("❌ Fatal: Failed to generate patch.");
    process.exit(1);
  }

  // Read existing i18n.js
  const i18nPath = path.join(__dirname, '../src/lib/i18n.js');
  if (!fs.existsSync(i18nPath)) {
    console.error("❌ src/lib/i18n.js does not exist yet!");
    process.exit(1);
  }

  let fileContent = fs.readFileSync(i18nPath, 'utf8');

  // Insert patched translations inside TRANSLATIONS block
  let patchString = "";
  Object.entries(patchResult).forEach(([key, langs]) => {
    patchString += `  ${key.padEnd(20)}: ${JSON.stringify(langs)},\n`;
  });

  // Find insertion point inside export const TRANSLATIONS = {
  const insertIndex = fileContent.indexOf('export const TRANSLATIONS = {');
  if (insertIndex === -1) {
    console.error("❌ TRANSLATIONS block not found in i18n.js");
    process.exit(1);
  }

  const openBraceIndex = fileContent.indexOf('{', insertIndex);
  if (openBraceIndex === -1) {
    console.error("❌ TRANSLATIONS open brace not found");
    process.exit(1);
  }

  const patchedContent = fileContent.slice(0, openBraceIndex + 1) + "\n" + patchString + fileContent.slice(openBraceIndex + 1);
  fs.writeFileSync(i18nPath, patchedContent, 'utf8');
  console.log("✅ Success! Patched 19 extra keys into src/lib/i18n.js successfully!");
}

run().catch(err => {
  console.error("❌ Patch failed:", err);
  process.exit(1);
});
