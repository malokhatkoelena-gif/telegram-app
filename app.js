const tg = window.Telegram?.WebApp;

const products = [
  {
    id: "vanilla-powder",
    name: "Vanilla Powder",
    brand: "Matiere Premiere",
    gender: "unisex",
    mood: ["пудровый", "ваниль", "вечер", "подарок"],
    notes: "ваниль, мягкая пудра, бархатный шлейф, сливочная база",
    description: "Аромат-личная подпись: мягко-пудровая ваниль с бархатной, немного хищной посадкой. Будто вы в лучах софитов, принимаете аплодисменты и чувствуете абсолютную уверенность.",
    image: "./assets/vanilla-powder.jpg",
    toneA: "#efe6d6",
    toneB: "#7f2639",
  },
  {
    id: "amouage-guidance",
    name: "Guidance",
    brand: "Amouage",
    gender: "female",
    mood: ["тренд", "розовый букет", "фрукты", "древесный", "подарок"],
    notes: "розовый букет, фруктовые акценты, древесная база, объемный шлейф",
    description: "Любимец всея Руси и триумфатор парижской выставки. Guidance звучит как объемный, насыщенный розовый букет с фруктовыми и древесными акцентами.",
    image: "./assets/amouage-guidance.jpeg",
    toneA: "#d89b9a",
    toneB: "#7f2639",
  },
  {
    id: "cedar-noir",
    name: "Cedar Noir",
    gender: "male",
    mood: ["деловой", "стойкий", "подарок"],
    notes: "кедр, кожа, перец, ветивер",
    description: "Собранный древесный аромат с кожаным акцентом. Звучит уверенно, чисто и дорого.",
    toneA: "#c5aa86",
    toneB: "#473329",
  },
  {
    id: "fig-silk",
    name: "Fig Silk",
    gender: "unisex",
    mood: ["день", "легкий", "унисекс"],
    notes: "инжир, зеленые листья, сандал, белый чай",
    description: "Мягкий дневной аромат с зеленой свежестью и кремовой базой. Комфортный на каждый день.",
    toneA: "#d8d5ad",
    toneB: "#87966f",
  },
  {
    id: "amber-letter",
    name: "Amber Letter",
    gender: "female",
    mood: ["теплый", "вечер", "шлейф"],
    notes: "ваниль, амбра, ирис, бобы тонка",
    description: "Теплый гурманский аромат без лишней сладости. Нежный, уютный и очень шлейфовый.",
    toneA: "#f0d7a5",
    toneB: "#98663d",
  },
  {
    id: "marine-suit",
    name: "Marine Suit",
    gender: "male",
    mood: ["свежий", "офис", "день"],
    notes: "бергамот, морская соль, шалфей, мускус",
    description: "Свежий и аккуратный аромат для работы, поездок и теплого сезона. Не перегружает пространство.",
    toneA: "#b9d4d8",
    toneB: "#4c7380",
  },
  {
    id: "oud-cream",
    name: "Oud Cream",
    gender: "unisex",
    mood: ["премиум", "вечер", "подарок"],
    notes: "уд, сливочный сандал, шафран, розовый перец",
    description: "Глубокий нишевый аромат для тех, кто любит необычное звучание и роскошную базу.",
    toneA: "#ddc2a1",
    toneB: "#5e1b2a",
  },
];

