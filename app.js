/* ========================================
   1. 유틸리티 함수
   ======================================== */
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getDday(expiry) {
  const today = new Date(getToday());
  const exp = new Date(expiry);
  return Math.ceil((exp - today) / 86400000);
}

function getDdayColor(d) {
  if (d < 0) return "var(--danger)";
  if (d <= 1) return "var(--coral)";
  if (d <= 3) return "var(--warning)";
  return "var(--success)";
}

function getDdayText(d) {
  if (d < 0) return "D+" + Math.abs(d);
  if (d === 0) return "D-Day";
  return "D-" + d;
}

function getDdayBadgeClass(d) {
  if (d < 0) return "badge-danger";
  if (d <= 3) return "badge-warning";
  return "badge-success";
}

function formatNum(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ========================================
   2. 데이터 관리 (LocalStorage)
   ======================================== */
function loadData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── 기본 샘플 데이터 ──
const DEFAULT_ITEMS = [
  { id: 1, name: "양파", category: "야채/과일", qty: "3개", expiry: getFutureDate(2) },
  { id: 2, name: "돼지고기 앞다리살", category: "육류/해산물", qty: "500g", expiry: getFutureDate(1) },
  { id: 3, name: "우유", category: "유제품", qty: "1L", expiry: getFutureDate(5) },
  { id: 4, name: "계란", category: "유제품", qty: "10개", expiry: getFutureDate(10) },
  { id: 5, name: "대파", category: "야채/과일", qty: "2단", expiry: getFutureDate(0) },
  { id: 6, name: "두부", category: "기타", qty: "1모", expiry: getFutureDate(3) },
  { id: 7, name: "고추장", category: "양념/소스", qty: "1통", expiry: getFutureDate(60) },
  { id: 8, name: "당근", category: "야채/과일", qty: "2개", expiry: getFutureDate(7) },
  { id: 9, name: "감자", category: "야채/과일", qty: "4개", expiry: getFutureDate(14) },
  { id: 10, name: "닭가슴살", category: "육류/해산물", qty: "300g", expiry: getFutureDate(-1) },
];

const RECIPES = [
  {
    id: 1, name: "돼지고기 양파볶음", time: "20분", difficulty: "쉬움", match: 95,
    ingredients: ["돼지고기 앞다리살", "양파", "대파", "고추장"],
    steps: ["돼지고기를 한입 크기로 썬다", "양파를 채 썬다", "팬에 기름을 두르고 돼지고기를 볶는다", "고기가 익으면 양파와 대파를 넣고 함께 볶는다", "고추장 1큰술을 넣고 간을 맞춘다"],
    desc: "냉장고 속 재료로 뚝딱! 아이들도 좋아하는 달콤한 양파볶음"
  },
  {
    id: 2, name: "두부 된장찌개", time: "25분", difficulty: "쉬움", match: 85,
    ingredients: ["두부", "양파", "대파", "감자"],
    steps: ["두부를 깍둑 썬다", "감자, 양파를 먹기 좋게 썬다", "냄비에 물을 붓고 된장을 풀어준다", "감자와 양파를 넣고 끓인다", "감자가 익으면 두부와 대파를 넣고 한소끔 끓인다"],
    desc: "구수한 된장찌개로 온 가족 속이 따뜻해지는 한 끼"
  },
  {
    id: 3, name: "당근 계란볶음밥", time: "15분", difficulty: "쉬움", match: 80,
    ingredients: ["계란", "당근", "대파"],
    steps: ["당근을 잘게 다진다", "계란을 풀어 스크램블한다", "밥과 당근을 넣고 함께 볶는다", "대파를 송송 썰어 넣는다", "간장으로 간을 맞추고 참기름을 두른다"],
    desc: "냉장고 파먹기의 정석! 간단하고 맛있는 볶음밥"
  },
];

const CATEGORIES = ["전체", "야채/과일", "육류/해산물", "유제품", "양념/소스", "음료", "기타"];
const BUDGET_CATS = ["식재료", "외식", "간식/음료", "배달", "기타"];
const AVATAR_COLORS = ["#1B8A6B", "#E85D3A", "#2B7BD5", "#D4537E", "#E69B00"];
const PIE_COLORS = ["#1B8A6B", "#E85D3A", "#2B7BD5", "#D4537E", "#E69B00"];

// ── 앱 상태 ──
let state = {
  items: loadData("fm_items", DEFAULT_ITEMS),
  shopping: loadData("fm_shopping", []),
  budget: loadData("fm_budget", 500000),
  expenses: loadData("fm_expenses", []),
  family: loadData("fm_family", []),
  currentPage: "home",
  editItem: null,
  selectedRecipe: null,
};

function save() {
  saveData("fm_items", state.items);
  saveData("fm_shopping", state.shopping);
  saveData("fm_budget", state.budget);
  saveData("fm_expenses", state.expenses);
  saveData("fm_family", state.family);
}

/* ========================================
   3. 네비게이션
   ======================================== */
function navigate(page, push = true) {
  state.currentPage = page;
  render();
  document.getElementById("main-content").scrollTop = 0;
  window.scrollTo(0, 0);

  // 하단 네비 활성화
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const p = btn.dataset.page;
    const isActive =
      p === page ||
      (p === "fridge" && page === "fridgeAdd") ||
      (p === "recipe" && page === "recipeDetail");
    btn.classList.toggle("active", isActive);
  });

  // 방문 기록 저장 (브라우저/스마트폰 뒤로가기 버튼 지원)
  // push=false 는 뒤로가기(popstate)로 호출된 경우라 기록을 또 쌓지 않음
  if (push) {
    const snapshot = {
      page,
      editItem: state.editItem,
      selectedRecipe: state.selectedRecipe,
    };
    history.pushState(snapshot, "", "#" + page);
  }
}

