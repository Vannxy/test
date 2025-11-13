// script.js (FINAL GABUNGAN: LOGIKA TABUNGAN LAMA + PERBAIKAN TAMPILAN PRINT)

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


// --- LOGIKA KALKULASI UTAMA ---
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
    
    // LOGIKA LAMA: Hanya menghitung selisih absolut
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


// --- FUNGSI DOM & RENDER (TERMASUK PERBAIKAN CETAK) ---

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
    
    // LOGIKA PERBAIKAN TAMPILAN HASIL & CETAK
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

function renderProgressBar() {
    const progressContainer = document.getElementById('step-progress');
    progressContainer.innerHTML = '';
    const stepLabels = ["Anggaran & Tabungan", "Venue & Catering", "Rias & Busana", "Layanan Tambahan"];

    stepLabels.forEach((label, index) => {
        const stepNum = index + 1;
        const isActive = currentState.step === stepNum;
        const isCompleted = currentState.step > stepNum;

        const indicator = document.createElement('div');
        indicator.className = 'flex-1 text-center';
        indicator.innerHTML = `
            <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg font-bold step-indicator
                ${isActive ? 'bg-jatim-primary text-jatim-background shadow-lg' : isCompleted ? 'bg-jatim-accent text-jatim-primary' : 'bg-jatim-secondary text-white opacity-70'}
            ">
                ${stepNum}
            </div>
            <p class="mt-2 text-sm md:text-base ${isActive ? 'font-semibold text-jatim-primary' : 'text-gray-600'}">
                ${label}
            </p>
        `;
        progressContainer.appendChild(indicator);
    });
}

function updateResultDisplay() {
    const { total, details } = currentState.costEstimation;
    const budget = currentState.budget;

    // Tampilkan Anggaran & Total
    document.getElementById('user-budget').textContent = formatRupiah(budget);
    document.getElementById('total-cost').textContent = formatRupiah(total);

    // Tentukan Status Anggaran
    const diff = budget - total;
    const budgetStatusElement = document.getElementById('budget-status');
    const budgetDiffElement = document.getElementById('budget-diff');

    budgetStatusElement.className = 'p-3 rounded-md text-white';

    if (budget === 0) { 
        budgetStatusElement.classList.add('bg-danger');
        budgetDiffElement.textContent = `Lebih Rp ${formatRupiah(total)}`;
    } else if (diff >= 0.1 * budget) {
        budgetStatusElement.classList.add('bg-success');
        budgetDiffElement.textContent = `Sisa ${formatRupiah(diff)}`;
    } else if (diff >= 0 && diff < 0.1 * budget) {
        budgetStatusElement.classList.add('bg-warning', 'text-jatim-text');
        budgetDiffElement.textContent = `Sisa ${formatRupiah(diff)}`;
    } else {
        budgetStatusElement.classList.add('bg-danger');
        budgetDiffElement.textContent = `Lebih Rp ${formatRupiah(Math.abs(diff))}`;
    }

    // Tampilkan Rincian
    const detailsList = document.getElementById('cost-details');
    detailsList.innerHTML = '';
    for (const [category, amount] of Object.entries(details)) {
        if (amount > 0) {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between border-b border-jatim-secondary pb-2';
            listItem.innerHTML = `
                <span class="text-jatim-text">${category}:</span>
                <span class="font-semibold text-jatim-primary">${formatRupiah(amount)}</span>
            `;
            detailsList.appendChild(listItem);
        }
    }
    
    // Panggil fungsi perencanaan tabungan
    calculateSavingsPlan();
    
    // Update Pie Chart
    updatePieChart(details);
}

