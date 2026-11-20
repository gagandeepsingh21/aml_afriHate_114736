
"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_CHARS = 2000;

const africanLanguages = [
  "Amharic",
  "Algerian Arabic",
  "Moroccan Arabic",
  "Hausa",
  "Igbo",
  "Kinyarwanda",
  "Oromo",
  "Nigerian Pidgin",
  "Somali",
  "Swahili",
  "Tigrinya",
  "Twi",
  "isiXhosa",
  "Yoruba",
  "isiZulu",
];

const additionalLanguages = ["English"];

type Prediction = {
  label: string;
  probabilities: Record<string, number>;
  harmful_score: number;
  needs_human_review: boolean;
};

type ModelInfo = {
  held_out_language?: string | null;
  review_threshold?: number;
  zero_shot_macro_f1?: number | null;
};

const languageCodes: Record<string, string> = {
  amh: "Amharic",
  arq: "Algerian Arabic",
  ary: "Moroccan Arabic",
  hau: "Hausa",
  ibo: "Igbo",
  kin: "Kinyarwanda",
  orm: "Oromo",
  pcm: "Nigerian Pidgin",
  som: "Somali",
  swa: "Swahili",
  tir: "Tigrinya",
  twi: "Twi",
  xho: "isiXhosa",
  yor: "Yoruba",
  zul: "isiZulu",
};

const resultStyle: Record<string, string> = {
  hate: "bg-red-100 text-red-700",
  abuse: "bg-orange-100 text-orange-700",
  normal: "bg-green-100 text-green-700",
};

const barStyle: Record<string, string> = {
  hate: "bg-red-500",
  abuse: "bg-orange-500",
  normal: "bg-green-500",
};

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function ResultCard({ result }: { result: Prediction }) {
  const probabilities = Object.entries(result.probabilities).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Classification Result</h3>

      <p className="mt-3 text-sm text-slate-500">Predicted category</p>

      <span
        className={`mt-2 inline-block rounded-full px-5 py-2 font-semibold capitalize ${
          resultStyle[result.label.toLowerCase()] ||
          "bg-slate-100 text-slate-700"
        }`}
      >
        {result.label}
      </span>

      <div
        className={`mt-5 rounded-lg p-4 text-sm ${
          result.needs_human_review
            ? "bg-amber-50 text-amber-800"
            : "bg-slate-50 text-slate-600"
        }`}
      >
        {result.needs_human_review
          ? "Flagged for human review. A moderator should look at this post."
          : "Not flagged. This does not guarantee the post is harmless."}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Harmful score: {percent(result.harmful_score)}
      </p>

      <div className="mt-4 space-y-3">
        {probabilities.map(([name, value]) => (
          <div key={name}>
            <div className="flex justify-between text-sm">
              <span className="capitalize">{name}</span>
              <span className="text-slate-500">{percent(value)}</span>
            </div>

            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${
                  barStyle[name.toLowerCase()] || "bg-slate-400"
                }`}
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Retrieve information about the held-out language.
  useEffect(() => {
    if (!API_URL) return;

    fetch(`${API_URL}/model-info`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setModelInfo(data))
      .catch(() => setModelInfo(null));
  }, []);

  const heldOut = modelInfo?.held_out_language ?? null;
  const heldOutName = heldOut
    ? languageCodes[heldOut] ?? heldOut
    : null;

  async function analyseText() {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    if (text.length > MAX_CHARS) {
      setError(`Text cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    if (!API_URL) {
      setError("The API address is not configured (NEXT_PUBLIC_API_URL).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const detail =
          body && typeof body.detail === "string" ? body.detail : null;

        setError(detail ?? "The text could not be analysed.");
        return;
      }

      setResult(await response.json());
    } catch {
      setError("Could not connect to the API. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  }

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
                Analyse social media text and classify it as Hate, Abusive,
                or Normal. This is a support tool for human moderators,
                not an automatic decision maker.
              </p>
            </div>

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  African languages in dataset
                </p>
                <h3 className="mt-2 text-3xl font-bold">15</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Classification classes
                </p>
                <h3 className="mt-2 text-3xl font-bold">3</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Model</p>
                <h3 className="mt-2 text-2xl font-bold">TF-IDF + LR</h3>
              </div>
            </div>

            {/* Text input */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                Enter text for classification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter text in any of the languages listed below.
                The model analyses the submitted text without requiring
                you to select a language.
              </p>

              {/* Supported languages */}
              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-800">
                  African languages represented in the dataset
                </h4>

                <div className="mt-3 flex flex-wrap gap-2">
                  {africanLanguages.map((name) => (
                    <span
                      key={name}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        name === heldOutName
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {name}
                      {name === heldOutName ? " (Held out)" : ""}
                    </span>
                  ))}
                </div>

                {/*<div className="mt-5 border-t border-slate-200 pt-4">*/}
                {/*  <h4 className="text-sm font-semibold text-slate-800">*/}
                {/*    Additional language*/}
                {/*  </h4>*/}

                {/*  <div className="mt-3 flex flex-wrap gap-2">*/}
                {/*    {additionalLanguages.map((name) => (*/}
                {/*      <span*/}
                {/*        key={name}*/}
                {/*        className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"*/}
                {/*      >*/}
                {/*        {name}*/}
                {/*      </span>*/}
                {/*    ))}*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>

              {/* Held-out language information */}
              {heldOutName && (
                <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>{heldOutName} – Zero-shot evaluation:</strong>{" "}
                  This language was excluded from model training.
                  Predictions may therefore be less reliable.
                  {typeof modelInfo?.zero_shot_macro_f1 === "number" &&
                    ` Its evaluated zero-shot macro-F1 score was ${modelInfo.zero_shot_macro_f1.toFixed(3)}.`}
                </div>
              )}

              <label
                htmlFor="text"
                className="mt-6 block text-sm font-medium"
              >
                Social media text
              </label>

              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                rows={6}
                maxLength={MAX_CHARS}
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 p-4 outline-none focus:border-indigo-500"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Maximum {MAX_CHARS.toLocaleString()} characters</span>
                <span>{text.length} characters</span>
              </div>

              <button
                onClick={analyseText}
                disabled={loading || !text.trim() || text.length > MAX_CHARS}
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
            {result && <ResultCard result={result} />}

            <footer className="mt-12 border-t pt-6 text-center text-sm text-slate-400">
              AfriHate | Multilingual Hate Speech and Abusive Language
              Classification. Performance may vary across languages.
              Always have a person review flagged content.
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}
