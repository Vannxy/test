// script.js (VERSI LAMA LOGIKA TABUNGAN + PERBAIKAN TAMPILAN)

// --- DATA HARGA & MULTIPLIER KONSTANTA ---
const priceList = {
    cateringPerGuest: { 'Basic': 75000, 'Standard': 120000, 'Premium': 180000 },
    venue: {
        'Rumah Adat': 35000000, 'Gedung Bersejarah': 60000000, 'Hotel Bintang 5': 100000000,
        'Balai Kota Surabaya': 75000000, 'Pendopo Agung Trowulan': 80000000,
    },
    riasBusana: { 'Paes Ageng Jatim': 25000000, 'Dodotan Jawa Timuran': 28000000, 'Kebaya Modern Modifikasi': 20000000 },
    addOnMenu: {
        'Rawon Daging': 15000, 'Lontong Balap': 12000, 'Tahu Campur Lamongan': 12000,
        'Soto Lamongan': 15000, 'Rujak Cingur': 13000,
    },
    additionalServices: {
        documentation: 15000000, entertainment: 10000000, WO: 20000000,
        dekorasiStandar: 30000000, undanganSouvenir: 10000000,
    }
};

// MULTIPLIER HARGA BERDASARKAN TINGKAT ADAT 
const adatMultiplier = {
    'Malangan': 1.0, 'Surabayan': 1.15, 'Suroboyoan': 1.25, 'Modern Jatim': 0.90,
};

const optionsConfig = {
    menuItems: ['Rawon Daging', 'Lontong Balap', 'Tahu Campur Lamongan', 'Soto Lamongan', 'Rujak Cingur'],
    additionalServices: [
        { id: 'documentation', label: 'Dokumentasi (Foto & Video)' },
        { id: 'entertainment', label: 'Hiburan (Musik/Tarian)' },
        { id: 'WO', label: 'Wedding Organizer' },
        { id: 'dekorasiStandar', label: 'Dekorasi Standar' },
        { id: 'undanganSouvenir', label: 'Undangan & Souvenir' },
    ]
};

// --- STATE MANAGEMENT ---
let currentState = {
    step: 1,
    budget: 150000000, monthlySavings: 5000000, 
    guestsFamily: 50, guestsFriends: 50, eventType: 'Malangan',
    venueType: 'Rumah Adat', cateringPackage: 'Basic', menuOptions: [], 
    bridalWear: 'Paes Ageng Jatim',
    additionalServices: { documentation: false, entertainment: false, WO: false, dekorasiStandar: false, undanganSouvenir: false },
    costEstimation: { total: 0, details: {} }
};

const totalSteps = 4;
let costChart = null; 
const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);


// --- LOGIKA KALKULASI UTAMA (TIDAK BERUBAH) ---
function calculateCost() {
    let total = 0;
    const details = {};
    const totalGuests = currentState.guestsFamily + currentState.guestsFriends;
    const multiplier = adatMultiplier[currentState.eventType] || 1.0;
    
    // 1. Biaya Catering
    const cateringCost = totalGuests * (priceList.cateringPerGuest[currentState.cateringPackage] || 0);
    total += cateringCost;
    details['Catering (Total Tamu: ' + totalGuests + ')'] = cateringCost;

    // 2. Biaya Venue
    const venueCost = priceList.venue[currentState.venueType] || 0;
    total += venueCost;
    details['Venue'] = venueCost;

    // 3. Biaya Rias & Busana (Dikenakan Multiplier Adat)
    const riasBusanaCost = Math.round((priceList.riasBusana[currentState.bridalWear] || 0) * multiplier);
    total += riasBusanaCost;
    details['Rias & Busana (Adat ' + currentState.eventType + ')'] = riasBusanaCost;

    // 4. Biaya Add-on Menu
    let addOnMenuCost = 0;
    currentState.menuOptions.forEach(menuItem => {
        addOnMenuCost += (priceList.addOnMenu[menuItem] || 0) * totalGuests; 
    });
    if (addOnMenuCost > 0) {
         details['Menu Tambahan Khas Jatim'] = addOnMenuCost;
         total += addOnMenuCost;
    }

    // 5. Biaya Layanan Tambahan (fixed cost)
    for (const serviceId in currentState.additionalServices) {
        if (currentState.additionalServices[serviceId]) {
            const serviceCost = priceList.additionalServices[serviceId] || 0;
            total += serviceCost;
            const label = optionsConfig.additionalServices.find(s => s.id === serviceId)?.label || serviceId;
            details[label] = serviceCost;
        }
    }
    
    currentState.costEstimation = { total, details };
    updateResultDisplay();
}


