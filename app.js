/* ==========================================
   BlackLook E-Commerce - Core JavaScript Engine
   Includes: State management, LocalStorage persistence,
             Password-Based Login & Role-Based Access Control,
             WhatsApp Checkout routing with text-based shipping cost,
             Merchant Admin Control Panel, Order Tracking Portal, and UI transitions.
   ========================================== */

// --- Constants & Globals ---
const STORE_WHATSAPP = "218947444666"; // Owner's phone in international format
const SUPER_ADMIN_PASSWORD = "dexds1";   // Permanent locked Super Admin password
const LOCAL_STORAGE_PRODUCTS = "blacklook_products";
const LOCAL_STORAGE_CART = "blacklook_cart";
const LOCAL_STORAGE_ORDERS = "blacklook_orders";
const LOCAL_STORAGE_USERS = "blacklook_authorized_users";
const LOCAL_STORAGE_SESSION = "blacklook_active_session";

// --- Application State ---
let state = {
    products: [],
    cart: [],
    orders: [],
    authorizedUsers: [], // Managed employees database
    currentUser: null,   // Logged-in session details
    filters: {
        category: "all",
        search: ""
    },
    tempBase64Image: null,
    selectedProductForModal: null
};

// --- DOM Elements ---
const DOM = {
    // Navigation
    btnShowStore: document.getElementById("btn-show-store"),
    btnShowAdmin: document.getElementById("btn-show-admin"),
    btnShowTrackNav: document.getElementById("btn-show-track-nav"),
    storeSection: document.getElementById("store-section"),
    adminSection: document.getElementById("admin-section"),
    navLogo: document.getElementById("nav-logo"),

    // Session status header
    adminSessionBar: document.getElementById("admin-session-bar"),
    sessionUserRole: document.getElementById("session-user-role"),
    sessionUserName: document.getElementById("session-user-name"),
    btnLogout: document.getElementById("btn-logout"),

    // Catalog & Storefront
    productsGrid: document.getElementById("products-grid"),
    storeEmptyState: document.getElementById("store-empty-state"),
    emptyGotoAdminBtn: document.getElementById("empty-goto-admin-btn"),
    searchInput: document.getElementById("search-input"),
    categoriesContainer: document.getElementById("categories-container"),

    // Shopping Cart Drawer
    cartBtn: document.getElementById("cart-btn"),
    cartBadge: document.getElementById("cart-badge"),
    cartOverlay: document.getElementById("cart-overlay"),
    cartDrawer: document.getElementById("cart-drawer"),
    closeCartBtn: document.getElementById("close-cart-btn"),
    cartItemsContainer: document.getElementById("cart-items-container"),
    cartEmpty: document.getElementById("cart-empty"),
    cartFooter: document.getElementById("cart-footer"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    cartTotal: document.getElementById("cart-total"),
    btnOpenCheckout: document.getElementById("btn-open-checkout"),

    // Product Modal
    productModal: document.getElementById("product-modal"),
    closeProductModal: document.getElementById("close-product-modal"),
    modalImg: document.getElementById("modal-img"),
    modalSaleBadge: document.getElementById("modal-sale-badge"),
    modalCategory: document.getElementById("modal-category"),
    modalTitle: document.getElementById("modal-title"),
    modalPriceOriginal: document.getElementById("modal-price-original"),
    modalPriceCurrent: document.getElementById("modal-price-current"),
    modalDesc: document.getElementById("modal-desc"),
    modalSizesGroup: document.getElementById("modal-sizes-group"),
    modalSizesContainer: document.getElementById("modal-sizes-container"),
    modalQtyMinus: document.getElementById("modal-qty-minus"),
    modalQtyPlus: document.getElementById("modal-qty-plus"),
    modalQtyInput: document.getElementById("modal-qty-input"),
    modalAddToCartBtn: document.getElementById("modal-add-to-cart-btn"),

    // Checkout Modal
    checkoutModal: document.getElementById("checkout-modal"),
    closeCheckoutModal: document.getElementById("close-checkout-modal"),
    checkoutForm: document.getElementById("checkout-form"),
    checkoutSummaryItems: document.getElementById("checkout-summary-items"),
    checkoutSummaryTotal: document.getElementById("checkout-summary-total"),
    custName: document.getElementById("cust-name"),
    custPhone: document.getElementById("cust-phone"),
    custCity: document.getElementById("cust-city"),
    custAddress: document.getElementById("cust-address"),

    // Order Tracking Modal
    trackModal: document.getElementById("track-modal"),
    closeTrackModal: document.getElementById("close-track-modal"),
    trackForm: document.getElementById("track-form"),
    trackInput: document.getElementById("track-input"),
    trackResult: document.getElementById("track-result"),
    trackResultId: document.getElementById("track-result-id"),
    trackResultName: document.getElementById("track-result-name"),
    trackResultAddress: document.getElementById("track-result-address"),
    trackResultDate: document.getElementById("track-result-date"),
    trackResultTotal: document.getElementById("track-result-total"),
    trackResultCancelledNote: document.getElementById("track-result-cancelled-note"),

    // Auth Password Login Modal
    loginModal: document.getElementById("login-modal"),
    loginPasswordForm: document.getElementById("login-password-form"),
    loginPasswordInput: document.getElementById("login-password-input"),

    // Admin Panel Controls
    productForm: document.getElementById("product-form"),
    editProductId: document.getElementById("edit-product-id"),
    formActionTitle: document.getElementById("form-action-title"),
    prodName: document.getElementById("prod-name"),
    prodCategory: document.getElementById("prod-category"),
    prodSizes: document.getElementById("prod-sizes"),
    prodPrice: document.getElementById("prod-price"),
    prodDiscountPrice: document.getElementById("prod-discount-price"),
    prodImage: document.getElementById("prod-image"),
    uploadArea: document.getElementById("upload-area"),
    imagePreview: document.getElementById("image-preview"),
    prodDesc: document.getElementById("prod-desc"),
    btnSubmitProduct: document.getElementById("btn-submit-product"),
    btnCancelEdit: document.getElementById("btn-cancel-edit"),

    // Admin Tabs & Tables
    adminProductsList: document.getElementById("admin-products-list"),
    adminOrdersList: document.getElementById("admin-orders-list"),
    productsTableEmpty: document.getElementById("products-table-empty"),
    ordersTableEmpty: document.getElementById("orders-table-empty"),
    tabProducts: document.getElementById("tab-products"),
    tabOrders: document.getElementById("tab-orders"),
    
    // Auth Tab
    tabRoles: document.getElementById("tab-roles"),
    tabBtnOrders: document.getElementById("tab-btn-orders"),
    tabBtnRoles: document.getElementById("tab-btn-roles"),
    roleForm: document.getElementById("role-form"),
    roleUsernameInput: document.getElementById("role-username"),
    rolePasswordInput: document.getElementById("role-password"),
    roleRankSelect: document.getElementById("role-rank"),
    adminRolesList: document.getElementById("admin-roles-list"),

    // Admin Stats
    adminStatsGrid: document.getElementById("admin-stats-grid"),
    statTotalSales: document.getElementById("stat-total-sales"),
    statOrdersCount: document.getElementById("stat-orders-count"),
    statProductsCount: document.getElementById("stat-products-count"),

    // Toast Alerts
    toastContainer: document.getElementById("toast-container")
};

// // --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
    // 1. جلب المنتجات سحابياً أولاً
    await loadProductsFromCloud();
    
    // 2. تحميل السلة محلياً كالمعتاد
    loadCartFromLocalStorage();
    
    setupEventListeners();
    renderStorefront();
    updateCartUI();
});

