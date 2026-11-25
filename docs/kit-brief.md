# Brief initial : construire proto-kit

> Document historique. C'est le cahier des charges qui a servi à construire
> le kit avec Claude Code. Il explique les choix de départ, mais ne décrit pas
> forcément le kit tel qu'il est aujourd'hui : pour l'utiliser, lire
> [README.md](../README.md) et [getting-started.md](getting-started.md).

## Mission

Construire un dépôt modèle réutilisable pour transformer des maquettes Figma
en prototypes HTML fonctionnels, fidèles, beaux et testables, pour n'importe
quel client.

Le kit fournit la méthode, l'outillage, les skills et les garde-fous.
Il ne contient AUCUN choix visuel : l'apparence est toujours extraite du
Figma du client.

Philosophie (inspirée de Luke Wroblewski, Rico, Headway, Kilo, NN/g) :
- Figma sert de point de départ et de référence de convergence.
- Une fois les écrans validés, le code devient la source de vérité :
  le raffinement se fait dans le code, piloté par le designer.
- Le design system est un steering layer : il guide l'agent à chaque
  modification, il est versionné dans le dépôt.
- Un prototype n'est fini que s'il est prêt à être testé avec des
  utilisateurs.

Avant de coder : lis ce fichier en entier, pose tes questions, propose un
plan de construction, attends ma validation.

---

## Décisions figées

- Vite + React + TypeScript + Tailwind v4.
- Primitives headless via shadcn/ui, base Radix (`--base radix`).
  Le style shadcn par défaut est entièrement remplacé par les tokens du
  projet. Ne jamais mélanger Radix et Base UI.
- React Router pour la navigation entre écrans.
- Playwright pour les captures et l'accessibilité (axe-core).
- pixelmatch pour la comparaison visuelle.
- Figma MCP pour lire les maquettes : variables, composants, captures,
  assets.
- Données fictives en JSON local, aucun backend.
- Déploiement de prévisualisation : configuration Vercel prête, non activée.
- GitHub Actions pour la CI.

Toute autre dépendance : me demander avant.

---

## Arborescence à créer

```
CLAUDE.md                     steering layer principal (court)
docs/kit-brief.md             ce brief, conservé pour l'historique
README.md                     démarrer un projet client en 10 lignes
.github/workflows/check.yml   CI : npm run check sur chaque PR
.claude/skills/
  figma-inventory/SKILL.md
  extract-tokens/SKILL.md
  build-component/SKILL.md
  build-screen/SKILL.md
  visual-diff/SKILL.md
  refine-screen/SKILL.md
  review-screen/SKILL.md
  prepare-test/SKILL.md
context/
  client.md                   modèle à remplir : client, marque, cibles,
                              niveau d'accessibilité visé, polices et licences
  inventory.md                généré en phase 0
  decisions.md                journal des décisions et des écarts au Figma
  rules-log.md                erreurs de l'agent devenues règles
docs/
  components/                 une fiche par composant (générée)
  blocks/                     une fiche par block (générée)
refs/figma/                   captures Figma de référence,
                              <ecran>@<breakpoint>.png
scripts/
  visual-diff.ts
  lint-tokens.ts
  a11y.ts
src/
  tokens/primitives.css       vide, consigne en tête
  tokens/semantic.css         vide, consigne en tête
  tokens/theme.css            mapping @theme Tailwind vers les tokens
  assets/                     images optimisées, icônes SVG, polices
  components/                 composants restylés
  blocks/                     sections réutilisables
  screens/                    un fichier par écran
  mocks/                      JSON
  routes/design-system.tsx    vitrine : composants, blocks, tokens,
                              chacun à côté de sa capture Figma
  lib/tracking.ts             suivi léger des parcours, désactivé par défaut
example/                      composant de démonstration, exclu du build
```

---

## Contenu attendu de CLAUDE.md

Court : moins de 150 lignes. Tout ce qui est détaillé vit dans les skills.

### 1. Rôle
Produire un prototype fidèle au Figma, beau, propre et testable.
Ne jamais inventer une valeur visuelle : la lire dans Figma, dans les
tokens, ou demander.