function updatePieChart(details) {
    const ctx = document.getElementById('costPieChart').getContext('2d');
    const filteredDetails = Object.entries(details).filter(([, amount]) => amount > 0);
    
    const data = {
        labels: filteredDetails.map(([category]) => category),
        datasets: [{
            data: filteredDetails.map(([, amount]) => amount),
            backgroundColor: [
                '#4A2A22', '#A87A5E', '#FFD700', '#8B4513', '#D2B48C', '#CD853F', 
                '#F4A460', '#BDB76B', '#5F9EA0',
            ],
            borderColor: '#FDFBF6',
            borderWidth: 2,
        }]
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#2C1D17' } },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (context.parsed !== null) {
                            label += ': ' + formatRupiah(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };

    if (costChart) {
        costChart.data = data;
        costChart.options = options;
        costChart.update();
    } else {
        costChart = new Chart(ctx, { type: 'pie', data: data, options: options });
    }
}


// --- EVENT HANDLERS & INITIALIZATION ---
function attachEventHandlers() {
    // Step 1: Input Change Listeners
    document.getElementById('budget').addEventListener('input', (e) => {
        currentState.budget = parseInt(e.target.value) || 0;
        calculateCost();
    });
    document.getElementById('monthlySavings').addEventListener('input', (e) => {
        currentState.monthlySavings = parseInt(e.target.value) || 0;
        calculateCost();
    });
    document.getElementById('guestsFamily').addEventListener('input', (e) => {
        currentState.guestsFamily = parseInt(e.target.value) || 0;
        calculateCost();
    });
    document.getElementById('guestsFriends').addEventListener('input', (e) => {
        currentState.guestsFriends = parseInt(e.target.value) || 0;
        calculateCost();
    });
    document.getElementById('eventType').addEventListener('change', (e) => {
        currentState.eventType = e.target.value;
        calculateCost(); 
    });

    // Step 2 & 3 Change Events
    document.getElementById('venueType').addEventListener('change', (e) => {
        currentState.venueType = e.target.value;
        calculateCost();
    });
    document.getElementById('cateringPackage').addEventListener('change', (e) => {
        currentState.cateringPackage = e.target.value;
        calculateCost();
    });
    document.getElementById('bridalWear').addEventListener('change', (e) => {
        currentState.bridalWear = e.target.value;
        calculateCost();
    });
    
    // Checkbox Rendering & Listeners (Menu Options)
    const menuContainer = document.getElementById('menu-options');
    optionsConfig.menuItems.forEach(item => {
        const id = `menu-${item.replace(/\s/g, '-')}`;
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `<input type="checkbox" id="${id}" value="${item}" class="h-5 w-5 text-jatim-primary focus:ring-jatim-accent rounded-sm border-jatim-secondary cursor-pointer"><label for="${id}" class="ml-3 text-base text-jatim-text cursor-pointer">${item}</label>`;
        div.querySelector('input').addEventListener('change', (e) => {
            const value = e.target.value;
            if (e.target.checked) { currentState.menuOptions.push(value); } 
            else { currentState.menuOptions = currentState.menuOptions.filter(i => i !== value); }
            calculateCost();
        });
        menuContainer.appendChild(div);
    });

    // Checkbox Rendering & Listeners (Additional Services)
    const servicesContainer = document.getElementById('additional-services-options');
    optionsConfig.additionalServices.forEach(service => {
        const id = `service-${service.id}`;
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `<input type="checkbox" id="${id}" value="${service.id}" class="h-5 w-5 text-jatim-primary focus:ring-jatim-accent rounded-sm border-jatim-secondary cursor-pointer"><label for="${id}" class="ml-3 text-base text-jatim-text cursor-pointer">${service.label}</label>`;
        div.querySelector('input').addEventListener('change', (e) => {
            currentState.additionalServices[e.target.value] = e.target.checked;
            calculateCost();
        });
        servicesContainer.appendChild(div);
    });
}

// --- NAVIGATION FUNGSI DENGAN VALIDASI ---
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

// FUNGSI PRINT 
function printResult() {
    window.print();
}

// Membuka fungsi ke window agar dapat dipanggil oleh HTML
window.nextStep = nextStep;
window.prevStep = prevStep;
window.printResult = printResult;

// --- INISIALISASI ---
function initialize() {
    attachEventHandlers();
    
    // Set nilai state awal dari input saat dimuat
    currentState.budget = parseInt(document.getElementById('budget').value) || 0;
    currentState.monthlySavings = parseInt(document.getElementById('monthlySavings').value) || 0;
    currentState.guestsFamily = parseInt(document.getElementById('guestsFamily').value) || 0;
    currentState.guestsFriends = parseInt(document.getElementById('guestsFriends').value) || 0;
    
    calculateCost(); 
    updateStepDisplay(); 
}

document.addEventListener('DOMContentLoaded', initialize);
