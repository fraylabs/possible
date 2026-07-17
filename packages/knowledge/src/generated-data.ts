// Generated from contributor-authored files in knowledge/. Do not edit by hand.
import type { KnowledgeGraph } from "./types.js";

export const knowledgeGraphData: KnowledgeGraph = {
  "nodes": [
    {
      "id": "manufacturing",
      "type": "topic",
      "domain": "manufacturing",
      "title": "Manufacturing",
      "summary": "Operational knowledge for turning controlled design intent into process-appropriate files, provider shortlists, approval-gated handoffs, fabricated parts, and inspection evidence.",
      "tags": [
        "fabrication",
        "cad",
        "process",
        "inspection"
      ],
      "recommendations": [
        {
          "statement": "Start in Manufacturing when the outcome includes a fabricated part, and preserve a traceable chain from native design through process-specific artifacts to inspection.",
          "applicability": [
            "The requested outcome includes one or more physical custom parts",
            "A manufacturing provider or local fabrication process will consume exported artifacts"
          ],
          "counterconditions": [
            "The outcome is wholly digital and never produces a physical component"
          ],
          "alternatives": [
            {
              "nodeId": "web",
              "reason": "Use the Web branch when the deliverable is a browser experience rather than a physical part."
            }
          ],
          "sources": [
            {
              "title": "Procedure for Product Data Exchange Using STEP",
              "url": "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=821480",
              "publisher": "NIST",
              "kind": "government-reference",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 180
        }
      ],
      "relationships": [
        {
          "type": "relevance",
          "target": "web",
          "description": "Web interfaces often initiate or monitor custom-part workflows."
        }
      ]
    },
    {
      "id": "manufacturing/actions/request-protolabs-quote",
      "type": "action",
      "domain": "manufacturing",
      "title": "Request a Protolabs quote",
      "summary": "An approval-gated upload of a revisioned model and drawing package to Protolabs for current DFM feedback and quote configuration, stopping before payment or fabrication.",
      "tags": [
        "quote",
        "protolabs",
        "dfm",
        "captain-approval"
      ],
      "recommendations": [
        {
          "statement": "Request a Protolabs quote only after live process and file checks plus captain approval of proprietary upload; review DFM feedback before accepting functional changes.",
          "applicability": [
            "Protolabs remains on the live process-specific shortlist",
            "A revisioned model, drawing, and inspection intent are ready"
          ],
          "counterconditions": [
            "The route assumes live material, inspection, tolerance, facility, or geography support that has not been confirmed"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/actions/request-xometry-quote",
              "reason": "Use the Xometry quote path when its live process and supplier route fits better."
            }
          ],
          "sources": [
            {
              "title": "Protolabs services",
              "url": "https://www.protolabs.com/services/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "A quote request is an external custom-part handoff action."
        },
        {
          "type": "invocation",
          "target": "manufacturing/providers/protolabs",
          "description": "The action invokes Protolabs' approved web quote flow."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/inspection-plan",
          "description": "Inspection requirements must be selected and confirmed during quote review."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "manufacturing/providers/protolabs",
        "requiresApproval": true,
        "approvalReason": "The upload discloses proprietary design files and creates external DFM and quote state.",
        "steps": [
          "Live-check process, file, material, facility, inspection, tolerance, and destination constraints",
          "Present the exact package and external disclosure for captain approval",
          "Upload only the approved revision and request DFM plus quote without ordering",
          "Return feedback, quote assumptions, inspection options, and revision identity"
        ],
        "produces": [
          "Live quote receipt",
          "DFM feedback",
          "Handoff audit record"
        ]
      }
    },
    {
      "id": "manufacturing/actions/request-sendcutsend-quote",
      "type": "action",
      "domain": "manufacturing",
      "title": "Request a SendCutSend quote",
      "summary": "An approval-gated handoff of a revisioned manufacturing package to SendCutSend for live process configuration and pricing, without authorizing payment, order, or fabrication.",
      "tags": [
        "quote",
        "sendcutsend",
        "upload",
        "captain-approval"
      ],
      "recommendations": [
        {
          "statement": "Upload to SendCutSend only after local preflight and explicit approval of the files, intellectual-property exposure, account, and quote request; stop before ordering.",
          "applicability": [
            "SendCutSend remains on the live provider shortlist",
            "A revisioned accepted-format package has passed local DFM preflight"
          ],
          "counterconditions": [
            "The selected file, process, material, feature, destination, or tolerance conditions are not confirmed live"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/actions/request-protolabs-quote",
              "reason": "Use the Protolabs quote path when its live service and file support fit the package better."
            }
          ],
          "sources": [
            {
              "title": "SendCutSend getting started",
              "url": "https://sendcutsend.com/guidelines/getting-started/",
              "publisher": "SendCutSend",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "A quote request is an external custom-part handoff action."
        },
        {
          "type": "invocation",
          "target": "manufacturing/providers/sendcutsend",
          "description": "The action uploads the approved package into SendCutSend's web quote flow."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/manufacturing-package",
          "description": "The approved revisioned package is the handoff input."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "manufacturing/providers/sendcutsend",
        "requiresApproval": true,
        "approvalReason": "The upload discloses proprietary design files and creates account-bound external quote state.",
        "steps": [
          "Live-check accepted files and process, material, thickness, feature, tolerance, and destination constraints",
          "Present the exact revisioned package and intellectual-property exposure for captain approval",
          "Upload only the approved package and configure a quote without ordering",
          "Return the quote, advisories, assumptions, and package revision for review"
        ],
        "produces": [
          "Live quote receipt",
          "Provider advisories",
          "Handoff audit record"
        ]
      }
    },
    {
      "id": "manufacturing/actions/request-xometry-quote",
      "type": "action",
      "domain": "manufacturing",
      "title": "Request a Xometry quote",
      "summary": "An approval-gated handoff of process-compatible CAD and drawings to Xometry's web quote flow, capturing live supplier assumptions without authorizing an order or fabrication.",
      "tags": [
        "quote",
        "xometry",
        "supplier-network",
        "captain-approval"
      ],
      "recommendations": [
        {
          "statement": "Request a Xometry quote only after process-specific format checks and captain approval of proprietary upload, then preserve supplier and quote assumptions with the package revision.",
          "applicability": [
            "Xometry remains on the live process-specific shortlist",
            "The package uses a currently accepted format and includes required drawings"
          ],
          "counterconditions": [
            "Supplier, process, inspection, material, geography, or API assumptions have not been verified live"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/actions/request-protolabs-quote",
              "reason": "Use Protolabs when its current service, DFM, and inspection path fits better."
            }
          ],
          "sources": [
            {
              "title": "Xometry capabilities",
              "url": "https://www.xometry.com/capabilities/",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "A quote request is an external custom-part handoff action."
        },
        {
          "type": "invocation",
          "target": "manufacturing/providers/xometry",
          "description": "The action invokes Xometry's approved web quote flow."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/manufacturing-package",
          "description": "The package revision anchors quote and supplier assumptions."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "manufacturing/providers/xometry",
        "requiresApproval": true,
        "approvalReason": "The upload discloses proprietary design files and creates external supplier-network quote state.",
        "steps": [
          "Live-check process, accepted format, material, inspection, supplier, geography, and destination conditions",
          "Present the exact package and disclosure for captain approval",
          "Upload only the approved revision and configure a quote without ordering",
          "Return quote, supplier assumptions, DFM feedback, and package revision"
        ],
        "produces": [
          "Live quote receipt",
          "Supplier and DFM assumptions",
          "Handoff audit record"
        ]
      }
    },
    {
      "id": "manufacturing/custom-parts",
      "type": "topic",
      "domain": "manufacturing",
      "title": "Custom manufactured parts",
      "summary": "One-off or low-volume physical components whose geometry, material, process, tolerances, drawings, provider constraints, and inspection plan must agree before fabrication.",
      "tags": [
        "custom-parts",
        "prototype",
        "fabrication",
        "quote"
      ],
      "recommendations": [
        {
          "statement": "Treat a custom part as a controlled manufacturing package, not merely a mesh upload: preserve native design, select the process, export revisioned files, and define critical checks.",
          "applicability": [
            "A custom geometry will be quoted or fabricated",
            "Fit, function, material, or inspection matters to acceptance"
          ],
          "counterconditions": [
            "A catalog component already satisfies the requirement without custom fabrication"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/outcomes/motor-brackets",
              "reason": "Use the motor-bracket outcome branch when mount interfaces and loading define the custom part."
            }
          ],
          "sources": [
            {
              "title": "Take CAD files from design to production",
              "url": "https://sendcutsend.com/blog/take-your-cad-files-from-design-to-production/",
              "publisher": "SendCutSend",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing",
          "description": "Custom parts are a primary branch of manufacturing knowledge."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/process-selection",
          "description": "Part requirements must be mapped to a viable manufacturing process."
        }
      ]
    },
    {
      "id": "manufacturing/outcomes/motor-brackets",
      "type": "topic",
      "domain": "manufacturing",
      "title": "Custom motor brackets",
      "summary": "Structural interface parts that locate and restrain a motor while respecting mounting geometry, loads, clearances, fasteners, material behavior, fabrication access, and inspection needs.",
      "tags": [
        "motor-bracket",
        "mounting",
        "robotics",
        "structural-part"
      ],
      "recommendations": [
        {
          "statement": "Define motor interface geometry, load cases, clearances, fasteners, environment, and critical dimensions before choosing a bracket process or generating fabrication files.",
          "applicability": [
            "A motor must be mounted in a custom assembly",
            "Fit and structural behavior affect the mechanism outcome"
          ],
          "counterconditions": [
            "A validated catalog bracket already fits the motor, structure, loads, and environment"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/custom-parts",
              "reason": "Use the general custom-part route when the component is not specifically a motor mounting interface."
            }
          ],
          "sources": [
            {
              "title": "ASME Y14.5 dimensioning and tolerancing overview",
              "url": "https://www.asme.org/learning-development/find-course/essentials-y14-5-dimensioning-tolerancing/self-study",
              "publisher": "ASME",
              "kind": "official-standard",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Motor brackets are a constrained custom-part outcome."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/parametric-cad",
          "description": "Parametric interfaces make bracket variants and revisions reproducible."
        },
        {
          "type": "relevance",
          "target": "manufacturing/tools/mujoco",
          "description": "Robot mechanism simulations can expose motion and load assumptions before fabrication."
        }
      ]
    },
    {
      "id": "manufacturing/outcomes/robot-arms",
      "type": "topic",
      "domain": "manufacturing",
      "title": "Robotic arms",
      "summary": "Articulated robotic arm outcomes combining work-envelope and payload requirements, mechanism architecture, actuators, parametric CAD, simulation, fabrication, controls, calibration, safety, and physical tests.",
      "tags": [
        "robotic-arm",
        "robotics",
        "manipulator",
        "mechanism"
      ],
      "recommendations": [
        {
          "statement": "Start a robotic arm from measurable payload, reach, repeatability, environment, budget, and manufacturing constraints, then reuse verified CAD, simulation, and custom-part knowledge instead of rediscovering each discipline.",
          "applicability": [
            "The outcome is an articulated manipulator or robot arm",
            "Mechanical design, simulation, fabrication, and physical verification must connect"
          ],
          "counterconditions": [
            "A qualified commercial arm already satisfies the outcome and custom mechanism development is unnecessary"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/outcomes/motor-brackets",
              "reason": "Use the narrower motor-bracket route when only one mounting interface is being designed."
            }
          ],
          "sources": [
            {
              "title": "MuJoCo overview",
              "url": "https://mujoco.readthedocs.io/en/stable/overview.html",
              "publisher": "Google DeepMind",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Robotic arms compose multiple custom parts and purchased components."
        },
        {
          "type": "relevance",
          "target": "manufacturing/tools/mujoco",
          "description": "MuJoCo can test articulated dynamics and control assumptions before fabrication."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/parametric-cad",
          "description": "Parametric CAD preserves interfaces and design variants across the mechanism."
        },
        {
          "type": "relevance",
          "target": "manufacturing/outcomes/motor-brackets",
          "description": "Motor mounting interfaces are reusable subproblems within a robotic arm."
        }
      ]
    },
    {
      "id": "manufacturing/practices/dfm-preflight",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Design-for-manufacturing preflight",
      "summary": "A process- and provider-specific review of inaccessible geometry, fragile or unsupported features, material assumptions, file setup, and known capability limits before external upload.",
      "tags": [
        "dfm",
        "preflight",
        "geometry",
        "provider-constraints"
      ],
      "recommendations": [
        {
          "statement": "Run a local process-specific DFM preflight before proprietary upload, then treat provider feedback as new evidence rather than automatic permission to change function.",
          "applicability": [
            "A process and provider shortlist exists",
            "Geometry or feature choices may violate fabrication constraints"
          ],
          "counterconditions": [
            "No external fabrication handoff is planned and the design remains a conceptual model"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/process-selection",
              "reason": "Return to process selection when DFM failures indicate the chosen process is structurally mismatched."
            }
          ],
          "sources": [
            {
              "title": "Design for machining toolkit",
              "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/",
              "publisher": "Protolabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "DFM preflight protects the custom-part handoff."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/process-selection",
          "description": "Preflight criteria depend on the selected manufacturing process."
        }
      ],
      "practice": {
        "outputs": [
          "A local DFM report with blocking issues, assumptions, and unresolved provider checks"
        ],
        "checks": [
          "Any functional material or geometry change remains captain-approved and revisioned"
        ]
      }
    },
    {
      "id": "manufacturing/practices/inspection-plan",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Inspection plan",
      "summary": "A pre-quote definition of critical-to-quality features, measurement methods, sample expectations, evidence, and acceptance decisions, distinct from generic provider inspection language.",
      "tags": [
        "inspection",
        "ctq",
        "measurement",
        "acceptance"
      ],
      "recommendations": [
        {
          "statement": "Define critical-to-quality features and evidence before quoting; do not treat standard inspection as equivalent to CMM, FAI, PPAP, or a custom report.",
          "applicability": [
            "The part has measurable functional acceptance criteria",
            "Provider inspection options affect quote or process selection"
          ],
          "counterconditions": [
            "The artifact is a nonfunctional visual sample with no dimensional acceptance claim"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/tolerance-contract",
              "reason": "Return to the tolerance contract if critical features and acceptance limits are not yet defined."
            }
          ],
          "sources": [
            {
              "title": "Protolabs inspection reports",
              "url": "https://www.protolabs.com/inspection-reports/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Inspection planning defines evidence for custom-part acceptance."
        },
        {
          "type": "relevance",
          "target": "manufacturing/providers/protolabs",
          "description": "Provider-specific inspection options require a live capability check."
        }
      ],
      "practice": {
        "outputs": [
          "Critical feature list, measurement method, sampling expectation, evidence, and acceptance owner"
        ],
        "checks": [
          "Named inspection service and evidence are confirmed live before purchase or fabrication"
        ]
      }
    },
    {
      "id": "manufacturing/practices/manufacturing-drawing",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Manufacturing drawing",
      "summary": "A human- and provider-readable definition of critical dimensions, tolerances, threads, finishes, datums, notes, and inspection expectations that solid geometry alone may not carry.",
      "tags": [
        "drawing",
        "gdandt",
        "tolerances",
        "threads",
        "finish"
      ],
      "recommendations": [
        {
          "statement": "Attach a drawing when critical tolerances, threads, finishes, datums, or inspection requirements cannot be safely inferred from the 3D model and quote form.",
          "applicability": [
            "Specific features have functional acceptance limits",
            "The provider accepts supporting drawings with the model"
          ],
          "counterconditions": [
            "Every required manufacturing and inspection attribute is explicitly represented and confirmed through another accepted contract"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/tolerance-contract",
              "reason": "Use the tolerance-contract practice to decide which features actually need drawing-level controls."
            }
          ],
          "sources": [
            {
              "title": "Quote parts with attached drawings",
              "url": "https://www.fictiv.com/help/getting-a-quote/how-to-get-parts-quoted-with-attached-drawings",
              "publisher": "Fictiv",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Drawings supplement geometry in custom-part packages."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/tolerance-contract",
          "description": "Feature tolerances and datums are communicated through the drawing."
        },
        {
          "type": "relevance",
          "target": "manufacturing/tools/step",
          "description": "A manufacturing drawing commonly accompanies a neutral solid model."
        }
      ],
      "practice": {
        "outputs": [
          "Revision-matched manufacturing drawing with critical feature controls and notes"
        ],
        "checks": [
          "Drawing revision, units, model revision, and inspection expectations agree"
        ]
      }
    },
    {
      "id": "manufacturing/practices/manufacturing-package",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Revisioned manufacturing package",
      "summary": "A traceable bundle containing the native-model revision, process-appropriate exports, drawing, material and finish intent, DFM receipt, inspection plan, and handoff record.",
      "tags": [
        "package",
        "revision",
        "handoff",
        "traceability"
      ],
      "recommendations": [
        {
          "statement": "Create one revisioned package for each provider handoff so geometry, drawings, requirements, approvals, quote feedback, and inspection expectations cannot silently diverge.",
          "applicability": [
            "Files will leave the local workspace for quote or fabrication",
            "More than one artifact communicates the part definition"
          ],
          "counterconditions": [
            "No external handoff or fabrication claim exists yet"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/parametric-cad",
              "reason": "Return to the parametric master when package artifacts cannot be traced to one source revision."
            }
          ],
          "sources": [
            {
              "title": "Procedure for Product Data Exchange Using STEP",
              "url": "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=821480",
              "publisher": "NIST",
              "kind": "government-reference",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "The package is the controlled custom-part handoff artifact."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/manufacturing-drawing",
          "description": "The revision-matched drawing belongs in the package when required."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/inspection-plan",
          "description": "The inspection plan belongs in the provider handoff package."
        }
      ],
      "practice": {
        "outputs": [
          "Immutable handoff bundle and manifest identifying source revision, exports, requirements, and approvals"
        ],
        "checks": [
          "Every file, quote response, and inspection expectation names the same package revision"
        ]
      }
    },
    {
      "id": "manufacturing/practices/parametric-cad",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Parametric CAD master",
      "summary": "A native editable model whose named dimensions, constraints, interfaces, and revision history remain the design source of truth while process-specific files are exported as artifacts.",
      "tags": [
        "parametric-cad",
        "source-of-truth",
        "revision",
        "automation"
      ],
      "recommendations": [
        {
          "statement": "Keep the native parametric model as the source of truth and export revision-specific STEP, mesh, drawing, or profile artifacts rather than editing downstream files independently.",
          "applicability": [
            "Dimensions or interfaces may change across iterations",
            "More than one manufacturing or simulation artifact derives from the same geometry"
          ],
          "counterconditions": [
            "The geometry is a one-time non-parametric capture whose source cannot be reconstructed as editable CAD"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/freecad",
              "reason": "A GUI-native parametric model in FreeCAD is an alternative to a script-authored CadQuery master."
            }
          ],
          "sources": [
            {
              "title": "Variable Studios automate parametric modeling",
              "url": "https://www.onshape.com/en/resource-center/tech-tips/variable-studios-automate-parametric-modeling",
              "publisher": "Onshape",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Parametric modeling preserves controlled custom-part intent."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/cadquery",
          "description": "CadQuery supports script-authored parametric solid models and exports."
        },
        {
          "type": "relevance",
          "target": "manufacturing/tools/step",
          "description": "STEP is a revisioned exchange artifact derived from the parametric master."
        }
      ],
      "practice": {
        "outputs": [
          "Native editable CAD source with named parameters and revision identity"
        ],
        "checks": [
          "Every exported artifact can be traced to the exact native-model revision and parameters"
        ]
      }
    },
    {
      "id": "manufacturing/practices/process-selection",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Manufacturing process selection",
      "summary": "A requirements-led comparison of geometry, material behavior, quantity, finish, dimensional needs, inspection, and provider constraints before committing fabrication artifacts.",
      "tags": [
        "process-selection",
        "fdm",
        "sls",
        "cnc",
        "sheet-cutting"
      ],
      "recommendations": [
        {
          "statement": "Select the process from functional requirements and geometry before optimizing the CAD for a provider; keep at least one viable alternative until DFM is checked.",
          "applicability": [
            "A custom part can be produced by more than one process",
            "Material behavior, finish, geometry, or dimensional requirements affect viability"
          ],
          "counterconditions": [
            "A regulated or already-qualified process is fixed by an external requirement"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/dfm-preflight",
              "reason": "Use DFM preflight to test the selected process against provider-specific constraints before handoff."
            }
          ],
          "sources": [
            {
              "title": "FDM vs SLA vs SLS",
              "url": "https://formlabs.com/eu/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/",
              "publisher": "Formlabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Design for machining toolkit",
              "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/",
              "publisher": "Protolabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Process selection is an early custom-part practice."
        },
        {
          "type": "relevance",
          "target": "manufacturing/processes/cnc-machining",
          "description": "CNC machining is one process family evaluated against the requirements."
        },
        {
          "type": "relevance",
          "target": "manufacturing/processes/fdm",
          "description": "FDM is one additive process family evaluated against the requirements."
        }
      ],
      "practice": {
        "outputs": [
          "A selected process with requirement fit, risks, and at least one alternative"
        ],
        "checks": [
          "No universal tolerance, material, finish, or cost claim is used across different processes"
        ]
      }
    },
    {
      "id": "manufacturing/practices/tolerance-contract",
      "type": "practice",
      "domain": "manufacturing",
      "title": "Tolerance contract",
      "summary": "A feature-level agreement that ties acceptance limits to function, datum strategy, process, provider, material, stock or thickness, and an achievable inspection method.",
      "tags": [
        "tolerance",
        "gdandt",
        "critical-features",
        "process-specific"
      ],
      "recommendations": [
        {
          "statement": "Specify tolerances only for functionally critical features and scope every capability claim by provider, process, material, thickness or stock, feature, and inspection method.",
          "applicability": [
            "Fit, alignment, motion, sealing, or load transfer depends on dimensional variation",
            "The chosen provider can review or quote explicit tolerances"
          ],
          "counterconditions": [
            "A universal tolerance copied across processes would replace feature-level engineering judgment"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/manufacturing-drawing",
              "reason": "Use the manufacturing drawing to communicate the resulting feature controls and datum scheme."
            }
          ],
          "sources": [
            {
              "title": "ASME Y14.5 dimensioning and tolerancing overview",
              "url": "https://www.asme.org/learning-development/find-course/essentials-y14-5-dimensioning-tolerancing/self-study",
              "publisher": "ASME",
              "kind": "official-standard",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "SendCutSend cut tolerance guidance",
              "url": "https://sendcutsend.com/faq/what-is-your-cut-tolerance/",
              "publisher": "SendCutSend",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Tolerance contracts define custom-part acceptance boundaries."
        },
        {
          "type": "relevance",
          "target": "manufacturing/practices/inspection-plan",
          "description": "Specified tolerances need an achievable inspection method."
        }
      ],
      "practice": {
        "outputs": [
          "A list of critical-to-quality features with scoped tolerances, datums, and rationale"
        ],
        "checks": [
          "Each tolerance maps to function and a named inspection method instead of a universal default"
        ]
      }
    },
    {
      "id": "manufacturing/processes/cnc-machining",
      "type": "topic",
      "domain": "manufacturing",
      "title": "CNC machining",
      "summary": "Subtractive production from stock with strong control over material, dimensions, and finish, bounded by cutter access, internal radii, workholding, depth, and fragile-feature constraints.",
      "tags": [
        "cnc",
        "subtractive",
        "machining",
        "stock-material"
      ],
      "recommendations": [
        {
          "statement": "Use CNC machining when stock material properties, dimensional control, and machined finish justify subtractive access and workholding constraints.",
          "applicability": [
            "The part is compatible with available stock and cutter access",
            "Material, dimensional, or finish requirements favor machining"
          ],
          "counterconditions": [
            "The geometry depends on inaccessible cavities, perfectly sharp internal corners, or deep fragile features without a qualified method"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/processes/laser-sheet-cutting",
              "reason": "Laser sheet cutting can be more direct for constant-thickness 2D profiles and bent sheet parts."
            }
          ],
          "sources": [
            {
              "title": "Design for machining toolkit",
              "url": "https://www.protolabs.com/resources/design-for-machining-toolkit/",
              "publisher": "Protolabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "CNC machining is one process option for custom parts."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/processes/laser-sheet-cutting",
          "description": "Sheet cutting is an alternative for planar constant-thickness geometry."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/step",
          "description": "STEP solid geometry is a common neutral CNC quote and handoff artifact."
        }
      ]
    },
    {
      "id": "manufacturing/processes/fdm",
      "type": "topic",
      "domain": "manufacturing",
      "title": "FDM additive manufacturing",
      "summary": "Material-extrusion additive manufacturing commonly suited to inexpensive concepts, fixtures, and fit checks, with layer behavior and surface limitations that must match the function.",
      "tags": [
        "fdm",
        "additive",
        "prototype",
        "fit-check"
      ],
      "recommendations": [
        {
          "statement": "Use FDM as a candidate for low-cost concepts, fixtures, and fit checks when layer-dependent behavior and achievable finish are acceptable.",
          "applicability": [
            "Fast, inexpensive geometric learning matters more than isotropic material behavior",
            "The geometry can be oriented and supported for the selected machine and material"
          ],
          "counterconditions": [
            "Fine finish, isotropy, watertightness, or validated production properties are essential without further qualification"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/processes/sls",
              "reason": "SLS can better suit complex nylon parts when supportless powder-bed production and more uniform behavior justify it."
            }
          ],
          "sources": [
            {
              "title": "FDM vs SLA vs SLS",
              "url": "https://formlabs.com/eu/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/",
              "publisher": "Formlabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "FDM is one process option for custom parts."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/processes/sls",
          "description": "SLS is an additive alternative with different material and support behavior."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/stl",
          "description": "STL is a common triangulated handoff when the selected FDM workflow accepts it."
        }
      ]
    },
    {
      "id": "manufacturing/processes/laser-sheet-cutting",
      "type": "topic",
      "domain": "manufacturing",
      "title": "Laser sheet cutting and bending",
      "summary": "Fabrication of constant-thickness 2D profiles, optionally followed by provider-supported bending, where flat geometry, closed contours, stock thickness, and bend setup define viability.",
      "tags": [
        "laser-cutting",
        "sheet-metal",
        "bending",
        "flat-profile"
      ],
      "recommendations": [
        {
          "statement": "Use laser sheet cutting for clean constant-thickness 2D profiles and provider-supported bends, with revisioned flat geometry and live material-thickness constraints.",
          "applicability": [
            "The part can be represented as a planar cut profile or supported bent sheet",
            "Constant stock thickness is compatible with the design"
          ],
          "counterconditions": [
            "The geometry requires enclosed 3D volumes, partial-depth features, or unsupported forming operations"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/processes/cnc-machining",
              "reason": "CNC machining is an alternative when solid 3D features or partial-depth machining are required."
            }
          ],
          "sources": [
            {
              "title": "SendCutSend 3D file guidelines",
              "url": "https://sendcutsend.com/guidelines/3d-files/",
              "publisher": "SendCutSend",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Sheet cutting is one process option for custom parts."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/processes/cnc-machining",
          "description": "CNC machining is an alternative for non-planar solid geometry."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/dxf",
          "description": "DXF is a common 1:1 profile artifact for 2D cutting workflows."
        }
      ]
    },
    {
      "id": "manufacturing/processes/sls",
      "type": "topic",
      "domain": "manufacturing",
      "title": "SLS additive manufacturing",
      "summary": "Powder-bed polymer additive manufacturing suited to complex durable nylon geometry and supportless nesting, with surface texture and powder-removal constraints.",
      "tags": [
        "sls",
        "additive",
        "nylon",
        "powder-bed"
      ],
      "recommendations": [
        {
          "statement": "Use SLS as a candidate for complex durable nylon parts when supportless nesting helps and grainy surface plus powder removal are acceptable.",
          "applicability": [
            "Complex geometry benefits from surrounding powder support",
            "Nylon material options and batch nesting fit the functional route"
          ],
          "counterconditions": [
            "Fine cosmetic surface, sealed internal cavities, or trapped-powder geometry conflicts with the provider process"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/processes/fdm",
              "reason": "FDM may be faster and cheaper for early concepts and simple fit checks."
            }
          ],
          "sources": [
            {
              "title": "What is selective laser sintering",
              "url": "https://formlabs.com/blog/what-is-selective-laser-sintering/",
              "publisher": "Formlabs",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "SLS is one process option for custom parts."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/processes/fdm",
          "description": "FDM is an additive alternative for inexpensive concepts and fit checks."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/3mf",
          "description": "3MF can carry additive model units and metadata when the selected workflow accepts it."
        }
      ]
    },
    {
      "id": "manufacturing/providers/fictiv",
      "type": "provider",
      "domain": "manufacturing",
      "title": "Fictiv",
      "summary": "A manufacturing network documenting machining, molding, additive, casting, and sheet services through a web quote path with process-specific file and assembly constraints.",
      "tags": [
        "manufacturer",
        "network",
        "quote",
        "drawings"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Fictiv only when the current process and file guidance fits the part, then live-check supplier, material, drawing, inspection, geography, and quote conditions.",
          "applicability": [
            "A documented Fictiv process matches the part route",
            "Required models and supporting drawings can satisfy current file guidance"
          ],
          "counterconditions": [
            "Assembly, file, material, or inspection requirements are outside the confirmed live capability"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/providers/xometry",
              "reason": "Xometry is an alternative manufacturing network with different process and supplier conditions."
            }
          ],
          "sources": [
            {
              "title": "Fictiv capabilities",
              "url": "https://www.fictiv.com/capabilities",
              "publisher": "Fictiv",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Fictiv is a provider candidate for multiple custom-part processes."
        },
        {
          "type": "support",
          "target": "manufacturing/practices/manufacturing-drawing",
          "description": "Fictiv documents attaching drawings to communicate manufacturing requirements."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/providers/xometry",
          "description": "Xometry is an alternative manufacturing network."
        }
      ],
      "provider": {
        "officialUrl": "https://www.fictiv.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "custom-manufacturing-quote",
            "label": "Custom manufacturing quote",
            "category": "manufacturing network",
            "description": "Fictiv documents a web quote route across multiple manufacturing capabilities using supported process-specific CAD inputs.",
            "status": "supported",
            "accepts": [
              "STEP",
              "STP",
              "SLDPRT",
              "X_T",
              "IGES"
            ],
            "outputs": [
              "Quote",
              "DFM feedback"
            ],
            "source": {
              "title": "Fictiv capabilities",
              "url": "https://www.fictiv.com/capabilities",
              "publisher": "Fictiv",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Supported file formats and assembly handling vary by process, so the current official file-format guidance must be consulted before upload.",
            "source": {
              "title": "Fictiv supported file formats",
              "url": "https://help.fictiv.com/en/articles/901841-what-file-formats-does-fictiv-support",
              "publisher": "Fictiv",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "website",
            "purpose": "Upload proprietary CAD and drawings to configure a live manufacturing quote.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Fictiv capabilities",
              "url": "https://www.fictiv.com/capabilities",
              "publisher": "Fictiv",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Live quote price, minimums, taxes, and validity are not persisted as provider facts."
          },
          {
            "field": "availability",
            "statement": "Supplier, process, material, finish, inspection, and capacity availability must be checked live."
          },
          {
            "field": "geography",
            "statement": "Supplier and shipping geography, timing, terms, and destination eligibility require live confirmation."
          },
          {
            "field": "inspection",
            "statement": "Inspection service, sampling, documentation, and process eligibility must be selected and verified live."
          }
        ]
      }
    },
    {
      "id": "manufacturing/providers/protolabs",
      "type": "provider",
      "domain": "manufacturing",
      "title": "Protolabs",
      "summary": "A digital manufacturing provider documenting CNC machining, additive manufacturing, sheet fabrication, and molding services with web model upload, quoting, and DFM feedback paths.",
      "tags": [
        "manufacturer",
        "cnc",
        "additive",
        "dfm"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Protolabs when its current service and accepted-file documentation fits, then confirm facility, material, tolerance, inspection, and quote details live.",
          "applicability": [
            "The part matches a currently documented Protolabs service",
            "A supported solid or mesh artifact and any required drawing can be prepared"
          ],
          "counterconditions": [
            "The required process, material, geography, inspection, or account terms are not confirmed in the live flow"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/providers/xometry",
              "reason": "Xometry is an alternative broad manufacturing quote network with different live capability and supplier conditions."
            }
          ],
          "sources": [
            {
              "title": "Protolabs services",
              "url": "https://www.protolabs.com/services/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Protolabs is a provider candidate for multiple custom-part processes."
        },
        {
          "type": "support",
          "target": "manufacturing/processes/cnc-machining",
          "description": "Protolabs documents CNC machining among its services."
        },
        {
          "type": "support",
          "target": "manufacturing/tools/step",
          "description": "Official file guidance lists STEP among accepted solid model formats."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/providers/xometry",
          "description": "Xometry is an alternative broad manufacturing provider network."
        }
      ],
      "provider": {
        "officialUrl": "https://www.protolabs.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "cnc-machining",
            "label": "CNC machining",
            "category": "subtractive manufacturing",
            "description": "Protolabs documents CNC machining and accepts supported 3D CAD model formats through its digital manufacturing workflow.",
            "status": "supported",
            "accepts": [
              "STEP",
              "STP",
              "IGES",
              "SLDPRT",
              "X_T"
            ],
            "outputs": [
              "Quote",
              "DFM feedback"
            ],
            "source": {
              "title": "Protolabs digital manufacturing FAQs",
              "url": "https://www.protolabs.com/resources/faqs/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          },
          {
            "key": "additive-manufacturing",
            "label": "3D printing",
            "category": "additive manufacturing",
            "description": "Protolabs documents industrial additive manufacturing services and accepts STL in addition to supported solid model formats.",
            "status": "supported",
            "accepts": [
              "STL",
              "STEP",
              "STP"
            ],
            "outputs": [
              "Quote",
              "DFM feedback"
            ],
            "source": {
              "title": "Protolabs digital manufacturing FAQs",
              "url": "https://www.protolabs.com/resources/faqs/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Protolabs states that it does not provide part-design services, so the user must arrive with a manufacturable 3D CAD model.",
            "source": {
              "title": "Protolabs digital manufacturing FAQs",
              "url": "https://www.protolabs.com/resources/faqs/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "website",
            "purpose": "Upload proprietary models and drawings for DFM feedback and a live quote.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Protolabs services",
              "url": "https://www.protolabs.com/services/",
              "publisher": "Protolabs",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Current quote price, minimums, taxes, and validity must be obtained from the live quoting flow."
          },
          {
            "field": "availability",
            "statement": "Process, facility, network, material, finish, and production availability must be confirmed live."
          },
          {
            "field": "geography",
            "statement": "Shipping eligibility, destination, timing, and provider terms must be checked for the actual order."
          },
          {
            "field": "inspection",
            "statement": "The exact inspection report, sampling, evidence, and eligibility must be selected and confirmed live."
          }
        ]
      }
    },
    {
      "id": "manufacturing/providers/sculpteo",
      "type": "provider",
      "domain": "manufacturing",
      "title": "Sculpteo",
      "summary": "An additive manufacturing provider documenting online 3D printing services, multiple model formats, and partner API services whose current access and effects require direct confirmation.",
      "tags": [
        "manufacturer",
        "additive",
        "3d-printing",
        "api"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Sculpteo for additive work only after confirming the exact process, format, material, finish, geography, and quote; treat partner API access as unverified until confirmed.",
          "applicability": [
            "The part follows an additive manufacturing route",
            "The current online service accepts the prepared model format"
          ],
          "counterconditions": [
            "The route assumes API access, material, certification, or destination support that has not been confirmed live"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/providers/protolabs",
              "reason": "Protolabs is an alternative provider with documented additive and other process paths."
            }
          ],
          "sources": [
            {
              "title": "Sculpteo online 3D printing",
              "url": "https://www.sculpteo.com/en/",
              "publisher": "Sculpteo",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Sculpteo is a provider candidate for additive custom-part processes."
        },
        {
          "type": "support",
          "target": "manufacturing/processes/sls",
          "description": "Sculpteo documents professional additive manufacturing services including powder-bed options."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/providers/protolabs",
          "description": "Protolabs is an alternative provider with additive services."
        }
      ],
      "provider": {
        "officialUrl": "https://www.sculpteo.com/en/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "additive-manufacturing",
            "label": "3D printing",
            "category": "additive manufacturing",
            "description": "Sculpteo documents online additive manufacturing from uploaded 3D model files across its current service catalog.",
            "status": "supported",
            "accepts": [
              "STL",
              "OBJ",
              "3MF",
              "STEP"
            ],
            "outputs": [
              "Quote"
            ],
            "source": {
              "title": "Sculpteo online 3D printing",
              "url": "https://www.sculpteo.com/en/",
              "publisher": "Sculpteo",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Sculpteo describes API services as a partner offering that requires contact, so access and supported operations cannot be assumed from public documentation alone.",
            "source": {
              "title": "Sculpteo API services",
              "url": "https://www.sculpteo.com/en/services/api-services/",
              "publisher": "Sculpteo",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "website",
            "purpose": "Upload a proprietary additive model and configure a live manufacturing quote.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Sculpteo online 3D printing",
              "url": "https://www.sculpteo.com/en/",
              "publisher": "Sculpteo",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Live price, minimums, taxes, and quote validity must be obtained from the current quote flow."
          },
          {
            "field": "availability",
            "statement": "Process, material, color, finish, inspection, and production availability must be checked live."
          },
          {
            "field": "geography",
            "statement": "Shipping destination, timing, eligibility, and terms must be confirmed for the actual handoff."
          },
          {
            "field": "api-access",
            "statement": "Partner API eligibility, authentication, operations, and external effects require direct current confirmation."
          }
        ]
      }
    },
    {
      "id": "manufacturing/providers/sendcutsend",
      "type": "provider",
      "domain": "manufacturing",
      "title": "SendCutSend",
      "summary": "A custom-parts provider with an official web upload and quote flow for documented 2D vector and STEP/STP inputs, especially relevant to sheet cutting and supported forming services.",
      "tags": [
        "manufacturer",
        "sheet-cutting",
        "bending",
        "quote"
      ],
      "recommendations": [
        {
          "statement": "Shortlist SendCutSend for compatible sheet or profile work only after matching the exact service, file, material, thickness, feature, and tolerance guidance live.",
          "applicability": [
            "The part fits a currently documented SendCutSend process",
            "A clean accepted 2D profile or supported STEP/STP model can be prepared"
          ],
          "counterconditions": [
            "The route depends on STL input, an unsupported process, or unconfirmed live material and feature constraints"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/providers/protolabs",
              "reason": "Protolabs is an alternative for a different mix of machining, additive, molding, and sheet services."
            }
          ],
          "sources": [
            {
              "title": "SendCutSend getting started",
              "url": "https://sendcutsend.com/guidelines/getting-started/",
              "publisher": "SendCutSend",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "SendCutSend is a provider candidate for selected custom-part processes."
        },
        {
          "type": "support",
          "target": "manufacturing/tools/dxf",
          "description": "Official setup guidance lists DXF among accepted 2D vector inputs."
        },
        {
          "type": "support",
          "target": "manufacturing/tools/step",
          "description": "Official setup guidance lists STEP and STP among accepted 3D inputs."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/providers/protolabs",
          "description": "Protolabs offers a different documented process and file mix."
        }
      ],
      "provider": {
        "officialUrl": "https://sendcutsend.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "sheet-profile-quote",
            "label": "Sheet profile and forming quote",
            "category": "sheet fabrication",
            "description": "The official upload flow accepts documented 2D vector and STEP/STP files for compatible cutting and supported service configurations.",
            "status": "supported",
            "accepts": [
              "DXF",
              "DWG",
              "AI",
              "EPS",
              "STEP",
              "STP"
            ],
            "outputs": [
              "Quote"
            ],
            "source": {
              "title": "SendCutSend getting started",
              "url": "https://sendcutsend.com/guidelines/getting-started/",
              "publisher": "SendCutSend",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Official 3D-file guidance requires STEP or STP for supported 3D services and explicitly does not accept STL for that path.",
            "source": {
              "title": "SendCutSend 3D file guidelines",
              "url": "https://sendcutsend.com/guidelines/3d-files/",
              "publisher": "SendCutSend",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "website",
            "purpose": "Upload proprietary part files and configure a live manufacturing quote.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "SendCutSend getting started",
              "url": "https://sendcutsend.com/guidelines/getting-started/",
              "publisher": "SendCutSend",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Part price, minimums, taxes, and quote validity are live and must not be persisted as provider facts."
          },
          {
            "field": "availability",
            "statement": "Material, thickness, process, finish, and service availability must be checked in the live quote flow."
          },
          {
            "field": "geography",
            "statement": "Shipping destination, eligibility, timing, and terms must be reconfirmed for the captain's actual destination."
          },
          {
            "field": "tolerances",
            "statement": "Tolerance capability must be checked for the exact process, material, thickness, feature, and service combination."
          }
        ]
      }
    },
    {
      "id": "manufacturing/providers/xometry",
      "type": "provider",
      "domain": "manufacturing",
      "title": "Xometry",
      "summary": "A manufacturing network documenting CNC, additive, sheet, molding, and other process capabilities through a web quoting flow with process-specific accepted inputs.",
      "tags": [
        "manufacturer",
        "network",
        "cnc",
        "additive"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Xometry for a documented process only after checking process-specific file support and live supplier, material, inspection, geography, and quote conditions.",
          "applicability": [
            "The required process appears in the current official capability catalog",
            "A process-compatible CAD artifact and drawing can be prepared"
          ],
          "counterconditions": [
            "The decision depends on an unverified customer manufacturing API or assumed supplier capability"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/providers/fictiv",
              "reason": "Fictiv is an alternative broad manufacturing network with its own process and file constraints."
            }
          ],
          "sources": [
            {
              "title": "Xometry capabilities",
              "url": "https://www.xometry.com/capabilities/",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "Xometry is a provider candidate for multiple custom-part processes."
        },
        {
          "type": "support",
          "target": "manufacturing/processes/cnc-machining",
          "description": "Xometry documents CNC machining among its capability catalog."
        },
        {
          "type": "support",
          "target": "manufacturing/tools/step",
          "description": "Official format guidance includes STEP for supported process paths."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/providers/fictiv",
          "description": "Fictiv is an alternative manufacturing network."
        }
      ],
      "provider": {
        "officialUrl": "https://www.xometry.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "cnc-machining",
            "label": "CNC machining",
            "category": "subtractive manufacturing",
            "description": "Xometry documents CNC machining and a web quote flow accepting process-compatible 3D CAD files including STEP.",
            "status": "supported",
            "accepts": [
              "STEP",
              "STP",
              "SLDPRT",
              "IPT",
              "PRT"
            ],
            "outputs": [
              "Quote",
              "DFM feedback"
            ],
            "source": {
              "title": "Xometry CNC machining",
              "url": "https://www.xometry.com/capabilities/cnc-machining-service/precision-cnc-machining/",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          },
          {
            "key": "additive-manufacturing",
            "label": "3D printing",
            "category": "additive manufacturing",
            "description": "Xometry's official capability catalog lists multiple plastic, resin, and metal additive manufacturing services.",
            "status": "supported",
            "accepts": [
              "STEP",
              "STP",
              "STL"
            ],
            "outputs": [
              "Quote"
            ],
            "source": {
              "title": "Xometry capabilities",
              "url": "https://www.xometry.com/capabilities/",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Accepted file types and requirements vary by manufacturing process and must be selected from current process-specific guidance.",
            "source": {
              "title": "Xometry accepted file types",
              "url": "https://community.xometry.com/kb/articles/643-what-file-types-does-xometry-accept",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "website",
            "purpose": "Upload proprietary CAD and drawings to configure a process-specific live quote.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Xometry capabilities",
              "url": "https://www.xometry.com/capabilities/",
              "publisher": "Xometry",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Live price, supplier allocation, minimums, taxes, and quote validity are not stored in Possible."
          },
          {
            "field": "availability",
            "statement": "Supplier, process, material, finish, certification, and capacity availability must be checked live."
          },
          {
            "field": "geography",
            "statement": "Shipping destination, supplier geography, timing, tariffs, and terms must be reconfirmed for the quote."
          },
          {
            "field": "api-access",
            "statement": "No customer manufacturing-order API is asserted by this record; any API access requires separate official verification."
          }
        ]
      }
    },
    {
      "id": "manufacturing/tools/3mf",
      "type": "tool",
      "domain": "manufacturing",
      "title": "3MF additive exchange",
      "summary": "An additive manufacturing package format with defined units, mesh geometry, transforms, metadata, and published extensions for materials and production workflows.",
      "tags": [
        "3mf",
        "additive",
        "units",
        "metadata"
      ],
      "recommendations": [
        {
          "statement": "Use 3MF as an additive alternative when the toolchain supports it and units or richer print metadata matter; do not use it as a replacement for neutral STEP solids.",
          "applicability": [
            "The selected additive workflow explicitly supports 3MF",
            "Defined units or supported color, material, or production metadata are useful"
          ],
          "counterconditions": [
            "The recipient requires exact neutral solid geometry for CAD or machining exchange"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/stl",
              "reason": "STL remains a simpler mesh alternative when the target accepts only triangulated surface geometry."
            }
          ],
          "sources": [
            {
              "title": "3MF specification suite",
              "url": "https://3mf.io/spec/",
              "publisher": "3MF Consortium",
              "kind": "official-standard",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 180
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "3MF is an additive manufacturing artifact option."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/stl",
          "description": "STL is a simpler triangulated mesh alternative."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/processes/sls",
          "description": "3MF can serve additive workflows when the selected SLS provider accepts it."
        }
      ],
      "tool": {
        "officialUrl": "https://3mf.io/spec/",
        "categories": [
          "mesh-format",
          "additive",
          "manufacturing-artifact"
        ]
      }
    },
    {
      "id": "manufacturing/tools/cadquery",
      "type": "tool",
      "domain": "manufacturing",
      "title": "CadQuery",
      "summary": "A Python library for script-authored parametric solid CAD, suited to agent-readable models, repeatable parameter changes, and export of manufacturing exchange formats.",
      "tags": [
        "cadquery",
        "python",
        "parametric-cad",
        "step"
      ],
      "recommendations": [
        {
          "statement": "Use CadQuery when a plain-text Python parametric model and repeatable agent edits are valuable, while validating geometry and exports with real CAD checks.",
          "applicability": [
            "The part can be expressed through parametric solid modeling",
            "Source-level diff, automation, and repeatable variants are useful"
          ],
          "counterconditions": [
            "The design depends on interactive surfacing or specialist workflows better served by a mature GUI CAD system"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/freecad",
              "reason": "FreeCAD provides a GUI-native parametric workflow when interactive feature modeling is preferred."
            }
          ],
          "sources": [
            {
              "title": "CadQuery documentation",
              "url": "https://cadquery.readthedocs.io/en/latest/",
              "publisher": "CadQuery",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/practices/parametric-cad",
          "description": "CadQuery is one implementation tool for a parametric CAD master."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/freecad",
          "description": "FreeCAD is a GUI-native parametric modeling alternative."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/step",
          "description": "CadQuery documents STEP export for downstream exchange."
        }
      ],
      "tool": {
        "officialUrl": "https://cadquery.readthedocs.io/",
        "categories": [
          "parametric-cad",
          "python",
          "solid-modeling"
        ]
      }
    },
    {
      "id": "manufacturing/tools/dxf",
      "type": "tool",
      "domain": "manufacturing",
      "title": "DXF profile exchange",
      "summary": "A 2D drawing exchange format commonly used to hand off clean, closed, one-to-one cut profiles or flat patterns to sheet cutting workflows.",
      "tags": [
        "dxf",
        "2d",
        "laser-cutting",
        "flat-pattern"
      ],
      "recommendations": [
        {
          "statement": "Use DXF for a clean 1:1 2D cut profile when accepted, with explicit units, closed contours, no duplicate geometry, and only process-relevant entities.",
          "applicability": [
            "The target process consumes a planar cut profile or flat pattern",
            "The provider explicitly accepts DXF for the selected service"
          ],
          "counterconditions": [
            "The part definition requires solid 3D geometry, partial-depth features, or unsupported annotations"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/step",
              "reason": "STEP is the appropriate neutral solid alternative when the process requires 3D geometry."
            }
          ],
          "sources": [
            {
              "title": "SendCutSend getting started",
              "url": "https://sendcutsend.com/guidelines/getting-started/",
              "publisher": "SendCutSend",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "DXF is a profile artifact for selected custom-part processes."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/step",
          "description": "STEP is a solid-model alternative for 3D process handoff."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/processes/laser-sheet-cutting",
          "description": "DXF is commonly accepted for planar sheet cutting profiles."
        }
      ],
      "tool": {
        "officialUrl": "https://sendcutsend.com/guidelines/getting-started/",
        "categories": [
          "2d-format",
          "sheet-cutting",
          "manufacturing-artifact"
        ]
      }
    },
    {
      "id": "manufacturing/tools/freecad",
      "type": "tool",
      "domain": "manufacturing",
      "title": "FreeCAD",
      "summary": "An open-source parametric 3D modeler with editable feature history, real-world units, solid modeling, drawings, and export paths for fabrication workflows.",
      "tags": [
        "freecad",
        "parametric-cad",
        "gui",
        "open-source"
      ],
      "recommendations": [
        {
          "statement": "Use FreeCAD when an open-source GUI parametric workflow and editable feature history fit better than a script-first CAD source.",
          "applicability": [
            "Interactive constrained modeling and drawing tools are useful",
            "An open-source native CAD environment fits the contributor workflow"
          ],
          "counterconditions": [
            "Automated textual generation and code review are the primary modeling requirements"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/cadquery",
              "reason": "CadQuery is a script-first alternative that exposes the parametric model as Python source."
            }
          ],
          "sources": [
            {
              "title": "FreeCAD parametric modeler",
              "url": "https://www.freecad.org/index.php?lang=eng_EN",
              "publisher": "FreeCAD",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 120
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/practices/parametric-cad",
          "description": "FreeCAD is one implementation tool for a parametric CAD master."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/cadquery",
          "description": "CadQuery is a script-authored parametric modeling alternative."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/tools/step",
          "description": "FreeCAD supports solid geometry export for neutral exchange workflows."
        }
      ],
      "tool": {
        "officialUrl": "https://www.freecad.org/",
        "categories": [
          "parametric-cad",
          "gui",
          "solid-modeling"
        ]
      }
    },
    {
      "id": "manufacturing/tools/mujoco",
      "type": "tool",
      "domain": "manufacturing",
      "title": "MuJoCo",
      "summary": "A general-purpose physics engine for articulated structures and contact, useful for robot mechanism studies while remaining a model-dependent simulation rather than physical proof.",
      "tags": [
        "mujoco",
        "robotics",
        "simulation",
        "dynamics"
      ],
      "recommendations": [
        {
          "statement": "Use MuJoCo to test articulated motion, contact, and control assumptions before fabrication when a calibrated model exists, while preserving physical verification as a separate requirement.",
          "applicability": [
            "The custom part belongs to an articulated robot mechanism",
            "Kinematics, contact, or controller behavior can invalidate the mechanical route"
          ],
          "counterconditions": [
            "Material stress, manufacturing defects, and physical performance are being inferred from an uncalibrated simulation alone"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/practices/inspection-plan",
              "reason": "Physical measurement and acceptance remain necessary after fabrication even when simulation is used."
            }
          ],
          "sources": [
            {
              "title": "MuJoCo overview",
              "url": "https://mujoco.readthedocs.io/en/stable/overview.html",
              "publisher": "Google DeepMind",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "MuJoCo supports robot-related custom-part reasoning before fabrication."
        },
        {
          "type": "relevance",
          "target": "manufacturing/outcomes/motor-brackets",
          "description": "Motor bracket interfaces may participate in an articulated mechanism model."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/practices/inspection-plan",
          "description": "Physical inspection supplies evidence that simulation cannot establish."
        }
      ],
      "tool": {
        "officialUrl": "https://mujoco.org/",
        "categories": [
          "simulation",
          "robotics",
          "physics"
        ]
      }
    },
    {
      "id": "manufacturing/tools/step",
      "type": "tool",
      "domain": "manufacturing",
      "title": "STEP solid exchange",
      "summary": "A neutral ISO 10303 product-data exchange family used to transfer part and assembly geometry and related product information between CAD, manufacturing, analysis, and inspection systems.",
      "tags": [
        "step",
        "iso-10303",
        "solid",
        "cad-exchange"
      ],
      "recommendations": [
        {
          "statement": "Use a revisioned STEP export for neutral solid handoff when accepted, but keep the native parametric model and drawing because STEP is not the native feature history.",
          "applicability": [
            "The receiving provider or tool accepts STEP solid geometry",
            "Editable native feature history is retained separately as the design source"
          ],
          "counterconditions": [
            "The target workflow explicitly requires a mesh, 2D profile, or native CAD format instead"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/stl",
              "reason": "STL is a mesh alternative for additive workflows that explicitly accept triangulated geometry."
            }
          ],
          "sources": [
            {
              "title": "ISO 10303-21:2016",
              "url": "https://www.iso.org/standard/63141.html",
              "publisher": "ISO",
              "kind": "official-standard",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "NIST STEP File Analyzer",
              "url": "https://www.nist.gov/services-resources/software/step-file-analyzer-and-viewer",
              "publisher": "NIST",
              "kind": "government-reference",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 180
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "STEP is a common neutral solid artifact in custom-part workflows."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/stl",
          "description": "STL is a triangulated mesh alternative for selected additive workflows."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/processes/cnc-machining",
          "description": "Many CNC quote workflows accept STEP solid models."
        }
      ],
      "tool": {
        "officialUrl": "https://www.iso.org/standard/63141.html",
        "categories": [
          "cad-format",
          "solid-exchange",
          "manufacturing-artifact"
        ]
      }
    },
    {
      "id": "manufacturing/tools/stl",
      "type": "tool",
      "domain": "manufacturing",
      "title": "STL mesh exchange",
      "summary": "A simple triangulated surface format widely used in additive workflows, with no intrinsic unit declaration or parametric feature history and limited manufacturing metadata.",
      "tags": [
        "stl",
        "mesh",
        "additive",
        "unitless"
      ],
      "recommendations": [
        {
          "statement": "Use STL only when the additive workflow accepts it, declare units out of band, choose sufficient mesh refinement, and never treat it as precision-editable native CAD.",
          "applicability": [
            "The selected additive workflow explicitly accepts STL",
            "Units, orientation, and mesh refinement are recorded in the package"
          ],
          "counterconditions": [
            "Neutral solid exchange, exact editable geometry, units, color, materials, or richer manufacturing metadata are required"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/tools/3mf",
              "reason": "3MF is an additive alternative with defined units and extensible manufacturing metadata."
            }
          ],
          "sources": [
            {
              "title": "STL file format family",
              "url": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000504.shtml",
              "publisher": "Library of Congress",
              "kind": "government-reference",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Fusion export mesh guidance",
              "url": "https://help.autodesk.com/cloudhelp/ENU/Fusion-Model/files/SLD-3D-PRINT.htm",
              "publisher": "Autodesk",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 180
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "manufacturing/custom-parts",
          "description": "STL is a mesh artifact for selected custom-part workflows."
        },
        {
          "type": "alternatives",
          "target": "manufacturing/tools/3mf",
          "description": "3MF is a richer additive mesh container alternative."
        },
        {
          "type": "compatibility",
          "target": "manufacturing/processes/fdm",
          "description": "FDM slicer workflows commonly consume triangulated mesh artifacts."
        }
      ],
      "tool": {
        "officialUrl": "https://www.loc.gov/preservation/digital/formats/fdd/fdd000504.shtml",
        "categories": [
          "mesh-format",
          "additive",
          "manufacturing-artifact"
        ]
      }
    },
    {
      "id": "web",
      "type": "topic",
      "domain": "web",
      "title": "Web",
      "summary": "Operational knowledge for outcomes delivered through browsers, from application architecture and interface composition to rendering, deployment, and verification.",
      "tags": [
        "browser",
        "software",
        "deployment",
        "frontend"
      ],
      "recommendations": [
        {
          "statement": "Start in the Web branch when the outcome is primarily experienced through a browser, then narrow by interaction, data, rendering, and runtime requirements.",
          "applicability": [
            "The primary user surface runs in a web browser",
            "Deployment and browser verification are part of the desired outcome"
          ],
          "counterconditions": [
            "The primary artifact is a physical part or embedded system rather than a browser surface"
          ],
          "alternatives": [
            {
              "nodeId": "manufacturing/custom-parts",
              "reason": "Use the custom-parts branch when the requested outcome is a fabricated physical component."
            }
          ],
          "sources": [
            {
              "title": "React: the library for web and native user interfaces",
              "url": "https://react.dev/",
              "publisher": "React",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 180
        }
      ],
      "relationships": [
        {
          "type": "relevance",
          "target": "manufacturing/custom-parts",
          "description": "Some web outcomes configure, quote, or monitor custom physical parts."
        }
      ]
    },
    {
      "id": "web/actions/deploy-cloudflare-preview",
      "type": "action",
      "domain": "web",
      "title": "Create a Cloudflare preview deployment",
      "summary": "An approval-gated handoff that deploys a compatible project to a non-production Cloudflare target and returns the external URL for runtime verification.",
      "tags": [
        "cloudflare",
        "preview",
        "workers",
        "external-effect"
      ],
      "recommendations": [
        {
          "statement": "Create a Cloudflare preview only after rechecking runtime and adapter compatibility and obtaining captain approval for authentication and external deployment state.",
          "applicability": [
            "Cloudflare Workers was selected after a live compatibility check",
            "A non-production environment is needed for browser verification"
          ],
          "counterconditions": [
            "Required Next.js or Node runtime features are unsupported by the current adapter"
          ],
          "alternatives": [
            {
              "nodeId": "web/actions/deploy-vercel-preview",
              "reason": "Use a Vercel preview when Vercel is the selected compatible provider."
            }
          ],
          "sources": [
            {
              "title": "Next.js on Cloudflare Workers",
              "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web",
          "description": "Preview deployment is an external Web delivery action."
        },
        {
          "type": "invocation",
          "target": "web/providers/cloudflare-workers",
          "description": "The action invokes the authenticated Cloudflare deployment path."
        },
        {
          "type": "relevance",
          "target": "web/practices/production-verification",
          "description": "The resulting preview supports runtime and browser-flow checks."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "web/providers/cloudflare-workers",
        "requiresApproval": true,
        "approvalReason": "Wrangler authentication and deployment create externally reachable provider state.",
        "steps": [
          "Live-check Workers runtime and framework-adapter compatibility",
          "Ask the captain to approve authentication and preview deployment",
          "Deploy to the approved non-production target",
          "Return the preview URL and verification evidence"
        ],
        "produces": [
          "Preview deployment URL",
          "Deployment verification receipt"
        ]
      }
    },
    {
      "id": "web/actions/deploy-vercel-preview",
      "type": "action",
      "domain": "web",
      "title": "Create a Vercel preview deployment",
      "summary": "An approval-gated handoff that sends project source or a connected Git revision to Vercel and returns a preview URL for verification without promoting production.",
      "tags": [
        "vercel",
        "preview",
        "deployment",
        "external-effect"
      ],
      "recommendations": [
        {
          "statement": "Create a preview only after the captain approves the external source handoff, then verify the returned deployment before any production promotion.",
          "applicability": [
            "Vercel was selected after a live provider check",
            "A review environment is needed before production"
          ],
          "counterconditions": [
            "Repository access, secrets, provider terms, or the deployment target have not been approved"
          ],
          "alternatives": [
            {
              "nodeId": "web/actions/deploy-cloudflare-preview",
              "reason": "Use a Cloudflare preview path when Workers is the selected compatible provider."
            }
          ],
          "sources": [
            {
              "title": "Deploying Git repositories with Vercel",
              "url": "https://vercel.com/docs/git",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web",
          "description": "Preview deployment is an external Web delivery action."
        },
        {
          "type": "invocation",
          "target": "web/providers/vercel",
          "description": "The action hands source or a Git revision to Vercel."
        },
        {
          "type": "relevance",
          "target": "web/practices/production-verification",
          "description": "The resulting preview is the environment for production-oriented checks."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "web/providers/vercel",
        "requiresApproval": true,
        "approvalReason": "The handoff grants provider access or uploads source and creates external deployment state.",
        "steps": [
          "Live-check provider compatibility, account, plan, and target configuration",
          "Ask the captain to approve source access and preview deployment",
          "Create the preview through the selected official Vercel path",
          "Return the preview URL and verification evidence"
        ],
        "produces": [
          "Preview deployment URL",
          "Deployment verification receipt"
        ]
      }
    },
    {
      "id": "web/actions/promote-vercel-production",
      "type": "action",
      "domain": "web",
      "title": "Promote a verified Vercel deployment to production",
      "summary": "A separately approval-gated production action that occurs only after preview evidence is reviewed and the captain explicitly accepts the target, domain, cost, and release impact.",
      "tags": [
        "vercel",
        "production",
        "promotion",
        "captain-approval"
      ],
      "recommendations": [
        {
          "statement": "Treat production promotion as a new captain decision, never as an implied continuation of preview approval or a successful build.",
          "applicability": [
            "A Vercel preview has passed the declared production checks",
            "The captain has reviewed target, domain, configuration, cost, and release impact"
          ],
          "counterconditions": [
            "Verification is incomplete or production scope differs from the approved preview"
          ],
          "alternatives": [
            {
              "nodeId": "web/actions/deploy-vercel-preview",
              "reason": "Remain on a preview deployment when production approval or evidence is incomplete."
            }
          ],
          "sources": [
            {
              "title": "Deploying to Vercel",
              "url": "https://vercel.com/docs/deployments/overview",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/actions/deploy-vercel-preview",
          "description": "Production promotion follows a separately verified preview route."
        },
        {
          "type": "invocation",
          "target": "web/providers/vercel",
          "description": "The action changes external Vercel production deployment state."
        },
        {
          "type": "relevance",
          "target": "web/practices/production-verification",
          "description": "Promotion requires the production verification receipt."
        }
      ],
      "action": {
        "access": "external-approval",
        "providerId": "web/providers/vercel",
        "requiresApproval": true,
        "approvalReason": "Production promotion changes the user-facing release and may affect domains, traffic, usage, and cost.",
        "steps": [
          "Present the preview verification receipt and exact production target",
          "Ask for explicit captain approval of production promotion",
          "Promote only the approved deployment and configuration",
          "Verify the production URL and record the resulting deployment identity"
        ],
        "produces": [
          "Production deployment URL",
          "Production verification receipt"
        ]
      }
    },
    {
      "id": "web/browser-applications",
      "type": "topic",
      "domain": "web",
      "title": "Browser applications",
      "summary": "Interactive browser software whose architecture must account for navigation, client and server boundaries, data mutation, state, accessibility, testing, and deployment.",
      "tags": [
        "browser",
        "application",
        "routing",
        "data"
      ],
      "recommendations": [
        {
          "statement": "Classify the application by data flow and runtime needs before selecting a framework, because rendering mode and deployment constraints change the productive default.",
          "applicability": [
            "The browser surface has multiple views or routes",
            "The product reads or mutates application data"
          ],
          "counterconditions": [
            "A single static document with negligible interaction may not need an application framework"
          ],
          "alternatives": [
            {
              "nodeId": "web/outcomes/3d-experiences",
              "reason": "Start from the 3D-experience branch when the renderer and frame budget dominate the architecture."
            }
          ],
          "sources": [
            {
              "title": "Sunsetting Create React App",
              "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app",
              "publisher": "React",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 90
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web",
          "description": "Browser applications are one operational branch within Web."
        },
        {
          "type": "relevance",
          "target": "web/practices/framework-selection",
          "description": "Application constraints determine whether a framework is productive."
        }
      ]
    },
    {
      "id": "web/outcomes/3d-experiences",
      "type": "topic",
      "domain": "web",
      "title": "3D web experiences",
      "summary": "Browser outcomes where interactive scenes, cameras, geometry, materials, animation, asset loading, input, and frame-time behavior are central rather than decorative.",
      "tags": [
        "3d",
        "webgl",
        "animation",
        "interactive-rendering"
      ],
      "recommendations": [
        {
          "statement": "Treat a browser 3D experience as a rendering product with an explicit asset and performance budget before choosing direct Three.js or a React renderer.",
          "applicability": [
            "A real-time 3D scene is essential to the requested experience",
            "Browser compatibility and frame-time behavior are acceptance criteria"
          ],
          "counterconditions": [
            "A pre-rendered image or video communicates the outcome without real-time interaction"
          ],
          "alternatives": [
            {
              "nodeId": "web/outcomes/dashboards",
              "reason": "Use ordinary browser application patterns when 3D is incidental and data workflows dominate."
            }
          ],
          "sources": [
            {
              "title": "Three.js fundamentals",
              "url": "https://threejs.org/manual/en/fundamentals.html",
              "publisher": "Three.js",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Interactive 3D experiences are browser applications with renderer-specific constraints."
        },
        {
          "type": "relevance",
          "target": "web/practices/renderer-selection",
          "description": "Renderer selection follows scene, framework, and performance constraints."
        }
      ]
    },
    {
      "id": "web/outcomes/dashboards",
      "type": "topic",
      "domain": "web",
      "title": "Data-heavy dashboards",
      "summary": "Authenticated or internal browser applications centered on dense records, filters, tables, forms, charts, operational navigation, and repeated data updates such as inventory dashboards.",
      "tags": [
        "dashboard",
        "inventory",
        "tables",
        "forms",
        "data-heavy"
      ],
      "recommendations": [
        {
          "statement": "For a React-based data-heavy dashboard needing routing, server data, and rapid UI composition, compare Next.js App Router with shadcn/ui as a productive default.",
          "applicability": [
            "React and TypeScript fit the team's or agent's working context",
            "The dashboard benefits from routing, server data access, forms, and reusable interface primitives"
          ],
          "counterconditions": [
            "The application is deliberately client-only, non-React, or rejects Tailwind and local component maintenance"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/vite-react",
              "reason": "A Vite-based React client can be simpler when server rendering and framework server features are intentionally unnecessary."
            }
          ],
          "sources": [
            {
              "title": "Next.js server and client components",
              "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
              "publisher": "Next.js",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "shadcn/ui documentation",
              "url": "https://ui.shadcn.com/docs",
              "publisher": "shadcn/ui",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Dashboards are data-oriented browser applications."
        },
        {
          "type": "relevance",
          "target": "web/tools/nextjs",
          "description": "Next.js is a conditional framework candidate for routed data-heavy dashboards."
        },
        {
          "type": "relevance",
          "target": "web/tools/shadcn-ui",
          "description": "shadcn/ui is a conditional composition candidate for dashboard primitives."
        }
      ]
    },
    {
      "id": "web/practices/3d-runtime-verification",
      "type": "practice",
      "domain": "web",
      "title": "3D runtime verification",
      "summary": "Browser and device checks for scene load, camera and input behavior, asset failures, fallback behavior, visual correctness, and representative frame-time stability.",
      "tags": [
        "3d",
        "runtime",
        "frame-time",
        "browser-testing"
      ],
      "recommendations": [
        {
          "statement": "Verify the actual 3D scene on representative target browsers and devices; a successful build does not prove assets, input, fallback, or frame behavior.",
          "applicability": [
            "The application renders an interactive Three.js scene",
            "Asset loading or device graphics capability can change the experience"
          ],
          "counterconditions": [
            "The outcome contains no real-time renderer and standard browser-flow checks cover all behavior"
          ],
          "alternatives": [
            {
              "nodeId": "web/practices/production-verification",
              "reason": "Use the general production verifier when no interactive renderer-specific behavior exists."
            }
          ],
          "sources": [
            {
              "title": "Three.js fundamentals",
              "url": "https://threejs.org/manual/en/fundamentals.html",
              "publisher": "Three.js",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/outcomes/3d-experiences",
          "description": "Renderer-specific verification belongs to the 3D outcome branch."
        },
        {
          "type": "compatibility",
          "target": "web/tools/threejs",
          "description": "The verifier targets behavior produced through Three.js rendering pipelines."
        }
      ],
      "practice": {
        "outputs": [
          "Scene-load, interaction, fallback, visual, and frame-behavior evidence"
        ],
        "checks": [
          "Representative browser and device classes complete the critical 3D route without hidden asset errors"
        ]
      }
    },
    {
      "id": "web/practices/framework-selection",
      "type": "practice",
      "domain": "web",
      "title": "Framework selection",
      "summary": "A constraint-first comparison of routing, rendering, server data, deployment targets, ecosystem fit, and maintenance ownership before committing an application stack.",
      "tags": [
        "framework",
        "architecture",
        "constraints",
        "trade-offs"
      ],
      "recommendations": [
        {
          "statement": "Choose a web framework from the required runtime and delivery model, and record the rejected alternative so agents do not mistake a default for a universal rule.",
          "applicability": [
            "A new browser application needs an implementation starting point",
            "Routing, server execution, static output, or deployment compatibility affects the choice"
          ],
          "counterconditions": [
            "An existing maintained application already fixes the framework and migration is outside scope"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/vite-react",
              "reason": "Compare a client-oriented Vite setup whenever server framework features are not required."
            }
          ],
          "sources": [
            {
              "title": "Sunsetting Create React App",
              "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app",
              "publisher": "React",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Deploying Next.js",
              "url": "https://nextjs.org/docs/app/getting-started/deploying",
              "publisher": "Next.js",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Framework selection is an architecture practice for browser applications."
        },
        {
          "type": "relevance",
          "target": "web/tools/nextjs",
          "description": "Next.js is one framework candidate evaluated by this practice."
        }
      ],
      "practice": {
        "outputs": [
          "A selected framework with explicit applicability and rejected alternatives"
        ],
        "checks": [
          "Required rendering and deployment modes are supported by current official documentation"
        ]
      }
    },
    {
      "id": "web/practices/production-verification",
      "type": "practice",
      "domain": "web",
      "title": "Production web verification",
      "summary": "Evidence that a deployed browser outcome builds, supports critical user flows, meets its accessibility target, protects sensitive boundaries, and records performance behavior.",
      "tags": [
        "testing",
        "accessibility",
        "performance",
        "security",
        "browser-flows"
      ],
      "recommendations": [
        {
          "statement": "Require build, critical browser-flow, accessibility, security-boundary, and measured performance evidence before calling a web deployment complete.",
          "applicability": [
            "The application will be used beyond local development",
            "The route includes a preview or production deployment"
          ],
          "counterconditions": [
            "A disposable visual spike is explicitly scoped without a production trust claim"
          ],
          "alternatives": [
            {
              "nodeId": "web/practices/3d-runtime-verification",
              "reason": "Add the 3D runtime verifier when scene correctness and frame behavior are part of the outcome."
            }
          ],
          "sources": [
            {
              "title": "Next.js production checklist",
              "url": "https://nextjs.org/docs/app/guides/production-checklist",
              "publisher": "Next.js",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Web Content Accessibility Guidelines 2.2",
              "url": "https://www.w3.org/TR/WCAG22/",
              "publisher": "W3C",
              "kind": "official-standard",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Web Vitals",
              "url": "https://web.dev/articles/vitals",
              "publisher": "Google",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Production verification applies to browser application delivery."
        },
        {
          "type": "relevance",
          "target": "web/actions/deploy-vercel-preview",
          "description": "A preview deployment provides an environment for verification before production."
        }
      ],
      "practice": {
        "outputs": [
          "Build log, browser-flow results, accessibility evidence, security review, and measured performance receipt"
        ],
        "checks": [
          "No production claim relies only on an agent success message or a screenshot"
        ]
      }
    },
    {
      "id": "web/practices/renderer-selection",
      "type": "practice",
      "domain": "web",
      "title": "3D renderer selection",
      "summary": "A decision record covering direct scene control, React integration, target browser APIs, asset pipeline, interaction model, and expected rendering complexity.",
      "tags": [
        "renderer",
        "threejs",
        "webgl",
        "webgpu"
      ],
      "recommendations": [
        {
          "statement": "Use stable WebGL-backed Three.js as the conservative browser baseline and treat WebGPU renderer adoption as an explicit, revalidated compatibility decision.",
          "applicability": [
            "The outcome requires interactive browser 3D",
            "Broad, predictable browser behavior matters more than experimental renderer features"
          ],
          "counterconditions": [
            "A controlled environment has validated WebGPU requirements and accepts experimental renderer limitations"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/react-three-fiber",
              "reason": "Use React Three Fiber when the application is React-led and declarative scene composition improves maintainability."
            }
          ],
          "sources": [
            {
              "title": "Three.js WebGPU renderer",
              "url": "https://threejs.org/manual/en/webgpurenderer.html",
              "publisher": "Three.js",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 45
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/outcomes/3d-experiences",
          "description": "Renderer selection is a defining practice for browser 3D outcomes."
        },
        {
          "type": "relevance",
          "target": "web/tools/threejs",
          "description": "Three.js provides the baseline rendering primitives considered here."
        }
      ],
      "practice": {
        "outputs": [
          "A renderer decision with browser target, framework boundary, and fallback"
        ],
        "checks": [
          "The selected renderer is exercised in every supported browser class before commitment"
        ]
      }
    },
    {
      "id": "web/providers/cloudflare-workers",
      "type": "provider",
      "domain": "web",
      "title": "Cloudflare Workers",
      "summary": "A web application deployment platform supporting static assets and documented full-stack framework adapters, including a current Next.js path through OpenNext and Wrangler.",
      "tags": [
        "hosting",
        "workers",
        "cloudflare",
        "opennext"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Cloudflare Workers when its runtime and static-asset model fit the application, and revalidate framework-adapter compatibility before every handoff.",
          "applicability": [
            "The application fits the Workers runtime and supported framework path",
            "Static assets and server logic can be deployed through Wrangler or a connected build"
          ],
          "counterconditions": [
            "Required Node.js APIs or Next.js features are unsupported by the current adapter or Workers runtime"
          ],
          "alternatives": [
            {
              "nodeId": "web/providers/vercel",
              "reason": "Vercel is an alternative when its integrated Next.js path and deployment workflow fit better."
            }
          ],
          "sources": [
            {
              "title": "Next.js on Cloudflare Workers",
              "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Cloudflare Workers static assets",
              "url": "https://developers.cloudflare.com/workers/static-assets/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web",
          "description": "Cloudflare Workers is a deployment provider in the Web branch."
        },
        {
          "type": "support",
          "target": "web/tools/nextjs",
          "description": "Cloudflare documents a Next.js deployment path through the OpenNext adapter."
        },
        {
          "type": "alternatives",
          "target": "web/providers/vercel",
          "description": "Vercel is a provider alternative with a different runtime and integration model."
        }
      ],
      "provider": {
        "officialUrl": "https://workers.cloudflare.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "nextjs-opennext-deployment",
            "label": "Next.js OpenNext deployment",
            "category": "web deployment",
            "description": "Cloudflare documents building and deploying Next.js applications to Workers through the OpenNext adapter and Wrangler workflow.",
            "status": "supported",
            "accepts": [
              "Next.js project"
            ],
            "outputs": [
              "Workers deployment URL"
            ],
            "source": {
              "title": "Next.js on Cloudflare Workers",
              "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          },
          {
            "key": "static-assets-deployment",
            "label": "Static assets deployment",
            "category": "web deployment",
            "description": "Workers can deploy a configured static-asset directory together with Worker logic as one application unit.",
            "status": "supported",
            "accepts": [
              "Static asset directory"
            ],
            "outputs": [
              "Workers deployment URL"
            ],
            "source": {
              "title": "Cloudflare Workers static assets",
              "url": "https://developers.cloudflare.com/workers/static-assets/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "The current Next.js adapter documentation marks Node.js middleware support as not yet supported, so middleware requirements need explicit compatibility review.",
            "source": {
              "title": "Next.js on Cloudflare Workers",
              "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "cli",
            "purpose": "Build and deploy a configured application through authenticated Wrangler commands.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Next.js on Cloudflare Workers",
              "url": "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
              "publisher": "Cloudflare",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Current plan pricing, included usage, and request or asset billing must be checked live."
          },
          {
            "field": "availability",
            "statement": "Account, region, compliance, binding, and feature availability must be checked live for the project."
          },
          {
            "field": "adapter-compatibility",
            "statement": "OpenNext and Next.js feature support is volatile and must be rechecked against the application before deployment."
          }
        ]
      }
    },
    {
      "id": "web/providers/vercel",
      "type": "provider",
      "domain": "web",
      "title": "Vercel",
      "summary": "A web deployment provider with documented Next.js support, Git-connected preview and production deployments, and a CLI path; all account and deployment state remains external to Possible.",
      "tags": [
        "hosting",
        "nextjs",
        "git-deployment",
        "preview"
      ],
      "recommendations": [
        {
          "statement": "Shortlist Vercel for a Next.js application when integrated framework support and Git-based previews fit, then live-check account, plan, runtime, and production requirements.",
          "applicability": [
            "The application uses Next.js or another documented Vercel framework",
            "Git-connected preview deployments are useful to the review workflow"
          ],
          "counterconditions": [
            "The selected runtime, compliance boundary, cost model, or infrastructure ownership requires a different provider"
          ],
          "alternatives": [
            {
              "nodeId": "web/providers/cloudflare-workers",
              "reason": "Cloudflare Workers is an alternative when its runtime and network platform better fit the application."
            }
          ],
          "sources": [
            {
              "title": "Next.js on Vercel",
              "url": "https://vercel.com/docs/frameworks/full-stack/nextjs",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Deploying Git repositories with Vercel",
              "url": "https://vercel.com/docs/git",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web",
          "description": "Vercel is a deployment provider in the Web branch."
        },
        {
          "type": "support",
          "target": "web/tools/nextjs",
          "description": "Vercel documents a first-party Next.js deployment path."
        },
        {
          "type": "alternatives",
          "target": "web/providers/cloudflare-workers",
          "description": "Cloudflare Workers is a provider alternative with a different runtime model."
        }
      ],
      "provider": {
        "officialUrl": "https://vercel.com/",
        "checkedAt": "2026-07-17",
        "liveCheckRequired": true,
        "capabilities": [
          {
            "key": "git-deployment",
            "label": "Git deployment",
            "category": "web deployment",
            "description": "Connected Git repositories can produce preview deployments from changes and production deployments from the configured production branch.",
            "status": "supported",
            "accepts": [
              "Git repository"
            ],
            "outputs": [
              "Preview deployment URL",
              "Production deployment URL"
            ],
            "source": {
              "title": "Deploying Git repositories with Vercel",
              "url": "https://vercel.com/docs/git",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          },
          {
            "key": "nextjs-deployment",
            "label": "Next.js deployment",
            "category": "framework hosting",
            "description": "Vercel documents an integrated deployment path for existing Next.js projects through Git or the Vercel CLI.",
            "status": "supported",
            "accepts": [
              "Next.js project",
              "Git repository"
            ],
            "outputs": [
              "Preview deployment URL",
              "Production deployment URL"
            ],
            "source": {
              "title": "Next.js on Vercel",
              "url": "https://vercel.com/docs/frameworks/full-stack/nextjs",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "knownConstraints": [
          {
            "statement": "Git deployment requires connecting a supported repository provider or using a separate CLI deployment path.",
            "source": {
              "title": "Deploying Git repositories with Vercel",
              "url": "https://vercel.com/docs/git",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "handoffs": [
          {
            "channel": "git-integration",
            "purpose": "Create preview or production deployments from a connected repository.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Deploying Git repositories with Vercel",
              "url": "https://vercel.com/docs/git",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          },
          {
            "channel": "cli",
            "purpose": "Deploy a local project through the authenticated Vercel CLI.",
            "authRequired": true,
            "externalEffect": true,
            "approvalRequired": true,
            "source": {
              "title": "Vercel deploy command",
              "url": "https://vercel.com/docs/cli/deploy",
              "publisher": "Vercel",
              "kind": "official-capability",
              "accessedAt": "2026-07-17"
            }
          }
        ],
        "unknowns": [
          {
            "field": "pricing",
            "statement": "Current plan pricing, included usage, and overage behavior must be checked live before selection."
          },
          {
            "field": "availability",
            "statement": "Account entitlements, runtime availability, and regional or compliance fit must be checked live."
          },
          {
            "field": "limits",
            "statement": "Build, function, bandwidth, and framework-feature limits are not persisted and require a live documentation check."
          }
        ]
      }
    },
    {
      "id": "web/tools/nextjs",
      "type": "tool",
      "domain": "web",
      "title": "Next.js",
      "summary": "A React framework with file-system routing, server and client component boundaries, multiple deployment modes, and an ecosystem suited to full-stack browser applications.",
      "tags": [
        "react",
        "framework",
        "routing",
        "server-components"
      ],
      "recommendations": [
        {
          "statement": "Use Next.js App Router as a productive candidate when a React application benefits from routing, server data, and framework-integrated rendering, then verify deployment-mode support.",
          "applicability": [
            "React is an accepted implementation constraint",
            "Routing or server-side application behavior is materially useful"
          ],
          "counterconditions": [
            "The outcome is intentionally client-only, non-React, or depends on features unsupported by the selected static or provider deployment mode"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/vite-react",
              "reason": "Vite with React provides a smaller client-oriented setup when Next.js server and routing conventions are unnecessary."
            }
          ],
          "sources": [
            {
              "title": "Next.js App Router",
              "url": "https://nextjs.org/docs/app",
              "publisher": "Next.js",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Deploying Next.js",
              "url": "https://nextjs.org/docs/app/getting-started/deploying",
              "publisher": "Next.js",
              "kind": "official-documentation",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Next.js is a framework option for browser applications."
        },
        {
          "type": "alternatives",
          "target": "web/tools/vite-react",
          "description": "Vite React is a client-oriented alternative when server framework features are unnecessary."
        },
        {
          "type": "compatibility",
          "target": "web/tools/shadcn-ui",
          "description": "shadcn/ui documents a supported Next.js installation path."
        }
      ],
      "tool": {
        "officialUrl": "https://nextjs.org/",
        "categories": [
          "framework",
          "react",
          "full-stack-web"
        ]
      }
    },
    {
      "id": "web/tools/react-three-fiber",
      "type": "tool",
      "domain": "web",
      "title": "React Three Fiber",
      "summary": "A React renderer for Three.js that expresses scene graphs as React components while retaining access to the underlying Three.js ecosystem and objects.",
      "tags": [
        "react",
        "threejs",
        "3d",
        "renderer"
      ],
      "recommendations": [
        {
          "statement": "Use React Three Fiber when React already owns the application and declarative scene composition is more valuable than a framework-neutral imperative scene lifecycle.",
          "applicability": [
            "The surrounding application is React-based",
            "Scene state and UI state benefit from one component composition model"
          ],
          "counterconditions": [
            "The scene is framework-neutral, highly imperative, or must avoid React runtime coupling"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/threejs",
              "reason": "Direct Three.js keeps the renderer independent of React and exposes the imperative lifecycle explicitly."
            }
          ],
          "sources": [
            {
              "title": "React Three Fiber introduction",
              "url": "https://r3f.docs.pmnd.rs/getting-started/introduction",
              "publisher": "pmndrs",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/outcomes/3d-experiences",
          "description": "React Three Fiber is a renderer option for React-based 3D experiences."
        },
        {
          "type": "alternatives",
          "target": "web/tools/threejs",
          "description": "Direct Three.js is the framework-neutral renderer alternative."
        },
        {
          "type": "compatibility",
          "target": "web/tools/nextjs",
          "description": "React Three Fiber can be composed in client-side React boundaries within Next.js."
        }
      ],
      "tool": {
        "officialUrl": "https://r3f.docs.pmnd.rs/",
        "categories": [
          "renderer",
          "react",
          "3d"
        ]
      }
    },
    {
      "id": "web/tools/shadcn-ui",
      "type": "tool",
      "domain": "web",
      "title": "shadcn/ui",
      "summary": "An open-code React component distribution model whose CLI adds component source into the application, making customization productive while leaving maintenance with the project.",
      "tags": [
        "ui",
        "components",
        "tailwind",
        "open-code"
      ],
      "recommendations": [
        {
          "statement": "Use shadcn/ui to accelerate React interface composition when Tailwind and local ownership of component source are acceptable maintenance choices.",
          "applicability": [
            "The application uses React and a compatible Tailwind setup",
            "Owning and customizing component source is preferred over consuming a sealed library"
          ],
          "counterconditions": [
            "The team rejects Tailwind, does not want local component maintenance, or requires a centrally versioned design-system package"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/vite-react",
              "reason": "A custom component layer in a Vite React application avoids adopting shadcn/ui's Tailwind and local-source model."
            }
          ],
          "sources": [
            {
              "title": "shadcn/ui documentation",
              "url": "https://ui.shadcn.com/docs",
              "publisher": "shadcn/ui",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Base UI is now the default",
              "url": "https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default",
              "publisher": "shadcn/ui",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 30
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "shadcn/ui is an interface composition option for React browser applications."
        },
        {
          "type": "compatibility",
          "target": "web/tools/nextjs",
          "description": "The project documents adding its components to Next.js applications."
        },
        {
          "type": "relevance",
          "target": "web/outcomes/dashboards",
          "description": "Its source-owned primitives can accelerate common dashboard interfaces."
        }
      ],
      "tool": {
        "officialUrl": "https://ui.shadcn.com/",
        "categories": [
          "ui-components",
          "react",
          "tailwind"
        ]
      }
    },
    {
      "id": "web/tools/threejs",
      "type": "tool",
      "domain": "web",
      "title": "Three.js",
      "summary": "A JavaScript 3D engine exposing scenes, cameras, renderers, geometry, materials, loaders, animation, and controls for browser graphics applications.",
      "tags": [
        "threejs",
        "webgl",
        "3d",
        "renderer"
      ],
      "recommendations": [
        {
          "statement": "Use Three.js directly when the project benefits from explicit scene lifecycle and renderer control without coupling scene composition to React.",
          "applicability": [
            "The outcome needs interactive browser 3D",
            "Direct imperative control of scene objects and render lifecycle fits the architecture"
          ],
          "counterconditions": [
            "A React-led application would benefit from declarative scene composition and React lifecycle integration"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/react-three-fiber",
              "reason": "React Three Fiber is a maintained React renderer for Three.js when React composition is the desired abstraction."
            }
          ],
          "sources": [
            {
              "title": "Three.js fundamentals",
              "url": "https://threejs.org/manual/en/fundamentals.html",
              "publisher": "Three.js",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "high",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/outcomes/3d-experiences",
          "description": "Three.js is a renderer tool for browser 3D experiences."
        },
        {
          "type": "alternatives",
          "target": "web/tools/react-three-fiber",
          "description": "React Three Fiber supplies a React renderer over Three.js."
        },
        {
          "type": "compatibility",
          "target": "web/tools/vite-react",
          "description": "Three.js can be bundled into a Vite browser project."
        }
      ],
      "tool": {
        "officialUrl": "https://threejs.org/",
        "categories": [
          "renderer",
          "3d",
          "webgl"
        ]
      }
    },
    {
      "id": "web/tools/vite-react",
      "type": "tool",
      "domain": "web",
      "title": "Vite with React",
      "summary": "A client-oriented React development and build setup that keeps framework policy light while providing a fast development server and production asset build.",
      "tags": [
        "react",
        "vite",
        "client-only",
        "build-tool"
      ],
      "recommendations": [
        {
          "statement": "Prefer a Vite React setup when the product is intentionally client-rendered and the team wants to choose routing and server services independently.",
          "applicability": [
            "The browser application does not require integrated server rendering",
            "A lightweight client build with independently selected services is desirable"
          ],
          "counterconditions": [
            "The route needs framework-integrated server data, server rendering, or file-system routing conventions"
          ],
          "alternatives": [
            {
              "nodeId": "web/tools/nextjs",
              "reason": "Next.js is the stronger candidate when integrated routing and server execution reduce overall system work."
            }
          ],
          "sources": [
            {
              "title": "Sunsetting Create React App",
              "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app",
              "publisher": "React",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            },
            {
              "title": "Vite guide",
              "url": "https://vite.dev/guide/",
              "publisher": "Vite",
              "kind": "official-project-docs",
              "accessedAt": "2026-07-17"
            }
          ],
          "contributors": [
            {
              "id": "possible-foundation",
              "name": "Possible founding contributors"
            }
          ],
          "reviewedAt": "2026-07-17",
          "confidence": "medium",
          "reviewIntervalDays": 60
        }
      ],
      "relationships": [
        {
          "type": "hierarchy",
          "target": "web/browser-applications",
          "description": "Vite React is a tooling option for client-oriented browser applications."
        },
        {
          "type": "alternatives",
          "target": "web/tools/nextjs",
          "description": "Next.js is an integrated framework alternative for server-aware React applications."
        },
        {
          "type": "compatibility",
          "target": "web/tools/react-three-fiber",
          "description": "React Three Fiber can run inside a Vite React application."
        }
      ],
      "tool": {
        "officialUrl": "https://vite.dev/",
        "categories": [
          "framework",
          "react",
          "client-web"
        ]
      }
    }
  ],
  "edges": [
    {
      "id": "manufacturing::relevance::web",
      "source": "manufacturing",
      "target": "web",
      "type": "relevance",
      "description": "Web interfaces often initiate or monitor custom-part workflows."
    },
    {
      "id": "manufacturing/actions/request-protolabs-quote::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/actions/request-protolabs-quote",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "A quote request is an external custom-part handoff action."
    },
    {
      "id": "manufacturing/actions/request-protolabs-quote::invocation::manufacturing/providers/protolabs",
      "source": "manufacturing/actions/request-protolabs-quote",
      "target": "manufacturing/providers/protolabs",
      "type": "invocation",
      "description": "The action invokes Protolabs' approved web quote flow."
    },
    {
      "id": "manufacturing/actions/request-protolabs-quote::relevance::manufacturing/practices/inspection-plan",
      "source": "manufacturing/actions/request-protolabs-quote",
      "target": "manufacturing/practices/inspection-plan",
      "type": "relevance",
      "description": "Inspection requirements must be selected and confirmed during quote review."
    },
    {
      "id": "manufacturing/actions/request-sendcutsend-quote::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/actions/request-sendcutsend-quote",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "A quote request is an external custom-part handoff action."
    },
    {
      "id": "manufacturing/actions/request-sendcutsend-quote::invocation::manufacturing/providers/sendcutsend",
      "source": "manufacturing/actions/request-sendcutsend-quote",
      "target": "manufacturing/providers/sendcutsend",
      "type": "invocation",
      "description": "The action uploads the approved package into SendCutSend's web quote flow."
    },
    {
      "id": "manufacturing/actions/request-sendcutsend-quote::relevance::manufacturing/practices/manufacturing-package",
      "source": "manufacturing/actions/request-sendcutsend-quote",
      "target": "manufacturing/practices/manufacturing-package",
      "type": "relevance",
      "description": "The approved revisioned package is the handoff input."
    },
    {
      "id": "manufacturing/actions/request-xometry-quote::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/actions/request-xometry-quote",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "A quote request is an external custom-part handoff action."
    },
    {
      "id": "manufacturing/actions/request-xometry-quote::invocation::manufacturing/providers/xometry",
      "source": "manufacturing/actions/request-xometry-quote",
      "target": "manufacturing/providers/xometry",
      "type": "invocation",
      "description": "The action invokes Xometry's approved web quote flow."
    },
    {
      "id": "manufacturing/actions/request-xometry-quote::relevance::manufacturing/practices/manufacturing-package",
      "source": "manufacturing/actions/request-xometry-quote",
      "target": "manufacturing/practices/manufacturing-package",
      "type": "relevance",
      "description": "The package revision anchors quote and supplier assumptions."
    },
    {
      "id": "manufacturing/custom-parts::hierarchy::manufacturing",
      "source": "manufacturing/custom-parts",
      "target": "manufacturing",
      "type": "hierarchy",
      "description": "Custom parts are a primary branch of manufacturing knowledge."
    },
    {
      "id": "manufacturing/custom-parts::relevance::manufacturing/practices/process-selection",
      "source": "manufacturing/custom-parts",
      "target": "manufacturing/practices/process-selection",
      "type": "relevance",
      "description": "Part requirements must be mapped to a viable manufacturing process."
    },
    {
      "id": "manufacturing/outcomes/motor-brackets::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/outcomes/motor-brackets",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Motor brackets are a constrained custom-part outcome."
    },
    {
      "id": "manufacturing/outcomes/motor-brackets::relevance::manufacturing/practices/parametric-cad",
      "source": "manufacturing/outcomes/motor-brackets",
      "target": "manufacturing/practices/parametric-cad",
      "type": "relevance",
      "description": "Parametric interfaces make bracket variants and revisions reproducible."
    },
    {
      "id": "manufacturing/outcomes/motor-brackets::relevance::manufacturing/tools/mujoco",
      "source": "manufacturing/outcomes/motor-brackets",
      "target": "manufacturing/tools/mujoco",
      "type": "relevance",
      "description": "Robot mechanism simulations can expose motion and load assumptions before fabrication."
    },
    {
      "id": "manufacturing/outcomes/robot-arms::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/outcomes/robot-arms",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Robotic arms compose multiple custom parts and purchased components."
    },
    {
      "id": "manufacturing/outcomes/robot-arms::relevance::manufacturing/outcomes/motor-brackets",
      "source": "manufacturing/outcomes/robot-arms",
      "target": "manufacturing/outcomes/motor-brackets",
      "type": "relevance",
      "description": "Motor mounting interfaces are reusable subproblems within a robotic arm."
    },
    {
      "id": "manufacturing/outcomes/robot-arms::relevance::manufacturing/practices/parametric-cad",
      "source": "manufacturing/outcomes/robot-arms",
      "target": "manufacturing/practices/parametric-cad",
      "type": "relevance",
      "description": "Parametric CAD preserves interfaces and design variants across the mechanism."
    },
    {
      "id": "manufacturing/outcomes/robot-arms::relevance::manufacturing/tools/mujoco",
      "source": "manufacturing/outcomes/robot-arms",
      "target": "manufacturing/tools/mujoco",
      "type": "relevance",
      "description": "MuJoCo can test articulated dynamics and control assumptions before fabrication."
    },
    {
      "id": "manufacturing/practices/dfm-preflight::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/dfm-preflight",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "DFM preflight protects the custom-part handoff."
    },
    {
      "id": "manufacturing/practices/dfm-preflight::relevance::manufacturing/practices/process-selection",
      "source": "manufacturing/practices/dfm-preflight",
      "target": "manufacturing/practices/process-selection",
      "type": "relevance",
      "description": "Preflight criteria depend on the selected manufacturing process."
    },
    {
      "id": "manufacturing/practices/inspection-plan::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/inspection-plan",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Inspection planning defines evidence for custom-part acceptance."
    },
    {
      "id": "manufacturing/practices/inspection-plan::relevance::manufacturing/providers/protolabs",
      "source": "manufacturing/practices/inspection-plan",
      "target": "manufacturing/providers/protolabs",
      "type": "relevance",
      "description": "Provider-specific inspection options require a live capability check."
    },
    {
      "id": "manufacturing/practices/manufacturing-drawing::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/manufacturing-drawing",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Drawings supplement geometry in custom-part packages."
    },
    {
      "id": "manufacturing/practices/manufacturing-drawing::relevance::manufacturing/practices/tolerance-contract",
      "source": "manufacturing/practices/manufacturing-drawing",
      "target": "manufacturing/practices/tolerance-contract",
      "type": "relevance",
      "description": "Feature tolerances and datums are communicated through the drawing."
    },
    {
      "id": "manufacturing/practices/manufacturing-drawing::relevance::manufacturing/tools/step",
      "source": "manufacturing/practices/manufacturing-drawing",
      "target": "manufacturing/tools/step",
      "type": "relevance",
      "description": "A manufacturing drawing commonly accompanies a neutral solid model."
    },
    {
      "id": "manufacturing/practices/manufacturing-package::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/manufacturing-package",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "The package is the controlled custom-part handoff artifact."
    },
    {
      "id": "manufacturing/practices/manufacturing-package::relevance::manufacturing/practices/inspection-plan",
      "source": "manufacturing/practices/manufacturing-package",
      "target": "manufacturing/practices/inspection-plan",
      "type": "relevance",
      "description": "The inspection plan belongs in the provider handoff package."
    },
    {
      "id": "manufacturing/practices/manufacturing-package::relevance::manufacturing/practices/manufacturing-drawing",
      "source": "manufacturing/practices/manufacturing-package",
      "target": "manufacturing/practices/manufacturing-drawing",
      "type": "relevance",
      "description": "The revision-matched drawing belongs in the package when required."
    },
    {
      "id": "manufacturing/practices/parametric-cad::compatibility::manufacturing/tools/cadquery",
      "source": "manufacturing/practices/parametric-cad",
      "target": "manufacturing/tools/cadquery",
      "type": "compatibility",
      "description": "CadQuery supports script-authored parametric solid models and exports."
    },
    {
      "id": "manufacturing/practices/parametric-cad::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/parametric-cad",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Parametric modeling preserves controlled custom-part intent."
    },
    {
      "id": "manufacturing/practices/parametric-cad::relevance::manufacturing/tools/step",
      "source": "manufacturing/practices/parametric-cad",
      "target": "manufacturing/tools/step",
      "type": "relevance",
      "description": "STEP is a revisioned exchange artifact derived from the parametric master."
    },
    {
      "id": "manufacturing/practices/process-selection::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/process-selection",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Process selection is an early custom-part practice."
    },
    {
      "id": "manufacturing/practices/process-selection::relevance::manufacturing/processes/cnc-machining",
      "source": "manufacturing/practices/process-selection",
      "target": "manufacturing/processes/cnc-machining",
      "type": "relevance",
      "description": "CNC machining is one process family evaluated against the requirements."
    },
    {
      "id": "manufacturing/practices/process-selection::relevance::manufacturing/processes/fdm",
      "source": "manufacturing/practices/process-selection",
      "target": "manufacturing/processes/fdm",
      "type": "relevance",
      "description": "FDM is one additive process family evaluated against the requirements."
    },
    {
      "id": "manufacturing/practices/tolerance-contract::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/practices/tolerance-contract",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Tolerance contracts define custom-part acceptance boundaries."
    },
    {
      "id": "manufacturing/practices/tolerance-contract::relevance::manufacturing/practices/inspection-plan",
      "source": "manufacturing/practices/tolerance-contract",
      "target": "manufacturing/practices/inspection-plan",
      "type": "relevance",
      "description": "Specified tolerances need an achievable inspection method."
    },
    {
      "id": "manufacturing/processes/cnc-machining::alternatives::manufacturing/processes/laser-sheet-cutting",
      "source": "manufacturing/processes/cnc-machining",
      "target": "manufacturing/processes/laser-sheet-cutting",
      "type": "alternatives",
      "description": "Sheet cutting is an alternative for planar constant-thickness geometry."
    },
    {
      "id": "manufacturing/processes/cnc-machining::compatibility::manufacturing/tools/step",
      "source": "manufacturing/processes/cnc-machining",
      "target": "manufacturing/tools/step",
      "type": "compatibility",
      "description": "STEP solid geometry is a common neutral CNC quote and handoff artifact."
    },
    {
      "id": "manufacturing/processes/cnc-machining::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/processes/cnc-machining",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "CNC machining is one process option for custom parts."
    },
    {
      "id": "manufacturing/processes/fdm::alternatives::manufacturing/processes/sls",
      "source": "manufacturing/processes/fdm",
      "target": "manufacturing/processes/sls",
      "type": "alternatives",
      "description": "SLS is an additive alternative with different material and support behavior."
    },
    {
      "id": "manufacturing/processes/fdm::compatibility::manufacturing/tools/stl",
      "source": "manufacturing/processes/fdm",
      "target": "manufacturing/tools/stl",
      "type": "compatibility",
      "description": "STL is a common triangulated handoff when the selected FDM workflow accepts it."
    },
    {
      "id": "manufacturing/processes/fdm::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/processes/fdm",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "FDM is one process option for custom parts."
    },
    {
      "id": "manufacturing/processes/laser-sheet-cutting::alternatives::manufacturing/processes/cnc-machining",
      "source": "manufacturing/processes/laser-sheet-cutting",
      "target": "manufacturing/processes/cnc-machining",
      "type": "alternatives",
      "description": "CNC machining is an alternative for non-planar solid geometry."
    },
    {
      "id": "manufacturing/processes/laser-sheet-cutting::compatibility::manufacturing/tools/dxf",
      "source": "manufacturing/processes/laser-sheet-cutting",
      "target": "manufacturing/tools/dxf",
      "type": "compatibility",
      "description": "DXF is a common 1:1 profile artifact for 2D cutting workflows."
    },
    {
      "id": "manufacturing/processes/laser-sheet-cutting::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/processes/laser-sheet-cutting",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Sheet cutting is one process option for custom parts."
    },
    {
      "id": "manufacturing/processes/sls::alternatives::manufacturing/processes/fdm",
      "source": "manufacturing/processes/sls",
      "target": "manufacturing/processes/fdm",
      "type": "alternatives",
      "description": "FDM is an additive alternative for inexpensive concepts and fit checks."
    },
    {
      "id": "manufacturing/processes/sls::compatibility::manufacturing/tools/3mf",
      "source": "manufacturing/processes/sls",
      "target": "manufacturing/tools/3mf",
      "type": "compatibility",
      "description": "3MF can carry additive model units and metadata when the selected workflow accepts it."
    },
    {
      "id": "manufacturing/processes/sls::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/processes/sls",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "SLS is one process option for custom parts."
    },
    {
      "id": "manufacturing/providers/fictiv::alternatives::manufacturing/providers/xometry",
      "source": "manufacturing/providers/fictiv",
      "target": "manufacturing/providers/xometry",
      "type": "alternatives",
      "description": "Xometry is an alternative manufacturing network."
    },
    {
      "id": "manufacturing/providers/fictiv::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/providers/fictiv",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Fictiv is a provider candidate for multiple custom-part processes."
    },
    {
      "id": "manufacturing/providers/fictiv::support::manufacturing/practices/manufacturing-drawing",
      "source": "manufacturing/providers/fictiv",
      "target": "manufacturing/practices/manufacturing-drawing",
      "type": "support",
      "description": "Fictiv documents attaching drawings to communicate manufacturing requirements."
    },
    {
      "id": "manufacturing/providers/protolabs::alternatives::manufacturing/providers/xometry",
      "source": "manufacturing/providers/protolabs",
      "target": "manufacturing/providers/xometry",
      "type": "alternatives",
      "description": "Xometry is an alternative broad manufacturing provider network."
    },
    {
      "id": "manufacturing/providers/protolabs::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/providers/protolabs",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Protolabs is a provider candidate for multiple custom-part processes."
    },
    {
      "id": "manufacturing/providers/protolabs::support::manufacturing/processes/cnc-machining",
      "source": "manufacturing/providers/protolabs",
      "target": "manufacturing/processes/cnc-machining",
      "type": "support",
      "description": "Protolabs documents CNC machining among its services."
    },
    {
      "id": "manufacturing/providers/protolabs::support::manufacturing/tools/step",
      "source": "manufacturing/providers/protolabs",
      "target": "manufacturing/tools/step",
      "type": "support",
      "description": "Official file guidance lists STEP among accepted solid model formats."
    },
    {
      "id": "manufacturing/providers/sculpteo::alternatives::manufacturing/providers/protolabs",
      "source": "manufacturing/providers/sculpteo",
      "target": "manufacturing/providers/protolabs",
      "type": "alternatives",
      "description": "Protolabs is an alternative provider with additive services."
    },
    {
      "id": "manufacturing/providers/sculpteo::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/providers/sculpteo",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Sculpteo is a provider candidate for additive custom-part processes."
    },
    {
      "id": "manufacturing/providers/sculpteo::support::manufacturing/processes/sls",
      "source": "manufacturing/providers/sculpteo",
      "target": "manufacturing/processes/sls",
      "type": "support",
      "description": "Sculpteo documents professional additive manufacturing services including powder-bed options."
    },
    {
      "id": "manufacturing/providers/sendcutsend::alternatives::manufacturing/providers/protolabs",
      "source": "manufacturing/providers/sendcutsend",
      "target": "manufacturing/providers/protolabs",
      "type": "alternatives",
      "description": "Protolabs offers a different documented process and file mix."
    },
    {
      "id": "manufacturing/providers/sendcutsend::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/providers/sendcutsend",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "SendCutSend is a provider candidate for selected custom-part processes."
    },
    {
      "id": "manufacturing/providers/sendcutsend::support::manufacturing/tools/dxf",
      "source": "manufacturing/providers/sendcutsend",
      "target": "manufacturing/tools/dxf",
      "type": "support",
      "description": "Official setup guidance lists DXF among accepted 2D vector inputs."
    },
    {
      "id": "manufacturing/providers/sendcutsend::support::manufacturing/tools/step",
      "source": "manufacturing/providers/sendcutsend",
      "target": "manufacturing/tools/step",
      "type": "support",
      "description": "Official setup guidance lists STEP and STP among accepted 3D inputs."
    },
    {
      "id": "manufacturing/providers/xometry::alternatives::manufacturing/providers/fictiv",
      "source": "manufacturing/providers/xometry",
      "target": "manufacturing/providers/fictiv",
      "type": "alternatives",
      "description": "Fictiv is an alternative manufacturing network."
    },
    {
      "id": "manufacturing/providers/xometry::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/providers/xometry",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "Xometry is a provider candidate for multiple custom-part processes."
    },
    {
      "id": "manufacturing/providers/xometry::support::manufacturing/processes/cnc-machining",
      "source": "manufacturing/providers/xometry",
      "target": "manufacturing/processes/cnc-machining",
      "type": "support",
      "description": "Xometry documents CNC machining among its capability catalog."
    },
    {
      "id": "manufacturing/providers/xometry::support::manufacturing/tools/step",
      "source": "manufacturing/providers/xometry",
      "target": "manufacturing/tools/step",
      "type": "support",
      "description": "Official format guidance includes STEP for supported process paths."
    },
    {
      "id": "manufacturing/tools/3mf::alternatives::manufacturing/tools/stl",
      "source": "manufacturing/tools/3mf",
      "target": "manufacturing/tools/stl",
      "type": "alternatives",
      "description": "STL is a simpler triangulated mesh alternative."
    },
    {
      "id": "manufacturing/tools/3mf::compatibility::manufacturing/processes/sls",
      "source": "manufacturing/tools/3mf",
      "target": "manufacturing/processes/sls",
      "type": "compatibility",
      "description": "3MF can serve additive workflows when the selected SLS provider accepts it."
    },
    {
      "id": "manufacturing/tools/3mf::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/tools/3mf",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "3MF is an additive manufacturing artifact option."
    },
    {
      "id": "manufacturing/tools/cadquery::alternatives::manufacturing/tools/freecad",
      "source": "manufacturing/tools/cadquery",
      "target": "manufacturing/tools/freecad",
      "type": "alternatives",
      "description": "FreeCAD is a GUI-native parametric modeling alternative."
    },
    {
      "id": "manufacturing/tools/cadquery::compatibility::manufacturing/tools/step",
      "source": "manufacturing/tools/cadquery",
      "target": "manufacturing/tools/step",
      "type": "compatibility",
      "description": "CadQuery documents STEP export for downstream exchange."
    },
    {
      "id": "manufacturing/tools/cadquery::hierarchy::manufacturing/practices/parametric-cad",
      "source": "manufacturing/tools/cadquery",
      "target": "manufacturing/practices/parametric-cad",
      "type": "hierarchy",
      "description": "CadQuery is one implementation tool for a parametric CAD master."
    },
    {
      "id": "manufacturing/tools/dxf::alternatives::manufacturing/tools/step",
      "source": "manufacturing/tools/dxf",
      "target": "manufacturing/tools/step",
      "type": "alternatives",
      "description": "STEP is a solid-model alternative for 3D process handoff."
    },
    {
      "id": "manufacturing/tools/dxf::compatibility::manufacturing/processes/laser-sheet-cutting",
      "source": "manufacturing/tools/dxf",
      "target": "manufacturing/processes/laser-sheet-cutting",
      "type": "compatibility",
      "description": "DXF is commonly accepted for planar sheet cutting profiles."
    },
    {
      "id": "manufacturing/tools/dxf::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/tools/dxf",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "DXF is a profile artifact for selected custom-part processes."
    },
    {
      "id": "manufacturing/tools/freecad::alternatives::manufacturing/tools/cadquery",
      "source": "manufacturing/tools/freecad",
      "target": "manufacturing/tools/cadquery",
      "type": "alternatives",
      "description": "CadQuery is a script-authored parametric modeling alternative."
    },
    {
      "id": "manufacturing/tools/freecad::compatibility::manufacturing/tools/step",
      "source": "manufacturing/tools/freecad",
      "target": "manufacturing/tools/step",
      "type": "compatibility",
      "description": "FreeCAD supports solid geometry export for neutral exchange workflows."
    },
    {
      "id": "manufacturing/tools/freecad::hierarchy::manufacturing/practices/parametric-cad",
      "source": "manufacturing/tools/freecad",
      "target": "manufacturing/practices/parametric-cad",
      "type": "hierarchy",
      "description": "FreeCAD is one implementation tool for a parametric CAD master."
    },
    {
      "id": "manufacturing/tools/mujoco::alternatives::manufacturing/practices/inspection-plan",
      "source": "manufacturing/tools/mujoco",
      "target": "manufacturing/practices/inspection-plan",
      "type": "alternatives",
      "description": "Physical inspection supplies evidence that simulation cannot establish."
    },
    {
      "id": "manufacturing/tools/mujoco::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/tools/mujoco",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "MuJoCo supports robot-related custom-part reasoning before fabrication."
    },
    {
      "id": "manufacturing/tools/mujoco::relevance::manufacturing/outcomes/motor-brackets",
      "source": "manufacturing/tools/mujoco",
      "target": "manufacturing/outcomes/motor-brackets",
      "type": "relevance",
      "description": "Motor bracket interfaces may participate in an articulated mechanism model."
    },
    {
      "id": "manufacturing/tools/step::alternatives::manufacturing/tools/stl",
      "source": "manufacturing/tools/step",
      "target": "manufacturing/tools/stl",
      "type": "alternatives",
      "description": "STL is a triangulated mesh alternative for selected additive workflows."
    },
    {
      "id": "manufacturing/tools/step::compatibility::manufacturing/processes/cnc-machining",
      "source": "manufacturing/tools/step",
      "target": "manufacturing/processes/cnc-machining",
      "type": "compatibility",
      "description": "Many CNC quote workflows accept STEP solid models."
    },
    {
      "id": "manufacturing/tools/step::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/tools/step",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "STEP is a common neutral solid artifact in custom-part workflows."
    },
    {
      "id": "manufacturing/tools/stl::alternatives::manufacturing/tools/3mf",
      "source": "manufacturing/tools/stl",
      "target": "manufacturing/tools/3mf",
      "type": "alternatives",
      "description": "3MF is a richer additive mesh container alternative."
    },
    {
      "id": "manufacturing/tools/stl::compatibility::manufacturing/processes/fdm",
      "source": "manufacturing/tools/stl",
      "target": "manufacturing/processes/fdm",
      "type": "compatibility",
      "description": "FDM slicer workflows commonly consume triangulated mesh artifacts."
    },
    {
      "id": "manufacturing/tools/stl::hierarchy::manufacturing/custom-parts",
      "source": "manufacturing/tools/stl",
      "target": "manufacturing/custom-parts",
      "type": "hierarchy",
      "description": "STL is a mesh artifact for selected custom-part workflows."
    },
    {
      "id": "web::relevance::manufacturing/custom-parts",
      "source": "web",
      "target": "manufacturing/custom-parts",
      "type": "relevance",
      "description": "Some web outcomes configure, quote, or monitor custom physical parts."
    },
    {
      "id": "web/actions/deploy-cloudflare-preview::hierarchy::web",
      "source": "web/actions/deploy-cloudflare-preview",
      "target": "web",
      "type": "hierarchy",
      "description": "Preview deployment is an external Web delivery action."
    },
    {
      "id": "web/actions/deploy-cloudflare-preview::invocation::web/providers/cloudflare-workers",
      "source": "web/actions/deploy-cloudflare-preview",
      "target": "web/providers/cloudflare-workers",
      "type": "invocation",
      "description": "The action invokes the authenticated Cloudflare deployment path."
    },
    {
      "id": "web/actions/deploy-cloudflare-preview::relevance::web/practices/production-verification",
      "source": "web/actions/deploy-cloudflare-preview",
      "target": "web/practices/production-verification",
      "type": "relevance",
      "description": "The resulting preview supports runtime and browser-flow checks."
    },
    {
      "id": "web/actions/deploy-vercel-preview::hierarchy::web",
      "source": "web/actions/deploy-vercel-preview",
      "target": "web",
      "type": "hierarchy",
      "description": "Preview deployment is an external Web delivery action."
    },
    {
      "id": "web/actions/deploy-vercel-preview::invocation::web/providers/vercel",
      "source": "web/actions/deploy-vercel-preview",
      "target": "web/providers/vercel",
      "type": "invocation",
      "description": "The action hands source or a Git revision to Vercel."
    },
    {
      "id": "web/actions/deploy-vercel-preview::relevance::web/practices/production-verification",
      "source": "web/actions/deploy-vercel-preview",
      "target": "web/practices/production-verification",
      "type": "relevance",
      "description": "The resulting preview is the environment for production-oriented checks."
    },
    {
      "id": "web/actions/promote-vercel-production::hierarchy::web/actions/deploy-vercel-preview",
      "source": "web/actions/promote-vercel-production",
      "target": "web/actions/deploy-vercel-preview",
      "type": "hierarchy",
      "description": "Production promotion follows a separately verified preview route."
    },
    {
      "id": "web/actions/promote-vercel-production::invocation::web/providers/vercel",
      "source": "web/actions/promote-vercel-production",
      "target": "web/providers/vercel",
      "type": "invocation",
      "description": "The action changes external Vercel production deployment state."
    },
    {
      "id": "web/actions/promote-vercel-production::relevance::web/practices/production-verification",
      "source": "web/actions/promote-vercel-production",
      "target": "web/practices/production-verification",
      "type": "relevance",
      "description": "Promotion requires the production verification receipt."
    },
    {
      "id": "web/browser-applications::hierarchy::web",
      "source": "web/browser-applications",
      "target": "web",
      "type": "hierarchy",
      "description": "Browser applications are one operational branch within Web."
    },
    {
      "id": "web/browser-applications::relevance::web/practices/framework-selection",
      "source": "web/browser-applications",
      "target": "web/practices/framework-selection",
      "type": "relevance",
      "description": "Application constraints determine whether a framework is productive."
    },
    {
      "id": "web/outcomes/3d-experiences::hierarchy::web/browser-applications",
      "source": "web/outcomes/3d-experiences",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Interactive 3D experiences are browser applications with renderer-specific constraints."
    },
    {
      "id": "web/outcomes/3d-experiences::relevance::web/practices/renderer-selection",
      "source": "web/outcomes/3d-experiences",
      "target": "web/practices/renderer-selection",
      "type": "relevance",
      "description": "Renderer selection follows scene, framework, and performance constraints."
    },
    {
      "id": "web/outcomes/dashboards::hierarchy::web/browser-applications",
      "source": "web/outcomes/dashboards",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Dashboards are data-oriented browser applications."
    },
    {
      "id": "web/outcomes/dashboards::relevance::web/tools/nextjs",
      "source": "web/outcomes/dashboards",
      "target": "web/tools/nextjs",
      "type": "relevance",
      "description": "Next.js is a conditional framework candidate for routed data-heavy dashboards."
    },
    {
      "id": "web/outcomes/dashboards::relevance::web/tools/shadcn-ui",
      "source": "web/outcomes/dashboards",
      "target": "web/tools/shadcn-ui",
      "type": "relevance",
      "description": "shadcn/ui is a conditional composition candidate for dashboard primitives."
    },
    {
      "id": "web/practices/3d-runtime-verification::compatibility::web/tools/threejs",
      "source": "web/practices/3d-runtime-verification",
      "target": "web/tools/threejs",
      "type": "compatibility",
      "description": "The verifier targets behavior produced through Three.js rendering pipelines."
    },
    {
      "id": "web/practices/3d-runtime-verification::hierarchy::web/outcomes/3d-experiences",
      "source": "web/practices/3d-runtime-verification",
      "target": "web/outcomes/3d-experiences",
      "type": "hierarchy",
      "description": "Renderer-specific verification belongs to the 3D outcome branch."
    },
    {
      "id": "web/practices/framework-selection::hierarchy::web/browser-applications",
      "source": "web/practices/framework-selection",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Framework selection is an architecture practice for browser applications."
    },
    {
      "id": "web/practices/framework-selection::relevance::web/tools/nextjs",
      "source": "web/practices/framework-selection",
      "target": "web/tools/nextjs",
      "type": "relevance",
      "description": "Next.js is one framework candidate evaluated by this practice."
    },
    {
      "id": "web/practices/production-verification::hierarchy::web/browser-applications",
      "source": "web/practices/production-verification",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Production verification applies to browser application delivery."
    },
    {
      "id": "web/practices/production-verification::relevance::web/actions/deploy-vercel-preview",
      "source": "web/practices/production-verification",
      "target": "web/actions/deploy-vercel-preview",
      "type": "relevance",
      "description": "A preview deployment provides an environment for verification before production."
    },
    {
      "id": "web/practices/renderer-selection::hierarchy::web/outcomes/3d-experiences",
      "source": "web/practices/renderer-selection",
      "target": "web/outcomes/3d-experiences",
      "type": "hierarchy",
      "description": "Renderer selection is a defining practice for browser 3D outcomes."
    },
    {
      "id": "web/practices/renderer-selection::relevance::web/tools/threejs",
      "source": "web/practices/renderer-selection",
      "target": "web/tools/threejs",
      "type": "relevance",
      "description": "Three.js provides the baseline rendering primitives considered here."
    },
    {
      "id": "web/providers/cloudflare-workers::alternatives::web/providers/vercel",
      "source": "web/providers/cloudflare-workers",
      "target": "web/providers/vercel",
      "type": "alternatives",
      "description": "Vercel is a provider alternative with a different runtime and integration model."
    },
    {
      "id": "web/providers/cloudflare-workers::hierarchy::web",
      "source": "web/providers/cloudflare-workers",
      "target": "web",
      "type": "hierarchy",
      "description": "Cloudflare Workers is a deployment provider in the Web branch."
    },
    {
      "id": "web/providers/cloudflare-workers::support::web/tools/nextjs",
      "source": "web/providers/cloudflare-workers",
      "target": "web/tools/nextjs",
      "type": "support",
      "description": "Cloudflare documents a Next.js deployment path through the OpenNext adapter."
    },
    {
      "id": "web/providers/vercel::alternatives::web/providers/cloudflare-workers",
      "source": "web/providers/vercel",
      "target": "web/providers/cloudflare-workers",
      "type": "alternatives",
      "description": "Cloudflare Workers is a provider alternative with a different runtime model."
    },
    {
      "id": "web/providers/vercel::hierarchy::web",
      "source": "web/providers/vercel",
      "target": "web",
      "type": "hierarchy",
      "description": "Vercel is a deployment provider in the Web branch."
    },
    {
      "id": "web/providers/vercel::support::web/tools/nextjs",
      "source": "web/providers/vercel",
      "target": "web/tools/nextjs",
      "type": "support",
      "description": "Vercel documents a first-party Next.js deployment path."
    },
    {
      "id": "web/tools/nextjs::alternatives::web/tools/vite-react",
      "source": "web/tools/nextjs",
      "target": "web/tools/vite-react",
      "type": "alternatives",
      "description": "Vite React is a client-oriented alternative when server framework features are unnecessary."
    },
    {
      "id": "web/tools/nextjs::compatibility::web/tools/shadcn-ui",
      "source": "web/tools/nextjs",
      "target": "web/tools/shadcn-ui",
      "type": "compatibility",
      "description": "shadcn/ui documents a supported Next.js installation path."
    },
    {
      "id": "web/tools/nextjs::hierarchy::web/browser-applications",
      "source": "web/tools/nextjs",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Next.js is a framework option for browser applications."
    },
    {
      "id": "web/tools/react-three-fiber::alternatives::web/tools/threejs",
      "source": "web/tools/react-three-fiber",
      "target": "web/tools/threejs",
      "type": "alternatives",
      "description": "Direct Three.js is the framework-neutral renderer alternative."
    },
    {
      "id": "web/tools/react-three-fiber::compatibility::web/tools/nextjs",
      "source": "web/tools/react-three-fiber",
      "target": "web/tools/nextjs",
      "type": "compatibility",
      "description": "React Three Fiber can be composed in client-side React boundaries within Next.js."
    },
    {
      "id": "web/tools/react-three-fiber::hierarchy::web/outcomes/3d-experiences",
      "source": "web/tools/react-three-fiber",
      "target": "web/outcomes/3d-experiences",
      "type": "hierarchy",
      "description": "React Three Fiber is a renderer option for React-based 3D experiences."
    },
    {
      "id": "web/tools/shadcn-ui::compatibility::web/tools/nextjs",
      "source": "web/tools/shadcn-ui",
      "target": "web/tools/nextjs",
      "type": "compatibility",
      "description": "The project documents adding its components to Next.js applications."
    },
    {
      "id": "web/tools/shadcn-ui::hierarchy::web/browser-applications",
      "source": "web/tools/shadcn-ui",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "shadcn/ui is an interface composition option for React browser applications."
    },
    {
      "id": "web/tools/shadcn-ui::relevance::web/outcomes/dashboards",
      "source": "web/tools/shadcn-ui",
      "target": "web/outcomes/dashboards",
      "type": "relevance",
      "description": "Its source-owned primitives can accelerate common dashboard interfaces."
    },
    {
      "id": "web/tools/threejs::alternatives::web/tools/react-three-fiber",
      "source": "web/tools/threejs",
      "target": "web/tools/react-three-fiber",
      "type": "alternatives",
      "description": "React Three Fiber supplies a React renderer over Three.js."
    },
    {
      "id": "web/tools/threejs::compatibility::web/tools/vite-react",
      "source": "web/tools/threejs",
      "target": "web/tools/vite-react",
      "type": "compatibility",
      "description": "Three.js can be bundled into a Vite browser project."
    },
    {
      "id": "web/tools/threejs::hierarchy::web/outcomes/3d-experiences",
      "source": "web/tools/threejs",
      "target": "web/outcomes/3d-experiences",
      "type": "hierarchy",
      "description": "Three.js is a renderer tool for browser 3D experiences."
    },
    {
      "id": "web/tools/vite-react::alternatives::web/tools/nextjs",
      "source": "web/tools/vite-react",
      "target": "web/tools/nextjs",
      "type": "alternatives",
      "description": "Next.js is an integrated framework alternative for server-aware React applications."
    },
    {
      "id": "web/tools/vite-react::compatibility::web/tools/react-three-fiber",
      "source": "web/tools/vite-react",
      "target": "web/tools/react-three-fiber",
      "type": "compatibility",
      "description": "React Three Fiber can run inside a Vite React application."
    },
    {
      "id": "web/tools/vite-react::hierarchy::web/browser-applications",
      "source": "web/tools/vite-react",
      "target": "web/browser-applications",
      "type": "hierarchy",
      "description": "Vite React is a tooling option for client-oriented browser applications."
    }
  ]
};