// // --- Cloud & LocalStorage Operations ---

// جلب المنتجات من السيرفر السحابي
async function loadProductsFromCloud() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('خطأ في جلب البيانات من السيرفر');
        const products = await response.json();
        
        // دالة إرسال وحفظ منتج جديد في قاعدة البيانات السحابية
async function saveProductToCloud(productData) {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        if (result.success) {
            alert("🎉 تم حفظ المنتج سحابياً بنجاح وسيظهر لكل الزوار الآن!");
            await loadProductsFromCloud(); // تحديث القائمة فوراً
            if (typeof renderStorefront === 'function') renderStorefront(); 
        } else {
            alert("حدث خطأ أثناء الحفظ: " + result.error);
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالسيرفر السحابي:", error);
    }
}
// دالة منفصلة لتحميل السلة محلياً في جهاز الزبون (تبقي السلة محفوظة للزبون نفسه فقط)
function loadCartFromLocalStorage() {
    try {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_CART);
        state.cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error("Error loading cart:", error);
        state.cart = [];
    }
}

        const storedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS);
        state.orders = storedOrders ? JSON.parse(storedOrders) : [];

        // Load employees credential database
        const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS);
        state.authorizedUsers = storedUsers ? JSON.parse(storedUsers) : [
            { name: "مالك المتجر", password: SUPER_ADMIN_PASSWORD, rank: "superadmin", label: "المشرف العام" }
        ];

        // Always ensure Super Admin is inside the credential lists
        const hasSuperAdmin = state.authorizedUsers.find(u => u.rank === "superadmin");
        if (!hasSuperAdmin) {
            state.authorizedUsers.unshift({ name: "مالك المتجر", password: SUPER_ADMIN_PASSWORD, rank: "superadmin", label: "المشرف العام" });
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(state.authorizedUsers));
        } else {
            hasSuperAdmin.password = SUPER_ADMIN_PASSWORD;
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(state.authorizedUsers));
        }

        // Active Session loading
        const activeSession = localStorage.getItem(LOCAL_STORAGE_SESSION);
        state.currentUser = activeSession ? JSON.parse(activeSession) : null;
    } catch (e) {
        console.error("خطأ أثناء تحميل البيانات من الذاكرة المحلية", e);
        showToast("خطأ أثناء تحميل البيانات المحفوظة", "error");
    }
}

function saveDataToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(state.products));
        localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(state.cart));
        localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(state.orders));
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(state.authorizedUsers));
    } catch (e) {
        console.error("خطأ أثناء حفظ البيانات في الذاكرة المحلية", e);
        showToast("فشل في حفظ البيانات. قد تكون الصورة كبيرة جداً!", "error");
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Nav Navigation Toggles
    DOM.btnShowStore.addEventListener("click", (e) => {
        e.preventDefault();
        switchView("store");
    });
    DOM.btnShowAdmin.addEventListener("click", (e) => {
        e.preventDefault();
        handleAdminAccessRequest();
    });
    DOM.navLogo.addEventListener("click", (e) => {
        e.preventDefault();
        switchView("store");
    });
    DOM.emptyGotoAdminBtn.addEventListener("click", handleAdminAccessRequest);

    // Logout
    DOM.btnLogout.addEventListener("click", handleLogout);

    // Cart Drawer Toggle
    DOM.cartBtn.addEventListener("click", () => toggleCartDrawer(true));
    DOM.closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
    DOM.cartOverlay.addEventListener("click", () => toggleCartDrawer(false));

    // Catalog filtering
    DOM.categoriesContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            state.filters.category = e.target.getAttribute("data-category");
            renderStorefront();
        }
    });

    // Search bar
    DOM.searchInput.addEventListener("input", (e) => {
        state.filters.search = e.target.value.trim().toLowerCase();
        renderStorefront();
    });

    // File input reading (Base64)
    DOM.prodImage.addEventListener("change", handleProductImageUpload);

    // Forms
    DOM.productForm.addEventListener("submit", handleProductFormSubmit);
    DOM.btnCancelEdit.addEventListener("click", resetProductForm);

    // Super Admin: Add employee credentials
    DOM.roleForm.addEventListener("submit", handleRoleFormSubmit);

    // Admin Tabs Navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Login Modals Action
    DOM.loginPasswordForm.addEventListener("submit", handleLoginPasswordSubmit);

    // Product Modal Actions
    DOM.closeProductModal.addEventListener("click", () => toggleModal(DOM.productModal, false));
    DOM.modalQtyMinus.addEventListener("click", () => adjustModalQuantity(-1));
    DOM.modalQtyPlus.addEventListener("click", () => adjustModalQuantity(1));
    DOM.modalAddToCartBtn.addEventListener("click", addProductFromModalToCart);

    // Checkout Modal Actions
    DOM.btnOpenCheckout.addEventListener("click", openCheckoutFlow);
    DOM.closeCheckoutModal.addEventListener("click", () => toggleModal(DOM.checkoutModal, false));
    DOM.checkoutForm.addEventListener("submit", handleCheckoutFormSubmit);

    // Order Tracking Modal Actions
    DOM.btnShowTrackNav.addEventListener("click", (e) => {
        e.preventDefault();
        openTrackingPortal();
    });
    DOM.closeTrackModal.addEventListener("click", () => toggleModal(DOM.trackModal, false));
    DOM.trackForm.addEventListener("submit", handleTrackingSearchSubmit);
}

