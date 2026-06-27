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
  favorites: migrateFavorites(read("bellaVitaFavorites", [])),
  cart: migrateFavorites(read("bellaVitaCart", [])),
  profile: read("bellaVitaProfile", null),
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

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
    const answer = prompt("Для кого подбираем аромат: для нее, для него или подарок?");
    const normalized = (answer || "").toLowerCase();
    const filter = normalized.includes("него")
      ? "male"
      : normalized.includes("подар")
        ? "gift"
        : "female";
    routeTo("catalog", { filter });
  });

  document.querySelectorAll(".choice").forEach((choice) => {
    choice.addEventListener("click", () => routeTo("catalog", { filter: choice.dataset.filter }));
  });
}

function renderCatalog() {
  const filtered = getFilteredProducts();
  document.querySelector("#catalogCount").textContent = `${filtered.length} ароматов`;
  renderProducts(document.querySelector("#catalogList"), filtered);

  document.querySelectorAll("[data-catalog-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.catalogFilter === state.catalogFilter);
    button.addEventListener("click", () => {
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
  return products.filter((product) => {
    const matchesFilter =
      state.catalogFilter === "all" ||
      product.gender === state.catalogFilter ||
      product.mood.includes(state.catalogFilter);
    const searchable = `${product.name} ${product.notes} ${product.description}`.toLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  });
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