### 2. Source de vérité
Règle à écrire telle quelle :
« Jusqu'à la validation d'un écran (fin de phase 3), Figma fait foi et
visual-diff mesure la convergence. Après validation, le code devient la
source de vérité : les raffinements se font dans le code et chaque écart
volontaire au Figma est consigné dans context/decisions.md. visual-diff
devient alors un contrôle de non-régression sur la nouvelle référence. »

### 3. Les phases et leurs points de validation
Résumé des 7 phases ci-dessous. À chaque point de validation : s'arrêter,
résumer ce qui a été fait, lister les questions, attendre mon accord.

### 4. Règles (une phrase, puis sa raison)
Au minimum :
- Toute valeur visuelle vient d'un token.
  Raison : la fidélité et la cohérence dépendent d'une source unique.
- Les composants n'utilisent que des tokens sémantiques, jamais les
  primitives.
  Raison : l'agent choisit une valeur par son rôle, pas par son apparence.
- Pas de valeur arbitraire Tailwind (`text-[13px]`, `bg-[#...]`), pas de
  style inline.
  Raison : ce sont des tokens inventés qui font dériver le produit.
- La mise en page s'aligne sur la grille du projet (colonnes, gouttières,
  marges).
  Raison : la grille est l'expertise du designer encodée, elle permet des
  consignes précises comme « aligne sur la colonne 3 ».
- Une valeur absente du Figma ou marquée TODO : demander, ne pas deviner.
  Raison : les suppositions raisonnables finissent dans le produit.
- Réutiliser un composant ou un block existant avant d'en créer un.
  Raison : un composant dupliqué diverge et casse la cohérence.
- Ne documenter et n'utiliser que ce qui existe dans le code.
  Raison : l'agent essaie d'utiliser ce qui est décrit, même s'il n'existe pas.
- Tout état ou comportement non dessiné (chargement, vide, erreur,
  responsive entre deux breakpoints) est proposé et marqué « ajouté par
  l'agent » dans decisions.md.
  Raison : je dois distinguer le Figma de l'interprétation.
- Les couleurs de statut (succès, alerte, erreur) ne servent qu'à signaler
  un état.
  Raison : utilisées en décoration, elles perdent leur sens.
- Accessibilité : focus visible, navigation clavier complète, labels,
  contrastes AA, `prefers-reduced-motion` respecté.
  Raison : non négociable et invisible sur une capture.
- Polices : utiliser les fichiers exacts de la marque, jamais une police
  de substitution sans me le signaler.
  Raison : la typographie fait la moitié de la fidélité perçue.

### 5. Anti-patterns
div cliquable, primitive réimplémentée, composant dupliqué, image non
optimisée, icône en PNG, z-index arbitraire, marge négative pour corriger
un alignement, `!important`.

### 6. Routing du contexte
Tableau : tâche, fichiers à lire, skill à utiliser. Exemples :
- Construire un composant : src/tokens/, docs/components/, skill
  build-component.
- Construire un écran : context/inventory.md, docs/blocks/, skill
  build-screen.
- Retour du designer sur un écran validé : context/decisions.md, skill
  refine-screen.

### 7. Git
- Une branche par composant ou par écran : `comp/<nom>`, `screen/<nom>`.
- Plusieurs écrans en parallèle : un git worktree par écran.
- Commits petits et fréquents. Une PR par lot cohérent (3 à 5 commits).
- La CI doit passer avant toute fusion.

### 8. Boucle d'apprentissage
Chaque correction que je fais deux fois devient une règle ajoutée ici,
tracée dans context/rules-log.md : ce que l'agent a fait, ce que je
voulais, pourquoi.

---

## Les 7 phases

### Phase 0 : inventaire
Skill figma-inventory.
Écrans, breakpoints dessinés, parcours (liens de prototype Figma),
composants Figma et variants, assets, polices, zones floues
(écran sans version mobile, état non dessiné, incohérence entre écrans).
VALIDATION : périmètre et ordre de construction.

### Phase 1 : fondations
Skill extract-tokens.
- Primitives : couleurs, typographie, espacements, rayons, ombres.
- Grille : colonnes, gouttières, marges, largeur max, par breakpoint.
- Mouvement : durées, courbes d'accélération (si présentes dans Figma ou
  dans les specs de prototype ; sinon TODO).