// --- View Router ---
function switchView(viewName) {
    if (viewName === "store") {
        DOM.btnShowStore.classList.add("active");
        DOM.btnShowAdmin.classList.remove("active");
        DOM.storeSection.classList.add("active");
        DOM.adminSection.classList.remove("active");
        renderStorefront();
    } else if (viewName === "admin") {
        DOM.btnShowStore.classList.remove("active");
        DOM.btnShowAdmin.classList.add("active");
        DOM.storeSection.classList.remove("active");
        DOM.adminSection.classList.add("active");
        renderAdminPanel();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Toast Alerts ---
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-xmark";
    else if (type === "success" && message.includes("واتساب")) iconClass = "fa-brands fa-whatsapp";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    toast.addEventListener("click", () => toast.remove());

    setTimeout(() => {
        toast.style.animation = "toastSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// --- Authentication & Access Control Flow (Password Based) ---
function handleAdminAccessRequest() {
    if (state.currentUser) {
        switchView("admin");
    } else {
        DOM.loginPasswordInput.value = "";
        toggleModal(DOM.loginModal, true);
    }
}

function handleLoginPasswordSubmit(e) {
    e.preventDefault();
    const enteredPassword = DOM.loginPasswordInput.value.trim();

    const matchedUser = state.authorizedUsers.find(u => u.password === enteredPassword);

    if (matchedUser) {
        state.currentUser = {
            name: matchedUser.name,
            rank: matchedUser.rank,
            label: matchedUser.label
        };

        localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(state.currentUser));

        DOM.loginPasswordInput.value = "";
        toggleModal(DOM.loginModal, false);
        
        switchView("admin");
        showToast(`مرحباً بك مجدداً يا ${state.currentUser.name} (${state.currentUser.label})!`, "success");
    } else {
        showToast("كلمة السر التي أدخلتها غير صحيحة أو غير مصرح لصاحبها بدخول لوحة التحكم!", "error");
    }
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem(LOCAL_STORAGE_SESSION);
    switchView("store");
    showToast("تم تسجيل الخروج بنجاح.", "success");
}

// --- Super Admin Employee/Credentials Management Form ---
function handleRoleFormSubmit(e) {
    e.preventDefault();

    if (state.currentUser.rank !== "superadmin") {
        showToast("صلاحية إضافة الموظفين مقتصرة على المشرف العام فقط!", "error");
        return;
    }

    const empName = DOM.roleUsernameInput.value.trim();
    const empPassword = DOM.rolePasswordInput.value.trim();
    const selectedRank = DOM.roleRankSelect.value;
    
    const passwordExists = state.authorizedUsers.find(u => u.password === empPassword);
    if (passwordExists) {
        showToast("كلمة السر هذه مستخدمة بالفعل من قبل موظف آخر! اختر كلمة سر فريدة.", "error");
        return;
    }

    let rankLabel = "مدير";
    if (selectedRank === "editor") rankLabel = "محرر";

    state.authorizedUsers.push({
        name: empName,
        password: empPassword,
        rank: selectedRank,
        label: rankLabel
    });

    saveDataToLocalStorage();
    DOM.roleForm.reset();
    renderAdminPanel();
    showToast(`تمت إضافة الموظف ${empName} بنجاح برتبة: ${rankLabel}`);
}

function revokeUserAccess(password) {
    if (password === SUPER_ADMIN_PASSWORD) {
        showToast("لا يمكن إلغاء تصريح المشرف العام الأساسي!", "error");
        return;
    }

    const userToDelete = state.authorizedUsers.find(u => u.password === password);
    if (!userToDelete) return;

    if (confirm(`هل أنت متأكد من حذف حساب الموظف ${userToDelete.name} وإلغاء صلاحية دخوله للمتجر؟`)) {
        state.authorizedUsers = state.authorizedUsers.filter(u => u.password !== password);
        saveDataToLocalStorage();
        renderAdminPanel();
        showToast(`تم حذف حساب الموظف ${userToDelete.name} بنجاح.`, "error");
    }
}

// --- Image Upload (Base64 conversion) ---
function handleProductImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
        showToast("حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 1.5 ميغابايت.", "error");
        DOM.prodImage.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        state.tempBase64Image = event.target.result;
        DOM.imagePreview.src = event.target.result;
        DOM.imagePreview.classList.remove("hidden");
        DOM.uploadArea.style.display = "none";
    };
    reader.readAsDataURL(file);
}

// --- Render Storefront ---
function renderStorefront() {
    DOM.productsGrid.innerHTML = "";
    
    const filteredProducts = state.products.filter(prod => {
        const matchesCategory = state.filters.category === "all" || prod.category === state.filters.category;
        const matchesSearch = prod.name.toLowerCase().includes(state.filters.search) || 
                              prod.desc.toLowerCase().includes(state.filters.search);
        return matchesCategory && matchesSearch;
    });

    if (state.products.length === 0) {
        DOM.storeEmptyState.classList.add("active");
        DOM.productsGrid.style.display = "none";
        return;
    } else {
        DOM.storeEmptyState.classList.remove("active");
        DOM.productsGrid.style.display = "grid";
    }

    if (filteredProducts.length === 0) {
        DOM.productsGrid.innerHTML = `
            <div class="empty-table-state" style="grid-column: 1 / -1; padding: 4rem 1rem;">
                <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
                <p>عذراً، لم نجد أي منتج يطابق بحثك.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(prod => {
        const hasDiscount = prod.discountPrice && parseFloat(prod.discountPrice) < parseFloat(prod.price);
        const currentPrice = hasDiscount ? prod.discountPrice : prod.price;

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="card-img-wrap" onclick="openProductModal('${prod.id}')">
                ${hasDiscount ? `<div class="card-badge">تخفيض</div>` : ''}
                <img src="${prod.image || 'https://via.placeholder.com/300x350/141414/ffffff?text=No+Image'}" alt="${prod.name}">
            </div>
            <div class="card-info">
                <span class="card-category">${prod.category}</span>
                <h3 class="card-title">${prod.name}</h3>
                <div class="card-footer">
                    <div class="card-prices">
                        <span class="price-original strikethrough ${hasDiscount ? 'active' : ''}">${prod.price} د.ل</span>
                        <span class="price-current">${currentPrice} د.ل</span>
                    </div>
                    <button class="add-to-cart-quick" onclick="quickAddToCart('${prod.id}')" aria-label="أضف للسلة الفورية">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        DOM.productsGrid.appendChild(card);
    });
}

// --- Render Admin Panel (Role-Based Access Control) ---
function renderAdminPanel() {
    if (!state.currentUser) return;

    DOM.sessionUserRole.innerText = state.currentUser.label;
    DOM.sessionUserName.innerText = `(${state.currentUser.name})`;

    const rank = state.currentUser.rank;

    if (rank === "superadmin") {
        DOM.adminStatsGrid.classList.remove("hidden");
        DOM.tabBtnOrders.classList.remove("hidden");
        DOM.tabBtnRoles.classList.remove("hidden");
    } else if (rank === "admin") {
        DOM.adminStatsGrid.classList.remove("hidden");
        DOM.tabBtnOrders.classList.remove("hidden");
        DOM.tabBtnRoles.classList.add("hidden");
        
        const activeTabBtn = document.querySelector(".tab-btn.active");
        if (activeTabBtn && activeTabBtn.getAttribute("data-tab") === "tab-roles") {
            DOM.tabBtnRoles.classList.remove("active");
            DOM.tabRoles.classList.remove("active");
            document.querySelector("[data-tab='tab-products']").classList.add("active");
            DOM.tabProducts.classList.add("active");
        }
    } else if (rank === "editor") {
        DOM.adminStatsGrid.classList.add("hidden");
        DOM.tabBtnOrders.classList.add("hidden");
        DOM.tabBtnRoles.classList.add("hidden");

        document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        document.querySelector("[data-tab='tab-products']").classList.add("active");
        DOM.tabProducts.classList.add("active");
    }

    DOM.adminProductsList.innerHTML = "";
    
    if (state.products.length === 0) {
        DOM.productsTableEmpty.classList.remove("hidden");
    } else {
        DOM.productsTableEmpty.classList.add("hidden");
        
        state.products.forEach(prod => {
            const hasDiscount = prod.discountPrice && parseFloat(prod.discountPrice) < parseFloat(prod.price);
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="table-product-cell">
                        <img class="table-prod-img" src="${prod.image}" alt="">
                        <span class="table-prod-name">${prod.name}</span>
                    </div>
                </td>
                <td>${prod.category}</td>
                <td><strong>${prod.price} د.ل</strong></td>
                <td>
                    ${hasDiscount ? `<span class="badge-sale">${prod.discountPrice} د.ل</span>` : '<span style="color: var(--text-muted)">لا يوجد</span>'}
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn-sm edit" onclick="editProduct('${prod.id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn-sm delete" onclick="deleteProduct('${prod.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            DOM.adminProductsList.appendChild(tr);
        });
    }

    if (rank === "superadmin" || rank === "admin") {
        DOM.adminOrdersList.innerHTML = "";
        
        if (state.orders.length === 0) {
            DOM.ordersTableEmpty.classList.remove("hidden");
        } else {
            DOM.ordersTableEmpty.classList.add("hidden");
            
            state.orders.forEach(order => {
                const itemsListHtml = order.items.map(item => `
                    <li>${item.name} (${item.size ? 'مقاس: ' + item.size : 'قياسي'}) × ${item.quantity}</li>
                `).join("");

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong style="font-family: var(--font-en)">#${order.id}</strong></td>
                    <td>
                        <div class="cust-details">
                            <span class="cust-name">${order.customer.name}</span>
                            <span class="cust-phone">${order.customer.phone}</span>
                            <span class="cust-phone" style="font-size:0.75rem">${order.customer.city}</span>
                        </div>
                    </td>
                    <td><span class="order-date">${order.date}</span></td>
                    <td>
                        <ul class="order-items-list">${itemsListHtml}</ul>
                    </td>
                    <td><strong class="order-total-cell">${order.total} د.ل</strong></td>
                    <td>
                        <select class="status-select ${order.status}" onchange="changeOrderStatus('${order.id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                        </select>
                    </td>
                    <td>
                        <button class="action-btn-sm whatsapp-msg-btn" onclick="sendWhatsAppDirectReminder('${order.id}')" title="تواصل وتذكير عبر واتساب">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                    </td>
                `;
                DOM.adminOrdersList.appendChild(tr);
            });
        }
    }

    if (rank === "superadmin") {
        DOM.adminRolesList.innerHTML = "";
        
        state.authorizedUsers.forEach(user => {
            const isSuper = user.password === SUPER_ADMIN_PASSWORD;
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td><span class="nav-link active" style="display:inline-block; font-size:0.85rem; padding:0.2rem 0.6rem;">${user.label}</span></td>
                <td><span style="font-family: var(--font-en); letter-spacing:1px; background:#1e1e1e; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${user.password}</span></td>
                <td><span style="color: #22c55e; font-weight: bold;"><i class="fa-solid fa-circle-check"></i> نشط</span></td>
                <td>
                    ${isSuper ? '<span style="color: var(--text-muted)">المالك الأساسي</span>' : `
                        <button class="action-btn-sm delete" onclick="revokeUserAccess('${user.password}')" title="إلغاء الصلاحية">
                            <i class="fa-solid fa-user-xmark"></i>
                        </button>
                    `}
                </td>
            `;
            DOM.adminRolesList.appendChild(tr);
        });
    }

    if (rank === "superadmin" || rank === "admin") {
        calculateStats();
    }
}

// --- Stats Calculations ---
function calculateStats() {
    DOM.statProductsCount.innerText = state.products.length;
    DOM.statOrdersCount.innerText = state.orders.length;

    const salesTotal = state.orders
        .filter(ord => ord.status !== "cancelled")
        .reduce((sum, ord) => sum + parseFloat(ord.total), 0);

    DOM.statTotalSales.innerText = `${salesTotal.toFixed(1)} د.ل`;
}

// --- Product Modal Setup & Controls ---
function openProductModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.selectedProductForModal = product;
    
    DOM.modalImg.src = product.image || 'https://via.placeholder.com/300x350/141414/ffffff?text=No+Image';
    DOM.modalCategory.innerText = product.category;
    DOM.modalTitle.innerText = product.name;
    DOM.modalDesc.innerText = product.desc;
    
    const hasDiscount = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);
    if (hasDiscount) {
        DOM.modalSaleBadge.classList.add("active");
        DOM.modalPriceOriginal.innerText = `${product.price} د.ل`;
        DOM.modalPriceOriginal.classList.add("active");
        DOM.modalPriceCurrent.innerText = `${product.discountPrice} د.ل`;
    } else {
        DOM.modalSaleBadge.classList.remove("active");
        DOM.modalPriceOriginal.classList.remove("active");
        DOM.modalPriceCurrent.innerText = `${product.price} د.ل`;
    }

    DOM.modalSizesContainer.innerHTML = "";
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== "") {
        DOM.modalSizesGroup.style.display = "block";
        product.sizes.forEach((sz, idx) => {
            const sizeBtn = document.createElement("div");
            sizeBtn.className = `size-box ${idx === 0 ? 'selected' : ''}`;
            sizeBtn.innerText = sz;
            sizeBtn.addEventListener("click", () => {
                document.querySelectorAll(".size-box").forEach(b => b.classList.remove("selected"));
                sizeBtn.classList.add("selected");
            });
            DOM.modalSizesContainer.appendChild(sizeBtn);
        });
    } else {
        DOM.modalSizesGroup.style.display = "none";
    }

    DOM.modalQtyInput.value = 1;

    toggleModal(DOM.productModal, true);
}

function adjustModalQuantity(delta) {
    let currentQty = parseInt(DOM.modalQtyInput.value);
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    DOM.modalQtyInput.value = currentQty;
}

function toggleModal(modalEl, show) {
    if (show) {
        modalEl.classList.add("active");
        document.body.style.overflow = "hidden";
    } else {
        modalEl.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

// --- Cart Drawer Operations ---
function toggleCartDrawer(show) {
    if (show) {
        DOM.cartDrawer.classList.add("active");
        DOM.cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    } else {
        DOM.cartDrawer.classList.remove("active");
        DOM.cartOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

// --- Add to Cart ---
function quickAddToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const size = (product.sizes && product.sizes.length > 0 && product.sizes[0] !== "") ? product.sizes[0] : null;
    addItemToCart(product, size, 1);
}

function addProductFromModalToCart() {
    if (!state.selectedProductForModal) return;
    const product = state.selectedProductForModal;
    const selectedSizeEl = DOM.modalSizesContainer.querySelector(".size-box.selected");
    const size = selectedSizeEl ? selectedSizeEl.innerText : null;
    const quantity = parseInt(DOM.modalQtyInput.value) || 1;

    addItemToCart(product, size, quantity);
    toggleModal(DOM.productModal, false);
}

function addItemToCart(product, size, quantity) {
    const existingIndex = state.cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        const hasDiscount = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);
        const finalPrice = hasDiscount ? product.discountPrice : product.price;

        state.cart.push({
            id: product.id,
            name: product.name,
            image: product.image,
            size: size,
            price: parseFloat(finalPrice),
            quantity: quantity
        });
    }

    saveDataToLocalStorage();
    updateCartUI();
    toggleCartDrawer(true);
    showToast(`تمت إضافة ${product.name} إلى السلة!`);
}

function updateCartQuantity(index, delta) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity < 1) {
        state.cart.splice(index, 1);
    }
    saveDataToLocalStorage();
    updateCartUI();
}

function removeCartItem(index) {
    const name = state.cart[index].name;
    state.cart.splice(index, 1);
    saveDataToLocalStorage();
    updateCartUI();
    showToast(`تمت إزالة ${name} من السلة`, "error");
}

function updateCartUI() {
    DOM.cartItemsContainer.innerHTML = "";
    let subtotal = 0;
    let badgeCount = 0;

    if (state.cart.length === 0) {
        DOM.cartBadge.innerText = "0";
        DOM.cartEmpty.classList.add("active");
        DOM.cartFooter.style.display = "none";
        return;
    }

    DOM.cartEmpty.classList.remove("active");
    DOM.cartFooter.style.display = "block";

    state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        badgeCount += item.quantity;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";
        cartItemEl.innerHTML = `
            <img class="cart-item-img" src="${item.image || 'https://via.placeholder.com/80x80/141414/ffffff?text=Logo'}" alt="">
            <div class="cart-item-details">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    ${item.size ? `<span class="cart-item-size">المقاس: ${item.size}</span>` : ''}
                </div>
                <div class="cart-item-price">${item.price} د.ل</div>
                <div class="cart-item-actions">
                    <div class="qty-control">
                        <button class="qty-btn-sm" onclick="updateCartQuantity(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-val-sm">${item.quantity}</span>
                        <button class="qty-btn-sm" onclick="updateCartQuantity(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="remove-item-btn" onclick="removeCartItem(${index})" title="حذف"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
        DOM.cartItemsContainer.appendChild(cartItemEl);
    });

    DOM.cartBadge.innerText = badgeCount;
    DOM.cartSubtotal.innerText = `${subtotal.toFixed(1)} د.ل`;
    DOM.cartTotal.innerText = `${subtotal.toFixed(1)} د.ل`;
}

