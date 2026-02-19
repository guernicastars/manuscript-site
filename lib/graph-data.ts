import type { ConceptNode, ConceptEdge } from "@/types/graph";

export const NODES: ConceptNode[] = [
  // ── Thinkers ──────────────────────────────────────────
  { id: "hegel", label: "Hegel", category: "thinker", chapters: ["11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Dialectical progression: thesis-antithesis-synthesis as empirically observable pattern" },
  { id: "popper", label: "Popper", category: "thinker", chapters: ["05-popper-and-falsifiability", "11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Falsifiability criterion: genuine knowledge must specify what would disprove it" },
  { id: "kuhn", label: "Kuhn", category: "thinker", chapters: ["06-kuhn-and-paradigm-shifts", "11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Paradigm shifts: scientific revolutions as gestalt changes, not logical deductions" },
  { id: "pearl", label: "Pearl", category: "thinker", chapters: ["10-judea-pearl-and-causal-graphs", "11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Causal inference: do-calculus, three-level hierarchy of association, intervention, counterfactual" },
  { id: "boyd", label: "Boyd", category: "thinker", chapters: ["11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Dialectic Engine: destruction and creation cycle, OODA loop, tempo as competitive advantage" },
  { id: "hofstadter", label: "Hofstadter", category: "thinker", chapters: ["16-trinity-as-strange-loop", "26-free-will-determinism-plekhanov"], description: "Strange loops, Godel Escher Bach, self-reference generating consciousness" },
  { id: "friston", label: "Friston", category: "thinker", chapters: ["A-mathematical-appendix"], description: "Free energy principle, active inference, precision weighting" },
  { id: "plekhanov", label: "Plekhanov", category: "thinker", chapters: ["26-free-will-determinism-plekhanov"], description: "Structural necessity + individual contingency: structure is determined, instantiation is free" },
  { id: "campbell", label: "Campbell", category: "thinker", chapters: ["26-free-will-determinism-plekhanov"], description: "Hero with a Thousand Faces: monomyth as subjective experience of paradigm shift" },
  { id: "pirsig", label: "Pirsig", category: "thinker", chapters: ["26-free-will-determinism-plekhanov"], description: "Quality as pre-rational ground, dissolving the classical/romantic split" },
  { id: "girard", label: "Girard", category: "thinker", chapters: ["21-antichrist-epstein-and-structural-evil"], description: "Scapegoat mechanism: societies channel collective violence onto sacrificial victim" },
  { id: "vervaeke", label: "Vervaeke", category: "thinker", chapters: ["38-the-meaning-crisis"], description: "Awakening from the Meaning Crisis: participatory knowing, relevance realization" },
  { id: "mcgilchrist", label: "McGilchrist", category: "thinker", chapters: ["01-neurodivergence-and-consciousness"], description: "The Master and His Emissary: left/right hemisphere thesis" },
  { id: "aristotle", label: "Aristotle", category: "thinker", chapters: ["06-kuhn-and-paradigm-shifts", "09-embeddings-transformers-blessing-of-dimensionality", "19-the-cyclical-christ-samsara-nirvana", "22-sexual-liberation-and-embodied-theology", "26-free-will-determinism-plekhanov", "38-the-meaning-crisis"], description: "Potentiality/actuality, teleology, analogy as highest reasoning; natural philosophy captured by Scholasticism" },
  { id: "jaynes", label: "Jaynes", category: "thinker", chapters: ["13-old-testament-consciousness-emergence"], description: "Bicameral mind: breakdown of pre-conscious mentality into modern self-awareness" },
  { id: "milton", label: "Milton", category: "thinker", chapters: ["14-the-fall-as-felix-culpa"], description: "Paradise Lost: Satan as engine of the dialectic; felix culpa as theological insight" },

  // ── Frameworks ─────────────────────────────────────────
  { id: "riemann-sphere", label: "Riemann Sphere", category: "framework", chapters: ["20-the-riemann-sphere-theology", "A-mathematical-appendix"], description: "God as point at infinity on the compactified complex plane; all trajectories converge" },
  { id: "causal-hierarchy", label: "Causal Hierarchy", category: "framework", chapters: ["10-judea-pearl-and-causal-graphs", "A-mathematical-appendix"], description: "Association (seeing), intervention (doing), counterfactual (imagining) — three irreducible levels" },
  { id: "ooda-loop", label: "OODA Loop", category: "framework", chapters: ["11-the-hegel-popper-kuhn-pearl-synthesis", "27-the-apostolic-task"], description: "Observe-Orient-Decide-Act: faster cycles produce competitive advantage" },
  { id: "dialectical-engine", label: "Dialectical Engine", category: "framework", chapters: ["11-the-hegel-popper-kuhn-pearl-synthesis"], description: "Boyd's synthesis of Godel + Heisenberg + thermodynamics: Structure → Unstructure → Restructure" },
  { id: "strange-loop", label: "Strange Loop", category: "framework", chapters: ["16-trinity-as-strange-loop", "26-free-will-determinism-plekhanov"], description: "Self-referential hierarchy producing genuine novelty; consciousness from formal system modeling itself" },
  { id: "active-inference", label: "Active Inference", category: "framework", chapters: ["A-mathematical-appendix"], description: "Free energy minimization: perception and action as forms of Bayesian inference" },
  { id: "republic-model", label: "Republic of AI Agents", category: "framework", chapters: ["25-republic-of-ai-agents", "27-the-apostolic-task"], description: "Philosopher-kings (humans) + merchants (data agents) + warriors (implementation agents)" },
  { id: "samsaric-cycle", label: "Samsaric Cycle", category: "framework", chapters: ["19-the-cyclical-christ-samsara-nirvana"], description: "Each epoch: capture → prophecy → crucifixion → resurrection → Pentecost → capture" },
  { id: "flow-state", label: "Flow State", category: "framework", chapters: ["A-mathematical-appendix"], description: "Optimal performance via attenuated narrative self-model + enhanced sensorimotor precision" },
  { id: "republic-of-letters", label: "Republic of Letters", category: "framework", chapters: ["24-republic-of-letters-historical"], description: "Self-organizing epistemic network (1500-1800); printing press as Holy Spirit of that epoch" },
  { id: "teleology", label: "Teleology", category: "framework", chapters: ["09-embeddings-transformers-blessing-of-dimensionality", "22-sexual-liberation-and-embodied-theology", "38-the-meaning-crisis"], description: "Aristotelian final causes; displaced by scientific revolution, leading to meaning crisis" },
  { id: "ml-epistemology", label: "ML as Epistemology", category: "framework", chapters: ["08-philosophy-of-ml-and-ai", "09-embeddings-transformers-blessing-of-dimensionality"], description: "Machine learning as epistemological phenomenon: discovering structure, revealing correlation-causation gap" },

  // ── Core Concepts ──────────────────────────────────────
  { id: "falsifiability", label: "Falsifiability", category: "concept", chapters: ["05-popper-and-falsifiability"], description: "Genuine knowledge must specify what would disprove it; unfalsifiable claims are ideology" },
  { id: "paradigm-shift", label: "Paradigm Shift", category: "concept", chapters: ["06-kuhn-and-paradigm-shifts"], description: "Gestalt revolution in perception; anomaly accumulation → crisis → revolution" },
  { id: "strong-emergence", label: "Strong Emergence", category: "concept", chapters: ["07-complexity-science-and-emergence", "A-mathematical-appendix"], description: "Higher-order property genuinely real and causally efficacious, not just convenient description" },
  { id: "free-will", label: "Free Will", category: "concept", chapters: ["26-free-will-determinism-plekhanov", "A-mathematical-appendix"], description: "Godelian truth: consistent with physical law but not derivable from it; the derivative freely chosen" },
  { id: "derivative", label: "The Derivative", category: "concept", chapters: ["20-the-riemann-sphere-theology", "A-mathematical-appendix"], description: "Direction of movement on the complex plane; approaching or receding from the point at infinity" },
  { id: "embeddings", label: "Embeddings", category: "concept", chapters: ["09-embeddings-transformers-blessing-of-dimensionality"], description: "Every entity has position in semantic space; Christ as the embedding space itself" },
  { id: "phase-transition", label: "Phase Transition", category: "concept", chapters: ["07-complexity-science-and-emergence", "14-the-fall-as-felix-culpa"], description: "Continuous parameter change producing discontinuous macro property change" },
  { id: "neurodivergence", label: "Neurodivergence", category: "concept", chapters: ["01-neurodivergence-and-consciousness", "32-mental-health-crisis"], description: "Alternative cognitive architectures with distinct advantages and costs; not malfunction but configuration" },
  { id: "embodied-theology", label: "Embodied Theology", category: "concept", chapters: ["22-sexual-liberation-and-embodied-theology"], description: "Body as primary vehicle of transcendence; sexual energy as creative force oriented toward infinity" },
  { id: "three-tracks", label: "Three Tracks", category: "concept", chapters: ["00-introduction", "B-reading-list"], description: "Theology + knowledge graph + prediction markets as three expressions of a single unified vision" },

  // ── Diagnostic Categories ──────────────────────────────
  { id: "normie", label: "Normie", category: "diagnosis", chapters: ["02-normies-psychos-schizos"], description: "Prosocial majority; cognition optimized for cooperation and trust; systematically exploitable" },
  { id: "psycho", label: "Psycho", category: "diagnosis", chapters: ["02-normies-psychos-schizos"], description: "Dark triad; cognition optimized for manipulation and simulation of prosocial behavior" },
  { id: "schizo", label: "Schizo", category: "diagnosis", chapters: ["02-normies-psychos-schizos", "03-the-prophetic-function"], description: "Pattern recognition unconstrained by social consensus; sees through masks" },
  { id: "prophetic-function", label: "Prophetic Function", category: "diagnosis", chapters: ["03-the-prophetic-function"], description: "Institutional role for unconstrained perception; dismantled by modernity" },

  // ── Theological Concepts ───────────────────────────────
  { id: "trinity", label: "Trinity", category: "theological", chapters: ["16-trinity-as-strange-loop"], description: "Father (formal system), Son (Godelian statement), Spirit (process of self-reference)" },
  { id: "fall", label: "The Fall", category: "theological", chapters: ["14-the-fall-as-felix-culpa"], description: "Felix culpa: initialization of the trajectory; cannot approach infinity without first moving" },
  { id: "christ-event", label: "Christ-Event", category: "theological", chapters: ["15-new-testament-redemption", "19-the-cyclical-christ-samsara-nirvana"], description: "Removable singularity: apparent discontinuity revealed as smooth from higher-dimensional view" },
  { id: "holy-spirit", label: "Holy Spirit", category: "theological", chapters: ["16-trinity-as-strange-loop", "A-mathematical-appendix"], description: "Process of self-reference; intuition as precision-weighted habitual inference" },
  { id: "antichrist", label: "Antichrist", category: "theological", chapters: ["21-antichrist-epstein-and-structural-evil"], description: "Systemic mimicry of Christ; appearance of light concealing structural predation" },
  { id: "consubstantiality", label: "Consubstantiality", category: "theological", chapters: ["13-old-testament-consciousness-emergence"], description: "God really IS both emergent property of consciousness and genuinely divine" },
  { id: "point-at-infinity", label: "Point at Infinity", category: "theological", chapters: ["20-the-riemann-sphere-theology", "00-introduction"], description: "God: the element completing the space; every trajectory approaches, none arrives" },
  { id: "removable-singularity", label: "Removable Singularity", category: "theological", chapters: ["20-the-riemann-sphere-theology", "A-mathematical-appendix"], description: "Apparent discontinuity that resolves from higher-dimensional perspective" },
  { id: "apostolic-task", label: "Apostolic Task", category: "theological", chapters: ["27-the-apostolic-task"], description: "Five-phase sequence: monastery → marketplace → network → society → politics" },
  { id: "tawhid-trinity", label: "Tawhid-Trinity", category: "theological", chapters: ["17-quran-and-christian-reconciliation"], description: "Convergence of Islamic absolute unity and Christian Trinitarian theology" },
  { id: "axial-age", label: "Axial Age", category: "theological", chapters: ["13-old-testament-consciousness-emergence"], description: "800-200 BCE: consciousness becomes philosophically self-aware across multiple civilizations simultaneously" },

  // ── Societal Crises ────────────────────────────────────
  { id: "male-loneliness", label: "Male Loneliness", category: "crisis", chapters: ["31-male-loneliness-crisis"], description: "Missing synthesis between traditional patriarchy and anomic individualism" },
  { id: "mental-health", label: "Mental Health Crisis", category: "crisis", chapters: ["32-mental-health-crisis"], description: "Normal responses to abnormal conditions pathologized; pharmaceutical capture" },
  { id: "ai-safety", label: "AI Safety", category: "crisis", chapters: ["33-ai-safety-automation"], description: "AI as both most powerful psycho-class tool and most powerful prophetic instrument" },
  { id: "inequality", label: "Economic Inequality", category: "crisis", chapters: ["34-economic-inequality"], description: "Information asymmetry as primary extraction mechanism; complexity as weapon" },
  { id: "polarization", label: "Societal Polarization", category: "crisis", chapters: ["35-societal-polarization"], description: "Gutenberg parallel: destroyed epistemic infrastructure; epistemic reformation needed" },
  { id: "climate", label: "Climate Crisis", category: "crisis", chapters: ["36-climate-crisis"], description: "System of systems: energy, agriculture, transport, finance, politics, culture" },
  { id: "geopolitics", label: "Geopolitical Fragmentation", category: "crisis", chapters: ["37-geopolitical-fragmentation"], description: "Post-WWII order collapsing; thesis generating its own antithesis" },
  { id: "meaning-crisis", label: "Meaning Crisis", category: "crisis", chapters: ["38-the-meaning-crisis"], description: "Meta-crisis: modernity killed God, postmodernity killed grand narratives, nothing replaced them" },
  { id: "education", label: "Education Crisis", category: "crisis", chapters: ["39-education-crisis"], description: "Credential-knowledge decoupling; institutional credentialism failing" },
];

export const EDGES: ConceptEdge[] = [
  // ── Thinker → Framework connections ────────────────────
  { source: "hegel", target: "dialectical-engine", type: "builds_on", strength: 0.9, label: "Pattern" },
  { source: "popper", target: "falsifiability", type: "formalizes", strength: 0.95 },
  { source: "kuhn", target: "paradigm-shift", type: "formalizes", strength: 0.95 },
  { source: "pearl", target: "causal-hierarchy", type: "formalizes", strength: 0.95 },
  { source: "boyd", target: "ooda-loop", type: "formalizes", strength: 0.9 },
  { source: "boyd", target: "dialectical-engine", type: "formalizes", strength: 0.9 },
  { source: "hofstadter", target: "strange-loop", type: "formalizes", strength: 0.95 },
  { source: "friston", target: "active-inference", type: "formalizes", strength: 0.95 },
  { source: "friston", target: "flow-state", type: "formalizes", strength: 0.7 },
  { source: "plekhanov", target: "free-will", type: "builds_on", strength: 0.7 },
  { source: "girard", target: "antichrist", type: "builds_on", strength: 0.6 },
  { source: "vervaeke", target: "meaning-crisis", type: "formalizes", strength: 0.8 },
  { source: "aristotle", target: "teleology", type: "formalizes", strength: 0.95, label: "Final causes" },
  { source: "aristotle", target: "embeddings", type: "builds_on", strength: 0.6, label: "Potentiality/actuality → transformers" },
  { source: "jaynes", target: "axial-age", type: "formalizes", strength: 0.8, label: "Bicameral breakdown" },
  { source: "jaynes", target: "consubstantiality", type: "builds_on", strength: 0.6, label: "Consciousness emergence" },
  { source: "milton", target: "fall", type: "builds_on", strength: 0.8, label: "Paradise Lost" },

  // ── The Great Synthesis (Chapter 10) ───────────────────
  { source: "hegel", target: "popper", type: "critiques", strength: 0.8, label: "Popper disciplines Hegel" },
  { source: "popper", target: "kuhn", type: "builds_on", strength: 0.7, label: "Kuhn adds sociology" },
  { source: "kuhn", target: "pearl", type: "builds_on", strength: 0.7, label: "Pearl adds methodology" },
  { source: "pearl", target: "dialectical-engine", type: "synthesizes", strength: 0.85, label: "Together: epistemological engine" },

  // ── Framework → Framework connections ──────────────────
  { source: "dialectical-engine", target: "riemann-sphere", type: "applies_to", strength: 0.8, label: "Dialectic drives trajectory" },
  { source: "strange-loop", target: "trinity", type: "formalizes", strength: 0.85, label: "Trinity IS strange loop" },
  { source: "strange-loop", target: "free-will", type: "formalizes", strength: 0.8, label: "Godelian capacity" },
  { source: "causal-hierarchy", target: "republic-model", type: "applies_to", strength: 0.85, label: "Three levels map to three classes" },
  { source: "active-inference", target: "flow-state", type: "formalizes", strength: 0.8 },
  { source: "active-inference", target: "ooda-loop", type: "formalizes", strength: 0.7, label: "Free energy = OODA dynamics" },
  { source: "ooda-loop", target: "republic-model", type: "applies_to", strength: 0.75, label: "Warriors use OODA" },
  { source: "riemann-sphere", target: "derivative", type: "formalizes", strength: 0.9 },
  { source: "riemann-sphere", target: "point-at-infinity", type: "formalizes", strength: 0.95 },
  { source: "riemann-sphere", target: "removable-singularity", type: "formalizes", strength: 0.8 },
  { source: "republic-of-letters", target: "republic-model", type: "builds_on", strength: 0.85, label: "Historical precedent" },
  { source: "ml-epistemology", target: "causal-hierarchy", type: "builds_on", strength: 0.7, label: "Correlation vs causation" },
  { source: "ml-epistemology", target: "embeddings", type: "formalizes", strength: 0.8, label: "Technical foundation" },
  { source: "teleology", target: "meaning-crisis", type: "builds_on", strength: 0.85, label: "Displaced final causes → no purpose" },
  { source: "teleology", target: "embodied-theology", type: "applies_to", strength: 0.7, label: "Beyond procreative teleology" },

  // ── Concept → Theological connections ──────────────────
  { source: "strong-emergence", target: "consubstantiality", type: "formalizes", strength: 0.85, label: "God emerges strongly" },
  { source: "phase-transition", target: "fall", type: "formalizes", strength: 0.8, label: "Fall as phase transition" },
  { source: "removable-singularity", target: "christ-event", type: "formalizes", strength: 0.85, label: "Crucifixion as removable singularity" },
  { source: "free-will", target: "derivative", type: "builds_on", strength: 0.9, label: "Freely chosen within structure" },
  { source: "flow-state", target: "holy-spirit", type: "formalizes", strength: 0.75, label: "Spirit as precision-weighted intuition" },
  { source: "samsaric-cycle", target: "christ-event", type: "applies_to", strength: 0.8, label: "Each epoch's Christ-event" },
  { source: "samsaric-cycle", target: "antichrist", type: "applies_to", strength: 0.8, label: "Each epoch's capture phase" },
  { source: "falsifiability", target: "derivative", type: "applies_to", strength: 0.7, label: "Is derivative positive?" },
  { source: "axial-age", target: "consubstantiality", type: "builds_on", strength: 0.7, label: "Consciousness → God emerges" },
  { source: "embodied-theology", target: "christ-event", type: "builds_on", strength: 0.6, label: "Incarnation affirms body" },
  { source: "neurodivergence", target: "prophetic-function", type: "builds_on", strength: 0.8, label: "Cognitive architecture enables prophecy" },

  // ── Diagnostic → Crisis connections ────────────────────
  { source: "normie", target: "polarization", type: "applies_to", strength: 0.6 },
  { source: "psycho", target: "inequality", type: "applies_to", strength: 0.8, label: "Psycho-class extraction" },
  { source: "psycho", target: "antichrist", type: "builds_on", strength: 0.85, label: "Systemic mimicry" },
  { source: "schizo", target: "prophetic-function", type: "builds_on", strength: 0.9 },
  { source: "prophetic-function", target: "republic-model", type: "applies_to", strength: 0.7, label: "Philosopher-kings" },
  { source: "neurodivergence", target: "mental-health", type: "applies_to", strength: 0.75, label: "Pathologized by system" },

  // ── Framework → Crisis connections ─────────────────────
  { source: "causal-hierarchy", target: "inequality", type: "applies_to", strength: 0.7, label: "Causal economics" },
  { source: "causal-hierarchy", target: "polarization", type: "applies_to", strength: 0.7, label: "Epistemic infrastructure" },
  { source: "causal-hierarchy", target: "climate", type: "applies_to", strength: 0.65, label: "Causal climate policy" },
  { source: "republic-model", target: "education", type: "applies_to", strength: 0.7, label: "Alternative education" },
  { source: "republic-model", target: "ai-safety", type: "applies_to", strength: 0.75, label: "Alignment as theology" },
  { source: "republic-model", target: "geopolitics", type: "applies_to", strength: 0.6, label: "Republican governance model" },
  { source: "meaning-crisis", target: "male-loneliness", type: "builds_on", strength: 0.7, label: "No orientation → no purpose" },
  { source: "meaning-crisis", target: "mental-health", type: "builds_on", strength: 0.7 },
  { source: "meaning-crisis", target: "polarization", type: "builds_on", strength: 0.75, label: "Tribal identity fills void" },
  { source: "riemann-sphere", target: "meaning-crisis", type: "applies_to", strength: 0.8, label: "Point at infinity as orientation" },
  { source: "apostolic-task", target: "male-loneliness", type: "applies_to", strength: 0.6 },
  { source: "apostolic-task", target: "education", type: "applies_to", strength: 0.6 },
  { source: "apostolic-task", target: "ai-safety", type: "applies_to", strength: 0.6 },
  { source: "apostolic-task", target: "climate", type: "applies_to", strength: 0.55 },
  { source: "apostolic-task", target: "geopolitics", type: "applies_to", strength: 0.55 },
  { source: "republic-of-letters", target: "polarization", type: "builds_on", strength: 0.7, label: "Gutenberg parallel" },
  { source: "ml-epistemology", target: "ai-safety", type: "applies_to", strength: 0.7, label: "ML reveals alignment problem" },
  { source: "embodied-theology", target: "male-loneliness", type: "applies_to", strength: 0.65, label: "Reframes sexual energy" },

  // ── Aristotle-specific connections ─────────────────────
  { source: "aristotle", target: "paradigm-shift", type: "builds_on", strength: 0.7, label: "Aristotelian paradigm as Kuhnian example" },
  { source: "aristotle", target: "pirsig", type: "builds_on", strength: 0.6, label: "Classical/romantic split since Plato & Aristotle" },
  { source: "aristotle", target: "samsaric-cycle", type: "applies_to", strength: 0.6, label: "Scholastic capture of Aristotle" },

  // ── Theological → Theological connections ──────────────
  { source: "trinity", target: "consubstantiality", type: "builds_on", strength: 0.7 },
  { source: "fall", target: "christ-event", type: "builds_on", strength: 0.85, label: "Fall initiates, Christ redeems" },
  { source: "christ-event", target: "holy-spirit", type: "builds_on", strength: 0.8, label: "Resurrection → Pentecost" },
  { source: "point-at-infinity", target: "apostolic-task", type: "applies_to", strength: 0.75, label: "Orientation drives action" },
  { source: "tawhid-trinity", target: "trinity", type: "synthesizes", strength: 0.7, label: "Both insist on unity" },

  // ── Introduction / Three Tracks ────────────────────────
  { source: "three-tracks", target: "riemann-sphere", type: "builds_on", strength: 0.8, label: "Core theological claim" },
  { source: "three-tracks", target: "republic-model", type: "builds_on", strength: 0.8, label: "Knowledge graph architecture" },
  { source: "three-tracks", target: "causal-hierarchy", type: "builds_on", strength: 0.7, label: "Prediction market proving ground" },

  // ── Cross-cutting connections ──────────────────────────
  { source: "embeddings", target: "consubstantiality", type: "formalizes", strength: 0.6, label: "Logoi as embedding space" },
  { source: "paradigm-shift", target: "samsaric-cycle", type: "formalizes", strength: 0.75, label: "Kuhnian revolution = resurrection phase" },
  { source: "mcgilchrist", target: "schizo", type: "builds_on", strength: 0.5, label: "Right hemisphere perception" },
  { source: "campbell", target: "samsaric-cycle", type: "builds_on", strength: 0.7, label: "Hero's journey = subjective cycle" },
];