- Tokens sémantiques : surface, texte, action, statut, layout, élévation,
  mouvement.
- Polices installées en local, chargement optimisé.
- Sans variables Figma : relever les valeurs réellement utilisées,
  regrouper par fréquence, proposer une échelle, signaler les valeurs
  isolées. Ce qui n'est pas tranché reste TODO.
VALIDATION : tokens, grille, polices.

### Phase 2 : composants
Skill build-component, un composant à la fois.
Tous les états, fiche dans docs/components/, ajout à /design-system,
convergence mesurée par visual-diff.
VALIDATION : vitrine des composants.

### Phase 3 : écrans
Skill build-screen.
Découper chaque écran en blocks nommés, construire bloc par bloc,
visual-diff à chaque breakpoint dessiné, extraire dans src/blocks/ ce qui
revient au moins deux fois (fiche dans docs/blocks/).
Écrans indépendants : en parallèle, un worktree chacun.
VALIDATION : écran par écran. Après validation, le code devient la source
de vérité pour cet écran.

### Phase 4 : raffinement
Skill refine-screen.
Le designer pilote, l'agent exécute :
- consignes en vocabulaire de grille et de tokens ;
- micro-interactions et animations (entrées, transitions, hover) avec
  les tokens de mouvement ;
- qualité perçue : rythme vertical, alignements optiques, rendu des
  images, comportement entre les breakpoints.
Chaque écart volontaire au Figma est consigné dans decisions.md, puis la
capture du rendu validé remplace la référence dans refs/.
VALIDATION : rendu final de chaque écran.

### Phase 5 : prototype fonctionnel
- Navigation selon les liens de prototype Figma.
- Mocks réalistes et variés (valeurs longues, courtes, absentes) pour
  éprouver la mise en page.
- États chargement, vide, erreur.
- Interactions réelles : formulaires, filtres, sélections, ouvertures.
VALIDATION : parcours cliquables de bout en bout.

### Phase 6 : revue et préparation du test
- Skill review-screen sur chaque écran.
- Skill prepare-test : scénarios de test et suivi léger.
- Déploiement de prévisualisation.
VALIDATION : prêt à tester.

---

## Spécifications des skills

