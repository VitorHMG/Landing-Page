const projectStorageKey = "atlasmap-projects";
const likedStorageKey = "atlasmap-liked-projects";
const authStorageKey = "atlasmap-auth-user";

function getStoredArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function setStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSavedProjects() {
  return getStoredArray(projectStorageKey);
}

function saveProject(project) {
  const savedProjects = getSavedProjects();
  const projectIndex = savedProjects.findIndex(
    (savedProject) => savedProject.properties?.id === project.properties.id,
  );

  if (projectIndex >= 0) {
    savedProjects[projectIndex] = project;
  } else {
    savedProjects.push(project);
  }

  setStoredArray(projectStorageKey, savedProjects);
}

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey) || "null");
  } catch (error) {
    return null;
  }
}

function setAuthUser(user) {
  localStorage.setItem(authStorageKey, JSON.stringify(user));
}

function parseCoordinates(value) {
  const coordinates = value.split(",").map((coordinate) => Number(coordinate.trim()));
  const [longitude, latitude] = coordinates;

  if (
    coordinates.length !== 2 ||
    coordinates.some((coordinate) => Number.isNaN(coordinate)) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return null;
  }

  return coordinates;
}

function projectFromCard(card) {
  return {
    id: card.dataset.projectId,
    title: card.querySelector("h3")?.textContent.trim() || "Projeto",
    description: card.querySelector(".project-card-content > p")?.textContent.trim() || "",
    owner: card.dataset.projectOwner || "AtlasMap",
  };
}

function renderProfileLists() {
  const myProjectsList = document.getElementById("my-projects-list");
  const likedProjectsList = document.getElementById("liked-projects-list");
  const profileUserCard = document.querySelector(".profile-user-card");
  const user = getAuthUser();

  if (profileUserCard) {
    profileUserCard.innerHTML = user
      ? `
          <div class="profile-avatar">${escapeHTML(user.initials || "AM")}</div>
          <div>
            <strong>${escapeHTML(user.name || "Usuário AtlasMap")}</strong>
            <span>${escapeHTML(user.email || "usuario@atlasmap.com")}</span>
          </div>
        `
      : `
          <div class="profile-avatar">?</div>
          <div>
            <strong>Visitante</strong>
            <span>Entre para gerenciar seus projetos.</span>
            <a class="profile-login-btn" href="login.html">Entrar</a>
          </div>
        `;
  }

  if (myProjectsList) {
    const projects = getSavedProjects();
    myProjectsList.innerHTML = projects.length
      ? projects
          .map(
            (project) => `
              <article class="profile-project">
                <strong>${escapeHTML(project.properties?.nome || "Projeto sem nome")}</strong>
                <span>${escapeHTML(project.properties?.organizacao || "Sem proprietário")}</span>
                <div class="profile-project-actions">
                  <button class="profile-edit-btn" type="button" data-edit-project="${escapeHTML(project.properties?.id || "")}">Editar</button>
                </div>
              </article>
            `,
          )
          .join("")
      : '<p class="profile-empty">Nenhum projeto criado ainda.</p>';
  }

  if (likedProjectsList) {
    const likedProjects = getStoredArray(likedStorageKey);
    likedProjectsList.innerHTML = likedProjects.length
      ? likedProjects
          .map(
            (project) => `
              <article class="profile-project">
                <strong>${escapeHTML(project.title)}</strong>
                <span>${escapeHTML(project.description || project.owner || "Projeto curtido")}</span>
              </article>
            `,
          )
          .join("")
      : '<p class="profile-empty">Você ainda não curtiu nenhum projeto.</p>';
  }
}

function getProjectById(projectId) {
  return getSavedProjects().find((project) => project.properties?.id === projectId);
}

function syncLikeButtons() {
  const likedIds = new Set(getStoredArray(likedStorageKey).map((project) => project.id));

  document.querySelectorAll(".project-card").forEach((card) => {
    const button = card.querySelector(".like-btn");
    const isLiked = likedIds.has(card.dataset.projectId);

    if (button) {
      button.classList.toggle("liked", isLiked);
      button.textContent = isLiked ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(isLiked));
    }
  });
}

function toggleCard(card) {
  const isAlreadyActive = card.classList.contains("active");

  document.querySelectorAll(".project-card").forEach((currentCard) => {
    currentCard.classList.remove("active");
  });

  if (!isAlreadyActive) {
    card.classList.add("active");
    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  }
}

function initProjectCards() {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => toggleCard(card));

    const likeButton = card.querySelector(".like-btn");
    if (likeButton) {
      likeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const project = projectFromCard(card);
        const likedProjects = getStoredArray(likedStorageKey);
        const exists = likedProjects.some((likedProject) => likedProject.id === project.id);
        const updatedProjects = exists
          ? likedProjects.filter((likedProject) => likedProject.id !== project.id)
          : [...likedProjects, project];

        setStoredArray(likedStorageKey, updatedProjects);
        syncLikeButtons();
        renderProfileLists();
      });
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".project-card")) {
      document.querySelectorAll(".project-card").forEach((card) => card.classList.remove("active"));
    }
  });

  syncLikeButtons();
}

