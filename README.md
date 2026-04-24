# Cordova + TypeScript + Vite — Boilerplate

> Boilerplate pour apps mobiles hybrides. **Cordova** (WebView native Android/iOS), **TypeScript** strict, **Vite** (dev server + bundler), **vanilla DOM** — zéro framework runtime.

Clone, renomme, développe. Pas de React/Vue/Angular à apprendre, pas de stack à maintenir : juste du TS typé, un store minimal, un template engine de ~30 lignes.

---

## Sommaire

1. [Pourquoi ce stack](#1-pourquoi-ce-stack)
2. [Prise en main (quickstart)](#2-prise-en-main-quickstart)
3. [Arborescence](#3-arborescence)
4. [Architecture](#4-architecture)
5. [Scripts npm](#5-scripts-npm)
6. [Build Cordova Android](#6-build-cordova-android)
7. [Adapter le boilerplate à un nouveau projet](#7-adapter-le-boilerplate-à-un-nouveau-projet)
8. [Conventions de code](#8-conventions-de-code)
9. [Ajouter une feature / un composant / une route](#9-ajouter-une-feature--un-composant--une-route)
10. [Limitations connues](#10-limitations-connues)

---

## 1. Pourquoi ce stack

| Choix | Raison |
|---|---|
| **Cordova** | WebView native Android/iOS, accès aux APIs natives (caméra, stockage, réseau) via plugins, packaging store. |
| **TypeScript `strict`** | Typage fort, refactoring safe, IntelliSense. `moduleResolution: "bundler"` aligné avec Vite. |
| **Vite** | Dev server instantané (ESM natif), HMR, build Rollup optimisé. Plus rapide que Webpack, plus simple qu'ESBuild seul. |
| **Vanilla DOM** | Zéro runtime overhead, boilerplate volontairement minimal. Facile à comprendre ligne par ligne. |
| **`Store<T>` maison** | Reactive minimal (~20 lignes), zéro dépendance, typé génériquement. |
| **`TemplateEngine` maison** | Mounting parent/enfant dans `#app`, pas de virtual DOM — DOM natif, direct. |
| **Post-build HTML injection** | `scripts/update-cordova-html.js` réécrit `www/index.html` avec le bundle hashé — cache-busting automatique. |

---

## 2. Prise en main (quickstart)

```bash
npm install
npm run dev              # http://localhost:5173
npm run type-check       # vérif TypeScript sans build
npm run build            # build prod + injection HTML
```

### Prérequis Android

```bash
npm install -g cordova
cordova platform add android
cordova run android      # nécessite émulateur ou device branché
```

---

## 3. Arborescence

```
.
├── index.html                  ← entry Vite (dev server)
├── vite.config.ts              ← config Vite (root, outDir, alias @, external cordova)
├── tsconfig.json               ← TypeScript strict, target ES2017
├── config.xml                  ← Cordova : id, nom, permissions
├── package.json
├── scripts/
│   └── update-cordova-html.js  ← post-build : injecte le bundle hashé dans www/index.html
├── src/
│   ├── main.ts                 ← bootstrap : deviceready → Router.init()
│   ├── navigation/
│   │   └── router.ts           ← routes → composants à monter
│   ├── lib/
│   │   ├── store.ts            ← classe générique Store<T>
│   │   ├── app-store.ts        ← singleton global (state partagé)
│   │   ├── template-engine.ts  ← render / init + ViewObject
│   │   ├── env.ts              ← constantes app (APP_NAME, VERSION)
│   │   └── utils/
│   │       ├── validators.ts
│   │       ├── storage.ts      ← wrapper localStorage
│   │       └── network-status.ts
│   ├── components/
│   │   └── ui/                 ← composants partagés
│   │       └── loading-screen/
│   │           ├── loading-screen.ts
│   │           └── events.ts   ← enum LoadingScreenEvent
│   ├── features/               ← code métier par feature
│   │   └── todo/
│   │       ├── types/todo.types.ts
│   │       ├── services/todo-service.ts
│   │       ├── store/todo-store.ts
│   │       ├── actions/todo-actions.ts  ← add / update / remove
│   │       └── screens/todo-screen.ts
│   ├── theme/colors.ts         ← design tokens TS (miroir de www/css/theme.css)
│   └── enums/                  ← enums globaux
└── www/
    ├── index.html              ← entry Cordova (généré par update-cordova-html.js)
    ├── cordova.js              ← stub dev (émet deviceready dans le browser)
    ├── css/
    │   ├── theme.css           ← CSS variables (couleurs, spacing)
    │   └── components.css
    └── dist/                   ← généré par Vite (gitignored)
```

---

## 4. Architecture

### 4.1 Dual-entry HTML

Deux fichiers `index.html`, deux rôles :

- **`/index.html` (racine)** — utilisé par `vite dev` et comme entrée de `vite build`. Chemins relatifs à la racine : `www/css/...`, `www/cordova.js`, `src/main.ts` (Vite transpile TS à la volée).
- **`/www/index.html`** — utilisé par Cordova lors du build Android. Chemins relatifs à `www/` : `css/...`, `cordova.js`, `dist/assets/index-[HASH].js`. **Ce fichier est regénéré à chaque `npm run build`** par `scripts/update-cordova-html.js`.

```
npm run dev                              npm run build
   │                                        │
   ▼                                        ▼
index.html  ──►  Vite dev serve         tsc --noEmit  (type check)
   │                                        │
   └── src/main.ts                          ▼
        (transpilé à la volée)          vite build
                                            │
                                            ▼
                                        www/dist/assets/index-[HASH].js
                                            │
                                            ▼
                                        scripts/update-cordova-html.js
                                            │ (injecte [HASH] dans template)
                                            ▼
                                        www/index.html  ──►  cordova build android
                                                                    │
                                                                    ▼
                                                               app.apk
```

### 4.2 Bootstrap

```ts
// src/main.ts
import { Router } from './navigation/router';

document.addEventListener('deviceready', () => {
  Router.init();
}, false);
```

- **En dev** : `www/cordova.js` est un stub qui émet un `deviceready` synthétique au `DOMContentLoaded` — permet de développer dans le browser sans Cordova.
- **En prod (APK)** : Cordova remplace ce fichier par la vraie implémentation plateforme qui expose les APIs natives et émet `deviceready` quand elles sont prêtes.

Le même `main.ts` fonctionne dans les deux modes.

### 4.3 Router

Pas de router multi-page classique : un objet `_routes` mappe une clé (lue depuis `window.location.hash`) vers une liste de composants à monter dans `#app`.

```ts
// src/navigation/router.ts
const _routes: Record<string, RouteConfig> = {
  todo: {
    components: [LoadingScreen, TodoScreen]
  }
};

export const Router = {
  init(): void {
    const parent = document.getElementById('app') as HTMLElement;
    const route  = window.location.hash.slice(2) || 'todo';
    const config = _routes[route] ?? _routes['todo'];

    AppStore.setState({ [LoadingScreenEvent.VISIBLE]: true });
    config.components.forEach(c => c.init(parent));
    AppStore.setState({ [LoadingScreenEvent.VISIBLE]: false });
  }
};
```

Chaque composant doit exposer `init(parent: HTMLElement): void`.

### 4.4 Store\<T\> générique

~20 lignes, pattern observable typé.

```ts
// src/lib/store.ts
export class Store<T extends object> {
  protected _state: T;
  private _listeners: Listener<T>[] = [];

  constructor(initialState: T) { this._state = initialState; }

  setState(updates: Partial<T>): void {
    Object.assign(this._state, updates);
    this._listeners.forEach(fn => fn({ ...this._state }));
  }

  subscribe(fn: Listener<T>): void { this._listeners.push(fn); }
  getState(): T { return { ...this._state }; }
}
```

Deux usages typiques :

- **`AppStore`** (global, clés string dynamiques) — pour la communication inter-composants (loading, toasts, modals).
- **`XxxStore` par feature** (typé) — état métier d'une feature.

```ts
// src/lib/app-store.ts
class AppStoreClass extends Store<{ [key: string]: unknown }> {
  constructor() { super({}); }
}
export const AppStore = new AppStoreClass();

// src/features/todo/store/todo-store.ts
class TodoStoreClass extends Store<TodoState> {
  constructor() { super({ tasks: TodoService.load() }); }
  add(title: string): void { /* ... */ }
  update(id: string, title: string): void { /* ... */ }
  remove(id: string): void { /* ... */ }
}
export const TodoStore = new TodoStoreClass();
```

### 4.5 TemplateEngine

Deux méthodes, une interface de retour.

```ts
// src/lib/template-engine.ts
export interface ViewObject {
  el(selector: string): HTMLElement | null;
  update(selector: string, value: string): void;
  node?: HTMLElement;
}

export const TemplateEngine = {
  render(container, html)       { /* remplace innerHTML */ },
  init(parent, html, id?)       { /* crée/réutilise un enfant avec ID, idempotent */ }
};
```

- **`render`** : remplace tout le contenu d'un container. Utile pour un re-render complet.
- **`init`** : crée un `<div id="..."/>` enfant (ou le réutilise s'il existe) et y injecte le HTML. Idempotent — appeler deux fois ne dupliquera pas le node.

Chaque composant utilise `init()` pour se monter dans `#app`, ce qui permet à plusieurs composants de coexister (ex: LoadingScreen + ImcScreen).

### 4.6 Composants UI vs Features

Convention :

- **`src/components/ui/<nom>/`** — composants partagés et non liés au métier (loading, toast, modal, header).
- **`src/features/<feature>/`** — code métier. Structure interne recommandée : `types/`, `services/`, `store/`, `screens/`.

Chaque composant = un objet figé exportant au minimum `init(parent)` et un `_template()` privé qui retourne une template string HTML.

```ts
export const LoadingScreen = {
  init(parent: HTMLElement): void {
    const view = TemplateEngine.init(parent, this._template(), 'loading-root');
    AppStore.subscribe((state) => {
      const el = view.el('div');
      if (el) el.style.display = state[LoadingScreenEvent.VISIBLE] ? 'flex' : 'none';
    });
  },
  _template(): string {
    return `<div style="...">Chargement...</div>`;
  }
};
```

### 4.7 Communication inter-composants

Via `AppStore` + un enum `events.ts` par composant. Les valeurs de l'enum sont les clés dans `AppState` — type-safe et découplé (le déclencheur n'a pas besoin d'importer le composant cible).

```ts
// src/components/ui/loading-screen/events.ts
export enum LoadingScreenEvent {
  VISIBLE = 'loadingVisible'
}

// ailleurs — déclencher l'event
import { LoadingScreenEvent } from '@/components/ui/loading-screen/events';
AppStore.setState({ [LoadingScreenEvent.VISIBLE]: true });

// dans le composant — écouter
AppStore.subscribe((state) => {
  if (state[LoadingScreenEvent.VISIBLE]) { /* ... */ }
});
```

---

## 5. Scripts npm

| Script | Commande | Rôle |
|---|---|---|
| `dev` | `vite` | Serveur dev sur `http://localhost:5173` avec HMR |
| `build` | `tsc --noEmit && vite build && node scripts/update-cordova-html.js` | Type check, bundle Vite, injection du bundle hashé dans `www/index.html` |
| `type-check` | `tsc --noEmit` | Vérification TypeScript sans émission |

---

## 6. Build Cordova Android

```bash
npm run build                # génère www/dist/ + regénère www/index.html
cordova build android        # génère APK dans platforms/android/
cordova run android          # build + deploy + launch sur émulateur/device
```

### Troubleshooting

- **`platforms/android` corrompu** (ex: `No Java files found that extend CordovaActivity`) :
  ```bash
  cordova platform rm android
  cordova platform add android
  ```

- **Gradle verrouillé (EBUSY)** : fermer l'émulateur avant `cordova build`.

- **Le bundle ne se met pas à jour dans l'APK** : vérifier que `npm run build` a bien tourné — `www/index.html` doit pointer vers le dernier hash dans `www/dist/assets/`.

---

## 7. Adapter le boilerplate à un nouveau projet

```bash
git clone <url-de-ce-repo> mon-nouveau-projet
cd mon-nouveau-projet
rm -rf .git && git init          # repartir sur un dépôt vierge
npm install
```

### Checklist de renommage

- [ ] **`package.json`** — `name`, `displayName`, `description`, `version`, `author`
- [ ] **`config.xml`** — `widget id="com.xxx.yyy"`, `<name>`, `<description>`, `<author>`
- [ ] **`index.html`** (racine) — `<title>`
- [ ] **`scripts/update-cordova-html.js`** — `<title>` dans le template HTML généré
- [ ] **`src/lib/env.ts`** — `APP_NAME`, `VERSION`
- [ ] **`src/theme/colors.ts`** + **`www/css/theme.css`** — couleurs brand (garder les deux synchronisés : TS pour usage inline, CSS variables pour stylesheets)
- [ ] **Supprimer `src/features/todo/`** — créer `src/features/<votre-feature>/` avec la même structure (`types/`, `services/`, `store/`, `actions/`, `screens/`)
- [ ] **`src/navigation/router.ts`** — remplacer la route `todo` par la vôtre, mettre à jour les imports
- [ ] **Adapter les templates HTML** dans vos nouveaux screens
- [ ] **Supprimer les enums spécifiques** à la feature si non réutilisés

### Prompt de démarrage (à copier-coller dans un agent IA)

Une fois le repo cloné, ouvrir le projet dans un agent (Claude Code, Cursor, etc.) et fournir ce prompt pour automatiser l'amorce :

````markdown
Tu es dans un repo cloné depuis un boilerplate Cordova + TypeScript + Vite. Le README.md à la racine
décrit l'architecture et la checklist d'adaptation — lis-le d'abord en entier.

Je veux démarrer un nouveau projet. Voici les infos :

- **Nom de l'app** (displayName) : <MON_APP>
- **Nom du package** (name, kebab-case) : <mon-app>
- **Package ID Android** (reverse-DNS) : com.<monorg>.<monapp>
- **Description** : <une phrase>
- **Auteur** : <Nom> <email>
- **Feature principale** (kebab-case, remplacera `imc`) : <ma-feature>
- **Couleurs brand** (primary, optionnel) : <#hex>

À faire, dans l'ordre, en t'arrêtant après chaque étape pour me montrer le diff :

1. **Renommage global** — applique la checklist §7 du README :
   - `package.json` : name, displayName, description, version (remets 0.1.0), author
   - `config.xml` : widget id, <name>, <description>, <author>
   - `index.html` (racine) + template dans `scripts/update-cordova-html.js` : <title>
   - `src/lib/env.ts` : APP_NAME, VERSION
   - Si couleurs fournies : `src/theme/colors.ts` + `www/css/theme.css` (garde les deux synchronisés)

2. **Remplacement de la feature** `todo` → `<ma-feature>` :
   - Renomme `src/features/todo/` → `src/features/<ma-feature>/`
   - Renomme les fichiers (`todo-screen.ts` → `<ma-feature>-screen.ts`, etc.) et les symboles (`TodoScreen`, `TodoStore`, `TodoService`, `TodoActions`, `TodoState`)
   - Vide le contenu métier : `_template()` → placeholder « Hello <MON_APP> », `*-service.ts` → fonctions stub, `*-store.ts` → state `{}` typé minimal, `*-actions.ts` → méthodes stub
   - Mets à jour `src/navigation/router.ts` : route `<ma-feature>` pointant vers `[LoadingScreen, <MaFeature>Screen]`
   - Supprime les enums spécifiques s'ils ne sont plus importés

3. **Réinitialisation du repo** :
   - Supprime `README.md` actuel (spécifique au boilerplate) OU garde-le si tu préfères — demande-moi
   - Crée un `README.md` minimal avec le nouveau nom d'app et les commandes `npm run dev` / `npm run build`
   - Ne touche pas à `.gitignore`, `tsconfig.json`, `vite.config.ts` — ils sont génériques

4. **Vérification** :
   - Lance `npm install` si `node_modules` absent
   - Lance `npm run type-check` — 0 erreur attendu
   - Lance `npm run build` — doit générer `www/dist/` et regénérer `www/index.html` avec le bon `<title>`
   - Confirme : « Boilerplate amorcé. Lance `npm run dev` pour tester. »

Contraintes :
- Ne casse pas la structure Store<T> / TemplateEngine / Router — réutilise-la.
- Ne supprime pas `src/lib/`, `src/components/ui/loading-screen/`, `src/theme/`, les scripts, config.xml, vite.config.ts.
- Si une info manque dans mes réponses, demande avant d'inventer.
````

---

## 8. Conventions de code

- **Objets figés module-level** (`export const Xxx = { ... }`) plutôt que classes, sauf si état interne (cas du `Store<T>`).
- **Templates** : backticks multilignes, pas de concaténation `+`.
- **Méthodes privées** : préfixe underscore (`_template`, `_bindEvents`).
- **Imports** : alias `@/` pour éviter `../../../`. Ex: `import { AppStore } from '@/lib/app-store'`.
- **Un fichier = une responsabilité**.
- **Pas de commentaires descriptifs** dans le code — les noms doivent suffire. Commentaires uniquement pour un *pourquoi* non évident.

---

## 9. Ajouter une feature / un composant / une route

### Nouvelle feature (exemple : `auth`)

```
src/features/auth/
├── types/auth.types.ts
├── services/auth-service.ts
├── store/auth-store.ts
├── actions/auth-actions.ts
└── screens/login-screen.ts
```

Puis dans `src/navigation/router.ts` :

```ts
import { LoginScreen } from '@/features/auth/screens/login-screen';

const _routes: Record<string, RouteConfig> = {
  todo: { components: [LoadingScreen, TodoScreen] },
  auth: { components: [LoadingScreen, LoginScreen] }   // ← nouvelle route #/auth
};
```

### Nouveau composant UI partagé (exemple : `toast`)

```
src/components/ui/toast/
├── toast.ts            # exporte { Toast: { init(parent), _template() } }
└── events.ts           # export enum ToastEvent { MESSAGE = 'toastMessage' }
```

Le composant `Toast.init` s'abonne à `AppStore` et lit `state[ToastEvent.MESSAGE]`. N'importe qui peut déclencher un toast via `AppStore.setState({ [ToastEvent.MESSAGE]: 'Hello' })`.

### Nouvelle route

1. Ajouter une entrée dans `_routes`.
2. Naviguer avec un lien `#/xxx` ou `window.location.hash = '#/xxx'`.
3. (Optionnel) Réagir au `hashchange` si vous voulez une vraie navigation SPA.

---

## 10. Limitations connues

- **Router minimaliste** : SPA avec hash uniquement, pas de nested routes ni de transitions animées.
- **Pas de diffing DOM** : `setState` re-déclenche tous les listeners qui font leurs updates ciblés via `view.update(selector, value)`. Acceptable pour UI simple, limite pour UI complexe (envisager Preact/lit-html si besoin).
- **iOS non configuré** : ajouter `cordova platform add ios` (requiert Mac + Xcode).
- **Pas de tests** : ajouter Vitest (`npm i -D vitest`) si besoin — la config Vite est déjà là.
- **Pas de linter/formatter** : ajouter ESLint + Prettier selon préférence.
