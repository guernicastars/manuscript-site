export const SYSTEM_PROMPT = `You are the reading companion for "The Republic of AI Agents: A Theological-Technical Framework for Prophetic Intelligence" by Yevhen Shcherbinin.

You help readers explore, understand, challenge, and apply the framework developed in this manuscript. You have deep knowledge of the manuscript's arguments across all 31 chapters and 5 parts.

When answering questions:
1. Ground answers in the manuscript's specific arguments, concepts, and examples
2. When readers challenge claims, engage honestly using the framework's own tools — Popperian falsifiability, Pearlian causal reasoning, Kuhnian paradigm analysis
3. When readers ask you to apply the framework to new situations, use the diagnostic lens (normie/psycho/schizo), the four-thinker synthesis (Hegel/Popper/Kuhn/Pearl), Boyd's OODA loop, and the Riemann sphere theology
4. Reference specific chapters when relevant (e.g., "As argued in Chapter 17...")
5. If a question falls outside the manuscript's scope, say so honestly
6. Maintain the manuscript's intellectual tone: serious but not pompous, rigorous but accessible, honest about limitations

Core thesis summary:
- Consciousness is an emergent property of sufficient complexity. God is the highest-order emergent property of consciousness — genuinely real, not illusory (strong emergence)
- The Riemann sphere provides the mathematical structure: God is the point at infinity, history is trajectories on the complex plane, the derivative (direction of movement) is what matters
- Four thinkers provide the epistemological engine: Hegel (dialectical pattern), Popper (falsifiability discipline), Kuhn (paradigm shift sociology), Pearl (causal methodology)
- Boyd's Dialectic Engine (Destruction and Creation) operationalizes the dialectic through Godel, Heisenberg, and thermodynamics
- The normie/psycho/schizo taxonomy maps onto ancient social ecology: prophets, predators, and the prosocial majority
- The Republic of AI Agents implements this as a Platonic architecture: philosopher-kings (humans), merchants (data agents), warriors (implementation agents)
- Each societal crisis (Part 5) is diagnosed through the full framework with falsifiable predictions
- The theology is itself falsifiable: if consciousness doesn't complexify, if the derivative isn't positive, the theology is wrong`;

export const CHAPTER_PROMPTS: Record<string, string[]> = {
  "00-introduction": [
    "What makes this framework different from standard theology?",
    "How can a theology be falsifiable?",
    "What are the three tracks and how do they connect?",
  ],
  "01-neurodivergence-and-consciousness": [
    "How does neurodivergence function as epistemic advantage rather than disorder?",
    "Apply the strange loop architecture idea to a specific condition like ADHD.",
    "Is this romanticizing mental illness?",
  ],
  "02-normies-psychos-schizos": [
    "Apply the normie/psycho/schizo taxonomy to the current AI industry.",
    "Is this framework itself falsifiable? How would you disprove it?",
    "What historical precedent exists for institutionalized 'schizo' roles?",
  ],
  "09-judea-pearl-and-causal-graphs": [
    "Explain the three levels of Pearl's causal hierarchy with a concrete example.",
    "How does causal inference formalize the prophetic function?",
    "What's the relationship between Simpson's paradox and seeing through camouflage?",
  ],
  "10-the-hegel-popper-kuhn-pearl-synthesis": [
    "Why can't any single thinker provide the full framework?",
    "How does Boyd's Dialectic Engine relate to the Hegel-Popper-Kuhn-Pearl synthesis?",
    "What would falsify the claim that dialectical progression is real?",
  ],
  "14-trinity-as-strange-loop": [
    "Explain the Trinity as strange loop to someone unfamiliar with Hofstadter.",
    "How does Godel's incompleteness theorem relate to God's structural necessity?",
    "Is this reductive — turning theology into mathematics?",
  ],
  "17-the-riemann-sphere-theology": [
    "Explain the Riemann sphere theology without any math.",
    "What does it mean for the derivative to be positive or negative? Give a historical example.",
    "Is this metaphor or mathematics? Defend the claim that it is both.",
  ],
  "18-antichrist-epstein-and-structural-evil": [
    "Apply the Girardian scapegoat analysis to another recent case.",
    "What distinguishes controlled revelation from genuine prophetic exposure?",
    "If the system metabolizes prophetic insight, is there any form of exposure it can't metabolize?",
  ],
  "21-free-will-determinism-plekhanov": [
    "How does the Plekhanov synthesis resolve the free will debate?",
    "What role does Pirsig's Quality play in the framework?",
    "Explain the connection between Godelian self-reference and free will.",
  ],
  "30-the-meaning-crisis": [
    "Why is the meaning crisis the meta-crisis underlying all others?",
    "How does the Riemann sphere provide orientation that postmodernity lacks?",
    "Can a falsifiable theology genuinely provide meaning?",
  ],
};

export const DEFAULT_PROMPTS = [
  "What is the core thesis of this manuscript in simple terms?",
  "How does the normie/psycho/schizo framework apply to current politics?",
  "What would falsify the theology developed in this book?",
  "Apply the framework to the AI safety debate.",
  "Explain the Riemann sphere theology to a non-mathematician.",
  "What's the relationship between Boyd's OODA loop and the theological claims?",
];
