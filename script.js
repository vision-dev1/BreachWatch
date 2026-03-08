// BreachWatch — Email Breach Check Functionality
(function () {
  "use strict";

  const emailInput = document.getElementById("email-input");
  const checkBtn = document.getElementById("check-btn");
  const resultArea = document.getElementById("result-area");

  if (!emailInput || !checkBtn || !resultArea) return;

  // Simple client-side email regex
  const EMAIL_RE = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  checkBtn.addEventListener("click", handleCheck);
  emailInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleCheck();
  });

  async function handleCheck() {
    const email = emailInput.value.trim();

    if (!email) {
      showError("Please enter an email address.");
      return;
    }

    if (!EMAIL_RE.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    showLoading();

    try {
      const res = await fetch("/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.breached) {
        showBreached(data);
      } else {
        showSafe(data);
      }
    } catch (err) {
      showError("Network error. Please check your connection and try again.");
    }
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------
  function showLoading() {
    resultArea.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4">
        <div class="bw-spinner"></div>
        <p class="text-sm font-medium text-slate-500">Scanning breach databases…</p>
      </div>`;
  }

  function showBreached(data) {
    const listItems = (data.breaches || [])
      .map(
        (b) =>
          `<li class="flex items-start gap-2 text-slate-700">
            <span class="material-symbols-outlined text-red-500 text-base mt-0.5">warning</span>
            <span class="text-sm">${escapeHtml(b)}</span>
          </li>`
      )
      .join("");

    resultArea.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="w-full md:w-1/2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span class="material-symbols-outlined text-sm">gpp_maybe</span>
              Breaches Detected
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">⚠ Email found in breaches</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
              Your email was found in <strong>${data.breach_count}</strong> known data breach(es). We recommend changing your passwords immediately.
            </p>
            <ul class="space-y-3">${listItems}</ul>
          </div>
          <div class="w-full md:w-1/2">
            <div class="aspect-video bg-white border border-slate-200 rounded-xl shadow-inner flex items-center justify-center">
              <div class="flex flex-col items-center gap-4 text-red-400">
                <span class="material-symbols-outlined text-6xl">gpp_bad</span>
                <p class="text-sm font-medium">Breach Count: ${data.breach_count}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function showSafe(data) {
    resultArea.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="w-full md:w-1/2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span class="material-symbols-outlined text-sm">verified_user</span>
              All Clear
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">✓ No breach found</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
              ${escapeHtml(data.message || "Your email was not found in known breach datasets.")}
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-slate-700">
                <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                <span class="text-sm font-medium">No compromised credentials detected</span>
              </li>
              <li class="flex items-start gap-3 text-slate-700">
                <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                <span class="text-sm font-medium">Not found in dark web databases</span>
              </li>
              <li class="flex items-start gap-3 text-slate-700">
                <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                <span class="text-sm font-medium">Email appears secure</span>
              </li>
            </ul>
          </div>
          <div class="w-full md:w-1/2">
            <div class="aspect-video bg-white border border-slate-200 rounded-xl shadow-inner flex items-center justify-center">
              <div class="flex flex-col items-center gap-4 text-emerald-400">
                <span class="material-symbols-outlined text-6xl">verified_user</span>
                <p class="text-sm font-medium">You're safe!</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function showError(msg) {
    resultArea.innerHTML = `
      <div class="bg-slate-50 border border-red-200 rounded-2xl p-8 md:p-12">
        <div class="flex flex-col items-center text-center gap-4">
          <span class="material-symbols-outlined text-5xl text-red-400">error</span>
          <p class="text-slate-700 font-medium">${escapeHtml(msg)}</p>
        </div>
      </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
