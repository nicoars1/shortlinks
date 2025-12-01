function saveToLocalStorage() {
    localStorage.setItem("linksData", JSON.stringify(linksData));
}

let linksData = [];
const MAX_LINKS = 5;

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

const modal = document.getElementById("customModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalIcon = document.getElementById("modalIcon");
const modalIconBg = document.getElementById("modalIconBg");

let confirmCallback = null;

function showModal(type, title, message, callback = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmCallback = callback;

    modal.classList.remove("hidden");

    if (type === 'delete') {
        modalIconBg.className = "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10";
        modalIcon.className = "fa-solid fa-trash-can text-red-600";
        modalConfirmBtn.textContent = "Delete";
        modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm";
        modalCancelBtn.classList.remove("hidden");
    } else if (type === 'security') {
        modalIconBg.className = "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10";
        modalIcon.className = "fa-solid fa-shield-halved text-red-600";
        modalConfirmBtn.textContent = "Close";
        modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-600 text-base font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:w-auto sm:text-sm";
        modalCancelBtn.classList.add("hidden");
    } else if (type === 'limit') {
        modalIconBg.className = "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10";
        modalIcon.className = "fa-solid fa-hand text-orange-600";
        modalConfirmBtn.textContent = "Close";
        modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-600 text-base font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:w-auto sm:text-sm";
        modalCancelBtn.classList.add("hidden");
    } else {
        modalIconBg.className = "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10";
        modalIcon.className = "fa-solid fa-info text-blue-600";
        modalConfirmBtn.textContent = "Close";
        modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-600 text-base font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:w-auto sm:text-sm";
        modalCancelBtn.classList.add("hidden");
    }
}

function closeModal() {
    modal.classList.add("hidden");
    confirmCallback = null;
}

modalCancelBtn.addEventListener("click", closeModal);
modalConfirmBtn.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    closeModal();
});

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
                <button onclick="copyToClipboard('https://shortlinks-production-86ed.up.railway.app/${shortCode}')" 
                        class="text-slate-400 hover:text-brand-600 transition p-2 rounded-full hover:bg-brand-50"
                        title="Copy">
                    <i class="fa-regular fa-copy"></i>
                </button>

                <button onclick="requestDeleteLink(${index})"
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = input.value.trim();

    if (!url) {
        showModal('error', 'Input Required', 'Please enter a valid URL.');
        return;
    }

    if (linksData.length >= MAX_LINKS) {
        showModal('limit', 'Limit Reached', `You have reached the limit of ${MAX_LINKS} short links. Please delete one to create a new one.`);
        return;
    }

    try {
        const response = await fetch("/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, user_id: userId })
        });

        const data = await response.json();
        
        if (data.error) {
            if (data.error.includes("suspicious")) {
                showModal('security', 'Security Alert', 'Suspicious URL detected. This link cannot be shortened due to security policies.');
            } else if (data.error.includes("limit")) {
                showModal('limit', 'Limit Reached', `You have reached the limit of ${MAX_LINKS} short links. Please delete one to create a new one.`);
            } else {
                showModal('error', 'Error', data.error);
            }
            return;
        }

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
        showModal('error', 'Connection Error', 'An unexpected error occurred. Please try again.');
    }
});

async function loadStats() {
    try {
        const res = await fetch("/stats/clicks");
        const data = await res.json();
        totalClicksDisplay.textContent = data.total_clicks;
    } catch (e) {
        console.log("Stats error");
    }
}

function updatePersonalClicks() {
    const total = linksData.reduce((sum, link) => sum + (link.clicks || 0), 0);
    document.getElementById("personalClicksDisplay").textContent = total;
}

async function loadLinks() {
    try {
        const res = await fetch(`/stats/links?user_id=${userId}`);
        const data = await res.json();

        linksData = data;
        saveToLocalStorage(); 
        renderTable();
        updatePersonalClicks();
    } catch (e) {
        console.log("Load links error");
    }
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

function requestDeleteLink(index) {
    showModal('delete', 'Delete Link', 'Are you sure you want to delete this link? This action cannot be undone.', () => {
        performDeleteLink(index);
    });
}

async function performDeleteLink(index) {
    const link = linksData[index];
    const shortCode = link.short || link.short_code;

    if (!shortCode) return;

    try {
        const res = await fetch(`/delete/${shortCode}`, {
            method: "DELETE"
        });

        const data = await res.json();
        if (data.error) {
            showModal('error', 'Error', data.error);
            return;
        }

        linksData.splice(index, 1);
        saveToLocalStorage();

        renderTable();
        loadStats();
        updatePersonalClicks();
        showToast("Link deleted successfully");
    } catch (err) {
        console.error("Delete error:", err);
        showModal('error', 'Error', 'Could not delete the link.');
    }
}

loadLinks();
loadStats();