// --- Checkout Flow (WhatsApp Redirection with text-based shipping) ---
function openCheckoutFlow() {
    if (state.cart.length === 0) {
        showToast("السلة فارغة حالياً!", "error");
        return;
    }

    DOM.checkoutSummaryItems.innerHTML = "";
    let total = 0;
    
    state.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.name} ${item.size ? `(${item.size})` : ''} × ${item.quantity}</span>
            <span>${itemTotal.toFixed(1)} د.ل</span>
        `;
        DOM.checkoutSummaryItems.appendChild(li);
    });

    DOM.checkoutSummaryTotal.innerText = `${total.toFixed(1)} د.ل`;
    toggleCartDrawer(false);
    toggleModal(DOM.checkoutModal, true);
}

function handleCheckoutFormSubmit(e) {
    e.preventDefault();

    const name = DOM.custName.value.trim();
    const phone = DOM.custPhone.value.trim();
    const city = DOM.custCity.value;
    const address = DOM.custAddress.value.trim();

    const phoneRegex = /^09[12345][0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
        showToast("رقم الهاتف غير صحيح! يجب أن يبدأ بـ 09 ويتكون من 10 أرقام.", "error");
        return;
    }

    let subtotal = 0;
    state.cart.forEach(item => subtotal += (item.price * item.quantity));

    // Generate unique order ID
    const orderId = `BL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
        id: orderId,
        customer: { name, phone, city, address },
        items: [...state.cart],
        total: subtotal.toFixed(1),
        date: new Date().toLocaleDateString("ar-LY", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: "pending"
    };

    state.orders.unshift(newOrder);
    saveDataToLocalStorage();

    let itemsText = "";
    state.cart.forEach(item => {
        itemsText += `- *${item.name}* ${item.size ? `(مقاس: ${item.size})` : '(مقاس قياسي)'} | العدد: ${item.quantity} | السعر: ${item.price} د.ل\n`;
    });

    const whatsappMessage = 
