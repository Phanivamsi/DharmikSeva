// ========================================================
// OPERATIONS & SUPPORT DASHBOARD LOGIC
// ========================================================

function initOpsDashboard() {
    renderOpsOrders();
    renderOpsMuhurtamQueue();
    renderOpsHeatmap();
    renderOpsShoppers();
    
    const slider = document.getElementById("ops-commission-slider");
    slider.value = db.getCommission();
    updateCommissionRate(slider.value);
}

// Render active orders table
function renderOpsOrders() {
    const tableBody = document.getElementById("ops-active-orders-table");
    const orders = db.getOrders();
    tableBody.innerHTML = "";

    let anomalies = 0;

    orders.forEach(o => {
        const row = document.createElement("tr");
        
        let statusBadge = "";
        let actions = "";

        if (o.status === 'delay-risk') {
            anomalies++;
            if (o.providerId === 'pending') {
                statusBadge = `<span class="badge badge-warning">Match Pending</span>`;
                actions = `<button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="assignBackupVendor('${o.id}')">Match Purohit</button>`;
            } else {
                statusBadge = `<span class="badge badge-danger">No Response / Risk</span>`;
                actions = `<button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="assignBackupVendor('${o.id}')">Assign Backup</button>`;
            }
        } else if (o.status === 'completed') {
            statusBadge = `<span class="badge badge-success">Completed</span>`;
            if (o.feedback && o.feedback.rating <= 2) {
                statusBadge += ` <span class="badge badge-danger">Low Rating</span>`;
                actions = `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem; border-color:var(--accent-red); color:var(--accent-red);" onclick="callUnhappyCustomer('${o.id}')">Call Customer</button>`;
            } else {
                actions = `<span style="font-size:0.8rem; color:var(--text-secondary);">Archive</span>`;
            }
        } else if (o.status === 'cancelled') {
            statusBadge = `<span class="badge badge-danger" style="background-color:rgba(255,255,255,0.05); color:var(--text-secondary);">Cancelled</span>`;
            actions = `<span style="font-size:0.8rem; color:var(--text-secondary);">N/A</span>`;
        } else {
            statusBadge = `<span class="badge badge-gold">Confirmed</span>`;
            actions = `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="flagVendorAnomaly('${o.id}')">Trigger Alert</button>`;
        }

        row.innerHTML = `
            <td><strong>${o.id}</strong></td>
            <td>
                <div style="font-weight:600;">${o.clientName}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${o.clientPhone}</div>
            </td>
            <td>${o.serviceName}</td>
            <td>${o.providerName}</td>
            <td>${o.date}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("ops-anomaly-count").textContent = anomalies;
}

// Flag vendor anomaly
function flagVendorAnomaly(orderId) {
    const orders = db.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    
    orders[idx].status = 'delay-risk';
    db.saveOrders(orders);
    renderOpsOrders();
    showNotification(`⚠️ Alert triggered for Order ${orderId}. Vendor attendance check required.`);
}

// Re-route and assign backup vendor (or manual match for pending orders)
function assignBackupVendor(orderId) {
    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const currentOrder = orders[orderIndex];
    const providers = db.getProviders();

    // Find alternative Purohit who has this date available in their calendar and is approved
    const purohits = providers.filter(p => p.type === 'purohit' && p.id !== currentOrder.providerId && p.status === 'approved');
    let matchedPurohit = null;

    for (let p of purohits) {
        const calSlotsStr = localStorage.getItem(`ds_cal_${p.id}`);
        if (calSlotsStr) {
            const slotMap = JSON.parse(calSlotsStr);
            const dayNum = parseInt(currentOrder.date.split("-")[2]); // Nov day

            if (slotMap[dayNum] === 'available') {
                matchedPurohit = p;
                
                // Reserve calendar slot
                slotMap[dayNum] = 'booked';
                localStorage.setItem(`ds_cal_${p.id}`, JSON.stringify(slotMap));
                break;
            }
        }
    }

    if (!matchedPurohit) {
        alert("Ops Failure: No available Purohits found for date " + currentOrder.date + ".");
        return;
    }

    alert(`Standby Match Resolved:\nAssigning Order ${orderId} to ${matchedPurohit.name}.`);

    orders[orderIndex].providerId = matchedPurohit.id;
    orders[orderIndex].providerName = matchedPurohit.name;
    orders[orderIndex].status = "booked"; // Confirmed

    db.saveOrders(orders);
    renderOpsOrders();
    showNotification(`✅ Booking assigned! ${matchedPurohit.name} allocated to Order ${orderId}.`);
}

// Call back customer
function callUnhappyCustomer(orderId) {
    const orders = db.getOrders();
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    alert(`Calling client ${o.clientName} (${o.clientPhone})...\n\nScript Guidelines:\n1. Apologize for vendor inconvenience: "${o.feedback.comment}".\n2. Offer 50% advance refund ($${(o.advancePaid / 2).toFixed(2)}) as apology.\n3. Log notes to developer feedback.`);
    
    alert("Call completed. Customer sentiment flag resolved.");
}

// Render Muhurtam Requests Queue
function renderOpsMuhurtamQueue() {
    const container = document.getElementById("ops-muhurtam-requests-queue");
    const consultations = db.getConsultations().filter(c => c.status === 'pending');
    container.innerHTML = "";

    if (consultations.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding: 1.5rem; font-size:0.85rem;">No pending Muhurtam requests in queue.</p>`;
        return;
    }

    consultations.forEach(c => {
        const item = document.createElement("div");
        item.className = "card";
        item.style.backgroundColor = "var(--bg-primary)";
        item.style.padding = "1rem";
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                    <strong>${c.clientName}</strong>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">Zodiac: ${c.zodiac} | Style: ${c.style}</div>
                </div>
                <span class="badge badge-gold" style="font-size:0.7rem;">${c.budget}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">
                <strong>Dates Expected:</strong> ${c.dates}<br>
                <strong>Notes:</strong> "${c.rashiPhalam}"
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.75rem; color:var(--accent-gold);">📞 ${c.clientPhone}</span>
                <button class="btn btn-primary" style="font-size:0.75rem; padding:4px 8px;" onclick="openAssistedBooking('${c.id}')">Fix Muhurtam</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Open Assisted Booking Modal
function openAssistedBooking(reqId) {
    const consultations = db.getConsultations();
    const req = consultations.find(c => c.id === reqId);
    if (!req) return;

    document.getElementById("assist-request-id").value = reqId;
    document.getElementById("assist-client-name").value = req.clientName;
    document.getElementById("assist-client-phone").value = req.clientPhone;
    document.getElementById("assist-client-style").value = req.style;

    const selectDate = document.getElementById("assist-booking-date");
    selectDate.innerHTML = `
        <option value="2026-11-14">Nov 14, 2026 (Auspicious Slot 1)</option>
        <option value="2026-11-16">Nov 16, 2026 (Auspicious Slot 2)</option>
    `;

    // Filter available approved Purohits
    const providers = db.getProviders().filter(p => p.type === 'purohit' && p.status === 'approved');
    const selectPurohit = document.getElementById("assist-purohit-select");
    selectPurohit.innerHTML = "";

    providers.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.name} (${p.style})`;
        selectPurohit.appendChild(option);
    });

    openModal("assisted-booking-modal");
}

// Execute assisted booking
function executeAssistedBooking(e) {
    e.preventDefault();

    const reqId = document.getElementById("assist-request-id").value;
    const clientName = document.getElementById("assist-client-name").value;
    const clientPhone = document.getElementById("assist-client-phone").value;
    const date = document.getElementById("assist-booking-date").value;
    const provId = document.getElementById("assist-purohit-select").value;

    const providers = db.getProviders();
    const p = providers.find(item => item.id === provId);
    if (!p) return;

    // Perform customer wallet debit (simulation)
    const walletBalance = db.getCustomerWallet();
    const totalCost = 250.00;
    const advanceCost = 50.00;

    if (walletBalance >= advanceCost) {
        db.setCustomerWallet(walletBalance - advanceCost);
    }

    // Reserve calendar slot
    const calSlotsStr = localStorage.getItem(`ds_cal_${p.id}`);
    if (calSlotsStr) {
        const slotMap = JSON.parse(calSlotsStr);
        const dayNum = parseInt(date.split("-")[2]);
        slotMap[dayNum] = 'booked';
        localStorage.setItem(`ds_cal_${p.id}`, JSON.stringify(slotMap));
    }

    // Add new order
    const orders = db.getOrders();
    orders.unshift({
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: clientName,
        clientPhone: clientPhone,
        clientAddress: "Assisted Call Booking Address, NJ",
        serviceName: "Satyanarayana Vratam Homa (Fixed Muhurtam)",
        providerId: p.id,
        providerName: p.name,
        date: date,
        price: totalCost,
        advancePaid: advanceCost,
        status: "booked",
        feedback: null
    });
    db.saveOrders(orders);

    // Resolve consultation request
    const consultations = db.getConsultations();
    const reqIndex = consultations.findIndex(c => c.id === reqId);
    if (reqIndex !== -1) {
        consultations[reqIndex].status = "resolved";
        db.saveConsultations(consultations);
    }

    closeModal("assisted-booking-modal");
    initOpsDashboard();
    showNotification(`✅ Muhurtam booked successfully on behalf of ${clientName}. Purohit ${p.name} assigned.`);
}

// Render dynamic heatmap resource grid
function renderOpsHeatmap() {
    const container = document.getElementById("ops-heatmap-container");
    container.innerHTML = "";

    const days = [
        { day: 2, density: "med", bookings: 4 },
        { day: 5, density: "high", bookings: 9 },
        { day: 8, density: "med", bookings: 5 },
        { day: 12, density: "low", bookings: 1 },
        { day: 15, density: "low", bookings: 2 },
        { day: 18, density: "med", bookings: 6 },
        { day: 20, density: "high", bookings: 12 },
        { day: 22, density: "low", bookings: 0 }
    ];

    for (let day = 1; day <= 28; day++) {
        const block = document.createElement("div");
        block.className = "heatmap-block";

        const specialDay = days.find(d => d.day === day);
        let densityClass = "density-low";
        let label = "0";

        if (specialDay) {
            densityClass = `density-${specialDay.density}`;
            label = specialDay.bookings;
        }

        block.classList.add(densityClass);
        block.innerHTML = `
            <span style="font-size:0.7rem; color:var(--text-secondary);">Nov ${day}</span>
            <span style="font-size:1.15rem;">${label}</span>
        `;
        block.title = `${label} active ritual bookings scheduled on this date.`;
        container.appendChild(block);
    }
}

// Update admin commission rate slider
function updateCommissionRate(val) {
    db.setCommission(val);
    
    const badge = document.getElementById("ops-pricing-badge");
    if (val < 10) {
        badge.textContent = "Low Demand Promo";
        badge.className = "badge badge-success";
    } else if (val > 20) {
        badge.textContent = "Peak Surges Active";
        badge.className = "badge badge-danger";
    } else {
        badge.textContent = "Standard Demand";
        badge.className = "badge badge-gold";
    }
}

// Render cart shoppers follow ups
function renderOpsShoppers() {
    const container = document.getElementById("ops-window-shoppers");
    container.innerHTML = "";

    const shoppers = db.getShoppers();

    shoppers.forEach(s => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.backgroundColor = "var(--bg-primary)";
        card.style.padding = "10px";
        card.style.border = "1px solid var(--border-color)";
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h5 style="font-family:var(--font-body); font-weight:600;">${s.name}</h5>
                    <span style="font-size:0.7rem; color:var(--text-secondary);">${s.lastActivity}</span>
                </div>
                <button class="btn btn-secondary" style="font-size:0.7rem; padding:4px 8px;" onclick="simulateShopperAssistance('${s.name}')">Assist</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function simulateShopperAssistance(name) {
    alert(`Initiating follow-up call/SMS to window-shopper ${name}...\n\nPromotional Offer:\n"Namaste! We noticed you left ritual packages in your cart. Use code MANDIR10 at checkout today to get 10% off your booking advance."`);
    showNotification(`✉️ Promo code sent to cart shopper ${name}!`);
}
