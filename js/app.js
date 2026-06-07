// ========================================================
// GLOBAL STATE & DATABASE INITIALIZATION
// ========================================================

const DEFAULT_PROVIDERS = [
    {
        id: "prov-1",
        name: "Pandit Krishna Shastri",
        type: "purohit",
        icon: "🌸",
        experience: 12,
        rating: 4.9,
        reviewsCount: 142,
        ordersServed: 350,
        hourlyRate: 75,
        status: "approved", // approved, pending, suspended
        pujas: ["Satyanarayana Vratam", "Ganesh Homa", "Muhurtam Panchang Fixing", "Vastu Consultation"],
        languages: ["Sanskrit", "Telugu", "Hindi"],
        style: "Vedic Smarta (South)",
        bio: "Specialized in Vedic Smarta paddhati, trained at Sringeri Gurukul. Expert in Vastu and Muhurtam calculations."
    },
    {
        id: "prov-2",
        name: "Pandit Ramesh Dwivedi",
        type: "purohit",
        icon: "🌸",
        experience: 15,
        rating: 4.8,
        reviewsCount: 98,
        ordersServed: 210,
        hourlyRate: 85,
        status: "approved",
        pujas: ["Griha Pravesh", "Satyanarayana Vratam", "Marriage Matchmaking", "Vastu Consultation"],
        languages: ["Sanskrit", "Hindi"],
        style: "Vedic (North Style)",
        bio: "Varanasi trained Vedic Shastri. Expertise in Griha Pravesh pujas and Kundali Matchmaking."
    },
    {
        id: "prov-3",
        name: "Smt. Rajeshwari Swaminathan",
        type: "singer",
        icon: "🎤",
        experience: 10,
        rating: 4.9,
        reviewsCount: 64,
        ordersServed: 88,
        hourlyRate: 60,
        status: "pending", // Pre-set as pending for the COO to verify on launch
        artForm: "Carnatic Vocal",
        languages: ["Tamil", "Telugu", "Sanskrit"],
        bio: "A-grade classical vocalist from Kalakshetra. Performs traditional kirtans and bhajans."
    },
    {
        id: "prov-4",
        name: "Kum. Meenakshi Sundaram",
        type: "dancer",
        icon: "💃",
        experience: 8,
        rating: 4.8,
        reviewsCount: 42,
        ordersServed: 54,
        hourlyRate: 80,
        status: "approved",
        artForm: "Bharatanatyam Dancer",
        languages: ["Tamil", "English"],
        bio: "Bharatanatyam solo dancer. Performed extensively in temple festivals across Southern India."
    },
    {
        id: "prov-7",
        name: "Sri K. Raghavan",
        type: "musician",
        icon: "🎻",
        experience: 15,
        rating: 4.9,
        reviewsCount: 55,
        ordersServed: 102,
        hourlyRate: 50,
        status: "approved",
        artForm: "Mridangam Artist",
        languages: ["Tamil", "Telugu"],
        bio: "Traditional mridangam percussionist. Accompanies lead classical vocalists and dance recitals."
    },
    {
        id: "prov-5",
        name: "Gopal Goshala Services",
        type: "cow",
        icon: "🐄",
        experience: 7,
        rating: 4.9,
        reviewsCount: 31,
        ordersServed: 78,
        hourlyRate: 40,
        status: "approved",
        breed: "Desi Gir Cow",
        cowsAvailable: 4,
        bio: "Hygenic and well-treated sacred Gir cows trained specifically for house warming (Griha Pravesh) ceremonies."
    },
    {
        id: "prov-6",
        name: "Vrindavan Prasadam Kitchens",
        type: "food",
        icon: "🍲",
        experience: 9,
        rating: 4.7,
        reviewsCount: 120,
        ordersServed: 410,
        items: [
            { name: "Pulihara (Tamarind Rice)", price: 12 },
            { name: "Chakrapongali (Sweet Rice)", price: 15 },
            { name: "Laddu (Sacred Sweet)", price: 18 }
        ],
        fssai: "12345678901234",
        entityType: "organization",
        teamSize: 12,
        status: "approved",
        bio: "Pure vegetarian Prasadam kitchen adhering to strict traditional hygiene and ingredients. FSSAI licensed."
    }
];

// Special Puja Service Products
const PUJA_PRODUCTS = [
    {
        id: "puja-satya",
        name: "Satyanarayana Vratam Homa",
        type: "purohit",
        icon: "🌸",
        basePrice: 150,
        duration: 3,
        description: "A sacred puja performed for family prosperity, peace, and obstacles removal. Includes Satyanarayana Katha recital.",
        style: "South or North Indian",
        languages: "Sanskrit, Hindi, Telugu, Tamil"
    },
    {
        id: "puja-griha",
        name: "Griha Pravesh (House Warming)",
        type: "purohit",
        icon: "🌸",
        basePrice: 250,
        duration: 4,
        description: "Ritual to cleanse and bless a new house. Includes Vastu Puja, Ganesh Homa, and Navagraha Homa.",
        style: "South or North Indian",
        languages: "Sanskrit, Hindi, Telugu, Marathi"
    },
    {
        id: "puja-ganesh",
        name: "Ganesh Homa & Vastu Shanti Homa",
        type: "purohit",
        icon: "🌸",
        basePrice: 180,
        duration: 3,
        description: "Conducted to remove hurdles in business/career and align positive vastu energy in the living premises.",
        style: "South or North Indian",
        languages: "Sanskrit, Hindi, Telugu, Kannada"
    }
];

