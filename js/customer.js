// ========================================================
// CUSTOMER PORTAL LOGIC
// ========================================================

let cart = [];
let activeCatalogCategory = "purohit"; // default

// Toggle Login vs Register panes
function toggleAuthPane(role, pane) {
    if (role === 'customer') {
        document.querySelectorAll("#customer-auth-section .auth-pane").forEach(p => p.classList.remove("active"));
        document.getElementById("cust-auth-login-btn").classList.remove("active");
        document.getElementById("cust-auth-register-btn").classList.remove("active");
        
        document.getElementById(`cust-${pane}-form`).classList.add("active");
        document.getElementById(`cust-auth-${pane}-btn`).classList.add("active");
    } else if (role === 'provider') {
        document.querySelectorAll("#provider-auth-section .auth-pane").forEach(p => p.classList.remove("active"));
        document.getElementById("prov-auth-login-btn").classList.remove("active");
        document.getElementById("prov-auth-register-btn").classList.remove("active");
        
        document.getElementById(`prov-${pane}-form`).classList.add("active");
        document.getElementById(`prov-auth-${pane}-btn`).classList.add("active");
    }
}

// Devotee Authentication
function handleCustomerLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("cust-login-username").value.trim().toLowerCase();
    const passVal = document.getElementById("cust-login-pass").value;

    const users = db.getUsersAuth();
    const matched = users.find(u => u.username === userVal && u.password === passVal);

    if (matched) {
        sessionStorage.setItem("ds_current_user", JSON.stringify(matched));
        document.getElementById("cust-login-form").reset();
        checkCustomerAuthSession();
        showNotification(`🙏 Welcome back, ${matched.name}!`);
    } else {
        alert("Invalid username or password. (Try 'sandhya' with password '123')");
    }
}

function handleCustomerRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById("cust-reg-name").value.trim();
    const userVal = document.getElementById("cust-reg-username").value.trim().toLowerCase();
    const email = document.getElementById("cust-reg-email").value.trim();
    const phone = document.getElementById("cust-reg-phone").value.trim();
    const address = document.getElementById("cust-reg-address").value.trim();
    const pass = document.getElementById("cust-reg-pass").value;

    const users = db.getUsersAuth();
    if (users.find(u => u.username === userVal)) {
        alert("Username already exists. Please choose another one.");
        return;
    }

    const newUser = { username: userVal, password: pass, name, email, phone, address };
    users.push(newUser);
    db.saveUsersAuth(users);

    sessionStorage.setItem("ds_current_user", JSON.stringify(newUser));
    document.getElementById("cust-register-form").reset();
    checkCustomerAuthSession();
    showNotification(`✨ Devotee registration successful!`);
}

function handleCustomerLogout() {
    sessionStorage.removeItem("ds_current_user");
    cart = [];
    updateCartDrawer();
    checkCustomerAuthSession();
}

// Tab Navigation inside Customer Portal
function switchCustomerTab(btn, tabId, category = "") {
    // Deactivate all customer tab links
    document.querySelectorAll("#customer-view .tab-link").forEach(link => {
        link.classList.remove("active");
    });
    
    // Hide all customer sub-views
    document.querySelectorAll(".customer-sub-view").forEach(subView => {
        subView.style.display = "none";
        subView.classList.remove("active");
    });

    btn.classList.add("active");

    if (tabId === 'catalog') {
        const targetSubView = document.getElementById("cust-tab-catalog");
        targetSubView.style.display = "block";
        targetSubView.classList.add("active");
        
        activeCatalogCategory = category;
        renderServicesGrid();
    } else {
        const targetSubView = document.getElementById(`cust-tab-${tabId}`);
        targetSubView.style.display = "block";
        targetSubView.classList.add("active");
        
        if (tabId === 'profile') {
            renderCustomerOrders();
        }
    }
}

