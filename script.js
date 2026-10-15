
const main = document.getElementById("main-content");
const accountArea = document.getElementById("account-area");
const sideUser = document.getElementById("side-user");
const currencyCount = document.getElementById("currency-count");

const games = [
  { name: "Classic World", creator: "Larpblox", icon: "C" },
  { name: "Brick Battle", creator: "Larpblox", icon: "B" },
  { name: "Happy Home", creator: "Larpblox", icon: "H" },
  { name: "The Old Obby", creator: "Larpblox", icon: "O" }
];

const items = [
  { name: "Classic Cap", price: 25 },
  { name: "Blue Shades", price: 50 },
  { name: "Builder Helmet", price: 100 },
  { name: "Red Bandana", price: 35 }
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("larpblox-user")) || null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("larpblox-user", JSON.stringify(user));
}

function refreshAccount() {
  const user = getUser();

  if (user) {
    accountArea.textContent = "";

    const name = document.createElement("span");
    name.textContent = user.username + " · " +
      Number(user.larpbux).toLocaleString() + " Larpbux";

    const logout = document.createElement("button");
    logout.textContent = "Log Out";
    logout.onclick = () => {
      localStorage.removeItem("larpblox-user");
      refreshAccount();
      showPage("Home");
    };

    accountArea.append(name, logout);
    sideUser.textContent = "Hello, " + user.username + "!";
    currencyCount.textContent = Number(user.larpbux).toLocaleString();
  } else {
    accountArea.textContent = "";

    const login = document.createElement("button");
    login.textContent = "Log In";
    login.onclick = () => showPage("Login");

    const register = document.createElement("button");
    register.textContent = "Sign Up";
    register.onclick = () => showPage("Register");

    accountArea.append(login, register);
    sideUser.textContent = "Welcome, Guest!";
    currencyCount.textContent = "0";
  }
}

function showPage(page) {
  if (page === "Home") {
    main.innerHTML = `
      <h1>Welcome to Larpblox!</h1>
      <p>Your place to build, play, and explore.</p>
      <div class="notice">
        Welcome to the classic Larpblox experience!
        Explore games and discover items for your avatar.
      </div>
      <h2>Featured Games</h2>
      <div class="game-grid" id="home-games"></div>
    `;

    renderGames("home-games");
    return;
  }

  if (page === "Games") {
    main.innerHTML = `
      <h1>Games</h1>
      <p>Discover experiences created for Larpblox.</p>
      <div class="game-grid" id="all-games"></div>
    `;

    renderGames("all-games");
    return;
  }

  if (page === "Catalog") {
    main.innerHTML = `
      <h1>Catalog</h1>
      <p>Browse items for your avatar.</p>
      <div class="notice">Your balance: <strong id="catalog-balance"></strong> Larpbux</div>
      <div class="item-grid" id="catalog-items"></div>
    `;

    document.getElementById("catalog-balance").textContent =
      Number(getUser()?.larpbux || 0).toLocaleString();

    const grid = document.getElementById("catalog-items");

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "item-card";

      const thumb = document.createElement("div");
      thumb.className = "item-thumb";
      thumb.textContent = "★";

      const title = document.createElement("h3");
      title.textContent = item.name;

      const price = document.createElement("p");
      price.textContent = item.price + " Larpbux";

      const buy = document.createElement("button");
      buy.textContent = "Buy";
      buy.onclick = () => buyItem(index);

      card.append(thumb, title, price, buy);
      grid.appendChild(card);
    });

    return;
  }

  if (page === "Avatar") {
    const user = getUser();

    main.innerHTML = `
      <h1>Avatar</h1>
      <div class="notice">Your avatar editor will go here.</div>
      <div class="game-thumb" style="width:180px;height:180px">?</div>
      <p>Username: <strong></strong></p>
      <p class="muted">Avatar customization is coming soon.</p>
    `;

    main.querySelector("strong").textContent =
      user ? user.username : "Guest";
    return;
  }

  if (page === "Profile") {
    const user = getUser();

    main.innerHTML = `
      <h1>Profile</h1>
      <div class="notice">Welcome to your Larpblox profile.</div>
      <p>Username: <strong></strong></p>
      <p>Larpbux: <strong></strong></p>
    `;

    const values = main.querySelectorAll("strong");
    values[0].textContent = user ? user.username : "Guest";
    values[1].textContent =
      user ? Number(user.larpbux).toLocaleString() : "0";
    return;
  }

  if (page === "Login" || page === "Register") {
    const registering = page === "Register";

    main.innerHTML = `
      <h1>${registering ? "Create an Account" : "Log In"}</h1>
      <p>${registering
        ? "Join the Larpblox community."
        : "Welcome back to Larpblox."}</p>
      <form id="account-form">
        <label for="username-input">Username</label>
        <input id="username-input" maxlength="20"
          autocomplete="username" required>
        <label for="password-input">Password</label>
        <input id="password-input" type="password"
          autocomplete="${registering ? "new-password" : "current-password"}"
          required>
        <button type="submit">${registering ? "Sign Up" : "Log In"}</button>
      </form>
      <p id="form-message"></p>
      <p class="muted">
        Demo only: accounts are stored in this browser, not securely on a server.
      </p>
    `;

    document.getElementById("account-form").onsubmit = event => {
      event.preventDefault();

      const username = document.getElementById("username-input")
        .value.trim();
      const password = document.getElementById("password-input").value;
      const message = document.getElementById("form-message");

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        message.textContent =
          "Use 3–20 letters, numbers, or underscores for your username.";
        return;
      }

      const key = "larpblox-demo-account-" + username.toLowerCase();

      if (registering) {
        if (localStorage.getItem(key)) {
          message.textContent = "That username is already registered here.";
          return;
        }

        // Demo only. Never store real passwords this way.
        localStorage.setItem(key, JSON.stringify({ username, password }));

        saveUser({ username, larpbux: 100 });
        refreshAccount();
        showPage("Home");
      } else {
        let saved;

        try {
          saved = JSON.parse(localStorage.getItem(key));
        } catch {
          saved = null;
        }

        if (!saved || saved.password !== password) {
          message.textContent = "Incorrect username or password.";
          return;
        }

        const previous = getUser();
        saveUser({
          username: saved.username,
          larpbux: previous?.username === saved.username
            ? previous.larpbux
            : 100
        });

        refreshAccount();
        showPage("Home");
      }
    };

    return;
  }
}

function renderGames(targetId) {
  const grid = document.getElementById(targetId);

  games.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";

    const thumb = document.createElement("div");
    thumb.className = "game-thumb";
    thumb.textContent = game.icon;

    const title = document.createElement("h3");
    title.textContent = game.name;

    const creator = document.createElement("p");
    creator.className = "muted";
    creator.textContent = "By " + game.creator;

    const play = document.createElement("button");
    play.textContent = "Play";
    play.onclick = () => {
      alert("This is a demo game listing. Game launching isn't connected yet.");
    };

    card.append(thumb, title, creator, play);
    grid.appendChild(card);
  });
}

function buyItem(index) {
  const user = getUser();

  if (!user) {
    showPage("Login");
    return;
  }

  const item = items[index];

  if (user.larpbux < item.price) {
    alert("You don't have enough Larpbux!");
    return;
  }

  user.larpbux -= item.price;
  saveUser(user);
  refreshAccount();
  showPage("Catalog");
  alert("Demo purchase: " + item.name);
}

document.addEventListener("click", event => {
  const link = event.target.closest("[data-page]");
  if (!link) return;

  event.preventDefault();
  showPage(link.dataset.page);
});

refreshAccount();
showPage("Home");