const state = {
  route: "home",
  catalogFilter: "all",
  search: "",
  recommendedIds: null,
  favorites: migrateFavorites(read("bellaVitaFavorites", [])),
  cart: migrateFavorites(read("bellaVitaCart", [])),
  profile: read("bellaVitaProfile", null),
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const pickerModal = document.querySelector("#pickerModal");
const pickerQuestions = [
  {
    id: "gender",
    eyebrow: "Вопрос 1 из 3",
    title: "Для кого подбираем аромат?",
    subtitle: "Так мы сразу покажем более точные рекомендации.",
    options: [
      { label: "Для нее", value: "female" },
      { label: "Для него", value: "male" },
    ],
  },
  {
    id: "gift",
    eyebrow: "Вопрос 2 из 3",
    title: "Это подарок?",
    subtitle: "Подарочные ароматы выбираем более универсальными и эффектными.",
    options: [
      { label: "Да", value: "yes" },
      { label: "Нет", value: "no" },
    ],
  },
  {
    id: "mood",
    eyebrow: "Вопрос 3 из 3",
    title: "Какое настроение хочется?",
    subtitle: "Если сомневаетесь, выбирайте то, что ближе по ощущению.",
    options: [
      { label: "Свежий", value: "fresh" },
      { label: "Нежный", value: "soft" },
      { label: "Яркий", value: "bright" },
      { label: "Теплый", value: "warm" },
    ],
  },
];
const pickerState = {
  step: 0,
  answers: {},
};

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateFavorites(favorites) {
  const migrated = favorites.map((id) => (id === "rose-velvet" ? "vanilla-powder" : id));
  return [...new Set(migrated)];
}

function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#f5eadc");
  tg.setBackgroundColor("#f7efe5");
}

function routeTo(route, options = {}) {
  state.route = route;
  if (options.filter) state.catalogFilter = options.filter;
  if (options.clearRecommendations) state.recommendedIds = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  const template = document.querySelector(`#${state.route}Template`);
  app.replaceChildren(template.content.cloneNode(true));
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.route === state.route);
  });

  if (state.route === "home") renderHome();
  if (state.route === "catalog") renderCatalog();
  if (state.route === "profile") renderProfile();
}

function renderHome() {
  renderProducts(document.querySelector("#featuredList"), products.slice(0, 3));

  document.querySelector("[data-action='start-picker']").addEventListener("click", () => {
    openPicker();
  });

  document.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", () => routeTo("catalog", { filter: choice.dataset.filter, clearRecommendations: true }));
  });
}

function renderCatalog() {
  const filtered = getFilteredProducts();
  document.querySelector("#catalogCount").textContent = state.recommendedIds ? `подобрано ${filtered.length}` : `${filtered.length} ароматов`;
  renderProducts(document.querySelector("#catalogList"), filtered);

  document.querySelectorAll("[data-catalog-filter]").forEach((button) => {
    button.classList.toggle("is-active", !state.recommendedIds && button.dataset.catalogFilter === state.catalogFilter);
    button.addEventListener("click", () => {
      state.recommendedIds = null;
      state.catalogFilter = button.dataset.catalogFilter;
      renderCatalog();
    });
  });

  const searchInput = document.querySelector("#searchInput");
  searchInput.value = state.search;
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderCatalog();
    document.querySelector("#searchInput").focus();
  });
}

function getFilteredProducts() {
  const query = state.search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesRecommendation = !state.recommendedIds || state.recommendedIds.includes(product.id);
    const matchesFilter =
      state.catalogFilter === "all" ||
      product.gender === state.catalogFilter ||
      product.mood.includes(state.catalogFilter);
    const searchable = `${product.name} ${product.notes} ${product.description}`.toLowerCase();
    return matchesRecommendation && matchesFilter && (!query || searchable.includes(query));
  });
  if (!state.recommendedIds) return filtered;
  return filtered.sort((a, b) => state.recommendedIds.indexOf(a.id) - state.recommendedIds.indexOf(b.id));
}

function openPicker() {
  pickerState.step = 0;
  pickerState.answers = {};
  pickerModal.classList.add("is-visible");
  pickerModal.setAttribute("aria-hidden", "false");
  renderPicker();
}

function closePicker() {
  pickerModal.classList.remove("is-visible");
  pickerModal.setAttribute("aria-hidden", "true");
  pickerModal.innerHTML = "";
}