function openAddProjectForm() {
  const addProjectScreen = document.getElementById("add-project-screen");

  if (!addProjectScreen) {
    window.location.href = "index.html#add-project-screen";
    return;
  }

  addProjectScreen.classList.add("active");
  addProjectScreen.setAttribute("aria-hidden", "false");
  addProjectScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProjectForm() {
  const form = document.getElementById("add-project-form");
  const editInput = document.getElementById("project-edit-id");
  const title = document.getElementById("project-form-title");
  const submitButton = document.getElementById("project-submit-btn");

  if (form) {
    form.reset();
  }

  if (editInput) {
    editInput.value = "";
  }

  if (title) {
    title.textContent = "Adicionar Projeto";
  }

  if (submitButton) {
    submitButton.textContent = "Salvar";
  }
}

function openEditProjectForm(projectId) {
  const project = getProjectById(projectId);

  if (!project) {
    return;
  }

  if (!document.getElementById("add-project-form")) {
    window.location.href = `index.html#editar-projeto-${encodeURIComponent(projectId)}`;
    return;
  }

  document.getElementById("project-edit-id").value = project.properties.id;
  document.getElementById("project-name").value = project.properties.nome || "";
  document.getElementById("project-owner").value = project.properties.organizacao || "";
  document.getElementById("project-description").value = project.properties.descricao || "";
  document.getElementById("project-coordinates").value = project.geometry?.coordinates?.join(", ") || "";

  const title = document.getElementById("project-form-title");
  const submitButton = document.getElementById("project-submit-btn");

  if (title) {
    title.textContent = "Editar Projeto";
  }

  if (submitButton) {
    submitButton.textContent = "Salvar Alterações";
  }

  document.getElementById("profile-panel")?.classList.remove("open");
  document.getElementById("panel-overlay")?.classList.remove("open");
  openAddProjectForm();
}

function initAddProjectForm() {
  const addProjectLinks = document.querySelectorAll("#add-project-link");
  const addProjectForm = document.getElementById("add-project-form");
  const profileAddProject = document.getElementById("profile-add-project");

  addProjectLinks.forEach((addProjectLink) => {
    addProjectLink.addEventListener("click", (event) => {
      event.preventDefault();
      resetProjectForm();
      openAddProjectForm();
    });
  });

  if (profileAddProject) {
    profileAddProject.addEventListener("click", () => {
      resetProjectForm();
      openAddProjectForm();
    });
  }

  if (window.location.hash === "#add-project-screen") {
    openAddProjectForm();
  } else if (window.location.hash.startsWith("#editar-projeto-")) {
    openEditProjectForm(decodeURIComponent(window.location.hash.replace("#editar-projeto-", "")));
  }

  if (addProjectForm) {
    addProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const coordinates = parseCoordinates(document.getElementById("project-coordinates").value);

      if (!coordinates) {
        alert("Digite as coordenadas no formato: longitude, latitude");
        return;
      }

      const editId = document.getElementById("project-edit-id")?.value;
      const project = {
        type: "Feature",
        geometry: { type: "Point", coordinates },
        properties: {
          id: editId || Date.now().toString(),
          nome: document.getElementById("project-name").value.trim(),
          organizacao: document.getElementById("project-owner").value.trim(),
          descricao: document.getElementById("project-description").value.trim(),
        },
      };

      saveProject(project);
      renderProfileLists();

      if (editId) {
        window.location.href = "mapa.html";
      } else {
        const projectParam = encodeURIComponent(JSON.stringify(project));
        window.location.href = `mapa.html?novoProjeto=${projectParam}`;
      }
    });
  }
}

function initProfilePanel() {
  const panel = document.getElementById("profile-panel");
  const overlay = document.getElementById("panel-overlay");
  const trigger = document.querySelector(".profile-trigger");
  const closeButton = document.querySelector(".profile-close");

  if (!panel || !overlay || !trigger) {
    return;
  }

  const openPanel = () => {
    panel.classList.add("open");
    overlay.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    renderProfileLists();
  };

  const closePanel = () => {
    panel.classList.remove("open");
    overlay.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", openPanel);
  overlay.addEventListener("click", closePanel);
  closeButton?.addEventListener("click", closePanel);

  document.querySelectorAll(".profile-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".profile-tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".profile-section").forEach((section) => section.classList.remove("active"));

      tab.classList.add("active");
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add("active");
    });
  });

  panel.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-project]");

    if (editButton) {
      openEditProjectForm(editButton.dataset.editProject);
    }
  });
}

