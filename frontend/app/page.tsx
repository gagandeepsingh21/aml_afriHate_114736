
"use client";

import { useState } from "react";

const languages = [
  { code: "amh", name: "Amharic" },
  { code: "arq", name: "Algerian Arabic" },
  { code: "ary", name: "Moroccan Arabic" },
  { code: "hau", name: "Hausa" },
  { code: "ibo", name: "Igbo" },
  { code: "kin", name: "Kinyarwanda" },
  { code: "orm", name: "Oromo" },
  { code: "pcm", name: "Nigerian Pidgin" },
  { code: "som", name: "Somali" },
  { code: "swa", name: "Swahili" },
  { code: "tir", name: "Tigrinya" },
  { code: "twi", name: "Twi" },
  { code: "xho", name: "isiXhosa" },
  { code: "yor", name: "Yoruba" },
  { code: "zul", name: "isiZulu" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("amh");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyseText() {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to analyse the text.");
      }

      const result = await response.json();
      setPrediction(result.prediction);
    } catch (err) {
      setError(
        "Could not connect to the API. Check that your FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const resultStyle: Record<string, string> = {
    hate: "bg-red-100 text-red-700",
    abuse: "bg-orange-100 text-orange-700",
    normal: "bg-green-100 text-green-700",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 flex-col bg-slate-950 p-6 text-white md:flex">
          <h1 className="text-2xl font-bold">AfriHate</h1>
          <p className="mt-1 text-sm text-slate-400">
            Multilingual Text Classification
          </p>

          <div className="mt-12 space-y-3">
            <div className="rounded-lg bg-indigo-600 px-4 py-3">
              Text Classification
            </div>

            <div className="px-4 py-3 text-slate-400">
              Language Testing
            </div>

            <div className="px-4 py-3 text-slate-400">
              Evaluation Results
            </div>

            <div className="px-4 py-3 text-slate-400">
              About the Research
            </div>
          </div>

          <div className="mt-auto border-t border-slate-800 pt-5 text-xs text-slate-500">
            MSc Research Project
            <br />
            African Language Analysis
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-5xl">

            <div className="mb-10">
              <p className="text-sm font-medium text-indigo-600">
                AFRIHATE CLASSIFICATION SYSTEM
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                African Language Text Analysis
              </h2>

              <p className="mt-3 text-slate-500">
                Analyse social media text and classify it as Hate,
                Abusive, or Normal.
              </p>
            </div>

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Supported languages</p>
                <h3 className="mt-2 text-3xl font-bold">15</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Classification classes</p>
                <h3 className="mt-2 text-3xl font-bold">3</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Model</p>
                <h3 className="mt-2 text-2xl font-bold">TF-IDF</h3>
              </div>
            </div>

            {/* Text input */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                Enter text for classification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select a language and enter the text you want to analyse.
              </p>

              <label className="mt-6 block text-sm font-medium">
                Language
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-indigo-500"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>

              <label className="mt-6 block text-sm font-medium">
                Social media text
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                rows={6}
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 p-4 outline-none focus:border-indigo-500"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Maximum 5,000 characters</span>
                <span>{text.length} characters</span>
              </div>

              <button
                onClick={analyseText}
                disabled={loading || !text.trim() || text.length > 5000}
                className="mt-6 w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analysing..." : "Analyse Text"}
              </button>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Prediction result */}
            {prediction && (
              <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  Classification Result
                </h3>

                <p className="mt-3 text-sm text-slate-500">
                  Predicted category
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-5 py-2 font-semibold capitalize ${
                    resultStyle[prediction.toLowerCase()] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {prediction}
                </span>

                <p className="mt-4 text-sm text-slate-500">
                  Selected language: {language}
                </p>
              </div>
            )}

            <footer className="mt-12 border-t pt-6 text-center text-sm text-slate-400">
              AfriHate | Multilingual Hate Speech and Abusive Language
              Classification
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}