`*طلبية جديدة من متجر BlackLook!* 🛍️
-----------------------------------
*رقم الطلب:* #${orderId}
*الاسم:* ${name}
*الهاتف:* ${phone}
*المدينة:* ${city}
*العنوان بالتفصيل:* ${address}

*المنتجات المطلوبة:*
${itemsText}
*توصيل الشحنة:* حسب المنطقة 🚚
*إجمالي المنتجات:* *${subtotal.toFixed(1)} د.ل*
*(ملاحظة: السعر لا يشمل تكلفة التوصيل)*
-----------------------------------
يرجى تأكيد الطلبية والشحن الفوري. وشكراً لكم!`;

    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
    
    showToast(`تم تسجيل الطلب رقم #${orderId}! جاري تحويلك للتأكيد...`, "success");
    
    // Clear cart
    state.cart = [];
    saveDataToLocalStorage();
    updateCartUI();
    
    // Reset and close checkout modal
    DOM.checkoutForm.reset();
    toggleModal(DOM.checkoutModal, false);
    
    // Re-render storefront and admin
    renderStorefront();
    renderAdminPanel();

    // AUTOMATIC ROUTING TO TRACKING PORTAL:
    // Open the tracking modal
    toggleModal(DOM.trackModal, true);
    // Put the new order ID in the input
    DOM.trackInput.value = orderId;
    // Render the tracking progress steps directly
    displayOrderTrackingResult(newOrder);
    
    // Open WhatsApp in a new tab after a brief delay
    setTimeout(() => {
        window.open(whatsappUrl, "_blank");
    }, 1200);
}

