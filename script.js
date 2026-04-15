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
const profileName = document.querySelector("#profile-name");
const profileBio = document.querySelector("#profile-bio");

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

/* 🔍 Buscar vídeo dentro del repo */
const getRepoVideo = async (repoName) => {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents`
        );

        if (!response.ok) return null;

        const files = await response.json();

        const videoFile = files.find(file =>
            file.name.endsWith(".mp4") || file.name.endsWith(".webm")
        );

        return videoFile ? videoFile.download_url : null;
    } catch (error) {
        return null;
    }
};

/* 🎴 Crear tarjeta de proyecto */
const createProjectCard = async (repo) => {
    const videoUrl = await getRepoVideo(repo.name);

    const demoLink = repo.homepage
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


    const codeLink = videoUrl
        ? "" // si hay video, ocultamos "Código"
        : `<a href="${repo.html_url}" target="_blank" rel="noreferrer">Código</a>`;

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

/* 🧩 Renderizar proyectos */
const renderProjects = async (repos) => {
    if (!projectsGrid) return;

    const cards = await Promise.all(
        repos.map(repo => createProjectCard(repo))
    );

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

        if (profileName) {
            profileName.textContent = profile.name || GITHUB_USERNAME;
        }

        if (profileBio && profile.bio) {
            profileBio.textContent = profile.bio;
        }

        const filteredRepos = repos
            .filter((repo) => {
                const isNotFork = !repo.fork;
                const isNotPortfolio = repo.name.toLowerCase() !== "portfolio";
                return isNotFork && isNotPortfolio;
            })
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, MAX_PROJECTS);

        await renderProjects(
            filteredRepos.length ? filteredRepos : fallbackProjects
        );

        if (projectsStatus) {
            projectsStatus.textContent = `Mostrando ${filteredRepos.length || fallbackProjects.length
                } repositorios recientes de @${GITHUB_USERNAME}.`;
        }
    } catch (error) {
        await renderProjects(fallbackProjects);

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