function renderPicker() {
  const question = pickerQuestions[pickerState.step];
  pickerModal.innerHTML = `
    <div class="picker-backdrop" data-picker-close></div>
    <section class="picker-sheet" role="dialog" aria-modal="true" aria-labelledby="pickerTitle">
      <div class="picker-header">
        <span class="soft-label">${question.eyebrow}</span>
        <button class="icon-button picker-close" type="button" data-picker-close aria-label="Закрыть">×</button>
      </div>
      <h2 id="pickerTitle">${question.title}</h2>
      <p>${question.subtitle}</p>
      <div class="picker-options">
        ${question.options.map((option) => `<button class="picker-option" type="button" data-picker-value="${option.value}">${option.label}</button>`).join("")}
      </div>
    </section>
  `;

  pickerModal.querySelectorAll("[data-picker-close]").forEach((button) => {
    button.addEventListener("click", closePicker);
  });
  pickerModal.querySelectorAll("[data-picker-value]").forEach((button) => {
    button.addEventListener("click", () => answerPickerQuestion(question.id, button.dataset.pickerValue));
  });
}

function answerPickerQuestion(id, value) {
  pickerState.answers[id] = value;
  if (pickerState.step < pickerQuestions.length - 1) {
    pickerState.step += 1;
    renderPicker();
    return;
  }

  state.recommendedIds = pickRecommendedProducts(pickerState.answers).map((product) => product.id);
  state.catalogFilter = "all";
  state.search = "";
  closePicker();
  routeTo("catalog");
  showToast("Подобрали ароматы по вашим ответам");
}

function pickRecommendedProducts(answers) {
  const moodWords = {
    fresh: ["свежий", "легкий", "день", "офис", "бергамот", "чай", "морская"],
    soft: ["мяг", "неж", "пудр", "крем", "мускус", "инжир"],
    bright: ["тренд", "фрукты", "розовый", "шлейф", "вечер", "ягод"],
    warm: ["теплый", "ваниль", "амбра", "уд", "сандал", "кожа"],
  };

  return products
    .map((product) => {
      const text = `${product.name} ${product.brand || ""} ${product.mood.join(" ")} ${product.notes} ${product.description}`.toLowerCase();
      let score = 0;
      if (product.gender === answers.gender) score += 5;
      if (product.gender === "unisex") score += 3;
      if (answers.gift === "yes" && product.mood.includes("подарок")) score += 4;
      if (answers.gift === "no" && !product.mood.includes("подарок")) score += 1;
      (moodWords[answers.mood] || []).forEach((word) => {
        if (text.includes(word)) score += 2;
      });
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.product);
}

function renderProducts(container, items, options = {}) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">${options.emptyText || "Ничего не найдено. Попробуйте другой фильтр или ноту."}</div>`;
    return;
  }

  container.innerHTML = items.map((product) => productCard(product, options)).join("");
  container.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.id));
  });
  container.querySelectorAll(".cart-button").forEach((button) => {
    button.addEventListener("click", () => toggleCart(button.dataset.id));
  });
}

function productCard(product, options = {}) {
  const isFavorite = state.favorites.includes(product.id);
  const isInCart = state.cart.includes(product.id);
  const genderLabel = product.gender === "female" ? "женский" : product.gender === "male" ? "мужской" : "унисекс";
  const visual = product.image
    ? `<img class="product-photo" src="${product.image}" alt="${product.name} ${product.brand || ""}" />`
    : `<div class="bottle" style="--tone-a: ${product.toneA}; --tone-b: ${product.toneB};"></div>`;
  const brand = product.brand ? `<span class="brand-name">${product.brand}</span>` : "";
  const cartLabel = options.mode === "cart" ? "Убрать" : isInCart ? "Добавлено" : "Добавить";
  return `
    <article class="product-card">
      ${visual}
      <div class="product-info">
        <h4>${product.name}</h4>
        ${brand}
        <p>${product.description}</p>
        <div class="tag-row">
          <span class="tag">${genderLabel}</span>
          <span class="tag">${product.notes}</span>
        </div>
        <button class="cart-button ${isInCart ? "is-active" : ""}" type="button" data-id="${product.id}">${cartLabel}</button>
      </div>
      <button class="favorite-button ${isFavorite ? "is-active" : ""}" type="button" data-id="${product.id}" aria-label="В избранное">♡</button>
    </article>
  `;
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id)
    ? state.favorites.filter((item) => item !== id)
    : [...state.favorites, id];
  write("bellaVitaFavorites", state.favorites);
  showToast(state.favorites.includes(id) ? "Добавлено в избранное" : "Удалено из избранного");
  render();
}