/* ========================================
   4. 페이지 렌더링 함수들
   ======================================== */

// ────────────────────────────────────
// 4-1. 홈 페이지
// ────────────────────────────────────
function renderHome() {
  const urgent = [...state.items]
    .map((i) => ({ ...i, dday: getDday(i.expiry) }))
    .filter((i) => i.dday <= 3)
    .sort((a, b) => a.dday - b.dday)
    .slice(0, 5);

  const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
  const pct = state.budget > 0 ? Math.min(100, (totalSpent / state.budget) * 100) : 0;

  let urgentHTML = "";
  if (urgent.length > 0) {
    urgentHTML = `
      <div class="px-16 mt-16">
        <div class="section-header">
          <h3 class="section-title" style="color:var(--coral)">
            <i class="ti ti-alert-triangle"></i> 유통기한 임박
          </h3>
          <button class="section-link" onclick="navigate('fridge')">전체보기 <i class="ti ti-chevron-right" style="font-size:12px"></i></button>
        </div>
        <div class="urgent-scroll">
          ${urgent.map((it) => `
            <div class="urgent-card">
              <span class="badge ${getDdayBadgeClass(it.dday)}">${getDdayText(it.dday)}</span>
              <p class="name">${it.name}</p>
              <p class="qty">${it.qty}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="home-hero">
      <p class="subtitle">안녕하세요!</p>
      <h2>냉장고 매니저 <span>FridgeMate</span></h2>
      <p class="desc">우리 집 냉장고를 한눈에 관리하세요</p>
    </div>

    ${urgentHTML}

    <div class="px-16 mt-20">
      <div class="section-header">
        <h3 class="section-title"><i class="ti ti-chef-hat" style="color:var(--coral)"></i> 오늘의 추천 레시피</h3>
      </div>
      <div class="home-recommend" onclick="state.selectedRecipe=RECIPES[0]; navigate('recipeDetail')">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4>${RECIPES[0].name}</h4>
          <span class="match">재료 ${RECIPES[0].match}% 보유</span>
        </div>
        <p class="desc">${RECIPES[0].desc}</p>
      </div>
    </div>

    <div class="stat-grid">
      <button class="stat-card" style="background:var(--primary-light)" onclick="navigate('fridge')">
        <i class="ti ti-fridge" style="color:var(--primary)"></i>
        <p class="number" style="color:var(--primary)">${state.items.length}</p>
        <p class="label">냉장고 재료</p>
      </button>
      <button class="stat-card" style="background:var(--blue-light)" onclick="navigate('budget')">
        <i class="ti ti-chart-pie" style="color:var(--blue)"></i>
        <p class="number" style="color:var(--blue)">${state.budget > 0 ? Math.round(pct) + "%" : "미설정"}</p>
        <p class="label">이번 달 예산 사용</p>
      </button>
    </div>

    <div class="quick-grid">
      <button class="quick-btn" style="background:var(--coral-light)" onclick="navigate('recipe')">
        <i class="ti ti-chef-hat" style="color:var(--coral)"></i>
        <p style="color:var(--coral)">뭐 해먹지?</p>
      </button>
      <button class="quick-btn" style="background:var(--amber-light)" onclick="navigate('shopping')">
        <i class="ti ti-shopping-cart" style="color:var(--amber)"></i>
        <p style="color:var(--amber-dark)">장보기 목록</p>
      </button>
    </div>
  `;
}

// ────────────────────────────────────
// 4-2. 냉장고 재료 목록
// ────────────────────────────────────
let fridgeFilter = "전체";
let fridgeSearch = "";

function renderFridge() {
  const filtered = state.items
    .filter((i) => (fridgeFilter === "전체" || i.category === fridgeFilter) && i.name.includes(fridgeSearch))
    .sort((a, b) => getDday(a.expiry) - getDday(b.expiry));

  return `
    <header class="page-header">
      <h1>냉장고 재료</h1>
      <button class="btn-header" style="background:var(--primary)" onclick="state.editItem=null; navigate('fridgeAdd')">
        <i class="ti ti-plus"></i> 추가
      </button>
    </header>
    <div class="px-16" style="padding-top:12px;padding-bottom:8px">
      <div class="search-box">
        <i class="ti ti-search"></i>
        <input placeholder="재료 검색..." value="${fridgeSearch}" oninput="fridgeSearch=this.value; render()">
      </div>
      <div class="category-tabs">
        ${CATEGORIES.map((c) => `
          <button class="cat-btn ${fridgeFilter === c ? "active" : ""}" onclick="fridgeFilter='${c}'; render()">${c}</button>
        `).join("")}
      </div>
    </div>
    <div class="px-16 pb-100">
      ${filtered.length === 0 ? '<div class="empty-state"><i class="ti ti-fridge"></i><p>등록된 재료가 없습니다</p></div>' : ""}
      ${filtered.map((it) => {
        const d = getDday(it.expiry);
        return `
          <div class="fridge-item" onclick="state.editItem=${JSON.stringify(it).replace(/"/g, "&quot;")}; navigate('fridgeAdd')">
            <div class="color-bar" style="background:${getDdayColor(d)}"></div>
            <div class="info">
              <div class="name-row">
                <span class="name">${it.name}</span>
                <span class="dday" style="color:${getDdayColor(d)}">${getDdayText(d)}</span>
              </div>
              <div class="meta">
                <span>${it.category}</span>
                <span>|</span>
                <span>${it.qty}</span>
                <span>|</span>
                <span>${it.expiry}</span>
              </div>
            </div>
            <i class="ti ti-chevron-right" style="color:var(--gray);font-size:16px;margin-left:8px"></i>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ────────────────────────────────────
// 4-3. 재료 등록/수정
// ────────────────────────────────────
function renderFridgeAdd() {
  const item = state.editItem;
  const isEdit = item !== null;

  return `
    <header class="page-header">
      <button class="btn-back" onclick="navigate('fridge')"><i class="ti ti-arrow-left"></i></button>
      <h1>${isEdit ? "재료 수정" : "재료 등록"}</h1>
    </header>
    <div class="px-16 pb-100" style="padding-top:20px">
      <div class="form-group">
        <label class="input-label">재료명 *</label>
        <input id="inp-name" class="input-field" placeholder="예: 양파" value="${isEdit ? item.name : ""}">
      </div>
      <div class="form-group">
        <label class="input-label">카테고리</label>
        <select id="inp-cat" class="input-field" style="appearance:auto">
          ${CATEGORIES.filter((c) => c !== "전체").map((c) => `<option value="${c}" ${isEdit && item.category === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="input-label">수량</label>
        <input id="inp-qty" class="input-field" placeholder="예: 3개, 500g" value="${isEdit ? item.qty : ""}">
      </div>
      <div class="form-group">
        <label class="input-label">유통기한</label>
        <input id="inp-expiry" type="date" class="input-field" value="${isEdit ? item.expiry : getToday()}">
      </div>
      <button class="btn-primary" onclick="saveFridgeItem()">${isEdit ? "수정 완료" : "등록하기"}</button>
      ${isEdit ? `<button class="btn-danger-outline" onclick="deleteFridgeItem(${item.id})">삭제하기</button>` : ""}
    </div>
  `;
}

function saveFridgeItem() {
  const name = document.getElementById("inp-name").value.trim();
  const category = document.getElementById("inp-cat").value;
  const qty = document.getElementById("inp-qty").value.trim();
  const expiry = document.getElementById("inp-expiry").value;

  if (!name) return alert("재료명을 입력해주세요");

  if (state.editItem) {
    state.items = state.items.map((i) =>
      i.id === state.editItem.id ? { ...i, name, category, qty, expiry } : i
    );
  } else {
    state.items.push({ id: Date.now(), name, category, qty, expiry });
  }
  save();
  navigate("fridge");
}

function deleteFridgeItem(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  state.items = state.items.filter((i) => i.id !== id);
  save();
  navigate("fridge");
}

// ────────────────────────────────────
// 4-4. AI 레시피 추천
// ────────────────────────────────────
function renderRecipe() {
  const tagsHTML = state.items
    .slice(0, 6)
    .map((i) => `<span class="tag">${i.name}</span>`)
    .join("");
  const extra = state.items.length > 6 ? `<span class="label">+${state.items.length - 6}개</span>` : "";

  return `
    <header class="page-header"><h1>AI 레시피 추천</h1></header>
    <div class="px-16 pb-100" style="padding-top:16px">
      <div class="recipe-hero">
        <p class="sub">냉장고 속 재료로</p>
        <h2>오늘 뭐 해먹지?</h2>
        <button class="btn-recommend" onclick="showRecipeLoading()">
          <i class="ti ti-sparkles"></i> AI 추천 받기
        </button>
        ${state.family.length > 0 ? '<p class="note">가족 선호/알레르기가 자동 반영됩니다</p>' : ""}
      </div>

      <div class="ingredient-tags">
        <span class="label">보유 재료:</span>
        ${tagsHTML}
        ${extra}
      </div>

      <div id="recipe-list">
        ${renderRecipeCards()}
      </div>
    </div>
  `;
}

function renderRecipeCards() {
  return RECIPES.map((r) => `
    <div class="recipe-card" onclick='state.selectedRecipe=${JSON.stringify(r).replace(/'/g, "\\'")}; navigate("recipeDetail")'>
      <div class="top">
        <div>
          <h3>${r.name}</h3>
          <p class="desc">${r.desc}</p>
        </div>
        <span class="match">${r.match}%</span>
      </div>
      <div class="meta-row">
        <span><i class="ti ti-clock"></i> ${r.time}</span>
        <span><i class="ti ti-star"></i> ${r.difficulty}</span>
      </div>
    </div>
  `).join("");
}

function showRecipeLoading() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>AI가 레시피를 찾고 있어요...</p>
    </div>
  `;
  setTimeout(() => {
    list.innerHTML = renderRecipeCards();
  }, 1200);
}

// ────────────────────────────────────
// 4-5. 레시피 상세
// ────────────────────────────────────
function renderRecipeDetail() {
  const r = state.selectedRecipe;
  if (!r) return "<p>레시피를 선택해주세요</p>";

  const owned = r.ingredients.map((ing) => ({
    name: ing,
    has: state.items.some((i) => i.name.includes(ing.split(" ")[0])),
  }));
  const missing = owned.filter((o) => !o.has);

  return `
    <header class="page-header">
      <button class="btn-back" onclick="navigate('recipe')"><i class="ti ti-arrow-left"></i></button>
      <h1>레시피 상세</h1>
    </header>
    <div class="px-16 pb-100" style="padding-top:16px">
      <div class="recipe-detail-hero">
        <h2>${r.name}</h2>
        <p class="desc">${r.desc}</p>
        <div class="meta">
          <span><i class="ti ti-clock"></i> ${r.time}</span>
          <span><i class="ti ti-star"></i> ${r.difficulty}</span>
          <span style="font-weight:600">재료 ${r.match}% 보유</span>
        </div>
      </div>

      <h3 class="section-title-h3">필요 재료</h3>
      ${owned.map((o) => `
        <div class="ingredient-row">
          <span class="icon">${o.has ? "✅" : "❌"}</span>
          <span class="name ${o.has ? "" : "missing"}">${o.name}</span>
          ${!o.has ? '<span class="badge badge-danger" style="margin-left:auto">미보유</span>' : ""}
        </div>
      `).join("")}

      ${missing.length > 0 ? `
        <button class="btn-add-shopping" onclick="addMissingToShopping()">
          <i class="ti ti-shopping-cart"></i> 부족한 재료 ${missing.length}개 장보기에 추가
        </button>
      ` : ""}

      <h3 class="section-title-h3" style="margin-top:24px">조리 순서</h3>
      ${r.steps.map((s, i) => `
        <div class="step-row">
          <span class="step-num">${i + 1}</span>
          <p class="step-text">${s}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function addMissingToShopping() {
  const r = state.selectedRecipe;
  if (!r) return;
  const missing = r.ingredients.filter(
    (ing) => !state.items.some((i) => i.name.includes(ing.split(" ")[0]))
  );
  let added = 0;
  missing.forEach((name) => {
    if (!state.shopping.some((s) => s.name === name)) {
      state.shopping.push({ id: Date.now() + Math.random(), name, checked: false });
      added++;
    }
  });
  save();
  alert(added + "개 재료가 장보기 목록에 추가되었습니다!");
}

// ────────────────────────────────────
// 4-6. 장보기 목록
// ────────────────────────────────────
function renderShopping() {
  const unchecked = state.shopping.filter((s) => !s.checked);
  const checked = state.shopping.filter((s) => s.checked);

  let contentHTML = "";
  if (state.shopping.length === 0) {
    contentHTML = `
      <div class="empty-state">
        <i class="ti ti-shopping-cart"></i>
        <p>장보기 목록이 비어있어요</p>
        <p class="sub">직접 추가하거나 레시피에서 자동 추가해 보세요</p>
      </div>
    `;
  } else {
    if (unchecked.length > 0) {
      contentHTML += `<p class="shopping-section-label">구매 예정 (${unchecked.length})</p>`;
      contentHTML += unchecked.map((s) => `
        <div class="shopping-item">
          <button class="check-btn" onclick="toggleShopping(${s.id})"></button>
          <span class="name">${s.name}</span>
          <button class="btn-remove" onclick="removeShopping(${s.id})"><i class="ti ti-x"></i></button>
        </div>
      `).join("");
    }
    if (checked.length > 0) {
      contentHTML += `<p class="shopping-section-label">구매 완료 (${checked.length})</p>`;
      contentHTML += checked.map((s) => `
        <div class="shopping-item checked">
          <button class="check-btn done" onclick="toggleShopping(${s.id})"><i class="ti ti-check"></i></button>
          <span class="name">${s.name}</span>
          <button class="btn-remove" onclick="removeShopping(${s.id})"><i class="ti ti-x"></i></button>
        </div>
      `).join("");
    }
  }

  const hasChecked = checked.length > 0;

  return `
    <header class="page-header">
      <h1>장보기 목록</h1>
      ${hasChecked ? '<button class="btn-clear-checked" onclick="clearCheckedShopping()">완료 항목 삭제</button>' : ""}
    </header>
    <div class="px-16 pb-100" style="padding-top:16px">
      <div class="shopping-input-row">
        <input id="inp-shopping" placeholder="추가할 재료 입력..." onkeydown="if(event.key==='Enter')addShoppingItem()">
        <button class="btn-add-item" onclick="addShoppingItem()">추가</button>
      </div>
      ${contentHTML}
    </div>
  `;
}

function addShoppingItem() {
  const inp = document.getElementById("inp-shopping");
  const name = inp.value.trim();
  if (!name) return;
  state.shopping.push({ id: Date.now(), name, checked: false });
  save();
  render();
  // 포커스 유지
  setTimeout(() => {
    const newInp = document.getElementById("inp-shopping");
    if (newInp) newInp.focus();
  }, 50);
}

function toggleShopping(id) {
  state.shopping = state.shopping.map((s) =>
    s.id === id ? { ...s, checked: !s.checked } : s
  );
  save();
  render();
}

function removeShopping(id) {
  state.shopping = state.shopping.filter((s) => s.id !== id);
  save();
  render();
}

function clearCheckedShopping() {
  state.shopping = state.shopping.filter((s) => !s.checked);
  save();
  render();
}

// ────────────────────────────────────
// 4-7. 식비 예산 관리
// ────────────────────────────────────
let showExpenseForm = false;
let showBudgetEdit = false;
let budgetChart = null;

function renderBudget() {
  const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = state.budget - totalSpent;
  const pct = state.budget > 0 ? Math.min(100, (totalSpent / state.budget) * 100) : 0;
  const barColor = pct > 90 ? "var(--danger)" : "var(--blue)";
  const remainColor = remaining >= 0 ? "var(--success)" : "var(--danger)";

  const budgetDisplay = showBudgetEdit
    ? `<div class="budget-edit-row">
         <input id="inp-budget" type="number" placeholder="예산 입력" value="${state.budget}">
         <button onclick="saveBudgetAmount()">저장</button>
       </div>`
    : `<p class="budget-amount">${formatNum(state.budget)}원</p>`;

  const expenseFormHTML = showExpenseForm
    ? `<div class="card expense-form">
         <h3>지출 기록 추가</h3>
         <input id="inp-exp-amt" type="number" placeholder="금액 (원)">
         <select id="inp-exp-cat">
           ${BUDGET_CATS.map((c) => `<option value="${c}">${c}</option>`).join("")}
         </select>
         <input id="inp-exp-memo" placeholder="메모 (선택)">
         <button class="btn-record" onclick="addExpense()">기록하기</button>
       </div>`
    : "";

  // 카테고리별 데이터
  const catData = BUDGET_CATS.map((c) => ({
    name: c,
    value: state.expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0);

  const chartHTML = catData.length > 0
    ? `<div class="card">
         <h3 class="section-title-h3" style="margin-bottom:8px">카테고리별 지출</h3>
         <div class="chart-container"><canvas id="budget-chart"></canvas></div>
       </div>`
    : "";

  const expenseListHTML = [...state.expenses].reverse().map((e) => `
    <div class="expense-row">
      <div class="info">
        <span class="memo">${e.memo || e.category}</span>
        <div class="meta">${e.category} · ${e.date}</div>
      </div>
      <span class="amount">${formatNum(e.amount)}원</span>
    </div>
  `).join("");

  return `
    <header class="page-header">
      <h1>식비 예산 관리</h1>
      <button class="btn-header" style="background:var(--blue)" onclick="showExpenseForm=!showExpenseForm; render()">
        <i class="ti ti-plus"></i> 지출 기록
      </button>
    </header>
    <div class="px-16 pb-100" style="padding-top:16px">
      <div class="budget-summary">
        <div class="top-row">
          <span class="label">이번 달 예산</span>
          <button class="btn-edit-budget" onclick="showBudgetEdit=!showBudgetEdit; render()">
            <i class="ti ti-edit"></i> 수정
          </button>
        </div>
        ${budgetDisplay}
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%; background:${barColor}"></div>
        </div>
        <div class="budget-footer">
          <span class="spent">지출: ${formatNum(totalSpent)}원 (${Math.round(pct)}%)</span>
          <span class="remain" style="color:${remainColor}">잔여: ${formatNum(remaining)}원</span>
        </div>
      </div>

      ${expenseFormHTML}
      ${chartHTML}

      <h3 class="section-title-h3">지출 내역</h3>
      ${state.expenses.length === 0 ? '<p class="empty-state" style="padding:20px 0"><p style="font-size:14px">아직 지출 기록이 없어요</p></p>' : expenseListHTML}
    </div>
  `;
}

function renderBudgetChart() {
  const catData = BUDGET_CATS.map((c) => ({
    name: c,
    value: state.expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0);

  if (catData.length === 0) return;

  const canvas = document.getElementById("budget-chart");
  if (!canvas) return;

  if (budgetChart) budgetChart.destroy();

  budgetChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: catData.map((d) => d.name),
      datasets: [{
        data: catData.map((d) => d.value),
        backgroundColor: PIE_COLORS.slice(0, catData.length),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 12 }, padding: 12 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatNum(ctx.raw)}원`,
          },
        },
      },
    },
  });
}

function saveBudgetAmount() {
  const val = Number(document.getElementById("inp-budget").value);
  if (isNaN(val) || val < 0) return alert("올바른 금액을 입력해주세요");
  state.budget = val;
  showBudgetEdit = false;
  save();
  render();
}

function addExpense() {
  const amt = Number(document.getElementById("inp-exp-amt").value);
  const cat = document.getElementById("inp-exp-cat").value;
  const memo = document.getElementById("inp-exp-memo").value.trim();

  if (!amt || isNaN(amt)) return alert("금액을 입력해주세요");

  state.expenses.push({ id: Date.now(), amount: amt, category: cat, memo, date: getToday() });
  showExpenseForm = false;
  save();
  render();
}

// ────────────────────────────────────
// 4-8. 가족 프로필
// ────────────────────────────────────
let showFamilyForm = false;
let familyEditId = null;

function renderFamily() {
  const formHTML = showFamilyForm
    ? `<div class="family-form">
         <h3>${familyEditId ? "가족 수정" : "가족 추가"}</h3>
         <label class="form-label">이름 *</label>
         <input id="inp-fm-name" placeholder="예: 김하은" value="${getFamilyField("name")}">
         <label class="form-label">나이</label>
         <input id="inp-fm-age" type="number" placeholder="예: 8" value="${getFamilyField("age")}">
         <label class="form-label">알레르기</label>
         <input id="inp-fm-allergy" placeholder="예: 새우, 땅콩" value="${getFamilyField("allergy")}">
         <label class="form-label">좋아하는 음식</label>
         <input id="inp-fm-likes" placeholder="예: 치킨, 떡볶이" value="${getFamilyField("likes")}">
         <label class="form-label">싫어하는 음식</label>
         <input id="inp-fm-dislikes" placeholder="예: 당근, 피망" value="${getFamilyField("dislikes")}">
         <div class="btn-row">
           <button class="btn-cancel" onclick="showFamilyForm=false; render()">취소</button>
           <button class="btn-save" onclick="saveFamilyMember()">저장</button>
         </div>
       </div>`
    : "";

  const cardsHTML = state.family.map((m, idx) => `
    <div class="family-card">
      <div class="top-row">
        <div class="avatar" style="background:${AVATAR_COLORS[idx % AVATAR_COLORS.length]}">${m.name[0]}</div>
        <div class="name-area">
          <span class="member-name">${m.name}</span>
          ${m.age ? `<span class="member-age">${m.age}세</span>` : ""}
        </div>
        <button class="btn-icon" style="color:var(--blue)" onclick="editFamilyMember(${m.id})"><i class="ti ti-edit"></i></button>
        <button class="btn-icon" style="color:var(--danger)" onclick="deleteFamilyMember(${m.id})"><i class="ti ti-trash"></i></button>
      </div>
      ${m.allergy ? `<div class="detail-row"><span class="detail-label" style="color:var(--danger)">알레르기:</span> <span class="detail-value">${m.allergy}</span></div>` : ""}
      ${m.likes ? `<div class="detail-row"><span class="detail-label" style="color:var(--success)">좋아하는 음식:</span> <span class="detail-value">${m.likes}</span></div>` : ""}
      ${m.dislikes ? `<div class="detail-row"><span class="detail-label" style="color:var(--coral)">싫어하는 음식:</span> <span class="detail-value">${m.dislikes}</span></div>` : ""}
    </div>
  `).join("");

  return `
    <header class="page-header">
      <h1>가족 프로필</h1>
      <button class="btn-header" style="background:var(--pink)" onclick="familyEditId=null; showFamilyForm=true; render()">
        <i class="ti ti-plus"></i> 추가
      </button>
    </header>
    <div class="px-16 pb-100" style="padding-top:16px">
      <p class="family-desc">가족 구성원의 선호와 알레르기 정보를 등록하면 AI 레시피 추천에 자동으로 반영됩니다.</p>
      ${state.family.length === 0 && !showFamilyForm
        ? '<div class="empty-state"><i class="ti ti-users"></i><p>등록된 가족이 없어요</p></div>'
        : ""}
      ${cardsHTML}
      ${formHTML}
    </div>
  `;
}

function getFamilyField(field) {
  if (!familyEditId) return "";
  const m = state.family.find((f) => f.id === familyEditId);
  return m ? m[field] || "" : "";
}

function editFamilyMember(id) {
  familyEditId = id;
  showFamilyForm = true;
  render();
}

function saveFamilyMember() {
  const name = document.getElementById("inp-fm-name").value.trim();
  const age = document.getElementById("inp-fm-age").value.trim();
  const allergy = document.getElementById("inp-fm-allergy").value.trim();
  const likes = document.getElementById("inp-fm-likes").value.trim();
  const dislikes = document.getElementById("inp-fm-dislikes").value.trim();

  if (!name) return alert("이름을 입력해주세요");

  if (familyEditId) {
    state.family = state.family.map((m) =>
      m.id === familyEditId ? { ...m, name, age, allergy, likes, dislikes } : m
    );
  } else {
    state.family.push({ id: Date.now(), name, age, allergy, likes, dislikes });
  }
  showFamilyForm = false;
  familyEditId = null;
  save();
  render();
}

function deleteFamilyMember(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  state.family = state.family.filter((m) => m.id !== id);
  save();
  render();
}

/* ========================================
   5. 메인 렌더 함수
   ======================================== */
function render() {
  const main = document.getElementById("main-content");
  const page = state.currentPage;

  switch (page) {
    case "home":        main.innerHTML = renderHome(); break;
    case "fridge":      main.innerHTML = renderFridge(); break;
    case "fridgeAdd":   main.innerHTML = renderFridgeAdd(); break;
    case "recipe":      main.innerHTML = renderRecipe(); break;
    case "recipeDetail":main.innerHTML = renderRecipeDetail(); break;
    case "shopping":    main.innerHTML = renderShopping(); break;
    case "budget":      main.innerHTML = renderBudget(); break;
    case "family":      main.innerHTML = renderFamily(); break;
    default:            main.innerHTML = renderHome();
  }

  // 예산 페이지 차트 렌더링 (DOM 생성 후)
  if (page === "budget") {
    setTimeout(renderBudgetChart, 100);
  }
}

/* ========================================
   6. 초기화
   ======================================== */
document.addEventListener("DOMContentLoaded", () => {
  // 하단 네비 이벤트
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.page);
    });
  });

  // 뒤로가기 버튼 처리: 브라우저/스마트폰의 뒤로(또는 앞으로) 가기를 누르면
  // 저장해 둔 방문 기록(snapshot)을 꺼내 해당 화면으로 되돌림
  window.addEventListener("popstate", (e) => {
    const snapshot = e.state;
    if (snapshot && snapshot.page) {
      state.editItem = snapshot.editItem || null;
      state.selectedRecipe = snapshot.selectedRecipe || null;
      navigate(snapshot.page, false); // false: 기록을 다시 쌓지 않음
    } else {
      navigate("home", false);
    }
  });

  // 첫 화면을 방문 기록의 시작점으로 등록 (홈에서 뒤로가기 시 기준점)
  history.replaceState({ page: "home", editItem: null, selectedRecipe: null }, "", "#home");

  // 첫 화면 렌더
  render();
});