// --- Order Tracking Search & Rendering ---
function openTrackingPortal() {
    DOM.trackInput.value = "";
    DOM.trackResult.classList.add("hidden");
    toggleModal(DOM.trackModal, true);
}

function displayOrderTrackingResult(order) {
    DOM.trackResultId.innerText = `#${order.id}`;
    DOM.trackResultName.innerText = order.customer.name;
    DOM.trackResultAddress.innerText = `${order.customer.city} - ${order.customer.address}`;
    DOM.trackResultDate.innerText = order.date;
    DOM.trackResultTotal.innerText = `${order.total} د.ل`;

    const stepPending = document.getElementById("step-pending");
    const stepShipped = document.getElementById("step-shipped");
    const stepCompleted = document.getElementById("step-completed");
    const line1 = document.getElementById("line-1");
    const line2 = document.getElementById("line-2");

    const steps = [stepPending, stepShipped, stepCompleted];
    const lines = [line1, line2];

    steps.forEach(s => s.className = "track-step");
    lines.forEach(l => l.className = "track-line");
    DOM.trackResultCancelledNote.classList.add("hidden");

    const status = order.status;

    if (status === "pending") {
        stepPending.classList.add("active");
    } else if (status === "shipped") {
        stepPending.classList.add("active");
        line1.classList.add("active");
        stepShipped.classList.add("active");
    } else if (status === "completed") {
        stepPending.classList.add("active");
        line1.classList.add("active");
        stepShipped.classList.add("active");
        line2.classList.add("active");
        stepCompleted.classList.add("active");
    } else if (status === "cancelled") {
        steps.forEach(s => s.classList.add("cancelled"));
        DOM.trackResultCancelledNote.classList.remove("hidden");
    }

    DOM.trackResult.classList.remove("hidden");
}