function toggleCart(id) {
  const isInCart = state.cart.includes(id);
  state.cart = isInCart
    ? state.cart.filter((item) => item !== id)
    : [...state.cart, id];
  write("bellaVitaCart", state.cart);
  showToast(isInCart ? "Удалено из корзины" : "Добавлено в корзину");
  render();
}

function renderProfile() {
  const profile = state.profile;
  const name = profile?.name || profile?.firstName || "Гость";
  const telegram = profile?.telegram || profile?.username || "";
  const phone = profile?.phone || "";

  document.querySelector("#profileName").textContent = name;
  document.querySelector("#profileMeta").textContent = telegram ? `Telegram: ${telegram}` : "Войдите через Telegram, чтобы сохранить данные.";
  document.querySelector("#avatar").textContent = initials(name);
  document.querySelector("#authState").textContent = profile?.authorized ? "Выполнен" : "Не выполнен";
  document.querySelector("#nameInput").value = name === "Гость" ? "" : name;
  document.querySelector("#phoneInput").value = phone;
  document.querySelector("#telegramInput").value = telegram;

  const cartProducts = products.filter((product) => state.cart.includes(product.id));
  const favoriteProducts = products.filter((product) => state.favorites.includes(product.id));
  document.querySelector("#cartCount").textContent = `${cartProducts.length}`;
  document.querySelector("#favoriteCount").textContent = `${favoriteProducts.length}`;
  renderProducts(document.querySelector("#cartList"), cartProducts, {
    mode: "cart",
    emptyText: "Корзина пока пустая. Добавьте аромат из каталога.",
  });
  renderProducts(document.querySelector("#favoriteList"), favoriteProducts, {
    emptyText: "В избранном пока пусто.",
  });

  document.querySelector("#telegramLogin").addEventListener("click", authorizeTelegram);
  document.querySelector("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      ...state.profile,
      name: document.querySelector("#nameInput").value.trim(),
      phone: document.querySelector("#phoneInput").value.trim(),
      telegram: document.querySelector("#telegramInput").value.trim(),
      authorized: Boolean(state.profile?.authorized),
    };
    write("bellaVitaProfile", state.profile);
    showToast("Данные сохранены");
    renderProfile();
  });
}

function authorizeTelegram() {
  const user = tg?.initDataUnsafe?.user;
  if (user) {
    state.profile = {
      name: [user.first_name, user.last_name].filter(Boolean).join(" "),
      firstName: user.first_name,
      telegram: user.username ? `@${user.username}` : "",
      phone: state.profile?.phone || "",
      authorized: true,
    };
    write("bellaVitaProfile", state.profile);
    showToast("Вход через Telegram подтвержден");
    renderProfile();
    return;
  }

  state.profile = {
    name: "Bella Vita Client",
    telegram: "@demo_client",
    phone: state.profile?.phone || "",
    authorized: true,
  };
  write("bellaVitaProfile", state.profile);
  showToast("Демо-вход выполнен. В Telegram будут подставлены реальные данные.");
  renderProfile();
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "BV";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) routeTo(routeButton.dataset.route);
});

document.querySelector("#profileShortcut").addEventListener("click", () => routeTo("profile"));
document.querySelector("#backButton").addEventListener("click", () => {
  if (state.route === "home") return;
  routeTo("home");
});

initTelegram();
render();