Chaque SKILL.md contient : frontmatter `name` et `description` (quand
l'utiliser, en une phrase), entrées attendues, étapes numérotées assez
claires pour que deux personnes les suivent de la même façon, livrable
attendu, critères d'arrêt.

### figma-inventory
Entrée : URL du fichier Figma.
- Parcourir pages et frames via le MCP.
- Produire context/inventory.md : tableau écrans x breakpoints, parcours,
  composants et variants, assets à exporter, polices, questions ouvertes.
- Proposer un ordre de construction (composants les plus réutilisés
  d'abord, puis l'écran le plus représentatif).

### extract-tokens
- Lire variables et styles Figma.
- Écrire primitives.css, semantic.css, theme.css (mapping @theme).
- Extraire grille et mouvement.
- Exporter et installer les polices ; si les fichiers ne sont pas
  disponibles, s'arrêter et demander.
- Lister TODO et valeurs isolées dans decisions.md.

### build-component
- Lire le composant Figma et tous ses variants.
- Partir de la primitive shadcn correspondante, restyler par tokens
  sémantiques uniquement.
- Couvrir : défaut, hover, focus, pressed, disabled, loading, error,
  et les variants Figma.
- Exporter la capture Figma dans refs/figma/, lancer visual-diff,
  itérer.
- Écrire docs/components/<nom>.md : quand l'utiliser, quand utiliser
  autre chose, variant par défaut, un bon et un mauvais exemple tirés du
  code, états couverts.
- Ajouter le composant à /design-system.

### build-screen
- Lire l'écran dans l'inventaire et dans Figma.
- Découper en blocks nommés ; réutiliser l'existant avant de créer.
- Exporter et optimiser les assets (WebP ou AVIF pour les images, SVG
  pour les icônes).
- Construire bloc par bloc, puis l'écran complet.
- visual-diff à chaque breakpoint dessiné.
- Vérifier aussi les largeurs intermédiaires (320, 390, 1024, 1280,
  1920) : rien ne casse, rien ne déborde.

### visual-diff
- Capturer le rendu Playwright à la taille exacte de la frame Figma.
- Comparer à refs/figma/<ecran>@<breakpoint>.png.
- Produire une image de différence et un pourcentage d'écart.
- Seuil de convergence par défaut : 5 % (le rendu typographique d'un
  navigateur ne sera jamais identique au pixel près à celui de Figma).
  Configurable par projet.
- Au-delà de 3 itérations sans passer sous le seuil : s'arrêter, montrer
  l'image de différence, expliquer les écarts restants.
- Ne jamais forcer la convergence par des hacks (marges négatives,
  valeurs arbitraires).

### refine-screen
- Entrée : consignes du designer sur un écran validé.
- Traduire chaque consigne en tokens et en grille ; si une consigne
  nécessite une nouvelle valeur, proposer un token, ne pas l'inventer.
- Implémenter animations et micro-interactions avec les tokens de
  mouvement, respecter `prefers-reduced-motion`.
- Passer la checklist de qualité perçue :
  1. rythme vertical régulier, espacements issus de l'échelle ;
  2. alignements sur la grille, alignements optiques des icônes et textes ;
  3. hiérarchie typographique nette, pas de veuve ni d'orphelin visible
     dans les titres ;
  4. images nettes, bien cadrées, sans déformation ;
  5. états hover et focus soignés et cohérents ;
  6. transitions fluides, aucune saccade au chargement (pas de décalage
     de mise en page, polices chargées sans saut visible).
- Consigner les écarts au Figma dans decisions.md, mettre à jour la
  référence dans refs/.

### review-screen
À lancer après chaque construction ou modification d'écran.
1. lint-tokens : aucune valeur hors token.
2. Chaque block a ses états chargement, vide, erreur.
3. Les textes de statut correspondent à l'état réel affiché.
4. axe : aucune violation sérieuse ou critique.
5. visual-diff sous le seuil sur la référence en vigueur.
6. Largeurs intermédiaires sans casse.
Sortie : rapport court (conforme, à corriger, à arbitrer).

### prepare-test
- À partir des parcours de l'inventaire, rédiger dans docs/test-plan.md :
  objectifs du test, tâches à confier aux participants, critères de
  réussite, questions de fin de test.
- Préparer les données fictives nécessaires à chaque tâche.
- Activer lib/tracking.ts si je le demande : événements de navigation,
  clics sur les éléments clés, abandon de parcours, export JSON local.
  Aucun service tiers sans accord.

---

## Scripts

- `npm run dev`, `npm run build`, `npm run preview`
- `npm run diff -- <ecran> [breakpoint]` : scripts/visual-diff.ts
- `npm run diff:update -- <ecran> [breakpoint]` : remplace la référence
  par le rendu actuel (après validation uniquement)
- `npm run lint:tokens` : couleurs hex, rgb, px et valeurs arbitraires
  Tailwind hors src/tokens/ = erreur
- `npm run a11y` : axe via Playwright sur toutes les routes
- `npm run check` : lint:tokens + a11y + typecheck + build

---

## CI

`.github/workflows/check.yml` : sur chaque PR, installer, lancer
`npm run check`, publier en artefact les rapports a11y et les images de
différence en cas d'échec.

---

## Critères d'acceptation du kit

- `npm install` puis `npm run check` passent sur le dépôt vide.
- Le dossier example/ contient un Button avec des tokens factices qui
  prouve que visual-diff, lint-tokens et a11y fonctionnent ; il est exclu
  du build.
- La route /design-system s'affiche, vide mais prête.
- README.md explique en 10 lignes comment démarrer un projet client :
  utiliser le modèle, remplir context/client.md, connecter le Figma MCP,
  lancer la phase 0.
- Aucun style, aucune couleur, aucune police de marque dans le kit.

---

## Interdits pendant la construction du kit

- Ajouter une dépendance non listée sans me demander.
- Écrire une règle de design générique (« boutons arrondis », etc.) :
  le kit ne décide d'aucune apparence.
- Sur-documenter : si une information vit dans le code, ne pas la répéter.
- Mélanger le générique et le spécifique : tout ce qui concerne un client
  va dans le dépôt du client, jamais dans le kit.