const DEFAULT_ORDERS = [
    {
        id: "ORD-9821",
        clientName: "Sandhya Sharma",
        clientPhone: "+1 (555) 342-9830",
        clientAddress: "108 Lotus Lane, Mandir District, NJ",
        serviceName: "Satyanarayana Vratam Homa",
        providerId: "prov-1",
        providerName: "Pandit Krishna Shastri",
        date: "2026-11-08",
        price: 150,
        advancePaid: 30,
        status: "booked", // upcoming, booked, completed, cancelled, delay-risk
        feedback: null
    },
    {
        id: "ORD-8712",
        clientName: "Rahul Patel",
        clientPhone: "+1 (555) 890-4321",
        clientAddress: "45 Temple View Blvd, Edison, NJ",
        serviceName: "Griha Pravesh (House Warming)",
        providerId: "prov-2",
        providerName: "Pandit Ramesh Dwivedi",
        date: "2026-11-05",
        price: 250,
        advancePaid: 50,
        status: "delay-risk",
        feedback: null
    }
];

const DEFAULT_CONSULTATIONS = [
    {
        id: "CON-401",
        clientName: "Deepa Ramachandran",
        clientPhone: "+1 (555) 123-4567",
        zodiac: "Mesha",
        style: "South Indian",
        dates: "Nov 12 - Nov 18, 2026",
        rashiPhalam: "Looking for wedding muhurtam. Auspicious Jupiter alignment preferred.",
        budget: "Medium ($300 - $800)",
        status: "pending"
    }
];

const DEFAULT_SHOPPERS = [
    { name: "Anil Kumar", contact: "+1 (555) 762-1082", lastActivity: "Added 'Griha Pravesh' to cart 2 hours ago" }
];

const DEFAULT_USERS_AUTH = [
    { username: "sandhya", password: "123", name: "Sandhya Sharma", email: "sandhya.sharma@example.com", phone: "+1 (555) 342-9830", address: "108 Lotus Lane, Mandir District, NJ" }
];

const DEFAULT_PROVIDERS_AUTH = [
    { username: "shastri", password: "123", providerId: "prov-1" },
    { username: "dwivedi", password: "123", providerId: "prov-2" },
    { username: "rajeshwari", password: "123", providerId: "prov-3" }
];

// Load Database
function initDatabase() {
    if (!localStorage.getItem("ds_providers")) {
        localStorage.setItem("ds_providers", JSON.stringify(DEFAULT_PROVIDERS));
    }
    if (!localStorage.getItem("ds_orders")) {
        localStorage.setItem("ds_orders", JSON.stringify(DEFAULT_ORDERS));
    }
    if (!localStorage.getItem("ds_consultations")) {
        localStorage.setItem("ds_consultations", JSON.stringify(DEFAULT_CONSULTATIONS));
    }
    if (!localStorage.getItem("ds_shoppers")) {
        localStorage.setItem("ds_shoppers", JSON.stringify(DEFAULT_SHOPPERS));
    }
    if (!localStorage.getItem("ds_users_auth")) {
        localStorage.setItem("ds_users_auth", JSON.stringify(DEFAULT_USERS_AUTH));
    }
    if (!localStorage.getItem("ds_providers_auth")) {
        localStorage.setItem("ds_providers_auth", JSON.stringify(DEFAULT_PROVIDERS_AUTH));
    }
    if (!localStorage.getItem("ds_wallet_customer")) {
        localStorage.setItem("ds_wallet_customer", "450.00");
    }
    if (!localStorage.getItem("ds_wallet_provider")) {
        localStorage.setItem("ds_wallet_provider", "180.00");
    }
    if (!localStorage.getItem("ds_commission")) {
        localStorage.setItem("ds_commission", "12");
    }
}