// --- FUNGSI PERENCANAAN TABUNGAN (LOGIKA LAMA) ---
function calculateSavingsPlan() {
    const totalCost = currentState.costEstimation.total;
    const currentBudget = currentState.budget;
    const monthlySavings = currentState.monthlySavings;
    const savingsCard = document.getElementById('savings-plan-card');
    const savingsMessage = document.getElementById('savings-message');

    if (monthlySavings < 1 || totalCost <= 0) {
        savingsCard.classList.add('hidden');
        return;
    }
    
    // LOGIKA LAMA (Hanya menghitung selisih absolut)
    const amountToSave = Math.abs(currentBudget - totalCost);
    
    if (amountToSave <= 0) {
         savingsCard.classList.add('hidden');
         return;
    }

    savingsCard.classList.remove('hidden');
    
    const months = Math.ceil(amountToSave / monthlySavings);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let timeString = '';
    if (years > 0) {
        timeString += `${years} tahun`;
        if (remainingMonths > 0) timeString += ` dan ${remainingMonths} bulan`;
    } else {
        timeString += `${months} bulan`;
    }

    let finalMessage = `Untuk menutupi kekurangan/memanfaatkan sisa dana sebesar **${formatRupiah(amountToSave)}**, Anda perlu menabung: `;
    finalMessage += `Dengan tabungan **${formatRupiah(monthlySavings)}** per bulan, Anda akan mencapai target dalam waktu **${timeString}**.`;
    
    savingsMessage.innerHTML = finalMessage;
}


// --- FUNGSI DOM & RENDER (Modifikasi di updateStepDisplay) ---

function validateStep(step) {
    const errorElement = document.getElementById('error-message');
    errorElement.classList.add('hidden'); 

    if (step === 1) {
        const totalGuests = currentState.guestsFamily + currentState.guestsFriends;
        if (totalGuests < 1 || !currentState.budget || !currentState.monthlySavings) {
            errorElement.textContent = 'Semua field di Langkah 1 harus diisi dengan benar!';
            errorElement.classList.remove('hidden');
            return false;
        }
    }
    return true;
}

function updateStepDisplay() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index + 1 !== currentState.step);
    });

    document.getElementById('prevBtn').classList.toggle('hidden', currentState.step === 1);
    document.getElementById('error-message').classList.add('hidden');
    
    // Perbaikan: Kontrol Tampilan Hasil
    const isResultStep = currentState.step > totalSteps;
    document.getElementById('result-section').classList.toggle('hidden', !isResultStep);
    document.getElementById('nextBtn').classList.toggle('hidden', isResultStep); // Sembunyikan 'Selanjutnya' di langkah hasil

    const nextBtn = document.getElementById('nextBtn');
    if (currentState.step === totalSteps) {
        nextBtn.textContent = 'Lihat Estimasi';
        nextBtn.classList.remove('ml-auto');
    } else if (currentState.step < totalSteps) {
        nextBtn.textContent = 'Selanjutnya \u2192'; 
        nextBtn.classList.add('ml-auto');
    }
    
    if (isResultStep) {
        calculateCost();
    }

    renderProgressBar();
}
// ... (fungsi renderProgressBar, updateResultDisplay, updatePieChart, event handlers, dan inisialisasi lainnya tetap sama) ...

// ... (lanjutan event handlers, navigation dan initialization) ...

function nextStep() {
    if (validateStep(currentState.step) && currentState.step <= totalSteps) {
        currentState.step++;
        updateStepDisplay();
    } 
}

function prevStep() {
    if (currentState.step > 1) {
        currentState.step--;
        updateStepDisplay();
    }
}

function printResult() {
    window.print();
}

window.nextStep = nextStep;
window.prevStep = prevStep;
window.printResult = printResult;

function initialize() {
    // ... (inisialisasi state awal) ...
    attachEventHandlers();
    updateStepDisplay(); 
    calculateCost();
}

document.addEventListener('DOMContentLoaded', initialize);
