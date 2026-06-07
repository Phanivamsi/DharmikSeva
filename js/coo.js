// ========================================================
// CHIEF OPERATIONS OFFICER (COO) LOGIC
// ========================================================

function initCooDashboard() {
    renderCooStats();
    renderCooProvidersTable();
}

// Compute and render stats cards
function renderCooStats() {
    const providers = db.getProviders();

    const total = providers.length;
    const purohits = providers.filter(p => p.type === 'purohit').length;
    const pending = providers.filter(p => p.status === 'pending').length;
    const approved = providers.filter(p => p.status === 'approved').length;
    const suspended = providers.filter(p => p.status === 'suspended').length;

    document.getElementById("coo-total-partners").textContent = total;
    document.getElementById("coo-purohit-count").textContent = `${purohits} Purohits`;
    document.getElementById("coo-pending-approvals").textContent = pending;
    document.getElementById("coo-approved-partners").textContent = approved;
    document.getElementById("coo-suspended-partners").textContent = suspended;
}

// Render partners vetting queue table
function renderCooProvidersTable() {
    const tableBody = document.getElementById("coo-providers-table");
    const providers = db.getProviders();
    tableBody.innerHTML = "";

    if (providers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-secondary);">No partners registered in system.</td></tr>`;
        return;
    }

    providers.forEach(p => {
        const row = document.createElement("tr");

        let statusBadge = "";
        let actions = "";

        if (p.status === 'pending') {
            statusBadge = `<span class="badge badge-warning">Awaiting Audit</span>`;
            actions = `
                <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem; background:var(--success); color:#FFF;" onclick="updateProviderStatus('${p.id}', 'approved')">Approve</button>
                <button class="btn btn-danger" style="padding:4px 10px; font-size:0.75rem;" onclick="updateProviderStatus('${p.id}', 'suspended')">Reject</button>
            `;
        } else if (p.status === 'approved') {
            statusBadge = `<span class="badge badge-success">Verified Active</span>`;
            actions = `<button class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem; color:var(--accent-red); border-color:rgba(198,40,40,0.3);" onclick="updateProviderStatus('${p.id}', 'suspended')">Suspend</button>`;
        } else if (p.status === 'suspended') {
            statusBadge = `<span class="badge badge-danger">Suspended</span>`;
            actions = `<button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem; background:var(--success); color:#FFF;" onclick="updateProviderStatus('${p.id}', 'approved')">Re-activate</button>`;
        }

        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>
                <div style="font-weight:600; display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.15rem;">${p.icon}</span> ${p.name}
                </div>
            </td>
            <td><span class="badge badge-gold" style="font-size:0.7rem;">${p.type.toUpperCase()}</span></td>
            <td>${p.experience} Years</td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="inspectProvider('${p.id}')">Inspect Credentials</button>
            </td>
            <td>${statusBadge}</td>
            <td>
                <div style="display:flex; gap:6px;">${actions}</div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Inspect specific provider details & documents scans
function inspectProvider(provId) {
    const providers = db.getProviders();
    const p = providers.find(item => item.id === provId);
    if (!p) return;

    const modalContent = document.getElementById("coo-modal-inspector-content");
    
    let specificAuditInfo = "";

    if (p.type === 'purohit') {
        specificAuditInfo = `
            <div style="margin-bottom:12px;">
                <strong>State Style Tradition:</strong> ${p.style}
            </div>
            <div style="margin-bottom:12px;">
                <strong>Languages Spoken:</strong> ${p.languages.join(", ")}
            </div>
            <div>
                <strong>Puja Catalog Registrations:</strong>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                    ${p.pujas.map(puja => `<span class="badge badge-gold" style="font-size:0.75rem;">${puja}</span>`).join("")}
                </div>
            </div>
        `;
    } else if (p.type === 'dancer' || p.type === 'singer' || p.type === 'musician') {
        specificAuditInfo = `
            <div style="margin-bottom:12px;">
                <strong>Classical Category Form:</strong> ${p.artForm}
            </div>
            <div>
                <strong>Experience:</strong> ${p.experience} Years of concert recitals
            </div>
        `;
    } else if (p.type === 'cow') {
        specificAuditInfo = `
            <div style="margin-bottom:12px;">
                <strong>Cow Breed:</strong> ${p.breed}
            </div>
            <div>
                <strong>Cows in Goshala:</strong> ${p.cowsAvailable} sacred cows
            </div>
        `;
    } else if (p.type === 'food') {
        specificAuditInfo = `
            <div style="margin-bottom:12px; padding:10px; border-radius:6px; border:1px solid rgba(198,40,40,0.2); background-color:rgba(198,40,40,0.02);">
                <strong style="color:var(--accent-red);">FSSAI License Registration:</strong> Verified Number: ${p.fssai}
            </div>
            <div style="margin-bottom:12px;">
                <strong>Prasadam Items:</strong> ${p.items.map(item => item.name).join(", ")}
            </div>
            <div>
                <strong>Team Kitchen Size:</strong> ${p.teamSize} chefs
            </div>
        `;
    }

    modalContent.innerHTML = `
        <div style="display:flex; gap:1.5rem; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:15px;">
            <div style="font-size: 3rem; background-color: var(--bg-tertiary); padding: 10px; border-radius: 12px; border: 1px solid var(--border-color);">${p.icon}</div>
            <div>
                <h2>${p.name}</h2>
                <div style="color:var(--accent-gold); font-weight:700; font-size:0.95rem;">Entity type: ${p.entityType} | Rating: ${p.rating}⭐</div>
            </div>
        </div>

        <div class="grid-2" style="align-items: flex-start; margin-bottom:1.5rem;">
            <div>
                <h3 style="margin-bottom:10px;">onboarding Profile</h3>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
                    <p style="margin-bottom:8px;">"${p.bio}"</p>
                    ${specificAuditInfo}
                </div>
            </div>

            <div class="card" style="background-color:var(--bg-primary);">
                <h3 style="margin-bottom:10px;">Verification documents</h3>
                <div style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem; color:var(--text-secondary);">
                    <div style="display:flex; align-items:center; gap:10px; padding:10px; border-radius:8px; background-color:var(--bg-secondary); border:1px solid var(--border-color);">
                        <span style="font-size:1.5rem;">🪪</span>
                        <div>
                            <strong>Government ID Scan</strong>
                            <div style="font-size:0.75rem; color:var(--success);">Match Verified (Aadhaar/License)</div>
                        </div>
                    </div>
                    ${p.type === 'food' ? `
                        <div style="display:flex; align-items:center; gap:10px; padding:10px; border-radius:8px; background-color:var(--bg-secondary); border:1px solid var(--border-color);">
                            <span style="font-size:1.5rem;">📋</span>
                            <div>
                                <strong>FSSAI Registration Scan</strong>
                                <div style="font-size:0.75rem; color:var(--success);">License Active & Authenticated</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--border-color); padding-top:15px; margin-top:1.5rem;">
            <button class="btn btn-secondary" onclick="closeModal('coo-inspector-modal')">Close Audit</button>
            ${p.status === 'pending' ? `
                <button class="btn btn-primary" style="background:var(--success); color:#FFF;" onclick="updateProviderStatus('${p.id}', 'approved'); closeModal('coo-inspector-modal');">Approve Partner</button>
                <button class="btn btn-danger" onclick="updateProviderStatus('${p.id}', 'suspended'); closeModal('coo-inspector-modal');">Reject Partner</button>
            ` : ''}
        </div>
    `;

    openModal("coo-inspector-modal");
}

// Approve or Suspend registered partner
function updateProviderStatus(provId, nextStatus) {
    const providers = db.getProviders();
    const idx = providers.findIndex(p => p.id === provId);
    if (idx === -1) return;

    providers[idx].status = nextStatus;
    db.saveProviders(providers);

    // Refresh UI
    initCooDashboard();
    
    const partnerName = providers[idx].name;
    const actionLabel = nextStatus === 'approved' ? 'approved & verified live' : 'rejected / suspended';
    showNotification(`💼 COO Action: ${partnerName} has been ${actionLabel}!`);
}