// Global state getters & setters
const db = {
    getProviders: () => JSON.parse(localStorage.getItem("ds_providers")),
    saveProviders: (data) => localStorage.setItem("ds_providers", JSON.stringify(data)),
    
    getOrders: () => JSON.parse(localStorage.getItem("ds_orders")),
    saveOrders: (data) => localStorage.setItem("ds_orders", JSON.stringify(data)),
    
    getConsultations: () => JSON.parse(localStorage.getItem("ds_consultations")),
    saveConsultations: (data) => localStorage.setItem("ds_consultations", JSON.stringify(data)),

    getShoppers: () => JSON.parse(localStorage.getItem("ds_shoppers")),
    saveShoppers: (data) => localStorage.setItem("ds_shoppers", JSON.stringify(data)),
    
    getUsersAuth: () => JSON.parse(localStorage.getItem("ds_users_auth")),
    saveUsersAuth: (data) => localStorage.setItem("ds_users_auth", JSON.stringify(data)),

    getProvidersAuth: () => JSON.parse(localStorage.getItem("ds_providers_auth")),
    saveProvidersAuth: (data) => localStorage.setItem("ds_providers_auth", JSON.stringify(data)),

    getCustomerWallet: () => parseFloat(localStorage.getItem("ds_wallet_customer")),
    setCustomerWallet: (val) => {
        localStorage.setItem("ds_wallet_customer", val.toFixed(2));
        const cBal = document.getElementById("customer-wallet-balance");
        if (cBal) cBal.textContent = `$${val.toFixed(2)}`;
    },
    
    getProviderWallet: () => parseFloat(localStorage.getItem("ds_wallet_provider")),
    setProviderWallet: (val) => {
        localStorage.setItem("ds_wallet_provider", val.toFixed(2));
        const pBal = document.getElementById("provider-wallet-balance");
        if (pBal) pBal.textContent = `$${val.toFixed(2)}`;
    },

    getCommission: () => parseInt(localStorage.getItem("ds_commission")),
    setCommission: (val) => {
        localStorage.setItem("ds_commission", val.toString());
        document.getElementById("ops-commission-display").textContent = `${val}%`;
    }
};

// ========================================================
// INTERFACE NAVIGATION & UTILITIES
// ========================================================

function switchRole(role) {
    // Hide all main views
    document.querySelectorAll(".app-view").forEach(view => {
        view.classList.remove("active");
    });
    
    // Deactivate all role buttons
    document.querySelectorAll(".role-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    document.getElementById(`customer-view`).style.display = 'none';
    document.getElementById(`provider-view`).style.display = 'none';
    document.getElementById(`ops-view`).style.display = 'none';
    document.getElementById(`coo-view`).style.display = 'none';
    
    const activeView = document.getElementById(`${role}-view`);
    activeView.style.display = 'block';
    activeView.classList.add("active");
    document.getElementById(`btn-role-${role}`).classList.add("active");

    // Initialize/Refresh modules for active view
    if (role === 'customer') {
        checkCustomerAuthSession();
    } else if (role === 'provider') {
        checkProviderAuthSession();
    } else if (role === 'ops') {
        initOpsDashboard();
    } else if (role === 'coo') {
        initCooDashboard();
    }
}

// Session Validation
function checkCustomerAuthSession() {
    const session = sessionStorage.getItem("ds_current_user");
    const loginSection = document.getElementById("customer-auth-section");
    const portalSection = document.getElementById("customer-portal-section");

    if (session) {
        const user = JSON.parse(session);
        loginSection.style.display = "none";
        portalSection.style.display = "block";
        
        document.getElementById("profile-name-display").textContent = user.name;
        document.getElementById("profile-email-field").value = user.email;
        document.getElementById("profile-phone-field").value = user.phone;
        document.getElementById("profile-address-field").value = user.address;

        renderServicesGrid();
        renderCustomerOrders();
    } else {
        loginSection.style.display = "block";
        portalSection.style.display = "none";
    }
}

function checkProviderAuthSession() {
    const session = sessionStorage.getItem("ds_current_provider_id");
    const loginSection = document.getElementById("provider-auth-section");
    const onboardingSection = document.getElementById("provider-onboarding-panel");
    const dashboardSection = document.getElementById("provider-active-dashboard");

    if (session) {
        loginSection.style.display = "none";
        activeProviderId = session;

        const provs = db.getProviders();
        const activeProv = provs.find(p => p.id === activeProviderId);

        if (activeProv) {
            onboardingSection.style.display = "none";
            dashboardSection.style.display = "block";
            document.getElementById("active-provider-name-display").textContent = activeProv.name;
            document.getElementById("active-provider-type-display").textContent = activeProv.type;
            
            // Show alert warning if provider is not yet approved by the COO
            const warningAlert = document.getElementById("provider-verification-alert");
            if (activeProv.status !== 'approved') {
                warningAlert.style.display = "block";
                document.querySelector("#provider-verification-alert div").innerHTML = "⚠️ Profile Pending COO Verification";
                document.querySelector("#provider-verification-alert p").innerHTML = "Your registration details have been submitted. The Chief Operations Officer must verify your documents (FSSAI/ID checks) before you become active in the customer catalog.";
            } else {
                warningAlert.style.display = "none";
            }

            initProviderDashboard();
        } else {
            onboardingSection.style.display = "block";
            dashboardSection.style.display = "none";
        }
    } else {
        loginSection.style.display = "block";
        onboardingSection.style.display = "none";
        dashboardSection.style.display = "none";
    }
}

// Notification Banner Helpers
function showNotification(text) {
    const banner = document.getElementById("notification-banner");
    const label = document.getElementById("notification-text");
    label.textContent = text;
    banner.style.display = "block";
}

function closeNotification() {
    document.getElementById("notification-banner").style.display = "none";
}

// Modal open/close helpers
function openModal(id) {
    document.getElementById(id).classList.add("open");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}

// Load DB on initial load
window.addEventListener("DOMContentLoaded", () => {
    initDatabase();
    
    // Initialize customer wallet display
    db.setCustomerWallet(db.getCustomerWallet());
    
    // Trigger customer catalog render by default
    switchRole('customer');
});
