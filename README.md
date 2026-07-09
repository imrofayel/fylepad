## fylepad — a notepad of your dreams!

<a href="https://github.com/imrofayel/fylepad/stargazers"><img src="https://img.shields.io/github/stars/imrofayel/fylepad" alt="GitHub Repo stars"/></a> <a href="https://github.com/imrofayel/fylepad/releases/"><img src="https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white" alt="Windows Release"/></a> <a href="https://github.com/imrofayel/fylepad/releases/"><img src="https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=F0F0F0" alt="MacOS Release"/></a>  <a href="https://github.com/imrofayel/fylepad/releases/"><img src="https://img.shields.io/badge/Ubuntu-E95420?logo=ubuntu&logoColor=white" alt="Ubunto Release"/></a>

`fylepad` is a privacy-first intelligent writing workspace for note-taking and personal knowledge management. Rich text, Markdown, diagrams, and on-demand AI in a ~10 MB app.

## Installation

Download the latest version for your platform from the `Releases` page. You can also use the [web version.](https://fylepad.app)

> [!IMPORTANT]
> Since the application is currently unsigned, macOS users may need to run.
> ```bash
>  xattr -c fylepad_aarch64.app
> ```

## Development

> [!WARNING]
> `Node.js 18+`, `pnpm` and `Rust` toolchain (for desktop development) are needed.

1. Install dependencies

```bash
pnpm install
```

2. Run the application

```bash
# for web version
pnpm dev

# for desktop version
pnpm tauri dev
```


### Cloud Features

> [!TIP]
> The backend is not required for normal development.

You only need backend services and environment variables if you want to test cloud sync, authentication, and server-side AI features.

> [!Note]
> You can clone the [`backend`](https://github.com/imrofayel/fylepad-backend) repo.

1. Run the backend server and these credentials in the `.env` of frontend repo.

```
VITE_AI_BACKEND_API=
VITE_BACKEND_API=
```

## 📦 Legacy Version

The previous version `v3` has been deprecated. Source code remains available in the `v3-legacy` branch.

## 📄 License

MIT