function initAuthPage() {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");
  const message = document.getElementById("auth-message");

  if (!loginForm || !signupForm) {
    return;
  }

  const showForm = (formName) => {
    const isSignup = formName === "signup";
    loginForm.classList.toggle("active", !isSignup);
    signupForm.classList.toggle("active", isSignup);
    message.textContent = "";
  };

  showSignup?.addEventListener("click", () => showForm("signup"));
  showLogin?.addEventListener("click", () => showForm("login"));

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "Cadastro realizado com sucesso. Faça login para continuar.";
    signupForm.reset();
    setTimeout(() => showForm("login"), 900);
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const name = email ? email.split("@")[0] : "Usuário AtlasMap";
    const initials = name
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "AM";

    setAuthUser({ name, email, initials });
    message.textContent = "Login realizado com sucesso. Redirecionando...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
}

function initMap() {
  if (!document.getElementById("map") || typeof mapboxgl === "undefined") {
    return;
  }

  mapboxgl.accessToken =
    "pk.eyJ1IjoiZGFya2dpb24iLCJhIjoiY21vaHFyYmNrMDVuYTJyb3J5ZGZ1aWg2ZCJ9.9X3i7-aKA-X_w6QyV6wK2w";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/darkgion/cmohrb0d3008j01qr47fkdp1n",
    center: [-53.2, -10.3],
    zoom: 3.5,
  });

  const meusProjetos = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-46.6333, -23.5505] },
        properties: {
          nome: "Reflorestamento Urbano",
          organizacao: "ONG Verde SP",
          descricao: "Plantio de mudas nativas em áreas degradadas da metrópole.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-43.1729, -22.9068] },
        properties: {
          nome: "Mar Limpo",
          organizacao: "Instituto Oceano",
          descricao: "Coleta seletiva e limpeza de microplásticos nas praias cariocas.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-47.8825, -15.7942] },
        properties: {
          nome: "Cerrado Vivo",
          organizacao: "EcoPlanalto",
          descricao: "Preservação da fauna e flora típica do bioma Cerrado.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-60.0217, -3.119] },
        properties: {
          nome: "Guardiões da Amazônia",
          organizacao: "Fundação Floresta Viva",
          descricao: "Monitoramento via satélite e apoio a brigadas comunitárias de combate a incêndios.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-38.5016, -12.9714] },
        properties: {
          nome: "Energia do Sol",
          organizacao: "Cooperativa Solar Nordeste",
          descricao: "Instalação de painéis fotovoltaicos em comunidades de baixa renda para redução de custos.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-56.0978, -15.601] },
        properties: {
          nome: "Pantanal Sustentável",
          organizacao: "Instituto Arara Azul",
          descricao: "Proteção de ninhos e educação ambiental para preservação da biodiversidade pantaneira.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-51.2177, -30.0346] },
        properties: {
          nome: "Hortas Comunitárias RS",
          organizacao: "Coletivo Cultivar",
          descricao: "Transformação de terrenos baldios em hortas urbanas para segurança alimentar local.",
        },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-43.9378, -19.9208] },
        properties: {
          nome: "Ciclo Águas MG",
          organizacao: "Movimento Rio Limpo",
          descricao: "Recuperação de nascentes e matas ciliares na bacia do Rio das Velhas.",
        },
      },
    ],
  };

  const getProjectFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get("novoProjeto");

    if (!projectParam) {
      return null;
    }

    try {
      return JSON.parse(projectParam);
    } catch (error) {
      return null;
    }
  };

  const newProject = getProjectFromURL();

  if (newProject) {
    saveProject(newProject);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const projetosDoMapa = {
    type: "FeatureCollection",
    features: [...meusProjetos.features, ...getSavedProjects()],
  };

  map.on("load", () => {
    map.addSource("projetos-source", {
      type: "geojson",
      data: projetosDoMapa,
    });

    map.addLayer({
      id: "camada-projetos",
      type: "circle",
      source: "projetos-source",
      paint: {
        "circle-radius": 6,
        "circle-color": "#53fa85",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#111111",
      },
    });

    map.on("click", "camada-projetos", (event) => {
      const coordinates = event.features[0].geometry.coordinates.slice();
      const props = event.features[0].properties;

      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(coordinates)
        .setHTML(
          `
            <div style="font-family: Inter, sans-serif; padding: 6px;">
              <h3 style="margin: 0; color: #16833a;">${escapeHTML(props.nome)}</h3>
              <p style="margin: 6px 0; font-weight: 700; color: #555;">Org: ${escapeHTML(props.organizacao)}</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">${escapeHTML(props.descricao)}</p>
            </div>
          `,
        )
        .addTo(map);
    });

    map.on("mouseenter", "camada-projetos", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "camada-projetos", () => {
      map.getCanvas().style.cursor = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initProjectCards();
  initAddProjectForm();
  initProfilePanel();
  initAuthPage();
  initMap();
  renderProfileLists();
});