// Render Services Grid Catalog
function renderServicesGrid(filterText = "") {
    const grid = document.getElementById("services-grid");
    grid.innerHTML = "";

    // IF PUROHIT: Display Puja Products (which will auto-assign approved Purohits later)
    if (activeCatalogCategory === 'purohit') {
        const filteredPujas = PUJA_PRODUCTS.filter(p => {
            if (!filterText) return true;
            return p.name.toLowerCase().includes(filterText.toLowerCase()) || 
                   p.description.toLowerCase().includes(filterText.toLowerCase());
        });

        if (filteredPujas.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-secondary); padding: 3rem;">No rituals found.</div>`;
            return;
        }

        filteredPujas.forEach(p => {
            const card = document.createElement("div");
            card.className = "card service-card";
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <span class="badge badge-gold">Ritual Puja Package</span>
                    <span style="color: var(--accent-gold); font-weight:700;">Verified Shastri</span>
                </div>
                <div class="service-card-body">
                    <h3 style="font-size: 1.15rem; margin: 8px 0 4px;">${p.name}</h3>
                    <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">${p.description}</p>
                    <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:4px; margin-top:auto;">
                        <span><strong>Standard Duration:</strong> ${p.duration} Hours</span>
                        <span><strong>Traditions:</strong> ${p.style}</span>
                        <span><strong>Languages:</strong> ${p.languages}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: auto;">
                    <div>
                        <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Starting Price</span>
                        <span class="service-price">$${p.basePrice}</span>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showPujaDetails('${p.id}')" style="font-size:0.8rem; padding: 6px 12px;">Configure & Book</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } else {
        // FOR OTHER CATEGORIES: Render approved providers directly (Exclude pending or suspended)
        const providers = db.getProviders().filter(p => p.type === activeCatalogCategory && p.status === 'approved');
        const filtered = providers.filter(p => {
            if (!filterText) return true;
            return p.name.toLowerCase().includes(filterText.toLowerCase()) || 
                   p.bio.toLowerCase().includes(filterText.toLowerCase());
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-secondary); padding: 3rem;">No active verified providers found.</div>`;
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "card service-card";
            
            let specLabel = "";
            let startingPrice = p.hourlyRate;
            let badgeClass = "badge-success";
            
            if (p.type === 'dancer') {
                specLabel = `Art Form: ${p.artForm}`;
                badgeClass = "badge-success";
            } else if (p.type === 'singer') {
                specLabel = `Vocal Form: ${p.artForm}`;
                badgeClass = "badge-success";
            } else if (p.type === 'musician') {
                specLabel = `Instrument: ${p.artForm}`;
                badgeClass = "badge-warning";
            } else if (p.type === 'cow') {
                specLabel = `Breed: ${p.breed}`;
                badgeClass = "badge-gold";
            } else if (p.type === 'food') {
                specLabel = `FSSAI: ${p.fssai}`;
                badgeClass = "badge-danger";
                startingPrice = p.items[0].price;
            }

            const priceDisplay = p.type === 'food' ? `$${startingPrice}/kg` : `$${startingPrice}/hr`;

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <span class="badge ${badgeClass}">${p.type}</span>
                    <span style="color: var(--accent-gold); font-weight:700;">⭐ ${p.rating}</span>
                </div>
                <div class="service-card-body">
                    <h3 style="font-size: 1.15rem; margin: 8px 0 4px;">${p.name}</h3>
                    <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">${p.bio}</p>
                    <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:4px; margin-top:auto;">
                        <span><strong>Exp:</strong> ${p.experience} Years</span>
                        <span><strong>Details:</strong> ${specLabel}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: auto;">
                    <span class="service-price">${priceDisplay}</span>
                    <button class="btn btn-primary btn-sm" onclick="showProviderDetails('${p.id}')" style="font-size:0.8rem; padding: 6px 12px;">Book Service</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Filter services search
function filterServices() {
    const query = document.getElementById("service-search").value;
    renderServicesGrid(query);
}

// Show Puja Configuration Modal (Purohit service booking with auto-assign disclaimer)
function showPujaDetails(pujaId) {
    const puja = PUJA_PRODUCTS.find(p => p.id === pujaId);
    if (!puja) return;

    const modalContent = document.getElementById("modal-provider-content");
    modalContent.innerHTML = `
        <div style="display:flex; gap:1.5rem; align-items:center; margin-bottom:1.5rem;">
            <div style="font-size: 3rem; background-color: var(--bg-tertiary); padding: 10px; border-radius: 12px; border: 1px solid var(--border-color);">${puja.icon}</div>
            <div>
                <h2>${puja.name}</h2>
                <div style="color:var(--accent-gold); font-weight:700; font-size:0.95rem;">Verified Vedic Ritual Service</div>
            </div>
        </div>

        <div class="grid-2" style="align-items: flex-start; margin-bottom:1.5rem;">
            <div>
                <h3>Ritual Details</h3>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                    <p>${puja.description}</p>
                    <p><strong>Standard duration:</strong> ${puja.duration} Hours</p>
                    <p><strong>Languages Supported:</strong> ${puja.languages}</p>
                    
                    <div style="margin-top:1rem; padding:12px; border-radius:8px; background-color:rgba(229, 91, 19, 0.05); border:1px solid rgba(229, 91, 19, 0.2); display:flex; flex-direction:column; gap:6px;">
                        <span style="color:var(--accent-gold); font-weight:700;">✨ Sacred Auto-Assignment Rule</span>
                        <p style="font-size:0.75rem; line-height:1.4;">To preserve authenticity and guarantee matching schedules, a certified Vedic Purohit matching your preferred tradition style will be automatically allocated based on their calendar availability for your date.</p>
                    </div>
                </div>
            </div>

            <div class="card" style="background-color: var(--bg-primary);">
                <h3 style="margin-bottom:12px;">Configure Puja</h3>
                <div class="form-group">
                    <label class="form-label" for="booking-style">Select Tradition Style</label>
                    <select id="booking-style" class="form-select">
                        <option value="Vedic Smarta (South)">Vedic Smarta (South Indian Style)</option>
                        <option value="Vedic (North Style)">Vedic (North Indian Style)</option>
                        <option value="Bengali Sampradaya">Bengali Sampradaya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="booking-date">Date of Ceremony</label>
                    <input type="date" id="booking-date" class="form-input" value="2026-11-10">
                </div>
                <div class="form-group">
                    <label class="form-label" for="booking-langs">Preferred Language</label>
                    <select id="booking-langs" class="form-select">
                        <option value="Sanskrit">Sanskrit (Universal)</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Tamil">Tamil</option>
                    </select>
                </div>
                <input type="hidden" id="booking-duration" value="${puja.duration}">

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; border-top:1px solid var(--border-color); padding-top:10px;">
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary);">Advance Payable (20%)</span>
                        <h3 style="color:var(--accent-gold); font-family:var(--font-heading);">$${(puja.basePrice * 0.2).toFixed(2)}</h3>
                    </div>
                    <button class="btn btn-primary" onclick="addPujaToCart('${puja.id}')">Add Puja</button>
                </div>
            </div>
        </div>
    `;

    openModal("provider-detail-modal");
}

// Add configured Puja to cart
function addPujaToCart(pujaId) {
    const puja = PUJA_PRODUCTS.find(p => p.id === pujaId);
    if (!puja) return;

    const date = document.getElementById("booking-date").value || "2026-11-10";
    const style = document.getElementById("booking-style").value;
    const lang = document.getElementById("booking-langs").value;

    const price = puja.basePrice;
    const advancePaid = price * 0.2;

    cart.push({
        id: `cart-${Date.now()}`,
        type: "purohit",
        serviceName: puja.name,
        qty: puja.duration,
        unit: 'hrs',
        price: price,
        advancePaid: advancePaid,
        date: date,
        style: style,
        language: lang
    });

    closeModal("provider-detail-modal");
    updateCartDrawer();
    toggleCartDrawer(true);
}

// Show standard provider details (dancers, singers, musicians, cows, food)
function showProviderDetails(id) {
    const providers = db.getProviders();
    const p = providers.find(item => item.id === id);
    if (!p) return;

    const modalContent = document.getElementById("modal-provider-content");
    
    let specFields = "";
    let bookingFields = "";
    
    if (p.type === 'dancer' || p.type === 'singer' || p.type === 'musician') {
        specFields = `
            <p><strong>Art Classification:</strong> ${p.artForm}</p>
            <p><strong>Languages Spoken:</strong> ${p.languages.join(", ")}</p>
            <p style="margin-top:10px;"><strong>Audio/Video Snippet:</strong></p>
            <div style="background-color:var(--bg-tertiary); padding:10px; border-radius:8px; display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-top:6px; border:1px solid var(--border-color);">
                <span>▶ Classical Performance Demo.mp3</span>
                <span style="color:var(--accent-gold); margin-left:auto;">01:30</span>
            </div>
        `;
        bookingFields = `
            <div class="form-group">
                <label class="form-label">Booking Recital Option</label>
                <select id="booking-item-select" class="form-select">
                    <option value="${p.artForm} Performance">${p.artForm} Auspicious Recital</option>
                    <option value="Concert">Festival Concert Session</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Duration (Hours)</label>
                <input type="number" id="booking-duration" class="form-input" min="1" max="6" value="2">
            </div>
        `;
    } else if (p.type === 'cow') {
        specFields = `
            <p><strong>Breed Type:</strong> ${p.breed}</p>
            <p><strong>Available Cows:</strong> ${p.cowsAvailable}</p>
            <p style="margin-top:5px;"><strong>Sanitary Standards:</strong> Verified fully clean, decorated for rituals.</p>
        `;
        bookingFields = `
            <input type="hidden" id="booking-item-select" value="${p.breed} Ritual Hire">
            <div class="form-group">
                <label class="form-label">Duration (Hours)</label>
                <input type="number" id="booking-duration" class="form-input" min="1" max="12" value="2">
            </div>
        `;
    } else if (p.type === 'food') {
        specFields = `
            <p><strong>Ashram Kitchen Team Size:</strong> ${p.teamSize} Cooks</p>
            <p><strong>FSSAI License:</strong> <span class="badge badge-success" style="font-size:0.75rem;">FSSAI ${p.fssai}</span></p>
            <p><strong>Menu & Rates (per kg):</strong></p>
            <ul style="margin-left:20px; font-size:0.9rem; margin-top:8px;">
                ${p.items.map(item => `<li>${item.name} - $${item.price} / kg</li>`).join("")}
            </ul>
        `;
        bookingFields = `
            <div class="form-group">
                <label class="form-label">Select Prasadam Item</label>
                <select id="booking-item-select" class="form-select">
                    ${p.items.map(item => `<option value="${item.name}">${item.name}</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Quantity (KG)</label>
                <input type="number" id="booking-duration" class="form-input" min="1" max="100" value="5">
            </div>
        `;
    }

    const reviews = db.getOrders().filter(o => o.providerId === id && o.feedback);

    modalContent.innerHTML = `
        <div style="display:flex; gap:1.5rem; align-items:center; margin-bottom:1.5rem;">
            <div style="font-size: 3rem; background-color: var(--bg-tertiary); padding: 10px; border-radius: 12px; border: 1px solid var(--border-color);">${p.icon}</div>
            <div>
                <h2>${p.name}</h2>
                <div style="color:var(--accent-gold); font-weight:700; font-size:0.95rem;">⭐ ${p.rating} (${p.reviewsCount} reviews) | ${p.ordersServed} orders served</div>
            </div>
        </div>
        
        <div class="grid-2" style="align-items: flex-start; margin-bottom:1.5rem;">
            <div>
                <h3>Specs & Description</h3>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                    <p>${p.bio}</p>
                    <p><strong>Experience:</strong> ${p.experience} Years</p>
                    ${specFields}
                </div>
            </div>
            
            <div class="card" style="background-color: var(--bg-primary);">
                <h3 style="margin-bottom:12px;">Configure Booking</h3>
                ${bookingFields}
                
                <div class="form-group">
                    <label class="form-label">Date of Event</label>
                    <input type="date" id="booking-date" class="form-input" value="2026-11-10">
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; border-top:1px solid var(--border-color); padding-top:10px;">
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary);">Advance Payable (20%)</span>
                        <h3 id="booking-cost-preview" style="color:var(--accent-gold); font-family:var(--font-heading);">$0.00</h3>
                    </div>
                    <button class="btn btn-primary" onclick="addProviderToCart('${p.id}')">Add to Cart</button>
                </div>
            </div>
        </div>

        <div style="margin-top:2rem; border-top:1px solid var(--border-color); padding-top:1.5rem;">
            <h3 style="margin-bottom:1rem;">Verified Reviews</h3>
            ${reviews.length === 0 ? 
                `<p style="color:var(--text-secondary); font-size:0.85rem;">No reviews submitted yet for this provider.</p>` : 
                reviews.map(rev => `
                    <div style="background-color:var(--bg-tertiary); padding:1rem; border-radius:8px; border:1px solid var(--border-color); margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <strong>${rev.clientName}</strong>
                            <span style="color:var(--accent-gold);">⭐ ${rev.feedback.rating}/5</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--text-secondary); font-style:italic;">"${rev.feedback.comment}"</p>
                    </div>
                `).join("")
            }
        </div>
    `;

    openModal("provider-detail-modal");

    // Cost Calculator
    const calculateCost = () => {
        const itemSelect = document.getElementById("booking-item-select");
        const durationInput = document.getElementById("booking-duration");
        if (!durationInput) return;

        let multiplier = parseInt(durationInput.value) || 1;
        let rate = p.hourlyRate;
        if (p.type === 'food') {
            const selectedItem = p.items.find(i => i.name === itemSelect.value);
            rate = selectedItem ? selectedItem.price : p.items[0].price;
        }

        const totalCost = rate * multiplier;
        const advanceCost = totalCost * 0.20;
        document.getElementById("booking-cost-preview").textContent = `$${advanceCost.toFixed(2)}`;
    };

    const dInput = document.getElementById("booking-duration");
    const iSelect = document.getElementById("booking-item-select");
    if (dInput) dInput.addEventListener("input", calculateCost);
    if (iSelect) iSelect.addEventListener("change", calculateCost);
    calculateCost();
}

// Add standard provider item to cart
function addProviderToCart(providerId) {
    const providers = db.getProviders();
    const p = providers.find(item => item.id === providerId);
    if (!p) return;

    const bookingItem = document.getElementById("booking-item-select") ? document.getElementById("booking-item-select").value : p.breed + " Ritual Hire";
    const qty = parseInt(document.getElementById("booking-duration").value) || 1;
    const date = document.getElementById("booking-date").value || "2026-11-10";

    let rate = p.hourlyRate;
    if (p.type === 'food') {
        const selectedItem = p.items.find(i => i.name === bookingItem);
        rate = selectedItem ? selectedItem.price : p.items[0].price;
    }

    const price = rate * qty;
    const advancePaid = price * 0.20;

    cart.push({
        id: `cart-${Date.now()}`,
        type: p.type,
        providerId: p.id,
        providerName: p.name,
        serviceName: bookingItem,
        qty: qty,
        unit: p.type === 'food' ? 'kg' : 'hrs',
        price: price,
        advancePaid: advancePaid,
        date: date
    });

    closeModal("provider-detail-modal");
    updateCartDrawer();
    toggleCartDrawer(true);
}

// Toggle drawer
function toggleCartDrawer(show) {
    const drawer = document.getElementById("cart-drawer");
    if (show && cart.length > 0) {
        drawer.classList.add("open");
    } else {
        drawer.classList.remove("open");
    }
}

// Update Cart Drawer Items List
function updateCartDrawer() {
    const container = document.getElementById("cart-items-container");
    const countEl = document.getElementById("cart-count");
    const advanceEl = document.getElementById("cart-advance-total");
    
    countEl.textContent = cart.length;
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">No services selected yet</p>`;
        advanceEl.textContent = "$0.00";
        toggleCartDrawer(false);
        return;
    }

    let advanceTotal = 0;
    cart.forEach(item => {
        advanceTotal += item.advancePaid;
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.innerHTML = `
            <div>
                <div class="cart-item-name">${item.serviceName}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${item.providerName || "Vedic Purohit auto-assign"} (${item.qty} ${item.unit})</div>
                <div style="font-size:0.7rem; color:var(--accent-gold); font-weight:600;">Date: ${item.date}</div>
            </div>
            <div style="text-align:right;">
                <div class="cart-item-price">$${item.advancePaid.toFixed(2)}</div>
                <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:0.75rem;">Remove</button>
            </div>
        `;
        container.appendChild(itemRow);
    });

    advanceEl.textContent = `$${advanceTotal.toFixed(2)}`;
}

// Remove from cart
function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.id !== cartItemId);
    updateCartDrawer();
}

// Execute Checkout with Puja Auto-Assignment (Must be approved)
function proceedToCheckout() {
    const advanceTotal = cart.reduce((acc, curr) => acc + curr.advancePaid, 0);
    const balance = db.getCustomerWallet();

    if (balance < advanceTotal) {
        alert("Insufficient wallet balance. Please add funds in 'My Wallet & Orders' tab first.");
        return;
    }

    // Debit customer wallet
    db.setCustomerWallet(balance - advanceTotal);

    // Save orders in storage
    const currentOrders = db.getOrders();
    const providers = db.getProviders();

    const loggedUser = JSON.parse(sessionStorage.getItem("ds_current_user"));
    const clientName = loggedUser ? loggedUser.name : "Sandhya Sharma";
    const clientPhone = loggedUser ? loggedUser.phone : "+1 (555) 342-9830";
    const clientAddress = loggedUser ? loggedUser.address : "108 Lotus Lane, Mandir District, NJ";

    cart.forEach(item => {
        let assignedId = item.providerId || "";
        let assignedName = item.providerName || "";

        // If it is a Purohit service, do Auto-Assignment based on calendar slots!
        if (item.type === 'purohit') {
            // Filter *only* approved Purohits!
            const purohits = providers.filter(p => p.type === 'purohit' && p.status === 'approved');
            let matchedPurohit = null;

            // Search for available Purohit
            for (let p of purohits) {
                const calSlotsStr = localStorage.getItem(`ds_cal_${p.id}`);
                if (calSlotsStr) {
                    const slotMap = JSON.parse(calSlotsStr);
                    const dayNum = parseInt(item.date.split("-")[2]); // Day number of Nov 2026

                    if (slotMap[dayNum] === 'available') {
                        matchedPurohit = p;
                        
                        // Reserve calendar slot to "booked"
                        slotMap[dayNum] = 'booked';
                        localStorage.setItem(`ds_cal_${p.id}`, JSON.stringify(slotMap));
                        break;
                    }
                }
            }

            if (matchedPurohit) {
                assignedId = matchedPurohit.id;
                assignedName = matchedPurohit.name;
            } else {
                // If all Purohits are busy or none approved, queue for Ops desk manual allocation
                assignedId = "pending";
                assignedName = "System Match Pending";
            }
        } else {
            // For other providers (dancer, singer, musician, cow), reserve their calendar slot
            const calSlotsStr = localStorage.getItem(`ds_cal_${item.providerId}`);
            if (calSlotsStr) {
                const slotMap = JSON.parse(calSlotsStr);
                const dayNum = parseInt(item.date.split("-")[2]);
                slotMap[dayNum] = 'booked';
                localStorage.setItem(`ds_cal_${item.providerId}`, JSON.stringify(slotMap));
            }
        }

        currentOrders.unshift({
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            clientName: clientName,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            serviceName: item.serviceName,
            providerId: assignedId,
            providerName: assignedName,
            date: item.date,
            price: item.price,
            advancePaid: item.advancePaid,
            status: assignedId === 'pending' ? 'delay-risk' : 'booked', // delay risk represents alert state
            feedback: null
        });
    });

    db.saveOrders(currentOrders);
    cart = [];
    updateCartDrawer();
    toggleCartDrawer(false);

    showNotification("✨ Order placed successfully! Verified Purohit matches have been calculated.");
    switchCustomerTab(document.querySelector(".tab-link:nth-child(8)"), 'profile');
}

// Add funds to wallet
function addWalletFunds() {
    const amountStr = prompt("Enter amount to top-up Dharma Wallet ($):", "200");
    if (!amountStr) return;
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }
    const current = db.getCustomerWallet();
    db.setCustomerWallet(current + amt);
    showNotification(`Successfully topped up $${amt.toFixed(2)} to Dharma Wallet!`);
}

