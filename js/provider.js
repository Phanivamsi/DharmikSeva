// ========================================================
// SERVICE PROVIDER DASHBOARD LOGIC
// ========================================================

let onboardingCategory = "purohit";
let activeProviderId = "";

// Provider Authentication
function handleProviderLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("prov-login-username").value.trim().toLowerCase();
    const passVal = document.getElementById("prov-login-pass").value;

    const auths = db.getProvidersAuth();
    const matched = auths.find(p => p.username === userVal && p.password === passVal);

    if (matched) {
        sessionStorage.setItem("ds_current_provider_id", matched.providerId);
        document.getElementById("prov-login-form").reset();
        checkProviderAuthSession();
        showNotification("🙏 Welcome back Shastriji / Partner!");
    } else {
        alert("Invalid provider credentials. (Try 'shastri' with password '123')");
    }
}

function handleProviderRegister(e) {
    e.preventDefault();
    
    const userVal = document.getElementById("prov-reg-username").value.trim().toLowerCase();
    const passVal = document.getElementById("prov-reg-pass").value;

    const auths = db.getProvidersAuth();
    if (auths.find(p => p.username === userVal)) {
        alert("Username already exists. Choose another name.");
        return;
    }

    // Allocate temporary provider ID until details are captured
    const tempProvId = `prov-${Date.now()}`;
    auths.push({ username: userVal, password: passVal, providerId: tempProvId });
    db.saveProvidersAuth(auths);

    sessionStorage.setItem("ds_current_provider_id", tempProvId);
    document.getElementById("prov-register-form").reset();
    checkProviderAuthSession();
    showNotification("✨ Credentials registered! Please complete your service profile.");
}

function handleProviderLogout() {
    sessionStorage.removeItem("ds_current_provider_id");
    activeProviderId = "";
    checkProviderAuthSession();
}

// Onboarding Entity/Team toggle
function toggleTeamSize(show) {
    document.getElementById("team-size-container").style.display = show ? "block" : "none";
}

// Onboarding Category selection
function selectOnboardingCategory(cat, element) {
    onboardingCategory = cat;
    
    document.querySelectorAll(".wizard-cat-card").forEach(card => {
        card.classList.remove("selected");
    });
    element.classList.add("selected");

    document.getElementById("wizard-form-purohit").style.display = cat === 'purohit' ? 'block' : 'none';
    document.getElementById("wizard-form-artist").style.display = (cat === 'dancer' || cat === 'singer' || cat === 'musician') ? 'block' : 'none';
    document.getElementById("wizard-form-cow").style.display = cat === 'cow' ? 'block' : 'none';
    document.getElementById("wizard-form-food").style.display = cat === 'food' ? 'block' : 'none';
    
    document.getElementById("fssai-field-container").style.display = cat === 'food' ? 'block' : 'none';
    document.getElementById("hourly-pricing-container").style.display = cat === 'food' ? 'none' : 'grid';

    const subLabel = document.getElementById("artist-subcat-label");
    const subSelect = document.getElementById("artist-subcat");
    
    if (cat === 'dancer') {
        subLabel.textContent = "Classical Dance Form";
        subSelect.innerHTML = `
            <option value="Bharatanatyam Dancer">Bharatanatyam</option>
            <option value="Kathak Soloist">Kathak</option>
            <option value="Kuchipudi Performer">Kuchipudi</option>
            <option value="Odissi Recital Artist">Odissi</option>
        `;
    } else if (cat === 'singer') {
        subLabel.textContent = "Classical Vocal Genre";
        subSelect.innerHTML = `
            <option value="Carnatic Vocal">Carnatic Vocals</option>
            <option value="Hindustani Khayal Vocal">Hindustani classical</option>
            <option value="Dhrupad / Bhajan Singer">Devotional Bhajans</option>
        `;
    } else if (cat === 'musician') {
        subLabel.textContent = "Classical Instrument Played";
        subSelect.innerHTML = `
            <option value="Mridangam Percussion">Mridangam</option>
            <option value="Tabla Ensemble">Tabla</option>
            <option value="Veena Soloist">Veena</option>
            <option value="Bansuri Flutist">Bansuri (Flute)</option>
        `;
    }
    
    const rateTitle = document.getElementById("wizard-step-2-title");
    if (cat === 'food') {
        rateTitle.textContent = "Catering Pricing Configuration";
    } else {
        rateTitle.textContent = "Service Details & Hourly Rates";
    }
}

// Wizard Steps controller
function goToWizardStep(stepNum) {
    if (stepNum === 3) {
        if (onboardingCategory === 'food') {
            const fssai = document.getElementById("fssai-number").value;
            if (!/^\d{14}$/.test(fssai)) {
                alert("Please enter a valid 14-digit FSSAI registration number.");
                return;
            }
        }
    }

    document.querySelectorAll(".wizard-step").forEach(node => {
        node.classList.remove("active");
    });
    document.querySelectorAll(".wizard-pane").forEach(pane => {
        pane.classList.remove("active");
        pane.style.display = "none";
    });

    document.getElementById(`step-node-${stepNum}`).classList.add("active");
    const activePane = document.getElementById(`wizard-pane-${stepNum}`);
    activePane.classList.add("active");
    activePane.style.display = "block";
}

