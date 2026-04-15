const GITHUB_USERNAME = "rodrigt1997";
const MAX_PROJECTS = 6;

const fallbackProjects = [
    {
        name: "Portfolio",
        description: "Repositorio del portfolio personal para LinkedIn.",
        language: "HTML",
        html_url: "https://github.com/rodrigt1997/Portfolio",
        homepage: "",
        stargazers_count: 0,
        forks_count: 0,
        updated_at: new Date().toISOString(),
    },
];

const projectsGrid = document.querySelector("#projects-grid");
const projectsStatus = document.querySelector("#projects-status");
const profileBio = document.querySelector("#profile-bio");

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

/* 🎴 Crear tarjeta de proyecto - AHORA ES SÍNCRONA */
const createProjectCard = (repo) => {
    // 1. Detectamos si se puso el link de un video en el campo "Website" de GitHub
    const isVideo = repo.homepage && (
        repo.homepage.toLowerCase().endsWith(".mp4") ||
        repo.homepage.toLowerCase().endsWith(".webm") ||
        repo.homepage.includes("raw.githubusercontent")
    );

    const videoUrl = isVideo ? repo.homepage : null;

    // 2. Si no es video, es un link de Demo normal
    const demoLink = (repo.homepage && !isVideo)
        ? `<a href="${repo.homepage}" target="_blank" rel="noreferrer">Demo</a>`
        : "";

    const media = videoUrl
        ? `
        <video class="project-video" controls muted loop>
            <source src="${videoUrl}" type="video/mp4">
        </video>
        `
        : "";

    const languageItem = repo.language
        ? `<li>${repo.language}</li>`
        : "";

    const codeLink = `<a href="${repo.html_url}" target="_blank" rel="noreferrer">Código</a>`;

    return `
    <article class="project-card">
      <h3>${repo.name}</h3>
      <p>${repo.description || "Sin descripción todavía."}</p>
      <ul class="project-tech">
        ${media}
        ${languageItem}
        <li>⭐ ${repo.stargazers_count}</li>
        <li>🍴 ${repo.forks_count}</li>
      </ul>
      <p class="updated">Actualizado: ${formatDate(repo.updated_at)}</p>
      <div class="project-links">
        ${demoLink}
        ${codeLink}
        </div>
    </article>
  `;
};

/* 🧩 Renderizar proyectos - YA NO USA PROMISE.ALL */
const renderProjects = (repos) => {
    if (!projectsGrid) return;

    const cards = repos.map(repo => createProjectCard(repo));
    projectsGrid.innerHTML = cards.join("");
};

/* 🌐 Cargar datos de GitHub */
const loadGitHubProfile = async () => {
    try {
        const [profileResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
        ]);

        if (!profileResponse.ok || !reposResponse.ok) {
            throw new Error("No se pudo cargar la API de GitHub");
        }

        const profile = await profileResponse.json();
        const repos = await reposResponse.json();


        if (profileBio && profile.bio) {
            profileBio.textContent = profile.bio;
        }

        const filteredRepos = repos
            .filter((repo) => {
                const excluded = ["Portfolio"];
                return !repo.fork && !excluded.includes(repo.name);
            })
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, MAX_PROJECTS);

        // AHORA NO NECESITA AWAIT
        renderProjects(
            filteredRepos.length ? filteredRepos : fallbackProjects
        );

        if (projectsStatus) {
            projectsStatus.textContent = `Mostrando ${filteredRepos.length || fallbackProjects.length
                } repositorios recientes de @${GITHUB_USERNAME}.`;
        }
    } catch (error) {
        renderProjects(fallbackProjects);

        if (projectsStatus) {
            projectsStatus.textContent =
                "No se pudo conectar con GitHub ahora. Se muestra contenido de respaldo.";
        }
    }
};

/* 📅 Año automático */
const year = document.querySelector("#year");
if (year) {
    year.textContent = new Date().getFullYear();
}

/* 📱 Menú responsive */
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");

if (toggle && nav) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

/* 🚀 Iniciar */
loadGitHubProfile();