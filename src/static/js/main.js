function saveToLocalStorage() {
    localStorage.setItem("linksData", JSON.stringify(linksData));
}

let linksData = [];
const MAX_LINKS = 5;

// Generar un ID único para cada usuario/navegador
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", userId);
}

const form = document.getElementById("shortenForm");
const input = document.getElementById("originalUrl");
const tableBody = document.getElementById("linksTableBody");
const totalLinksDisplay = document.getElementById("totalLinksDisplay");
const totalClicksDisplay = document.getElementById("totalClicksDisplay");
const submitBtn = document.getElementById("submitBtn");



function renderTable() {
    tableBody.innerHTML = "";

    if (linksData.length === 0) {
        document.getElementById("emptyState").classList.remove("hidden");
        totalLinksDisplay.textContent = "0/5";
        return;
    }
        
    

    document.getElementById("emptyState").classList.add("hidden");

    linksData.forEach((link, index) => {
        const original = link.original || link.original_url || "";
        const shortCode = link.short || link.short_code || "";
        const truncatedUrl =
            original.length > 40 ? original.substring(0, 40) + "…" : original;

        const row = document.createElement("tr");
        row.className = "hover:bg-slate-50 transition-colors group";

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 mr-3">
                        <i class="fa-brands fa-chrome"></i>
                    </div>
                    <div class="max-w-xs truncate" title="${original}">
                        <a href="${original}" target="_blank" class="text-slate-900 font-medium hover:text-brand-600 transition">
                            ${truncatedUrl}
                        </a>
                    </div>
                </div>
            </td>

            <td class="px-6 py-4">
                <span class="text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded text-xs border border-brand-100">
                    <a href="${shortCode}" target="_blank">${shortCode}</a>
                </span>
            </td>

            <td class="px-6 py-4 text-slate-500">
                ${link.created || link.created_at || ""}
            </td>

            <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${link.clicks ? link.clicks.toLocaleString() : 0}
                </span>
            </td>

            <td class="px-6 py-4 text-right">
                <button onclick="copyToClipboard('http://127.0.0.1:4000/${shortCode}')" 
                        class="text-slate-400 hover:text-brand-600 transition p-2 rounded-full hover:bg-brand-50"
                        title="Copy">
                    <i class="fa-regular fa-copy"></i>
                </button>

                <button onclick="deleteLink(${index})"
                        class="text-slate-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50 ml-1"
                        title="Delete">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    totalLinksDisplay.textContent = `${linksData.length}/5`;
}

// --- Form Submit ---
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = input.value.trim();

    if (!url) return alert("Enter a URL");

    // Validar límite de 5 links
    if (linksData.length >= MAX_LINKS) {
        return alert(`Has alcanzado el límite de ${MAX_LINKS} links cortos. Elimina uno para crear otro.`);
    }

    try {
        const response = await fetch("/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, user_id: userId })
        });

        const data = await response.json();
        if (data.error) return alert("Error: " + data.error);

        linksData.push({
            original: data.original,
            short: data.short,
            created_at: data.created_at,
            clicks: data.clicks
        });

        saveToLocalStorage();
        renderTable();
        loadStats();
        input.value = "";
    } catch (err) {
        console.error("Error:", err);
        alert("Unexpected error.");
    }
});

async function loadStats() {
    const res = await fetch("/stats/clicks");
    const data = await res.json();
    totalClicksDisplay.textContent = data.total_clicks;
}

async function loadLinks() {
    const res = await fetch(`/stats/links?user_id=${userId}`);
    const data = await res.json();

    linksData = data;
    saveToLocalStorage(); // Sync local copy

    renderTable();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast(`Copied: ${text}`))
        .catch(err => console.error("Copy error", err));
}

function showToast(message) {
    const toastEl = document.getElementById("toast");
    document.getElementById("toastMessage").innerText = message;

    toastEl.classList.remove("translate-y-20", "opacity-0");

    setTimeout(() => {
        toastEl.classList.add("translate-y-20", "opacity-0");
    }, 3000);
}

async function deleteLink(index) {
    const link = linksData[index];
    const shortCode = link.short || link.short_code;

    if (!shortCode) return;
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
        const res = await fetch(`/delete/${shortCode}`, {
            method: "DELETE"
        });

        const data = await res.json();
        if (data.error) return alert("Error: " + data.error);

        linksData.splice(index, 1);
        saveToLocalStorage();

        renderTable();
        loadStats();
        showToast("Link deleted successfully");
    } catch (err) {
        console.error("Delete error:", err);
        alert("Error trying to delete.");
    }
}

// --- Initial Load ---
loadLinks();
loadStats();