// Submit Astro Consultation Request
function submitMuhurtamForm(e) {
    e.preventDefault();

    const name = document.getElementById("muhurtam-name").value;
    const phone = document.getElementById("muhurtam-phone").value;
    const zodiac = document.getElementById("muhurtam-zodiac").value;
    const style = document.getElementById("muhurtam-style").value;
    const rashiPhalam = document.getElementById("muhurtam-rashi-phalam").value;
    const dates = document.getElementById("muhurtam-dates").value;
    const budget = document.getElementById("muhurtam-budget").value;

    const currentReqs = db.getConsultations();
    currentReqs.push({
        id: `CON-${Math.floor(400 + Math.random() * 500)}`,
        clientName: name,
        clientPhone: phone,
        zodiac: zodiac,
        style: style,
        dates: dates,
        rashiPhalam: rashiPhalam,
        budget: budget,
        status: "pending"
    });

    db.saveConsultations(currentReqs);
    document.getElementById("muhurtam-form").reset();

    alert("Pranam! Your Muhurtam request details have been forwarded to the Astro scheduling desk. Support team will contact you shortly to join the Shastri live matching call.");
    showNotification("📅 Muhurtam consultation request submitted to Ops Console!");
}

// Render Client Bookings
function renderCustomerOrders(statusFilter = 'all') {
    const listContainer = document.getElementById("customer-orders-list");
    const orders = db.getOrders();
    listContainer.innerHTML = "";

    const user = JSON.parse(sessionStorage.getItem("ds_current_user"));
    const cName = user ? user.name : "Sandhya Sharma";
    const clientOrders = orders.filter(o => o.clientName === cName);

    const filtered = clientOrders.filter(o => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'upcoming') return o.status === 'booked' || o.status === 'delay-risk';
        return o.status === statusFilter;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; padding: 2rem; color:var(--text-secondary);">No orders found in this category.</p>`;
        return;
    }

    filtered.forEach(o => {
        const orderCard = document.createElement("div");
        orderCard.className = "card";
        orderCard.style.borderLeft = o.status === 'completed' ? '4px solid var(--success)' : o.status === 'cancelled' ? '4px solid var(--error)' : '4px solid var(--accent-gold)';

        let badgeStr = "";
        let feedbackForm = "";

        if (o.status === 'completed') {
            badgeStr = `<span class="badge badge-success">Completed</span>`;
            if (o.feedback) {
                badgeStr += ` <span class="badge badge-gold">⭐ ${o.feedback.rating}/5 Rated</span>`;
                feedbackForm = `<div style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px; font-style:italic;">Your Feedback: "${o.feedback.comment}"</div>`;
            } else {
                feedbackForm = `
                    <div style="margin-top:12px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        <h5 style="margin-bottom:6px; font-family:var(--font-body);">Rate Your Ritual Experience</h5>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <select id="rating-val-${o.id}" class="form-select" style="width:70px; padding:3px 6px; font-size:0.75rem;">
                                <option value="5">5 ⭐</option>
                                <option value="4">4 ⭐</option>
                                <option value="3">3 ⭐</option>
                                <option value="2">2 ⭐</option>
                                <option value="1">1 ⭐</option>
                            </select>
                            <input type="text" id="rating-comm-${o.id}" class="form-input" style="flex-grow:1; padding:3px 6px; font-size:0.75rem;" placeholder="Leave comment...">
                            <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="submitOrderFeedback('${o.id}')">Submit</button>
                        </div>
                    </div>
                `;
            }
        } else if (o.status === 'cancelled') {
            badgeStr = `<span class="badge badge-danger">Cancelled</span>`;
        } else if (o.status === 'delay-risk') {
            if (o.providerId === 'pending') {
                badgeStr = `<span class="badge badge-warning">Awaiting Auto-Assign Match</span>`;
            } else {
                badgeStr = `<span class="badge badge-warning">Delayed / Action Required</span>`;
            }
        } else {
            badgeStr = `<span class="badge badge-gold">Confirmed / Booked</span>`;
        }

        orderCard.innerHTML = `
            <div style="display:flex; justify-content:between; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
                <div>
                    <strong style="color:var(--accent-gold); font-size:1.05rem;">${o.serviceName}</strong>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">Order ID: ${o.id}</div>
                </div>
                <div>${badgeStr}</div>
            </div>
            <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:4px; color:var(--text-secondary);">
                <span>👤 <strong>Provider Assigned:</strong> ${o.providerName}</span>
                <span>📅 <strong>Scheduled Date:</strong> ${o.date}</span>
                <span>🏠 <strong>Location:</strong> ${o.clientAddress}</span>
                <span>💰 <strong>Total Charges:</strong> $${o.price.toFixed(2)} | <strong>Paid Advance (20%):</strong> $${o.advancePaid.toFixed(2)}</span>
            </div>
            ${feedbackForm}
        `;
        listContainer.appendChild(orderCard);
    });
}