function handleTrackingSearchSubmit(e) {
    e.preventDefault();
    let query = DOM.trackInput.value.trim().toUpperCase();

    if (query && !query.startsWith("BL-")) {
        query = "BL-" + query;
    }

    const order = state.orders.find(o => o.id === query);

    if (order) {
        displayOrderTrackingResult(order);
        showToast("تم العثور على الطلبية وتحديث حالتها!", "success");
    } else {
        DOM.trackResult.classList.add("hidden");
        showToast("لم نجد أي طلبية برقم التتبع هذا! يرجى التأكد وإعادة المحاولة.", "error");
    }
}

// --- Admin Product Forms CRUD ---
async function handleProductFormSubmit(e) {
    e.preventDefault();

    const editId = DOM.editProductId.value;
    const name = DOM.prodName.value.trim();
    const category = DOM.prodCategory.value;
    const price = parseFloat(DOM.prodPrice.value);
    const discountPriceInput = DOM.prodDiscountPrice.value;
    const discountPrice = discountPriceInput ? parseFloat(discountPriceInput) : null;
    const desc = DOM.prodDesc.value.trim();
    
    const sizes = DOM.prodSizes.value
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let imageSrc = state.tempBase64Image;

    if (editId) {
        const existingProd = state.products.find(p => p.id === editId);
        if (!existingProd) return;

        if (!imageSrc) {
            imageSrc = existingProd.image;
        }

        existingProd.name = name;
        existingProd.category = category;
        existingProd.price = price;
        existingProd.discountPrice = discountPrice;
        existingProd.sizes = sizes;
        existingProd.desc = desc;
        existingProd.image = imageSrc;

        showToast("تم تحديث المنتج بنجاح!");
    } else {
        if (!imageSrc) {
            showToast("يرجى اختيار صورة للمنتج!", "error");
            return;
        }

        const newProduct = {
            id: Date.now().toString(),
            name,
            category,
            price,
            discountPrice,
            sizes,
            desc,
            image: imageSrc
        };

// رفع وحفظ المنتج في قاعدة البيانات السحابية مباشرة
        await saveProductToCloud(newProduct);
        resetProductForm();
        if (typeof renderAdminPanel === 'function') renderAdminPanel();
}

function editProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    DOM.editProductId.value = product.id;
    DOM.formActionTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> تعديل المنتج: ${product.name}`;
    DOM.prodName.value = product.name;
    DOM.prodCategory.value = product.category;
    DOM.prodPrice.value = product.price;
    DOM.prodDiscountPrice.value = product.discountPrice || "";
    DOM.prodSizes.value = product.sizes ? product.sizes.join(", ") : "";
    DOM.prodDesc.value = product.desc;

    DOM.imagePreview.src = product.image;
    DOM.imagePreview.classList.remove("hidden");
    DOM.uploadArea.style.display = "none";

    DOM.btnSubmitProduct.innerHTML = `حفظ التعديلات <i class="fa-solid fa-check"></i>`;
    DOM.btnCancelEdit.classList.remove("hidden");

    document.querySelector(".form-column").scrollIntoView({ behavior: "smooth" });
}

function deleteProduct(productId) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟")) {
        state.products = state.products.filter(p => p.id !== productId);
        saveDataToLocalStorage();
        renderAdminPanel();
        renderStorefront();
        showToast("تم حذف المنتج بنجاح", "error");
    }
}

function resetProductForm() {
    DOM.productForm.reset();
    DOM.editProductId.value = "";
    DOM.formActionTitle.innerHTML = `<i class="fa-solid fa-circle-plus"></i> إضافة منتج جديد`;
    DOM.imagePreview.src = "#";
    DOM.imagePreview.classList.add("hidden");
    DOM.uploadArea.style.display = "flex";
    state.tempBase64Image = null;
    DOM.btnSubmitProduct.innerHTML = `حفظ وإضافة المنتج <i class="fa-solid fa-check"></i>`;
    DOM.btnCancelEdit.classList.add("hidden");
}

function changeOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    saveDataToLocalStorage();
    renderAdminPanel();
    showToast(`تم تغيير حالة الطلب #${orderId} إلى: ${getStatusText(newStatus)}`);
}

function getStatusText(status) {
    switch (status) {
        case "pending": return "قيد الانتظار";
        case "shipped": return "تم الشحن";
        case "completed": return "واصل";
        case "cancelled": return "ملغي";
        default: return status;
    }
}

function sendWhatsAppDirectReminder(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    let cleanPhone = order.customer.phone;
    if (cleanPhone.startsWith("0")) {
        cleanPhone = "218" + cleanPhone.substring(1);
    }

    const message = 
`أهلاً بك يا زبوننا الكريم *${order.customer.name}* 🌺
نحن من فريق دعم متجر *BlackLook*.
نود إبلاغك بخصوص طلبيتك رقم *#${order.id}* بمجموع *${order.total} د.ل* بأنها الآن: *${getStatusText(order.status)}*.
شكرًا لتسوقك معنا!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

// Global functions for inline HTML events
window.quickAddToCart = quickAddToCart;
window.openProductModal = openProductModal;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.changeOrderStatus = changeOrderStatus;
window.sendWhatsAppDirectReminder = sendWhatsAppDirectReminder;
window.revokeUserAccess = revokeUserAccess;