// Onboarding form completion submit (Saves as PENDING)
function completeOnboardingSubmit() {
    const name = document.getElementById("provider-name").value.trim();
    if (!name) {
        alert("Please enter a provider display name.");
        return;
    }

    const isOrg = document.querySelector('input[name="entity-type"]:checked').value === 'organization';
    const teamSize = isOrg ? parseInt(document.getElementById("provider-team-size").value) || 2 : 1;

    let experience = parseInt(document.getElementById("provider-experience-years").value) || 3;
    let hourlyRate = parseFloat(document.getElementById("provider-rate").value) || 50;

    let icon = "🌸";
    let extraFields = {};

    if (onboardingCategory === 'purohit') {
        icon = "🌸";
        const selectedPujas = Array.from(document.querySelectorAll("#wizard-form-purohit input[type='checkbox']:checked")).map(cb => cb.value);
        const selectedLangs = ["Sanskrit", "Hindi"];
        extraFields = {
            pujas: selectedPujas.length > 0 ? selectedPujas : ["Satyanarayana Vratam Homa"],
            languages: selectedLangs,
            style: document.getElementById("purohit-style").value
        };
    } else if (onboardingCategory === 'dancer' || onboardingCategory === 'singer' || onboardingCategory === 'musician') {
        icon = onboardingCategory === 'dancer' ? "💃" : onboardingCategory === 'singer' ? "🎤" : "🎻";
        extraFields = {
            artForm: document.getElementById("artist-subcat").value,
            experience: parseInt(document.getElementById("artist-experience").value) || 5,
            languages: ["Sanskrit", "Hindi"]
        };
    } else if (onboardingCategory === 'cow') {
        icon = "🐄";
        extraFields = {
            breed: document.getElementById("cow-breed").value,
            cowsAvailable: parseInt(document.getElementById("cow-count").value) || 1
        };
    } else if (onboardingCategory === 'food') {
        icon = "🍲";
        experience = 5;
        hourlyRate = 0;
        const p1 = parseFloat(document.getElementById("price-pulihara").value) || 12;
        const p2 = parseFloat(document.getElementById("price-pongali").value) || 15;
        const p3 = parseFloat(document.getElementById("price-laddu").value) || 18;
        extraFields = {
            fssai: document.getElementById("fssai-number").value,
            items: [
                { name: "Pulihara (Tamarind Rice)", price: p1 },
                { name: "Chakrapongali (Sweet Rice)", price: p2 },
                { name: "Laddu (Sacred Sweet)", price: p3 }
            ]
        };
    }

    const newProvider = {
        id: activeProviderId,
        name: name,
        type: onboardingCategory,
        icon: icon,
        experience: experience,
        rating: 5.0,
        reviewsCount: 0,
        ordersServed: 0,
        hourlyRate: hourlyRate,
        entityType: isOrg ? "organization" : "individual",
        teamSize: teamSize,
        status: "pending", // Critical refinement: registers as pending
        bio: `Verified traditional ${onboardingCategory} service.`,
        ...extraFields
    };

    // Save to database
    const providers = db.getProviders();
    const existingIndex = providers.findIndex(p => p.id === activeProviderId);
    if (existingIndex !== -1) {
        providers[existingIndex] = newProvider;
    } else {
        providers.push(newProvider);
    }
    db.saveProviders(providers);

    // Initial calendar slots
    const availabilityMap = {};
    for (let d = 1; d <= 30; d++) {
        availabilityMap[d] = d % 3 === 0 ? "unavailable" : "available";
    }
    localStorage.setItem(`ds_cal_${activeProviderId}`, JSON.stringify(availabilityMap));

    // Show dashboard view
    document.getElementById("provider-onboarding-panel").style.display = "none";
    document.getElementById("provider-active-dashboard").style.display = "block";
    
    document.getElementById("active-provider-name-display").textContent = name;
    document.getElementById("active-provider-type-display").textContent = onboardingCategory;
    
    // Trigger the pending alert display immediately
    document.getElementById("provider-verification-alert").style.display = "block";

    initProviderDashboard();
    showNotification("✨ Profile details saved! Profile is pending COO approval.");
}

// Initialise active dashboard calendar & bookings
function initProviderDashboard() {
    db.setProviderWallet(db.getProviderWallet());
    renderProviderCalendar();
    renderProviderJobs();
}