// Filter bookings
function filterCustomerOrders(btn, filterType) {
    document.querySelectorAll(".order-tab-btn").forEach(b => {
        b.classList.remove("active");
    });
    btn.classList.add("active");
    renderCustomerOrders(filterType);
}

// Feedback submission
function submitOrderFeedback(orderId) {
    const rating = parseInt(document.getElementById(`rating-val-${orderId}`).value);
    const comment = document.getElementById(`rating-comm-${orderId}`).value || "No comments";

    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    orders[orderIndex].feedback = { rating, comment };
    db.saveOrders(orders);
    renderCustomerOrders('completed');
    showNotification("✨ Review submitted. Thank you for your feedback!");

    // Update provider average rating
    const providerId = orders[orderIndex].providerId;
    if (providerId === 'pending') return;
    
    const providers = db.getProviders();
    const pIndex = providers.findIndex(p => p.id === providerId);
    if (pIndex !== -1) {
        const pReviews = orders.filter(o => o.providerId === providerId && o.feedback);
        const sum = pReviews.reduce((acc, curr) => acc + curr.feedback.rating, 0);
        const avg = sum / pReviews.length;
        providers[pIndex].rating = parseFloat(avg.toFixed(1));
        providers[pIndex].reviewsCount = pReviews.length + 50;
        db.saveProviders(providers);
    }
}
