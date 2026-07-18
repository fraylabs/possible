// Generated from contributor-authored Markdown in knowledge/pages/. Do not edit by hand.
import type { WikiCorpus } from "./types.js";

export const wikiCorpusData: WikiCorpus = {
  "pages": [
    {
      "slug": "3d-renderer-selection",
      "title": "3D renderer selection",
      "summary": "A decision record covering direct scene control, React integration, target browser APIs, asset pipeline, interaction model, and expected rendering complexity.",
      "tags": [
        "renderer",
        "threejs",
        "webgl",
        "webgpu"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Three.js WebGPU renderer",
          "url": "https://threejs.org/manual/en/webgpurenderer.html"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nAn explicit renderer decision aligns work in [3D web experiences](/wiki/3d-web-experiences) with its target browsers, application framework, asset pipeline, interaction model, and expected scene complexity.\n\n## A common approach\n\nUse stable WebGL-backed [Three.js](/wiki/threejs) as the conservative browser baseline when broad, predictable behavior matters. Treat the WebGPU renderer as a separate compatibility decision that must be revalidated against current limitations and the actual target environment.\n\nChoose direct scene control when it suits the application boundary. Compare [React Three Fiber](/wiki/react-three-fiber) when the application is React-led and declarative scene composition would make the code easier to maintain.\n\n## Use this when\n\nUse this practice when interactive browser 3D is essential and browser graphics support can determine whether the experience works.\n\n## Consider another route when\n\nA controlled environment may justify WebGPU-specific requirements, but only after it has been tested and the project explicitly accepts experimental renderer limitations.\n\n## Important decisions\n\nRecord the renderer, browser API, framework boundary, asset path, input model, expected complexity, and fallback. The fallback should say what users receive when the preferred graphics path is unavailable.\n\n## How to verify\n\nExercise the selected renderer in every supported browser class before commitment. Verify the representative scene and fallback, not only a minimal renderer initialization.",
      "links": [
        "3d-web-experiences",
        "threejs",
        "react-three-fiber"
      ]
    },
    {
      "slug": "3d-runtime-verification",
      "title": "3D runtime verification",
      "summary": "Browser and device checks for scene load, camera and input behavior, asset failures, fallback behavior, visual correctness, and representative frame-time stability.",
      "tags": [
        "3d",
        "runtime",
        "frame-time",
        "browser-testing"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Three.js fundamentals",
          "url": "https://threejs.org/manual/en/fundamentals.html"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nRuntime verification provides evidence that [3D web experiences](/wiki/3d-web-experiences) work as interactive scenes, not merely as code that compiles.\n\n## A common approach\n\nLoad the real [Three.js](/wiki/threejs) scene on representative target browsers and devices. Exercise camera and input behavior, watch for asset-loading failures, inspect the fallback, compare visual correctness, and measure representative frame-time stability.\n\n## Use this when\n\nUse this practice when an application renders interactive 3D or when assets and device graphics capability can change the experience.\n\n## Consider another route when\n\nUse general [Production web verification](/wiki/production-web-verification) when there is no real-time renderer and ordinary browser-flow checks cover the entire behavior.\n\n## Common mistakes\n\nA successful build does not prove that assets load, inputs work, the camera behaves correctly, fallbacks appear, or frame behavior remains stable. Hidden console asset errors are runtime failures even if the route looks partly correct.\n\n## How to verify\n\nKeep scene-load, interaction, fallback, visual, and frame-behavior evidence. Every representative browser and device class should complete the critical 3D route without hidden asset errors.",
      "links": [
        "3d-web-experiences",
        "threejs",
        "production-web-verification"
      ]
    },
    {
      "slug": "3d-web-experiences",
      "title": "3D web experiences",
      "summary": "Browser outcomes where interactive scenes, cameras, geometry, materials, animation, asset loading, input, and frame-time behavior are central rather than decorative.",
      "tags": [
        "3d",
        "webgl",
        "animation",
        "interactive-rendering"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Three.js fundamentals",
          "url": "https://threejs.org/manual/en/fundamentals.html"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\n3D web experiences are [Browser applications](/wiki/browser-applications) in which scenes, cameras, geometry, materials, animation, assets, input, and frame-time behavior are central to the product rather than decorative.\n\n## A common approach\n\nTreat interactive 3D as a rendering product. Set an explicit asset and performance budget before making a [3D renderer selection](/wiki/3d-renderer-selection), including the choice between direct Three.js control and a React renderer.\n\n## Use this when\n\nUse this approach when a real-time scene is essential and browser compatibility plus frame-time behavior are acceptance criteria.\n\n## Consider another route when\n\nUse a pre-rendered image or video when it communicates the outcome without real-time interaction. Follow [Data-heavy dashboards](/wiki/data-heavy-dashboards) patterns when 3D is incidental and records, forms, charts, or operational workflows dominate.\n\n## Important decisions\n\nDefine the supported browser and device classes, asset-loading path, input model, fallback, and representative performance budget. These constraints should shape the renderer choice and later runtime verification.\n\n## How to verify\n\nVerify the branch choice with a representative interactive scene on the target browser and device classes. Confirm that real-time rendering, asset loading, input behavior, fallback handling, and frame-time expectations are part of the acceptance criteria before committing to [3D renderer selection](/wiki/3d-renderer-selection).",
      "links": [
        "browser-applications",
        "3d-renderer-selection",
        "data-heavy-dashboards"
      ]
    },
    {
      "slug": "3mf-additive-exchange",
      "title": "3MF additive exchange",
      "summary": "An additive manufacturing package format with defined units, mesh geometry, transforms, metadata, and published extensions for materials and production workflows.",
      "tags": [
        "3mf",
        "additive",
        "units",
        "metadata"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "3MF specification suite",
          "url": "https://3mf.io/spec/"
        }
      ],
      "parent": "manufacturing",
      "body": "3MF is an additive manufacturing package format with defined units, mesh geometry, transforms, metadata, and published extensions for materials and production workflows.\n\nUse 3MF when the selected additive toolchain explicitly supports it and defined units or richer print metadata are useful. Choose [STL mesh exchange](/wiki/stl-mesh-exchange) only when the target accepts a simpler triangulated surface package, and do not substitute 3MF for [STEP solid exchange](/wiki/step-solid-exchange) when the recipient needs neutral solid geometry for CAD or machining exchange.\n\nVerification is still toolchain-specific. Confirm that the provider or slicer actually supports the 3MF features you intend to rely on before treating the package as the final additive handoff. It can serve additive routes such as SLS when the selected provider explicitly accepts 3MF for that service.",
      "links": [
        "stl-mesh-exchange",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "browser-applications",
      "title": "Browser applications",
      "summary": "Interactive browser software whose architecture must account for navigation, client and server boundaries, data mutation, state, accessibility, testing, and deployment.",
      "tags": [
        "browser",
        "application",
        "routing",
        "data"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Sunsetting Create React App",
          "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\n[Web](/wiki/web) applications can support multiple views, navigation, data reads and mutations, persistent state, and accessible user flows across client and server boundaries.\n\n## A common approach\n\nClassify the application by its data flow and runtime needs before selecting a stack. Decide which work belongs in the client or server, how routes and state behave, where mutations occur, and how the result will be tested and deployed. Use [Framework selection](/wiki/framework-selection) only after those constraints are visible.\n\n## Use this when\n\nUse application patterns when the browser surface has multiple routes or views, or when the product reads or mutates application data.\n\n## Consider another route when\n\nA single static document with negligible interaction may not need an application framework. Start from [3D web experiences](/wiki/3d-web-experiences) when rendering, assets, input, and frame budget dominate the architecture instead of ordinary data flow.\n\n## Important decisions\n\nRecord the navigation model, client/server boundary, mutation path, state ownership, accessibility target, critical test flows, and deployment constraints before treating the architecture as settled.\n\n## How to verify\n\nVerify the classification against a representative route that exercises navigation plus real data reads or mutations. The chosen architecture should make the client and server boundary, state ownership, and deployment target explicit before [Framework selection](/wiki/framework-selection) is treated as settled.",
      "links": [
        "web",
        "framework-selection",
        "3d-web-experiences"
      ]
    },
    {
      "slug": "cadquery",
      "title": "CadQuery",
      "summary": "A Python library for script-authored parametric solid CAD, suited to agent-readable models, repeatable parameter changes, and export of manufacturing exchange formats.",
      "tags": [
        "cadquery",
        "python",
        "parametric-cad",
        "step"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "CadQuery documentation",
          "url": "https://cadquery.readthedocs.io/en/latest/"
        }
      ],
      "parent": "manufacturing",
      "body": "CadQuery is a Python library for script-authored parametric solid CAD. It fits parts that can be expressed through parametric solid modeling when source-level diff, automation, and repeatable variants matter.\n\nUse CadQuery when a plain-text Python model and repeatable agent edits are valuable, but validate geometry and exports with real CAD checks. Choose [FreeCAD](/wiki/freecad) instead when interactive surfacing or a GUI-native parametric workflow fits better.\n\nCadQuery is one implementation tool for a broader parametric CAD practice, and it documents export to [STEP solid exchange](/wiki/step-solid-exchange) for downstream handoff. Keep the native parametric source under revision control because the exported exchange file is not the design authority.",
      "links": [
        "freecad",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "cloudflare-workers",
      "title": "Cloudflare Workers",
      "summary": "A Web application platform for static assets and server logic, with a documented Next.js deployment path through OpenNext and Wrangler.",
      "tags": [
        "hosting",
        "workers",
        "cloudflare",
        "opennext"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js on Cloudflare Workers",
          "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/"
        },
        {
          "title": "Cloudflare Workers static assets",
          "url": "https://developers.cloudflare.com/workers/static-assets/"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\n[Cloudflare Workers](https://workers.cloudflare.com/) can deploy server logic together with a configured static-asset directory as one application unit through Wrangler or a connected build. It also has a documented path for [Next.js](/wiki/nextjs) projects through the OpenNext adapter and Wrangler, producing a Workers deployment URL.\n\n## A common approach\n\nCheck the application against the current Workers runtime and framework-adapter documentation, then [create a Cloudflare preview deployment](/wiki/create-cloudflare-preview-deployment) through authenticated Wrangler commands. Verify the resulting non-production URL before making any separately approved release decision.\n\n## Use this when\n\nShortlist Workers when its runtime and static-asset model fit the application and the required framework path is currently supported. It is one deployment provider in [Web](/wiki/web).\n\n## Consider another route when\n\nDo not select Workers when required Node.js APIs or Next.js features are unsupported by the current runtime or adapter. [Vercel](/wiki/vercel) is an alternative when its integrated Next.js and Git deployment workflow fits better.\n\n## Known constraints and live checks\n\nAt the review date, Cloudflare's Next.js guidance marked Node.js middleware support as not yet supported, so middleware requirements need explicit review. Before every handoff, recheck OpenNext and Next.js compatibility as well as current pricing, included usage, and request or asset billing; account and regional availability; compliance fit; bindings; and feature availability. These are live unknowns, not durable promises.\n\n## Authenticated handoffs\n\nThe Wrangler build-and-deploy route requires authentication, creates externally reachable provider state, and needs explicit approval. Confirm the target, credentials, source, and expected external effect before running it. Possible documents the route but does not hold the account or authorize the deployment.\n\n## How to verify\n\nRe-read the current adapter and runtime documentation against the project's actual features. After deployment, confirm the approved target and URL, exercise static assets and server behavior, and retain a receipt with the deployment identity and observed runtime evidence.",
      "links": [
        "nextjs",
        "create-cloudflare-preview-deployment",
        "web",
        "vercel"
      ]
    },
    {
      "slug": "cnc-machining",
      "title": "CNC machining",
      "summary": "Subtractive production from stock with strong control over material, dimensions, and finish, bounded by cutter access, internal radii, workholding, depth, and fragile-feature constraints.",
      "tags": [
        "cnc",
        "subtractive",
        "machining",
        "stock-material"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Design for machining toolkit",
          "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nCNC machining is a candidate when stock material properties, dimensional control, and machined finish matter enough to justify subtractive access and workholding constraints.\n\n## A common approach\n\nUse CNC machining when the part is compatible with available stock and cutter access, and when material, dimensional, or finish requirements favor machining.\n\n## Use this when\n\nUse this process when the part can be reached from stock with the available cutting approach and when material, dimensional, or finish requirements favor machining.\n\n## Consider another route when\n\nIf the geometry depends on inaccessible cavities, perfectly sharp internal corners, or deep fragile features without a qualified method, do not assume CNC is viable. [Laser sheet cutting and bending](/wiki/laser-sheet-cutting-and-bending) can be more direct for constant-thickness 2D profiles and bent sheet parts.\n\n## Important decisions\n\nCNC machining is one process option within [Custom manufactured parts](/wiki/custom-manufactured-parts). [STEP solid exchange](/wiki/step-solid-exchange) remains a common neutral solid-model handoff for CNC quoting and fabrication.",
      "links": [
        "laser-sheet-cutting-and-bending",
        "custom-manufactured-parts",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "create-cloudflare-preview-deployment",
      "title": "Create a Cloudflare preview deployment",
      "summary": "Deploy a compatible project to an approved non-production Cloudflare target and return its URL and runtime-verification evidence.",
      "tags": [
        "cloudflare",
        "preview",
        "workers",
        "external-effect"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js on Cloudflare Workers",
          "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nA Cloudflare preview puts a compatible Web application on a non-production target so its real runtime and browser flows can be checked. The handoff invokes [Cloudflare Workers](/wiki/cloudflare-workers) and produces a preview URL plus a deployment-verification receipt.\n\n## A common approach\n\nLive-check the Workers runtime and the current framework-adapter support against the project. Ask the captain to approve Wrangler authentication and creation of externally reachable preview state. Deploy only to the approved non-production target, then return the exact URL and verification evidence.\n\n## Use this when\n\nUse this action after Cloudflare Workers has passed a live compatibility check and a non-production environment is needed for browser verification. It is an external delivery action within [Web](/wiki/web).\n\n## Consider another route when\n\nDo not use this route if required Next.js features, Node.js APIs, or middleware are unsupported by the current adapter or Workers runtime. If Vercel is the compatible selected provider, [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) instead.\n\n## Important decisions\n\nAuthenticated deployment changes external provider state and therefore requires explicit approval. Preview approval covers neither a production target nor a later production release; production approval must be requested separately.\n\n## How to verify\n\nConfirm that the returned URL belongs to the approved target, exercise the declared runtime and browser flows, and apply the relevant [Production web verification](/wiki/production-web-verification) checks. Record the deployment identity, URL, and evidence in the receipt rather than treating a successful command as sufficient proof.",
      "links": [
        "cloudflare-workers",
        "web",
        "create-vercel-preview-deployment",
        "production-web-verification"
      ]
    },
    {
      "slug": "create-vercel-preview-deployment",
      "title": "Create a Vercel preview deployment",
      "summary": "Create an approval-gated Vercel preview from project source or a connected Git revision, then return a URL and evidence without promoting production.",
      "tags": [
        "vercel",
        "preview",
        "deployment",
        "external-effect"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Deploying Git repositories with Vercel",
          "url": "https://vercel.com/docs/git"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nA preview gives reviewers an externally reachable version of a Web project before anything is released to production. It hands approved source or a Git revision to [Vercel](/wiki/vercel) and returns both a preview URL and a deployment-verification receipt.\n\n## A common approach\n\nFirst, live-check Vercel compatibility, the account and plan, and the intended target configuration. Ask the captain to approve repository or source access and creation of external preview state. Create the preview through the approved official path, then return the exact URL with the evidence used to verify it.\n\n## Use this when\n\nUse this route when Vercel was selected after a live provider check and a review environment is needed before production. It is one delivery action within [Web](/wiki/web), not an implicit release.\n\n## Consider another route when\n\nDo not proceed while repository access, secrets, provider terms, or the deployment target remain unapproved. When Workers is the compatible selected provider, [Create a Cloudflare preview deployment](/wiki/create-cloudflare-preview-deployment) instead.\n\n## Important decisions\n\nAuthentication, source access, and deployment all create state outside Possible, so they require explicit approval. Approval to create a preview does not authorize production promotion; production is a separate decision with its own target, cost, domain, and release impact.\n\n## How to verify\n\nConfirm the returned preview URL is the intended deployment and run the applicable [Production web verification](/wiki/production-web-verification) checks against it. Record the deployment identity, observed URL, and verification evidence as the receipt. A successful build alone is not a verified preview.",
      "links": [
        "vercel",
        "web",
        "create-cloudflare-preview-deployment",
        "production-web-verification"
      ]
    },
    {
      "slug": "custom-manufactured-parts",
      "title": "Custom manufactured parts",
      "summary": "One-off or low-volume physical components whose geometry, material, process, tolerances, drawings, provider constraints, and inspection plan must agree before fabrication.",
      "tags": [
        "custom-parts",
        "prototype",
        "fabrication",
        "quote"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Take CAD files from design to production",
          "url": "https://sendcutsend.com/blog/take-your-cad-files-from-design-to-production/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nThis page covers one-off and low-volume parts whose geometry, material, process, tolerances, drawings, provider constraints, and inspection plan must agree before fabrication.\n\n## A common approach\n\nTreat a custom part as a controlled manufacturing package rather than a mesh upload. Preserve the native design, select the process, export revisioned files, and define the critical checks before the handoff leaves your workspace.\n\n## Use this when\n\nUse this route when a custom geometry will be quoted or fabricated, or when fit, function, material, or inspection matters to acceptance.\n\n## Consider another route when\n\nIf a catalog component already satisfies the requirement without custom fabrication, do not force a custom-part workflow. When mount interfaces and loading define the problem, continue with [Custom motor brackets](/wiki/custom-motor-brackets).\n\n## Important decisions\n\nThis is a primary branch of [Manufacturing](/wiki/manufacturing). Part requirements still need to be mapped to a viable process, so [Manufacturing process selection](/wiki/manufacturing-process-selection) is an early follow-on practice.",
      "links": [
        "custom-motor-brackets",
        "manufacturing",
        "manufacturing-process-selection"
      ]
    },
    {
      "slug": "custom-motor-brackets",
      "title": "Custom motor brackets",
      "summary": "Structural interface parts that locate and restrain a motor while respecting mounting geometry, loads, clearances, fasteners, material behavior, fabrication access, and inspection needs.",
      "tags": [
        "motor-bracket",
        "mounting",
        "robotics",
        "structural-part"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "ASME Y14.5 dimensioning and tolerancing overview",
          "url": "https://www.asme.org/learning-development/find-course/essentials-y14-5-dimensioning-tolerancing/self-study"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nCustom motor brackets turn a motor mounting problem into a controlled part definition that accounts for interface geometry, loads, clearances, fasteners, material behavior, fabrication access, and inspection needs.\n\n## A common approach\n\nDefine the motor interface geometry, load cases, clearances, fasteners, environment, and critical dimensions before choosing a process or generating fabrication files.\n\n## Use this when\n\nUse this route when a motor must be mounted in a custom assembly and fit plus structural behavior affect the mechanism outcome.\n\n## Consider another route when\n\nIf a validated catalog bracket already fits the motor, structure, loads, and environment, use that instead. When the component is custom but not specifically a motor mounting interface, return to [Custom manufactured parts](/wiki/custom-manufactured-parts).\n\n## Important decisions\n\nThis is a constrained branch of [Custom manufactured parts](/wiki/custom-manufactured-parts). [Parametric CAD master](/wiki/parametric-cad-master) keeps bracket variants and revisions reproducible. [MuJoCo](/wiki/mujoco) remains relevant because robot mechanism simulations can expose motion and load assumptions before fabrication.",
      "links": [
        "custom-manufactured-parts",
        "parametric-cad-master",
        "mujoco"
      ]
    },
    {
      "slug": "data-heavy-dashboards",
      "title": "Data-heavy dashboards",
      "summary": "Authenticated or internal browser applications centered on dense records, filters, tables, forms, charts, operational navigation, and repeated data updates such as inventory dashboards.",
      "tags": [
        "dashboard",
        "inventory",
        "tables",
        "forms",
        "data-heavy"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js server and client components",
          "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components"
        },
        {
          "title": "shadcn/ui documentation",
          "url": "https://ui.shadcn.com/docs"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nData-heavy dashboards are [Browser applications](/wiki/browser-applications) for dense records, filters, tables, forms, charts, operational navigation, and repeated updates, for example an inventory dashboard.\n\n## A common approach\n\nFor a React and TypeScript dashboard that benefits from routing, server data, forms, and reusable interface primitives, compare the [Next.js](/wiki/nextjs) App Router with [shadcn/ui](/wiki/shadcn-ui) as a productive starting point. This is a conditional pairing, not a default for every dashboard.\n\n## Use this when\n\nUse this approach when React and TypeScript fit the working context and the product benefits from both framework data features and locally maintained UI primitives.\n\n## Consider another route when\n\nCompare [Vite with React](/wiki/vite-react) when the application is deliberately client-only and server rendering or framework server features are unnecessary. Choose a different composition approach when the product is non-React or rejects Tailwind and local component maintenance.\n\n## Important decisions\n\nSeparate server and client responsibilities, decide how data updates invalidate the visible records, and account for routing, forms, accessibility, and component ownership. Validate the choice against a representative dense screen rather than a sparse demo.\n\n## How to verify\n\nVerify the approach against a representative dense screen with realistic records, filters, forms, and navigation. Confirm that routing, server data access, local component ownership, and accessibility still hold once the screen is more complex than a minimal demo.",
      "links": [
        "browser-applications",
        "nextjs",
        "shadcn-ui",
        "vite-react"
      ]
    },
    {
      "slug": "design-for-manufacturing-preflight",
      "title": "Design-for-manufacturing preflight",
      "summary": "A process- and provider-specific review of inaccessible geometry, fragile or unsupported features, material assumptions, file setup, and known capability limits before external upload.",
      "tags": [
        "dfm",
        "preflight",
        "geometry",
        "provider-constraints"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Design for machining toolkit",
          "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA local DFM report that captures blocking issues, assumptions, and unresolved provider checks before proprietary files are uploaded.\n\n## A common approach\n\nRun a local process-specific DFM preflight before proprietary upload, then treat provider feedback as new evidence rather than automatic permission to change function.\n\n## Use this when\n\nUse this practice when a process and provider shortlist exists and geometry or feature choices may violate fabrication constraints.\n\n## Consider another route when\n\nIf no external fabrication handoff is planned and the design remains a conceptual model, a formal preflight can wait. When DFM failures show that the chosen route is structurally mismatched, return to [Manufacturing process selection](/wiki/manufacturing-process-selection).\n\n## Important decisions\n\nThis protects the [Custom manufactured parts](/wiki/custom-manufactured-parts) handoff. The preflight criteria depend on the selected manufacturing process.\n\n## How to verify\n\nKeep any functional material or geometry change captain-approved and revisioned.",
      "links": [
        "manufacturing-process-selection",
        "custom-manufactured-parts"
      ]
    },
    {
      "slug": "dxf-profile-exchange",
      "title": "DXF profile exchange",
      "summary": "A 2D drawing exchange format commonly used to hand off clean, closed, one-to-one cut profiles or flat patterns to sheet cutting workflows.",
      "tags": [
        "dxf",
        "2d",
        "laser-cutting",
        "flat-pattern"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "SendCutSend getting started",
          "url": "https://sendcutsend.com/guidelines/getting-started/"
        }
      ],
      "parent": "manufacturing",
      "body": "DXF is a 2D drawing exchange format used to hand off clean, closed, 1:1 cut profiles or flat patterns to sheet-cutting workflows.\n\nUse DXF when the target process consumes a planar cut profile or flat pattern and the provider explicitly accepts DXF for the selected service. Keep units explicit, contours closed, duplicate geometry removed, and only process-relevant entities in the file. Choose [STEP solid exchange](/wiki/step-solid-exchange) instead when the process requires 3D solid geometry, partial-depth features, or other details that a 2D profile cannot express.\n\nDXF is commonly accepted for planar laser sheet cutting, but the right verification is still service-specific preflight against the provider's current guidance and the exact file revision being uploaded.",
      "links": [
        "step-solid-exchange"
      ]
    },
    {
      "slug": "fdm-additive-manufacturing",
      "title": "FDM additive manufacturing",
      "summary": "Material-extrusion additive manufacturing commonly suited to inexpensive concepts, fixtures, and fit checks, with layer behavior and surface limitations that must match the function.",
      "tags": [
        "fdm",
        "additive",
        "prototype",
        "fit-check"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "FDM vs SLA vs SLS",
          "url": "https://formlabs.com/eu/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nFDM is a candidate for inexpensive concepts, fixtures, and fit checks when the part can tolerate layer-dependent behavior and a limited surface finish.\n\n## A common approach\n\nUse FDM when low cost and fast geometric learning matter more than isotropic material behavior, and when the geometry can be oriented and supported for the selected machine and material.\n\n## Use this when\n\nUse this process when fast, inexpensive geometric learning matters more than isotropic properties and the geometry can be oriented and supported for the selected machine and material.\n\n## Consider another route when\n\nIf fine finish, isotropy, watertightness, or validated production properties are essential without further qualification, do not assume FDM is acceptable. [SLS additive manufacturing](/wiki/sls-additive-manufacturing) can better suit complex durable nylon parts when supportless powder-bed production and more uniform behavior justify it.\n\n## Important decisions\n\nFDM is one process option within [Custom manufactured parts](/wiki/custom-manufactured-parts). [STL mesh exchange](/wiki/stl-mesh-exchange) remains a common handoff when the selected workflow accepts STL.",
      "links": [
        "sls-additive-manufacturing",
        "custom-manufactured-parts",
        "stl-mesh-exchange"
      ]
    },
    {
      "slug": "fictiv",
      "title": "Fictiv",
      "summary": "A manufacturing network documenting machining, molding, additive, casting, and sheet services through a web quote path with process-specific file and assembly constraints.",
      "tags": [
        "manufacturer",
        "network",
        "quote",
        "drawings"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Fictiv capabilities",
          "url": "https://www.fictiv.com/capabilities"
        },
        {
          "title": "Fictiv supported file formats",
          "url": "https://help.fictiv.com/en/articles/901841-what-file-formats-does-fictiv-support"
        }
      ],
      "parent": "manufacturing",
      "body": "Fictiv is a manufacturing network that documents machining, molding, additive, casting, and sheet services through a web quote path. Its documented quote route accepts supported process-specific CAD inputs including [STEP solid exchange](/wiki/step-solid-exchange), STP, SLDPRT, X_T, and IGES, and supporting drawings remain important for communicating manufacturing requirements.\n\nShortlist Fictiv only when the current process and file guidance fit the part and supporting drawings can satisfy the route. Supported file formats and assembly handling vary by process, so current official guidance must be checked before upload. Choose [Xometry](/wiki/xometry) when its supplier network or current process fit is better.\n\nThis page reflects provider documentation checked on 2026-07-17 and still requires a live check. Price, minimums, taxes, and quote validity; supplier, process, material, finish, inspection, and capacity availability; supplier and shipping geography, timing, terms, and destination eligibility; and the exact inspection service, sampling, documentation, and process eligibility are live unknowns until quote configuration.\n\nThe handoff channel is the authenticated website upload flow for proprietary CAD and drawings. That upload can return DFM feedback, creates external quote state, and requires explicit approval before the request is made.",
      "links": [
        "step-solid-exchange",
        "xometry"
      ]
    },
    {
      "slug": "framework-selection",
      "title": "Framework selection",
      "summary": "A constraint-first comparison of routing, rendering, server data, deployment targets, ecosystem fit, and maintenance ownership before committing an application stack.",
      "tags": [
        "framework",
        "architecture",
        "constraints",
        "trade-offs"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Sunsetting Create React App",
          "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app"
        },
        {
          "title": "Deploying Next.js",
          "url": "https://nextjs.org/docs/app/getting-started/deploying"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nA constraint-first framework decision gives a browser project an implementation starting point without turning a familiar default into a universal rule. It also leaves future maintainers a record of why the chosen runtime and delivery model fit.\n\n## A common approach\n\nStart with the required routing, rendering, server execution, static-output, and deployment behavior. Then compare ecosystem fit and who will maintain framework-specific code. Record the selected framework, where it applies, and the strongest rejected alternative.\n\n[Next.js](/wiki/nextjs) is one candidate when server framework features or its deployment modes are useful. Always compare [Vite with React](/wiki/vite-react) when a client-oriented application does not need those features.\n\n## Use this when\n\nUse this practice when a new project falls under [Browser applications](/wiki/browser-applications) and routing, server execution, static output, or deployment compatibility can materially change the choice.\n\n## Consider another route when\n\nKeep the framework of an existing, maintained application when migration is outside the outcome. A framework review is not a reason by itself to reopen a settled architecture.\n\n## Important decisions\n\nWrite down the required rendering and delivery modes, the deployment target, the ownership boundary, and why the rejected option was not selected. This decision record is the useful output—not simply a framework name.\n\n## How to verify\n\nCheck current official documentation for every required rendering and deployment mode. Exercise the critical route against the intended build and hosting target before treating the choice as committed.",
      "links": [
        "nextjs",
        "vite-react",
        "browser-applications"
      ]
    },
    {
      "slug": "freecad",
      "title": "FreeCAD",
      "summary": "An open-source parametric 3D modeler with editable feature history, real-world units, solid modeling, drawings, and export paths for fabrication workflows.",
      "tags": [
        "freecad",
        "parametric-cad",
        "gui",
        "open-source"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "FreeCAD parametric modeler",
          "url": "https://www.freecad.org/index.php?lang=eng_EN"
        }
      ],
      "parent": "manufacturing",
      "body": "FreeCAD is an open-source parametric 3D modeler with editable feature history, solid modeling, drawings, and real-world units. It fits contributors who want an open-source native CAD environment and interactive constrained modeling tools.\n\nUse FreeCAD when a GUI parametric workflow fits better than a script-first source. Choose [CadQuery](/wiki/cadquery) instead when automated textual generation, code review, and source-level edits are the primary modeling requirements.\n\nFreeCAD is one implementation tool for parametric CAD and supports neutral solid export for workflows that hand off through [STEP solid exchange](/wiki/step-solid-exchange). Verify the exported geometry in the receiving tool or manufacturing flow before treating the handoff as complete.",
      "links": [
        "cadquery",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "inspection-plan",
      "title": "Inspection plan",
      "summary": "A pre-quote definition of critical-to-quality features, measurement methods, sample expectations, evidence, and acceptance decisions, distinct from generic provider inspection language.",
      "tags": [
        "inspection",
        "ctq",
        "measurement",
        "acceptance"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Protolabs inspection reports",
          "url": "https://www.protolabs.com/inspection-reports/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA critical feature list, measurement method, sampling expectation, evidence package, and acceptance owner that are defined before the quote becomes a fabrication commitment.\n\n## A common approach\n\nDefine critical-to-quality features and evidence before quoting. Do not treat standard inspection as equivalent to CMM, FAI, PPAP, or a custom report.\n\n## Use this when\n\nUse this practice when the part has measurable functional acceptance criteria and provider inspection options affect the quote or process selection.\n\n## Consider another route when\n\nIf the artifact is a nonfunctional visual sample with no dimensional acceptance claim, a full inspection plan may be unnecessary. Return to [Tolerance contract](/wiki/tolerance-contract) if critical features and acceptance limits are not yet defined.\n\n## Important decisions\n\nThis defines acceptance evidence for [Custom manufactured parts](/wiki/custom-manufactured-parts). [Protolabs](/wiki/protolabs) remains relevant because provider-specific inspection options require a live capability check.\n\n## How to verify\n\nConfirm the named inspection service and required evidence live with the selected provider before purchase or fabrication.",
      "links": [
        "tolerance-contract",
        "custom-manufactured-parts",
        "protolabs"
      ]
    },
    {
      "slug": "laser-sheet-cutting-and-bending",
      "title": "Laser sheet cutting and bending",
      "summary": "Fabrication of constant-thickness 2D profiles, optionally followed by provider-supported bending, where flat geometry, closed contours, stock thickness, and bend setup define viability.",
      "tags": [
        "laser-cutting",
        "sheet-metal",
        "bending",
        "flat-profile"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "SendCutSend 3D file guidelines",
          "url": "https://sendcutsend.com/guidelines/3d-files/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nLaser sheet cutting suits constant-thickness 2D profiles and provider-supported bends when flat geometry, closed contours, stock thickness, and bend setup define the part.\n\n## A common approach\n\nUse laser sheet cutting for clean constant-thickness profiles and supported bends, with revisioned flat geometry and live material-thickness constraints.\n\n## Use this when\n\nUse this process when the part can be represented as a planar cut profile or supported bent sheet and constant stock thickness is compatible with the design.\n\n## Consider another route when\n\nIf the geometry requires enclosed 3D volumes, partial-depth features, or unsupported forming operations, do not force a sheet-cut route. [CNC machining](/wiki/cnc-machining) is the alternative when solid 3D features or partial-depth machining are required.\n\n## Important decisions\n\nLaser sheet cutting and bending is one process option within [Custom manufactured parts](/wiki/custom-manufactured-parts). [DXF profile exchange](/wiki/dxf-profile-exchange) remains a common 1:1 artifact for 2D cutting workflows.",
      "links": [
        "cnc-machining",
        "custom-manufactured-parts",
        "dxf-profile-exchange"
      ]
    },
    {
      "slug": "manufacturing",
      "title": "Manufacturing",
      "summary": "Operational knowledge for turning controlled design intent into process-appropriate files, provider shortlists, approval-gated handoffs, fabricated parts, and inspection evidence.",
      "tags": [
        "fabrication",
        "cad",
        "process",
        "inspection"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Procedure for Product Data Exchange Using STEP",
          "url": "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=821480"
        }
      ],
      "body": "## What this makes possible\n\nManufacturing knowledge covers outcomes that end in fabricated parts. It keeps a traceable chain from native design intent through process-specific artifacts, provider handoffs, fabricated parts, and inspection evidence.\n\n## A common approach\n\nStart here when the requested outcome includes one or more physical custom parts. Keep the native design, exported artifacts, approvals, and inspection evidence aligned, then narrow into [Custom manufactured parts](/wiki/custom-manufactured-parts) when a specific part must be quoted or fabricated.\n\n## Use this when\n\nUse this branch when the outcome includes one or more physical custom parts and a manufacturing provider or local fabrication process will consume exported artifacts.\n\n## Consider another route when\n\nIf the outcome is wholly digital and never produces a physical component, use [Web](/wiki/web) instead.\n\n## Important decisions\n\nWeb interfaces often initiate or monitor custom-part workflows, so Manufacturing and [Web](/wiki/web) can meet in the same project even when the fabricated part remains the core outcome.",
      "links": [
        "custom-manufactured-parts",
        "web"
      ]
    },
    {
      "slug": "manufacturing-drawing",
      "title": "Manufacturing drawing",
      "summary": "A human- and provider-readable definition of critical dimensions, tolerances, threads, finishes, datums, notes, and inspection expectations that solid geometry alone may not carry.",
      "tags": [
        "drawing",
        "gdandt",
        "tolerances",
        "threads",
        "finish"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Quote parts with attached drawings",
          "url": "https://www.fictiv.com/help/getting-a-quote/how-to-get-parts-quoted-with-attached-drawings"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA revision-matched drawing that carries the critical feature controls, notes, and inspection expectations that solid geometry alone may not communicate safely.\n\n## A common approach\n\nAttach a drawing when critical tolerances, threads, finishes, datums, or inspection requirements cannot be safely inferred from the 3D model and quote form.\n\n## Use this when\n\nUse this practice when specific features have functional acceptance limits and the provider accepts supporting drawings with the model.\n\n## Consider another route when\n\nIf every required manufacturing and inspection attribute is already represented and confirmed through another accepted contract, a separate drawing may be unnecessary. Use [Tolerance contract](/wiki/tolerance-contract) to decide which features actually need drawing-level controls.\n\n## Important decisions\n\nThis is part of the [Custom manufactured parts](/wiki/custom-manufactured-parts) handoff package. [Tolerance contract](/wiki/tolerance-contract) defines the feature tolerances and datum strategy that the drawing communicates. [STEP solid exchange](/wiki/step-solid-exchange) remains the neutral solid model commonly paired with the drawing.\n\n## How to verify\n\nConfirm that drawing revision, units, model revision, and inspection expectations all agree.",
      "links": [
        "tolerance-contract",
        "custom-manufactured-parts",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "manufacturing-process-selection",
      "title": "Manufacturing process selection",
      "summary": "A requirements-led comparison of geometry, material behavior, quantity, finish, dimensional needs, inspection, and provider constraints before committing fabrication artifacts.",
      "tags": [
        "process-selection",
        "fdm",
        "sls",
        "cnc",
        "sheet-cutting"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "FDM vs SLA vs SLS",
          "url": "https://formlabs.com/eu/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/"
        },
        {
          "title": "Design for machining toolkit",
          "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA selected process with requirement fit, known risks, and at least one viable alternative before the part definition is optimized around a specific provider.\n\n## A common approach\n\nSelect the process from functional requirements and geometry before optimizing the CAD for a provider. Keep at least one viable alternative until [Design-for-manufacturing preflight](/wiki/design-for-manufacturing-preflight) checks the chosen route.\n\n## Use this when\n\nUse this practice when a custom part can be produced by more than one process and material behavior, finish, geometry, or dimensional requirements affect viability.\n\n## Consider another route when\n\nIf a regulated or already qualified process is fixed by an external requirement, document that constraint instead of reopening selection.\n\n## Important decisions\n\nThis is an early practice within [Custom manufactured parts](/wiki/custom-manufactured-parts). [CNC machining](/wiki/cnc-machining) and [FDM additive manufacturing](/wiki/fdm-additive-manufacturing) are two process families often evaluated against the same requirement set.\n\n## How to verify\n\nReject any universal tolerance, material, finish, or cost claim that is being copied across unlike processes.",
      "links": [
        "design-for-manufacturing-preflight",
        "custom-manufactured-parts",
        "cnc-machining",
        "fdm-additive-manufacturing"
      ]
    },
    {
      "slug": "mujoco",
      "title": "MuJoCo",
      "summary": "A general-purpose physics engine for articulated structures and contact, useful for robot mechanism studies while remaining a model-dependent simulation rather than physical proof.",
      "tags": [
        "mujoco",
        "robotics",
        "simulation",
        "dynamics"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "MuJoCo overview",
          "url": "https://mujoco.readthedocs.io/en/stable/overview.html"
        }
      ],
      "parent": "manufacturing",
      "body": "MuJoCo is a general-purpose physics engine for articulated structures and contact. It is useful for robot mechanism studies before fabrication, including cases where a motor-bracket interface participates in an articulated model.\n\nUse MuJoCo when a calibrated model can test motion, contact, or control assumptions that could invalidate a mechanical route before fabrication. Do not treat an uncalibrated simulation as proof of material stress limits, manufacturing quality, or physical performance.\n\nMuJoCo helps with robot-related custom-part reasoning, but it is an alternative to neither fabrication nor inspection. Physical measurement and acceptance still need a separate inspection plan after fabrication.",
      "links": []
    },
    {
      "slug": "nextjs",
      "title": "Next.js",
      "summary": "A React framework for full-stack browser applications with file-system routing, server and client component boundaries, and several deployment modes.",
      "tags": [
        "react",
        "framework",
        "routing",
        "server-components"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js App Router",
          "url": "https://nextjs.org/docs/app"
        },
        {
          "title": "Deploying Next.js",
          "url": "https://nextjs.org/docs/app/getting-started/deploying"
        }
      ],
      "parent": "web",
      "body": "[Next.js](https://nextjs.org/) is a React framework for full-stack web applications that combines routing, rendering, and server-execution conventions in one project.\n\n## What this makes possible\n\nNext.js can provide file-system routes, server-side data access, server and client component boundaries, and production rendering for [Browser applications](/wiki/browser-applications). The App Router gives those concerns a shared framework rather than requiring the application to assemble them independently.\n\n## Use this when\n\nUse Next.js when React is an accepted constraint and routing, server data, or framework-integrated rendering materially reduces the work needed to ship the application.\n\nIt also pairs with [shadcn/ui](/wiki/shadcn-ui) when the interface benefits from locally owned React component source.\n\n## Consider another route when\n\nFor an intentionally client-rendered application that does not need Next.js routing or server conventions, [Vite with React](/wiki/vite-react) is the smaller alternative. Choose a non-React route when React itself is not appropriate.\n\nDo not select Next.js from its development experience alone when the chosen static export or hosting provider does not support the framework features the application needs.\n\n## Important decisions\n\nDecide which routes need server execution, where client component boundaries belong, and which deployment mode will run the result. Verify those choices together: a feature supported by the framework may still be unavailable in a particular deployment mode.\n\n## How to verify\n\nBuild and run the production artifact in the intended deployment mode. Exercise routing, server data, client interactions, and direct navigation to each important route rather than relying only on the development server.",
      "links": [
        "browser-applications",
        "shadcn-ui",
        "vite-react"
      ]
    },
    {
      "slug": "parametric-cad-master",
      "title": "Parametric CAD master",
      "summary": "A native editable model whose named dimensions, constraints, interfaces, and revision history remain the design source of truth while process-specific files are exported as artifacts.",
      "tags": [
        "parametric-cad",
        "source-of-truth",
        "revision",
        "automation"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Variable Studios automate parametric modeling",
          "url": "https://www.onshape.com/en/resource-center/tech-tips/variable-studios-automate-parametric-modeling"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA native editable CAD source with named parameters, stable interfaces, and revision identity that every downstream export can trace back to.\n\n## A common approach\n\nKeep the native parametric model as the source of truth and export revision-specific STEP, mesh, drawing, or profile artifacts rather than editing downstream files independently.\n\n## Use this when\n\nUse this practice when dimensions or interfaces may change across iterations, or when more than one manufacturing or simulation artifact derives from the same geometry.\n\n## Consider another route when\n\nIf the geometry is a one-time non-parametric capture whose source cannot be reconstructed as editable CAD, say so explicitly. A GUI-native [FreeCAD](/wiki/freecad) model is the alternative path to a script-authored [CadQuery](/wiki/cadquery) master.\n\n## Important decisions\n\nThis practice preserves controlled intent within [Custom manufactured parts](/wiki/custom-manufactured-parts). [CadQuery](/wiki/cadquery) supports script-authored parametric solids, [CAD Skills (text-to-cad)](/wiki/text-to-cad) packages a STEP-first workflow for compatible agents, and [STEP solid exchange](/wiki/step-solid-exchange) remains a common neutral revisioned artifact.\n\n## How to verify\n\nConfirm that every exported artifact can be traced to the exact native-model revision and parameter set.",
      "links": [
        "freecad",
        "cadquery",
        "custom-manufactured-parts",
        "text-to-cad",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "production-web-verification",
      "title": "Production web verification",
      "summary": "Evidence that a deployed browser outcome builds, supports critical user flows, meets its accessibility target, protects sensitive boundaries, and records performance behavior.",
      "tags": [
        "testing",
        "accessibility",
        "performance",
        "security",
        "browser-flows"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js production checklist",
          "url": "https://nextjs.org/docs/app/guides/production-checklist"
        },
        {
          "title": "Web Content Accessibility Guidelines 2.2",
          "url": "https://www.w3.org/TR/WCAG22/"
        },
        {
          "title": "Web Vitals",
          "url": "https://web.dev/articles/vitals"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nProduction verification turns a deployed route in [Browser applications](/wiki/browser-applications) into a supportable trust claim. It supplies evidence that the build, critical flows, accessibility target, sensitive boundaries, and observed performance all hold outside local development.\n\n## A common approach\n\nCreate a realistic preview environment; a [Vercel preview deployment](/wiki/create-vercel-preview-deployment) is one documented route. Preserve the build log, run critical browser flows, check the agreed accessibility target, review security boundaries, and record measured performance behavior.\n\nAdd [3D runtime verification](/wiki/3d-runtime-verification) when scene correctness, assets, input, fallback behavior, or frame timing are part of the outcome.\n\n## Use this when\n\nUse this practice whenever the application will be used beyond local development or when delivery includes a preview or production deployment.\n\n## Consider another route when\n\nA disposable visual spike can omit this production trust claim if that limitation is explicit. It should not later be described as production-ready without completing the evidence.\n\n## Common mistakes\n\nA screenshot or an agent success message does not prove the critical flow, accessibility, security boundary, or performance behavior. A successful build alone also does not prove that the deployed application works.\n\n## How to verify\n\nRetain a receipt containing the build result, browser-flow results, accessibility evidence, security review, and measured performance. Review the evidence against the actual deployment rather than a different local build.",
      "links": [
        "browser-applications",
        "create-vercel-preview-deployment",
        "3d-runtime-verification"
      ]
    },
    {
      "slug": "promote-vercel-deployment-to-production",
      "title": "Promote a verified Vercel deployment to production",
      "summary": "Promote an already verified Vercel preview only after separate approval of the exact production target, domain, configuration, cost, and release impact.",
      "tags": [
        "vercel",
        "production",
        "promotion",
        "captain-approval"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Deploying to Vercel",
          "url": "https://vercel.com/docs/deployments/overview"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\nThis action promotes the reviewed result of [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) into the approved user-facing release. It produces a production URL and a production-verification receipt tied to the resulting deployment identity.\n\n## A common approach\n\nPresent the preview-verification receipt and name the exact production target. Ask the captain to approve the domain, configuration, expected cost, traffic exposure, and release impact. Promote only that approved deployment through [Vercel](/wiki/vercel), then verify the production URL and record its deployment identity.\n\n## Use this when\n\nProceed only when the preview has passed the declared [Production web verification](/wiki/production-web-verification) and the captain has reviewed the complete production scope.\n\n## Consider another route when\n\nStay on the preview if verification is incomplete, approval is missing, or production would use a different scope or configuration. Running [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) again is safer than treating an unreviewed change as part of an earlier approval.\n\n## Important decisions\n\nProduction promotion is always a new approval gate. Neither preview approval nor a successful build authorizes a user-facing release, and a production change may affect domains, traffic, provider usage, and cost.\n\n## Common mistakes\n\nDo not promote a different artifact from the one that was verified, silently change production configuration, or report only that the promotion command succeeded. Those shortcuts break the connection between approval, evidence, and the released deployment.\n\n## How to verify\n\nConfirm the final URL, deployment identity, approved configuration, and critical production behavior. Preserve those observations as the production-verification receipt so the released artifact can be traced back to the reviewed preview and approval.",
      "links": [
        "create-vercel-preview-deployment",
        "vercel",
        "production-web-verification"
      ]
    },
    {
      "slug": "protolabs",
      "title": "Protolabs",
      "summary": "A digital manufacturing provider documenting CNC machining, additive manufacturing, sheet fabrication, and molding services with web model upload, quoting, and DFM feedback paths.",
      "tags": [
        "manufacturer",
        "cnc",
        "additive",
        "dfm"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Protolabs services",
          "url": "https://www.protolabs.com/services/"
        },
        {
          "title": "Protolabs digital manufacturing FAQs",
          "url": "https://www.protolabs.com/resources/faqs/"
        }
      ],
      "parent": "manufacturing",
      "body": "Protolabs is a provider candidate for multiple custom-part processes, including CNC machining and industrial additive manufacturing. Its CNC path documents accepted 3D CAD formats including [STEP solid exchange](/wiki/step-solid-exchange), STP, IGES, SLDPRT, and X_T, while its additive path also accepts [STL mesh exchange](/wiki/stl-mesh-exchange) alongside STEP and STP.\n\nShortlist Protolabs when its current service and accepted-file documentation fits the part, then confirm facility, material, tolerance, inspection, geography, and quote details live. Protolabs states that it does not provide part-design services, so the user still needs a manufacturable 3D CAD model before upload. Choose [Xometry](/wiki/xometry) when its supplier network or process route fits better.\n\nThis page reflects provider documentation checked on 2026-07-17 and still requires a live check. Price, minimums, taxes, and quote validity; process, facility, network, material, finish, and production availability; shipping eligibility, destination, timing, and provider terms, including applicable account terms; and the exact inspection report, sampling, evidence, and eligibility are not stable provider facts here.\n\nThe handoff channel is the authenticated website upload flow for proprietary models and drawings. That upload creates external DFM feedback and quote state and requires explicit approval before any quote request.",
      "links": [
        "step-solid-exchange",
        "stl-mesh-exchange",
        "xometry"
      ]
    },
    {
      "slug": "react-three-fiber",
      "title": "React Three Fiber",
      "summary": "A React renderer for Three.js that expresses scene graphs as components while retaining access to Three.js objects and its wider ecosystem.",
      "tags": [
        "react",
        "threejs",
        "3d",
        "renderer"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "React Three Fiber introduction",
          "url": "https://r3f.docs.pmnd.rs/getting-started/introduction"
        }
      ],
      "parent": "web",
      "body": "[React Three Fiber](https://r3f.docs.pmnd.rs/) is a React renderer for Three.js. It lets a React application express a 3D scene as components while retaining access to underlying Three.js objects, loaders, materials, and other ecosystem tools.\n\n## What this makes possible\n\nReact Three Fiber supports React-led [3D web experiences](/wiki/3d-web-experiences) whose scene state and interface state benefit from a shared component composition model. It can run inside client-side React boundaries in [Next.js](/wiki/nextjs).\n\n## Use this when\n\nUse it when React already owns the surrounding application and declarative scene composition is more valuable than a framework-neutral imperative lifecycle.\n\n## Consider another route when\n\nUse [Three.js](/wiki/threejs) directly when the scene must remain independent of React, is dominated by imperative lifecycle control, or should avoid React runtime coupling.\n\n## Important decisions\n\nDecide which state belongs in React, which work belongs in the render loop, and where direct Three.js object access is warranted. In a server-aware React framework, keep browser-only canvas and WebGL work behind a client boundary.\n\n## Common mistakes\n\nDo not drive high-frequency frame state through ordinary React re-renders when the render loop can update it directly. Clean up assets, subscriptions, and effects, and do not assume React composition removes the underlying GPU and Three.js lifecycle costs.\n\n## How to verify\n\nBuild the production application and confirm that the canvas mounts only in a browser-capable boundary. Test asset loading, frame behavior, interaction, resize handling, route changes, teardown, and representative device performance.",
      "links": [
        "3d-web-experiences",
        "nextjs",
        "threejs"
      ]
    },
    {
      "slug": "request-protolabs-quote",
      "title": "Request a Protolabs quote",
      "summary": "An approval-gated upload of a revisioned model and drawing package to Protolabs for current DFM feedback and quote configuration, stopping before payment or fabrication.",
      "tags": [
        "quote",
        "protolabs",
        "dfm",
        "captain-approval"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Protolabs services",
          "url": "https://www.protolabs.com/services/"
        }
      ],
      "parent": "manufacturing",
      "body": "Requesting a Protolabs quote is an external custom-part handoff through [Protolabs](/wiki/protolabs). It uploads a revisioned model and drawing package for live DFM feedback and quote configuration, then stops before payment or fabrication.\n\nUse this action only after live process and file checks and explicit approval of the proprietary upload. It applies when Protolabs remains on the process-specific shortlist and a revisioned model, drawing, and inspection intent are ready. Choose [Request a Xometry quote](/wiki/request-xometry-quote) when Xometry fits the live route better.\n\nReview returned DFM feedback before accepting any functional change. Select and confirm the [Inspection plan](/wiki/inspection-plan) requirements during quote review rather than assuming a generic inspection option will satisfy them.\n\nDo not proceed if the route assumes unconfirmed material, inspection, tolerance, facility, or geography support. The approval gate exists because the upload discloses proprietary design files and creates external DFM and quote state.\n\nSteps:\n1. Live-check process, file, material, facility, inspection, tolerance, and destination constraints.\n2. Present the exact package and external disclosure for captain approval.\n3. Upload only the approved revision and request DFM plus quote without ordering.\n4. Return feedback, quote assumptions, inspection options, and revision identity.\n\nThis action should produce a live quote receipt, DFM feedback, and a handoff audit record.",
      "links": [
        "protolabs",
        "request-xometry-quote",
        "inspection-plan"
      ]
    },
    {
      "slug": "request-sendcutsend-quote",
      "title": "Request a SendCutSend quote",
      "summary": "An approval-gated handoff of a revisioned manufacturing package to SendCutSend for live process configuration and pricing, without authorizing payment, order, or fabrication.",
      "tags": [
        "quote",
        "sendcutsend",
        "upload",
        "captain-approval"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "SendCutSend getting started",
          "url": "https://sendcutsend.com/guidelines/getting-started/"
        }
      ],
      "parent": "manufacturing",
      "body": "Requesting a SendCutSend quote is an external custom-part handoff through [SendCutSend](/wiki/sendcutsend). It uses a revisioned manufacturing package, creates live quote state, and stops before payment, ordering, or fabrication.\n\nUse this action only after local preflight and explicit approval of the exact files, intellectual-property exposure, account, and quote request. It applies when SendCutSend remains on the live shortlist and an accepted-format package has already passed local DFM preflight. Choose [Request a Protolabs quote](/wiki/request-protolabs-quote) when Protolabs fits the package better.\n\nDo not proceed if the selected file, process, material, feature, destination, or tolerance conditions are not confirmed live. The approval gate exists because the upload discloses proprietary design files and creates account-bound external quote state.\n\nSteps:\n1. Live-check accepted files and process, material, thickness, feature, tolerance, and destination constraints.\n2. Present the exact revisioned package and intellectual-property exposure for captain approval.\n3. Upload only the approved package and configure a quote without ordering.\n4. Return the quote, advisories, assumptions, and package revision for review.\n\nThis action should produce a live quote receipt, provider advisories, and a handoff audit record.",
      "links": [
        "sendcutsend",
        "request-protolabs-quote"
      ]
    },
    {
      "slug": "request-xometry-quote",
      "title": "Request a Xometry quote",
      "summary": "An approval-gated handoff of process-compatible CAD and drawings to Xometry's web quote flow, capturing live supplier assumptions without authorizing an order or fabrication.",
      "tags": [
        "quote",
        "xometry",
        "supplier-network",
        "captain-approval"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Xometry capabilities",
          "url": "https://www.xometry.com/capabilities/"
        }
      ],
      "parent": "manufacturing",
      "body": "Requesting a Xometry quote is an external custom-part handoff through [Xometry](/wiki/xometry). It uploads process-compatible CAD and drawings into the live quote flow, captures supplier assumptions, and stops before ordering or fabrication.\n\nUse this action only after process-specific format checks and explicit approval of the proprietary upload. It applies when Xometry remains on the live shortlist and the package uses a currently accepted format with the required drawings. Choose [Request a Protolabs quote](/wiki/request-protolabs-quote) when Protolabs offers the better live process, DFM, or inspection path.\n\nDo not proceed if supplier, process, inspection, material, geography, or API assumptions have not been verified live. The approval gate exists because the upload discloses proprietary design files and creates external supplier-network quote state.\n\nSteps:\n1. Live-check process, accepted format, material, inspection, supplier, geography, and destination conditions.\n2. Present the exact package and disclosure for captain approval.\n3. Upload only the approved revision and configure a quote without ordering.\n4. Return quote, supplier assumptions, DFM feedback, and package revision.\n\nThis action should produce a live quote receipt, supplier and DFM assumptions, and a handoff audit record.",
      "links": [
        "xometry",
        "request-protolabs-quote"
      ]
    },
    {
      "slug": "revisioned-manufacturing-package",
      "title": "Revisioned manufacturing package",
      "summary": "A traceable bundle containing the native-model revision, process-appropriate exports, drawing, material and finish intent, DFM receipt, inspection plan, and handoff record.",
      "tags": [
        "package",
        "revision",
        "handoff",
        "traceability"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Procedure for Product Data Exchange Using STEP",
          "url": "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=821480"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nAn immutable handoff bundle and manifest that identify the source revision, exports, requirements, and approvals for one provider-facing manufacturing package.\n\n## A common approach\n\nCreate one revisioned package for each provider handoff so geometry, drawings, requirements, approvals, quote feedback, and inspection expectations cannot silently diverge.\n\n## Use this when\n\nUse this practice when files will leave the local workspace for quote or fabrication, or when more than one artifact communicates the part definition.\n\n## Consider another route when\n\nIf no external handoff or fabrication claim exists yet, the package can wait. When package artifacts cannot be traced to one source revision, return to [Parametric CAD master](/wiki/parametric-cad-master).\n\n## Important decisions\n\nThis is the controlled handoff artifact within [Custom manufactured parts](/wiki/custom-manufactured-parts). Include the revision-matched [Manufacturing drawing](/wiki/manufacturing-drawing) when required and the [Inspection plan](/wiki/inspection-plan) when acceptance evidence matters.\n\n## How to verify\n\nConfirm that every file, quote response, and inspection expectation names the same package revision.",
      "links": [
        "parametric-cad-master",
        "custom-manufactured-parts",
        "manufacturing-drawing",
        "inspection-plan"
      ]
    },
    {
      "slug": "robotic-arms",
      "title": "Robotic arms",
      "summary": "Articulated robotic arm outcomes combining work-envelope and payload requirements, mechanism architecture, actuators, parametric CAD, simulation, fabrication, controls, calibration, safety, and physical tests.",
      "tags": [
        "robotic-arm",
        "robotics",
        "manipulator",
        "mechanism"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "MuJoCo overview",
          "url": "https://mujoco.readthedocs.io/en/stable/overview.html"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nThis page covers articulated arm outcomes that have to connect work-envelope and payload requirements with mechanism architecture, actuators, CAD, simulation, fabrication, controls, calibration, safety, and physical tests.\n\n## A common approach\n\nStart from measurable payload, reach, repeatability, environment, budget, and manufacturing constraints. Reuse verified CAD, simulation, and custom-part knowledge instead of rediscovering each discipline independently.\n\n## Use this when\n\nUse this route when the outcome is an articulated manipulator or robot arm and the mechanical design, simulation, fabrication, and physical verification all need to connect.\n\n## Consider another route when\n\nIf a qualified commercial arm already satisfies the outcome, custom mechanism development is unnecessary. When only one mounting interface is being designed, continue with [Custom motor brackets](/wiki/custom-motor-brackets).\n\n## Important decisions\n\nRobotic arms compose multiple custom parts and purchased components under [Custom manufactured parts](/wiki/custom-manufactured-parts). [Parametric CAD master](/wiki/parametric-cad-master) preserves interfaces and design variants across the mechanism, while [CAD Skills (text-to-cad)](/wiki/text-to-cad) is one open-source agent workflow for producing and inspecting those artifacts. [MuJoCo](/wiki/mujoco) remains relevant because it can test articulated dynamics and control assumptions before fabrication.",
      "links": [
        "custom-motor-brackets",
        "custom-manufactured-parts",
        "parametric-cad-master",
        "text-to-cad",
        "mujoco"
      ]
    },
    {
      "slug": "sculpteo",
      "title": "Sculpteo",
      "summary": "An additive manufacturing provider documenting online 3D printing services, multiple model formats, and partner API services whose current access and effects require direct confirmation.",
      "tags": [
        "manufacturer",
        "additive",
        "3d-printing",
        "api"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Sculpteo online 3D printing",
          "url": "https://www.sculpteo.com/en/"
        },
        {
          "title": "Sculpteo API services",
          "url": "https://www.sculpteo.com/en/services/api-services/"
        }
      ],
      "parent": "manufacturing",
      "body": "Sculpteo is a provider candidate for additive custom-part work through an online 3D-printing service. Its documented upload path accepts formats including [STL mesh exchange](/wiki/stl-mesh-exchange), OBJ, [3MF additive exchange](/wiki/3mf-additive-exchange), and [STEP solid exchange](/wiki/step-solid-exchange).\n\nShortlist Sculpteo only after confirming the exact additive process, model format, material, finish, certification, geography, and live quote. Its public API description is framed as a partner offering that requires contact, so API eligibility, authentication, supported operations, and external effects cannot be assumed from public documentation alone. Choose [Protolabs](/wiki/protolabs) when its additive service path fits better.\n\nThis page reflects provider documentation checked on 2026-07-17 and still requires a live check. Price, minimums, taxes, and quote validity; process, material, color, finish, inspection, and production availability; shipping destination, timing, eligibility, and terms; and partner API access remain live unknowns until directly confirmed.\n\nThe handoff channel is the authenticated website upload flow for proprietary additive models. That upload creates external quote state and requires explicit approval before any request is made.",
      "links": [
        "stl-mesh-exchange",
        "3mf-additive-exchange",
        "step-solid-exchange",
        "protolabs"
      ]
    },
    {
      "slug": "sendcutsend",
      "title": "SendCutSend",
      "summary": "A custom-parts provider with an official web upload and quote flow for documented 2D vector and STEP/STP inputs, especially relevant to sheet cutting and supported forming services.",
      "tags": [
        "manufacturer",
        "sheet-cutting",
        "bending",
        "quote"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "SendCutSend getting started",
          "url": "https://sendcutsend.com/guidelines/getting-started/"
        },
        {
          "title": "SendCutSend 3D file guidelines",
          "url": "https://sendcutsend.com/guidelines/3d-files/"
        }
      ],
      "parent": "manufacturing",
      "body": "SendCutSend is a provider candidate for custom-part work that fits its documented sheet and supported forming services. Official setup guidance lists [DXF profile exchange](/wiki/dxf-profile-exchange), DWG, AI, and EPS among accepted 2D vector inputs and [STEP solid exchange](/wiki/step-solid-exchange) or STP among accepted 3D inputs for the live quote flow.\n\nShortlist SendCutSend only after matching the exact service, file, material, thickness, feature, and tolerance guidance live. Its official 3D-file guidance requires STEP or STP for supported 3D services and explicitly does not accept STL on that path. Choose [Protolabs](/wiki/protolabs) when a different mix of machining, additive, molding, or sheet services fits better.\n\nThis page reflects provider documentation checked on 2026-07-17 and still requires a live quote-flow check. Pricing, minimums, taxes, and quote validity; process, material, thickness, finish, and service availability; shipping destination, eligibility, timing, and terms; and exact tolerance capability all remain live unknowns until the current quote is configured.\n\nThe handoff channel is the website upload flow. It requires authentication, discloses proprietary files, produces a live quote, creates external quote state, and needs explicit approval before a quote request.",
      "links": [
        "dxf-profile-exchange",
        "step-solid-exchange",
        "protolabs"
      ]
    },
    {
      "slug": "shadcn-ui",
      "title": "shadcn/ui",
      "summary": "An open-code React component distribution model that copies customizable component source into an application and leaves its maintenance with the project.",
      "tags": [
        "ui",
        "components",
        "tailwind",
        "open-code"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "shadcn/ui documentation",
          "url": "https://ui.shadcn.com/docs"
        },
        {
          "title": "Base UI is now the default",
          "url": "https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default"
        }
      ],
      "parent": "web",
      "body": "[shadcn/ui](https://ui.shadcn.com/) uses a CLI to add React component source to the application rather than delivering a sealed, centrally upgraded component package. This makes deep customization straightforward and makes the project responsible for the resulting code.\n\n## What this makes possible\n\nshadcn/ui can accelerate interface composition for [Browser applications](/wiki/browser-applications), including familiar tables, forms, navigation, and controls for [Data-heavy dashboards](/wiki/data-heavy-dashboards). It documents a supported installation path for [Next.js](/wiki/nextjs).\n\n## Use this when\n\nUse it when the application has a compatible React and Tailwind setup and the team prefers to own, inspect, and customize component source locally.\n\n## Consider another route when\n\nChoose a centrally versioned design-system package when coordinated upgrades matter more than source ownership. If the team rejects Tailwind or does not want to maintain copied component code, a custom component layer in [Vite with React](/wiki/vite-react) avoids adopting shadcn/ui's distribution model.\n\n## Important decisions\n\nTreat generated components as application code: decide how local changes are reviewed and how upstream improvements are evaluated. At this review date, Base UI is the documented default, so check the primitive used by current examples instead of assuming older component internals.\n\n## Common mistakes\n\nDo not assume copied components receive automatic fixes when the upstream project changes. Avoid importing many components before confirming that the styling, primitive choice, and maintenance model fit the product.\n\n## How to verify\n\nBuild the application and exercise keyboard navigation, focus behavior, responsive layouts, and local customizations for every adopted component. Review the generated source and dependencies as carefully as handwritten interface code.",
      "links": [
        "browser-applications",
        "data-heavy-dashboards",
        "nextjs",
        "vite-react"
      ]
    },
    {
      "slug": "sls-additive-manufacturing",
      "title": "SLS additive manufacturing",
      "summary": "Powder-bed polymer additive manufacturing suited to complex durable nylon geometry and supportless nesting, with surface texture and powder-removal constraints.",
      "tags": [
        "sls",
        "additive",
        "nylon",
        "powder-bed"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "What is selective laser sintering",
          "url": "https://formlabs.com/blog/what-is-selective-laser-sintering/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nSLS is a candidate for complex durable nylon parts when supportless nesting is useful and the design can tolerate grainy surfaces plus powder-removal constraints.\n\n## A common approach\n\nUse SLS when complex geometry benefits from surrounding powder support and the nylon material options plus batch nesting fit the functional route.\n\n## Use this when\n\nUse this process when complex geometry benefits from powder support and when nylon material options with batch nesting match the required function.\n\n## Consider another route when\n\nIf fine cosmetic surface, sealed internal cavities, or trapped-powder geometry conflict with the provider process, do not assume SLS will work. [FDM additive manufacturing](/wiki/fdm-additive-manufacturing) may be faster and cheaper for early concepts and simple fit checks.\n\n## Important decisions\n\nSLS is one process option within [Custom manufactured parts](/wiki/custom-manufactured-parts). [3MF additive exchange](/wiki/3mf-additive-exchange) remains relevant for workflows that accept 3MF units and additive metadata.",
      "links": [
        "fdm-additive-manufacturing",
        "custom-manufactured-parts",
        "3mf-additive-exchange"
      ]
    },
    {
      "slug": "step-solid-exchange",
      "title": "STEP solid exchange",
      "summary": "A neutral ISO 10303 product-data exchange family used to transfer part and assembly geometry and related product information between CAD, manufacturing, analysis, and inspection systems.",
      "tags": [
        "step",
        "iso-10303",
        "solid",
        "cad-exchange"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "ISO 10303-21:2016",
          "url": "https://www.iso.org/standard/63141.html"
        },
        {
          "title": "NIST STEP File Analyzer",
          "url": "https://www.nist.gov/services-resources/software/step-file-analyzer-and-viewer"
        }
      ],
      "parent": "manufacturing",
      "body": "STEP is a neutral ISO 10303 solid exchange family for part and assembly handoff between CAD, manufacturing, analysis, and inspection systems. It is a common artifact in custom-part workflows and many CNC quote paths.\n\nUse a revisioned STEP export when the receiving provider or tool accepts neutral solid geometry, but keep the native parametric model and drawing because STEP is not the native feature history. Choose [STL mesh exchange](/wiki/stl-mesh-exchange) for additive workflows that explicitly accept triangulated geometry when a mesh handoff is intended, use a provider-accepted 2D format such as [DXF profile exchange](/wiki/dxf-profile-exchange) when the target requires a 2D profile, and retain the native CAD format when the receiving workflow explicitly requires it.\n\nVerification matters here: retain the editable design source separately, and validate the exported file in the receiving CAD or manufacturing workflow with a real STEP check such as the NIST analyzer or the target provider's import preview.",
      "links": [
        "stl-mesh-exchange",
        "dxf-profile-exchange"
      ]
    },
    {
      "slug": "stl-mesh-exchange",
      "title": "STL mesh exchange",
      "summary": "A simple triangulated surface format widely used in additive workflows, with no intrinsic unit declaration or parametric feature history and limited manufacturing metadata.",
      "tags": [
        "stl",
        "mesh",
        "additive",
        "unitless"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "STL file format family",
          "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000504.shtml"
        },
        {
          "title": "Fusion export mesh guidance",
          "url": "https://help.autodesk.com/cloudhelp/ENU/Fusion-Model/files/SLD-3D-PRINT.htm"
        }
      ],
      "parent": "manufacturing",
      "body": "STL is a simple triangulated surface format used widely in additive workflows. It has no intrinsic unit declaration, no parametric feature history, and limited manufacturing metadata.\n\nUse STL only when the selected additive workflow explicitly accepts it. Record units, orientation, and mesh refinement out of band, and do not treat STL as precision-editable native CAD. Choose [3MF additive exchange](/wiki/3mf-additive-exchange) when defined units or richer print metadata matter, and choose [STEP solid exchange](/wiki/step-solid-exchange) when the recipient needs exact neutral solid geometry instead of a mesh.\n\nVerification should confirm that the package states units clearly and that the mesh is refined enough for the intended process. STL is commonly consumed by FDM slicer workflows, but that compatibility does not remove the need for a real preview and geometry check before fabrication.",
      "links": [
        "3mf-additive-exchange",
        "step-solid-exchange"
      ]
    },
    {
      "slug": "text-to-cad",
      "title": "CAD Skills (text-to-cad)",
      "summary": "An open-source agent skill library for STEP-first parametric CAD, geometry inspection, robot-description files, slicing, parts sourcing, and guarded fabrication handoffs.",
      "tags": [
        "agent-skills",
        "parametric-cad",
        "robotics",
        "step",
        "open-source"
      ],
      "reviewedAt": "2026-07-18",
      "sources": [
        {
          "title": "CAD Skills repository and documentation",
          "url": "https://github.com/earthtojake/text-to-cad"
        },
        {
          "title": "CAD generation, inspection, and validation skill",
          "url": "https://github.com/earthtojake/text-to-cad/blob/main/skills/cad/SKILL.md"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nCAD Skills, published from the `earthtojake/text-to-cad` repository, gives compatible agents focused workflows for creating and inspecting parametric CAD, exporting STEP and mesh formats, describing robots, sourcing standard parts, slicing print files, and handing validated artifacts to fabrication tools.\n\n## A common approach\n\nUse its CAD skill to turn a clear mechanical brief into an editable Python model and a validated STEP artifact. The workflow treats STEP as the primary exchange artifact, checks geometric facts, requires visual snapshots, and keeps STL, 3MF, and GLB as secondary exports. That fits a [Parametric CAD master](/wiki/parametric-cad-master) workflow and can feed [STEP solid exchange](/wiki/step-solid-exchange).\n\n## Use this when\n\nUse this project when an installed agent needs a repeatable local workflow for parts, assemblies, enclosures, brackets, robot descriptions, or fabrication preparation rather than a one-off rendered mesh. It is particularly relevant to [Robotic arms](/wiki/robotic-arms), where CAD geometry, purchased components, simulation descriptions, and manufacturing artifacts must stay connected.\n\n## Consider another route when\n\nIt is not a substitute for structural certification, finite-element conclusions, tolerance ownership, or physical validation. Use a specialist engineering workflow when safety, regulated compliance, fatigue, or certified analysis determines acceptance. [FreeCAD](/wiki/freecad) and [CadQuery](/wiki/cadquery) remain direct modeling options when an agent skill bundle is unnecessary.\n\n## How to verify\n\nKeep the generated source and STEP together, run the project's geometry inspection and snapshot workflow, review the result visually, and verify every fit-critical dimension independently. Before fabrication, continue through [Design-for-manufacturing preflight](/wiki/design-for-manufacturing-preflight) and an explicit [Inspection plan](/wiki/inspection-plan).",
      "links": [
        "parametric-cad-master",
        "step-solid-exchange",
        "robotic-arms",
        "freecad",
        "cadquery",
        "design-for-manufacturing-preflight",
        "inspection-plan"
      ]
    },
    {
      "slug": "threejs",
      "title": "Three.js",
      "summary": "A JavaScript 3D engine for browser scenes, cameras, rendering, geometry, materials, loaders, animation, and controls.",
      "tags": [
        "threejs",
        "webgl",
        "3d",
        "renderer"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Three.js fundamentals",
          "url": "https://threejs.org/manual/en/fundamentals.html"
        }
      ],
      "parent": "web",
      "body": "[Three.js](https://threejs.org/) is a browser 3D engine that exposes the scene graph and rendering lifecycle directly. It includes scenes, cameras, renderers, geometry, materials, loaders, animation tools, and controls.\n\n## What this makes possible\n\nThree.js is a renderer option for interactive [3D web experiences](/wiki/3d-web-experiences), from product viewers to animated spatial interfaces. It can be bundled into a [Vite with React](/wiki/vite-react) project without making React responsible for the scene.\n\n## Use this when\n\nUse Three.js directly when interactive browser 3D is required and explicit, imperative control of scene objects, the frame loop, and renderer lifecycle fits the architecture.\n\n## Consider another route when\n\nWhen React already owns the surrounding application and scene state benefits from declarative component composition, compare [React Three Fiber](/wiki/react-three-fiber). It retains the Three.js ecosystem while integrating scene construction with React's lifecycle.\n\n## Important decisions\n\nChoose the camera, renderer settings, frame-loop ownership, asset-loading strategy, resize behavior, and resource-disposal policy early. Direct control is valuable, but those lifecycle responsibilities stay with the application.\n\n## Common mistakes\n\nDo not leave the renderer at a fixed canvas size, create GPU resources every frame, or forget to dispose resources when scenes are replaced. Avoid judging performance from a simple development scene when production assets and interaction are materially heavier.\n\n## How to verify\n\nTest the production build on target browsers and representative devices. Exercise loading failures, resizing, animation, controls, visibility changes, and scene teardown while watching frame time, memory use, and console errors.",
      "links": [
        "3d-web-experiences",
        "vite-react",
        "react-three-fiber"
      ]
    },
    {
      "slug": "tolerance-contract",
      "title": "Tolerance contract",
      "summary": "A feature-level agreement that ties acceptance limits to function, datum strategy, process, provider, material, stock or thickness, and an achievable inspection method.",
      "tags": [
        "tolerance",
        "gdandt",
        "critical-features",
        "process-specific"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "ASME Y14.5 dimensioning and tolerancing overview",
          "url": "https://www.asme.org/learning-development/find-course/essentials-y14-5-dimensioning-tolerancing/self-study"
        },
        {
          "title": "SendCutSend cut tolerance guidance",
          "url": "https://sendcutsend.com/faq/what-is-your-cut-tolerance/"
        }
      ],
      "parent": "manufacturing",
      "body": "## What this makes possible\n\nA list of critical-to-quality features with scoped tolerances, datums, and functional rationale instead of a generic default tolerance claim.\n\n## A common approach\n\nSpecify tolerances only for functionally critical features and scope every capability claim by provider, process, material, thickness or stock, feature, and inspection method.\n\n## Use this when\n\nUse this practice when fit, alignment, motion, sealing, or load transfer depends on dimensional variation, and when the chosen provider can review or quote explicit tolerances.\n\n## Consider another route when\n\nDo not copy a universal tolerance across unlike processes in place of feature-level engineering judgment. Use [Manufacturing drawing](/wiki/manufacturing-drawing) to communicate the resulting feature controls and datum scheme.\n\n## Important decisions\n\nThis defines acceptance boundaries for [Custom manufactured parts](/wiki/custom-manufactured-parts). Specified tolerances still need an achievable [Inspection plan](/wiki/inspection-plan).\n\n## How to verify\n\nCheck that each tolerance maps to function and a named inspection method instead of a universal default.",
      "links": [
        "manufacturing-drawing",
        "custom-manufactured-parts",
        "inspection-plan"
      ]
    },
    {
      "slug": "vercel",
      "title": "Vercel",
      "summary": "A Web deployment provider with documented Next.js support, Git-connected previews and production deployments, and an authenticated CLI path.",
      "tags": [
        "hosting",
        "nextjs",
        "git-deployment",
        "preview"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Next.js on Vercel",
          "url": "https://vercel.com/docs/frameworks/full-stack/nextjs"
        },
        {
          "title": "Deploying Git repositories with Vercel",
          "url": "https://vercel.com/docs/git"
        },
        {
          "title": "Vercel deploy command",
          "url": "https://vercel.com/docs/cli/deploy"
        }
      ],
      "parent": "web",
      "body": "## What this makes possible\n\n[Vercel](https://vercel.com/) can host Web applications and provides an integrated deployment path for [Next.js](/wiki/nextjs). A connected Git repository can create preview deployments from changes and production deployments from the configured production branch. Existing Next.js projects can also be deployed through the authenticated CLI. These paths accept a project or repository and return externally reachable preview or production URLs.\n\n## A common approach\n\nConnect an approved repository when Git-based previews fit the review workflow, then [create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) and verify it before considering production. The CLI is an alternative handoff for an approved local project. Promotion to production remains a separate action and approval decision.\n\n## Use this when\n\nShortlist Vercel when the application uses Next.js or another documented framework and integrated Git previews are valuable. Vercel is one deployment provider in [Web](/wiki/web), not a guarantee that a particular account, runtime, or plan fits.\n\n## Consider another route when\n\nChoose a different provider when the runtime, compliance boundary, cost model, or infrastructure-ownership requirements do not fit. [Cloudflare Workers](/wiki/cloudflare-workers) is an alternative with a different runtime and network model.\n\n## Known constraints and live checks\n\nGit deployment requires either a connection to a supported repository provider or use of the separate CLI path. Before selection, check current pricing, included usage, and overage behavior; account entitlements, runtime and regional availability, and compliance fit; and current build, function, bandwidth, and framework-feature limits. These volatile details are intentionally not treated as settled facts.\n\n## Authenticated handoffs\n\nBoth the Git integration and CLI require authentication, create external deployment state, and need explicit approval before use. Repository access, source upload, preview creation, and production promotion should each remain within the approved scope. Possible does not hold the provider account or imply authority to deploy.\n\n## How to verify\n\nRe-read the current official documentation for the chosen framework and handoff, verify the account and target configuration, and test the returned URL. For production, preserve the exact deployment identity and a receipt that connects the approved preview to the released artifact.",
      "links": [
        "nextjs",
        "create-vercel-preview-deployment",
        "web",
        "cloudflare-workers"
      ]
    },
    {
      "slug": "vite-react",
      "title": "Vite with React",
      "summary": "A lightweight React development and production-build setup for client-rendered applications that choose routing and server services independently.",
      "tags": [
        "react",
        "vite",
        "client-only",
        "build-tool"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Sunsetting Create React App",
          "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app"
        },
        {
          "title": "Vite guide",
          "url": "https://vite.dev/guide/"
        }
      ],
      "parent": "web",
      "body": "[Vite](https://vite.dev/) supplies a fast development server and a production asset build while leaving most application policy to the project. With React, it is a framework-light option for client-oriented web work.\n\n## What this makes possible\n\nVite with React supports client-rendered [Browser applications](/wiki/browser-applications) without imposing an integrated server runtime or file-system router. The team can select routing, APIs, authentication, and hosting as separate concerns.\n\nIt can also host declarative 3D scenes built with [React Three Fiber](/wiki/react-three-fiber).\n\n## Use this when\n\nUse this setup when the application is intentionally client-rendered, does not need integrated server rendering, and benefits from a lightweight build whose server services can evolve independently.\n\n## Consider another route when\n\nChoose [Next.js](/wiki/nextjs) when framework-integrated routing, server data, or server rendering removes more system work than it adds. A Vite client can call server services, but Vite does not itself supply the full-stack application conventions that Next.js does.\n\n## Important decisions\n\nChoose the router, server boundary, environment-variable policy, and deployment target explicitly. Keeping framework policy light gives the project flexibility, but it also makes these decisions the project's responsibility.\n\n## Common mistakes\n\nDo not treat the development server as the shipped architecture. Browser history fallbacks, asset base paths, environment values, and API routing can behave differently once the production bundle is hosted.\n\n## How to verify\n\nRun the production build, serve its output under the intended path, and test direct navigation, client-side navigation, asset loading, and calls to independently hosted services.",
      "links": [
        "browser-applications",
        "react-three-fiber",
        "nextjs"
      ]
    },
    {
      "slug": "web",
      "title": "Web",
      "summary": "Operational knowledge for outcomes delivered through browsers, from application architecture and interface composition to rendering, deployment, and verification.",
      "tags": [
        "browser",
        "software",
        "deployment",
        "frontend"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "React: the library for web and native user interfaces",
          "url": "https://react.dev/"
        }
      ],
      "body": "## What this makes possible\n\nWeb knowledge supports outcomes primarily experienced through a browser, including application architecture, interface composition, rendering, deployment, and browser verification.\n\n## A common approach\n\nStart here when the primary user surface runs in a browser. Narrow the work by its interaction model, data flow, rendering needs, runtime boundaries, deployment target, and verification requirements. For routed or stateful software, continue with [browser applications](/wiki/browser-applications).\n\n## Use this when\n\nUse the Web branch when browser delivery is central to the requested outcome and deployment plus browser verification are part of “done.”\n\n## Consider another route when\n\nWhen the primary artifact is a fabricated physical component or embedded system, start with [Custom manufactured parts](/wiki/custom-manufactured-parts) instead. A web surface may still configure, quote, or monitor a custom part, but it does not replace the physical-product requirements.\n\n## Important decisions\n\nIdentify whether the browser is the product surface or only an accessory. Then make the application, rendering, deployment, and verification decisions at the narrowest relevant page rather than assuming one frontend stack fits every outcome.\n\n## How to verify\n\nVerify the classification by naming the primary user surface, the runtime boundary, and the delivery target. If the browser is central, continue into the narrower page that governs the actual work, such as [Browser applications](/wiki/browser-applications), rather than treating Web as a sufficient implementation decision on its own.",
      "links": [
        "browser-applications",
        "custom-manufactured-parts"
      ]
    },
    {
      "slug": "xometry",
      "title": "Xometry",
      "summary": "A manufacturing network documenting CNC, additive, sheet, molding, and other process capabilities through a web quoting flow with process-specific accepted inputs.",
      "tags": [
        "manufacturer",
        "network",
        "cnc",
        "additive"
      ],
      "reviewedAt": "2026-07-17",
      "sources": [
        {
          "title": "Xometry capabilities",
          "url": "https://www.xometry.com/capabilities/"
        },
        {
          "title": "Xometry CNC machining",
          "url": "https://www.xometry.com/capabilities/cnc-machining-service/precision-cnc-machining/"
        },
        {
          "title": "Xometry accepted file types",
          "url": "https://community.xometry.com/kb/articles/643-what-file-types-does-xometry-accept"
        }
      ],
      "parent": "manufacturing",
      "body": "Xometry is a manufacturing network with a process catalog that includes CNC machining and additive manufacturing. Its CNC quoting flow documents accepted formats including [STEP solid exchange](/wiki/step-solid-exchange), STP, SLDPRT, IPT, and PRT, while its additive catalog lists STEP, STP, and [STL mesh exchange](/wiki/stl-mesh-exchange) among accepted formats.\n\nShortlist Xometry only after checking process-specific file support and live supplier, material, inspection, geography, and quote conditions. Accepted file types vary by manufacturing process, so current process guidance has to be selected before upload. Choose [Fictiv](/wiki/fictiv) when its network or process route fits better.\n\nThis page reflects provider documentation checked on 2026-07-17 and still requires a live quote-flow check. Price, supplier allocation, minimums, taxes, and quote validity; supplier, process, material, finish, certification, and capacity availability; shipping destination, supplier geography, timing, tariffs, and terms; and any customer manufacturing-order API access remain live unknowns rather than stored provider facts.\n\nThe handoff channel is the authenticated website quote flow. Uploading proprietary CAD and drawings can return DFM feedback for supported paths, creates external supplier-network quote state, and needs explicit approval before the request is made.",
      "links": [
        "step-solid-exchange",
        "stl-mesh-exchange",
        "fictiv"
      ]
    }
  ]
};