// Render calendar
function renderProviderCalendar() {
    const grid = document.getElementById("provider-calendar-grid");
    grid.innerHTML = "";

    let calSlots = localStorage.getItem(`ds_cal_${activeProviderId}`);
    if (!calSlots) {
        const initial = {};
        for (let d = 1; d <= 30; d++) {
            if (d === 8 && activeProviderId === "prov-1") initial[d] = "booked";
            else initial[d] = d % 3 === 0 ? "unavailable" : "available";
        }
        localStorage.setItem(`ds_cal_${activeProviderId}`, JSON.stringify(initial));
        calSlots = JSON.stringify(initial);
    }
    const slotMap = JSON.parse(calSlots);

    // Get bookings
    const orders = db.getOrders().filter(o => o.providerId === activeProviderId && (o.status === 'booked' || o.status === 'delay-risk'));

    for (let day = 1; day <= 30; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell";

        const orderOnDay = orders.find(o => {
            const oDay = parseInt(o.date.split("-")[2]);
            const oMonth = o.date.split("-")[1];
            return oDay === day && oMonth === "11";
        });

        let stateClass = slotMap[day] || "available";
        if (orderOnDay) {
            stateClass = "booked";
        }

        cell.classList.add(stateClass);
        cell.innerHTML = `
            <span class="calendar-cell-num">${day}</span>
            <div class="calendar-cell-status"></div>
        `;

        if (stateClass !== 'booked') {
            cell.addEventListener("click", () => {
                const current = slotMap[day] || "available";
                const next = current === "available" ? "unavailable" : "available";
                slotMap[day] = next;
                localStorage.setItem(`ds_cal_${activeProviderId}`, JSON.stringify(slotMap));
                renderProviderCalendar();
            });
        } else if (orderOnDay) {
            cell.title = `Event: ${orderOnDay.serviceName} - Client: ${orderOnDay.clientName}`;
            cell.addEventListener("click", () => {
                alert(`Ritual Details:\nService: ${orderOnDay.serviceName}\nClient: ${orderOnDay.clientName}\nContact: ${orderOnDay.clientPhone}\nAddress: ${orderOnDay.clientAddress}`);
            });
        }

        grid.appendChild(cell);
    }
}

// Render provider accepted upcoming orders
function renderProviderJobs() {
    const container = document.getElementById("provider-jobs-list");
    container.innerHTML = "";

    const jobs = db.getOrders().filter(o => o.providerId === activeProviderId && o.status !== 'completed' && o.status !== 'cancelled');

    if (jobs.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No upcoming bookings assigned.</p>`;
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement("div");
        jobCard.className = "card";
        jobCard.style.backgroundColor = "var(--bg-primary)";
        jobCard.style.padding = "1rem";
        
        let warningBadge = "";
        if (job.status === 'delay-risk') {
            warningBadge = `<span class="badge badge-danger" style="margin-left:auto;">ALERT: Action Required</span>`;
        }

        jobCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>${job.serviceName}</strong>
                ${warningBadge}
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
                <span>📅 <strong>Scheduled Date:</strong> ${job.date}</span>
                <span>👤 <strong>Client:</strong> ${job.clientName} (${job.clientPhone})</span>
                <span>🏠 <strong>Location:</strong> ${job.clientAddress}</span>
                <span>💰 <strong>Your Pay (Advance):</strong> $${job.advancePaid.toFixed(2)}</span>
            </div>
            <div style="display:flex; gap:10px; margin-top:10px; justify-content:flex-end;">
                ${job.status === 'delay-risk' ? `
                    <button class="btn btn-primary" style="font-size:0.75rem; padding:4px 8px;" onclick="confirmAttendance('${job.id}')">Confirm Attendance</button>
                    <button class="btn btn-danger" style="font-size:0.75rem; padding:4px 8px;" onclick="alert('Operations desk notified. Absence logged.')">Declare Absence</button>
                ` : `
                    <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="completeRitualJob('${job.id}')">Complete Ritual</button>
                `}
            </div>
        `;
        container.appendChild(jobCard);
    });
}

function confirmAttendance(orderId) {
    const orders = db.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    orders[idx].status = "booked";
    db.saveOrders(orders);
    
    const wallet = db.getProviderWallet();
    db.setProviderWallet(wallet + 10.00);

    initProviderDashboard();
    showNotification("✅ Attendance Confirmed!");
}

function completeRitualJob(orderId) {
    const orders = db.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    orders[idx].status = "completed";
    db.saveOrders(orders);

    const total = orders[idx].price;
    const remaining = total * 0.80;
    const commission = remaining * (db.getCommission() / 100);
    const payout = remaining - commission;

    const wallet = db.getProviderWallet();
    db.setProviderWallet(wallet + payout);

    initProviderDashboard();
    showNotification(`🌸 Ritual completed! Paid $${payout.toFixed(2)} transferred to provider wallet.`);
}

function requestPayout() {
    const wallet = db.getProviderWallet();
    if (wallet <= 0) {
        alert("No earnings available to cashout.");
        return;
    }
    db.setProviderWallet(0);
    alert(`Payout transfer of $${wallet.toFixed(2)} initiated to your registered bank account.`);
}
