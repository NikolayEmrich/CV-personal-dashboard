// Base value: January 2026 estimate in GB
const baseGB = 186_000_000_000_000; // 186 триллионов GB

// Assumed annual growth rate (22%)
const annualGrowth = 0.22;

// Base date for the estimate
const startDate = new Date("2026-01-20T00:00:00Z");

function updateCounter() {
    const now = new Date();
    const yearsPassed = (now - startDate) / (1000 * 60 * 60 * 24 * 365);
    const currentGB = baseGB * Math.pow(1 + annualGrowth, yearsPassed);

    const counterEl = document.getElementById("counter");
    if (counterEl) {
        // Используем локаль de-DE или ru-RU для разделителя точкой
        counterEl.innerText = Math.round(currentGB).toLocaleString('de-DE') + " GB";
    }
}

// Initialize counter immediately
updateCounter();

// Update every second
setInterval(updateCounter, 1000);