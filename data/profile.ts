/**
 * Every word on the site lives here.
 * Edit this file to update the website — no component changes needed.
 *
 * Fields marked `// TODO` are intentionally empty: fill them in and the
 * matching UI (links, buttons, channels) appears automatically.
 */

export type Status = "Building" | "Live" | "Ongoing" | "Exploring" | "Experimental" | "Concept" | "Prototyping" | "Researching";

export type Project = {
  id: string;
  name: string;
  kind: string;
  status: Status;
  summary: string;
  capabilities: string[];
  problem: string;
  learned: string;
  tech: string[];
  /** Optional public link. Leave empty to hide the button. */
  link?: { label: string; href: string };
  /** Visual signature used for the generated preview. */
  glyph: "signal" | "hub" | "rack" | "route" | "candles" | "flask";
};

export type Chapter = {
  marker: string;
  title: string;
  lines: string[];
  keywords: string[];
};

export type Tech = {
  id: string;
  label: string;
  cluster: "Cloud" | "Infrastructure" | "Network & Security" | "AI" | "Messaging" | "Code" | "Operations";
  context: string;
  links: string[];
};

export type Idea = {
  id: string;
  name: string;
  idea: string;
  problem: string;
  solution: string;
  model: string;
  status: Status;
  tech: string[];
  next: string;
  shape: "icosa" | "cube" | "torus" | "octa" | "prism" | "helix";
};

export const profile = {
  name: { first: "Kishore", last: "Mohankumar", initials: "KM" },
  roles: ["Cloud Architect", "Product Builder", "AI Entrepreneur"],
  positioning:
    "Building technology, products and businesses at the intersection of infrastructure, AI and automation.",
  url: "https://kishoremohankumar.com", // TODO: replace with the final domain

  hero: {
    statement: "I build things that move.",
    sub: "Cloud infrastructure. AI products. Automation. Businesses. Experiments.",
    status: [
      "Building AI products",
      "Exploring autonomous systems",
      "Shipping automation that runs itself",
      "Experimenting with new businesses",
      "Turning ideas into products",
    ],
  },

  about: {
    title: "Not just a job title.",
    // Each string is one paragraph. Words light up as the reader scrolls.
    story: [
      "I started with technology as a craft.",
      "Servers became infrastructure. Infrastructure became systems.",
      "Systems became products. Products became businesses.",
      "Now I work where AI, infrastructure and entrepreneurship collide — and I build whatever comes out the other side.",
    ],
    flow: ["Infrastructure", "Systems", "Products", "Businesses", "What's next"],
    facts: [
      { label: "In technology since", value: "2013" },
      { label: "Works across", value: "Cloud · AI · Product" },
      { label: "Default mode", value: "Building" },
    ],
  },

  journey: [
    {
      marker: "2013",
      title: "The craft",
      lines: ["Started my career in IT.", "Learned that every system is somebody's Monday morning."],
      keywords: ["Support", "Hardware", "First servers"],
    },
    {
      marker: "Ch. 02",
      title: "Infrastructure",
      lines: ["Servers. Networks. Linux. Virtualization.", "The parts nobody sees until they stop working."],
      keywords: ["Linux", "VMware", "Networking", "Storage"],
    },
    {
      marker: "Ch. 03",
      title: "Cloud",
      lines: ["Azure and enterprise infrastructure.", "Moving real workloads, not slideware."],
      keywords: ["Azure", "Hybrid", "Identity", "Migration"],
    },
    {
      marker: "Ch. 04",
      title: "Architecture",
      lines: ["Designed and deployed production systems.", "Thinking in failure modes, cost and the next five years."],
      keywords: ["Design", "Security", "Monitoring", "Resilience"],
    },
    {
      marker: "Ch. 05",
      title: "AI",
      lines: ["Started building AI-powered products and automation.", "Models are easy to call. Products are hard to make useful."],
      keywords: ["LLMs", "Agents", "Chatbots", "Voice"],
    },
    {
      marker: "Ch. 06",
      title: "Entrepreneurship",
      lines: ["From implementing technology to creating products and businesses.", "Owning the outcome, not just the ticket."],
      keywords: ["Products", "Customers", "Teams", "Revenue"],
    },
    {
      marker: "Now",
      title: "Building",
      lines: ["Building, experimenting and launching.", "The best chapter is the one being written."],
      keywords: ["AI products", "Automation", "New ventures"],
    },
  ] satisfies Chapter[],

  projects: [
    {
      id: "ai-studio-craft",
      name: "AI Studio Craft",
      kind: "Communication & automation platform",
      status: "Building",
      summary: "AI-powered communication and automation platform for businesses that talk to customers at scale.",
      capabilities: ["WhatsApp Business API", "AI chatbots", "RCS", "SMS", "Voice", "Automation"],
      problem:
        "Businesses run customer conversations across five channels with five tools. Replies are slow, context is lost, and automation breaks the moment a customer goes off-script.",
      learned:
        "Sending a message is the easy part. Templates, opt-ins, delivery and graceful hand-off to a human are the real product.",
      tech: ["WhatsApp", "RCS", "OpenAI", "APIs", "Automation", "Cloud"],
      glyph: "signal",
    },
    {
      id: "infinitia-hub",
      name: "Infinitia Hub",
      kind: "Product ecosystem",
      status: "Building",
      summary: "A technology and product ecosystem for building digital products and solutions.",
      capabilities: ["Product studio", "Digital solutions", "Shared platform", "Launch pipeline"],
      problem:
        "Good ideas die between the sketch and the launch. Each new product rebuilds the same foundations from scratch.",
      learned: "A shared foundation turns every new idea into a faster experiment instead of a fresh start.",
      tech: ["Cloud", "TypeScript", "APIs", "DevOps"],
      glyph: "hub",
    },
    {
      id: "enterprise-infrastructure",
      name: "Enterprise Infrastructure",
      kind: "Cloud & systems",
      status: "Ongoing",
      summary: "Cloud, virtualization, networking, security, monitoring and enterprise systems.",
      capabilities: ["Azure", "Virtualization", "Networking", "Security", "Monitoring"],
      problem:
        "Enterprises need systems that stay up, stay secure and still move fast enough for the business that depends on them.",
      learned: "Reliability is a design decision made long before the outage. Boring infrastructure is a compliment.",
      tech: ["Azure", "VMware", "Linux", "FortiGate", "Networking", "Monitoring"],
      glyph: "rack",
    },
    {
      id: "travel-technology",
      name: "Travel Technology",
      kind: "Booking & marketing",
      status: "Building",
      summary: "Modern travel booking and marketing platforms.",
      capabilities: ["Booking flows", "Marketing automation", "Customer messaging"],
      problem: "Travel buyers expect instant answers. Most travel businesses still run on phone calls and spreadsheets.",
      learned: "Trust converts better than features. Speed of response is part of the product.",
      tech: ["JavaScript", "APIs", "Automation", "WhatsApp"],
      glyph: "route",
    },
    {
      id: "algo-trading",
      name: "Algo Trading",
      kind: "Strategy infrastructure",
      status: "Experimental",
      summary: "Experimental algorithmic trading infrastructure and strategy systems.",
      capabilities: ["Market data", "Backtesting", "Strategy engines", "Risk rules"],
      problem: "Discretionary decisions are hard to measure. A strategy that can't be tested is just an opinion.",
      learned: "Infrastructure discipline transfers directly: logging, failure handling and risk limits matter more than the clever signal.",
      tech: ["Python", "APIs", "Cloud", "Monitoring"],
      glyph: "candles",
    },
    {
      id: "product-lab",
      name: "Product Lab",
      kind: "Ideas & prototypes",
      status: "Exploring",
      summary: "Ideas, prototypes and experiments. Where the next products start.",
      capabilities: ["Prototypes", "Concept validation", "Rapid builds"],
      problem: "Most ideas are never tested, so nobody learns whether they were good.",
      learned: "A rough prototype in a week teaches more than a perfect plan in a quarter.",
      tech: ["AI", "TypeScript", "Python", "Automation"],
      glyph: "flask",
    },
  ] satisfies Project[],

  technologies: [
    { id: "cloud", label: "Cloud", cluster: "Cloud", context: "The common ground for everything else. I design for cost, security and operability from day one.", links: ["azure", "devops", "kubernetes", "security"] },
    { id: "azure", label: "Azure", cluster: "Cloud", context: "Enterprise cloud architecture — landing zones, identity, networking and migrations of real workloads.", links: ["cloud", "kubernetes", "monitoring", "networking"] },
    { id: "kubernetes", label: "Kubernetes", cluster: "Cloud", context: "Orchestrating containerised services when a product outgrows a single box.", links: ["docker", "devops", "cloud"] },
    { id: "docker", label: "Docker", cluster: "Infrastructure", context: "The default packaging for anything I ship — from prototypes to production services.", links: ["kubernetes", "linux", "devops"] },
    { id: "vmware", label: "VMware", cluster: "Infrastructure", context: "Enterprise virtualization: clusters, capacity, high availability and lifecycle.", links: ["linux", "networking", "monitoring"] },
    { id: "linux", label: "Linux", cluster: "Infrastructure", context: "Where most of my systems actually run. Comfortable at the shell when things go wrong.", links: ["docker", "vmware", "security", "python"] },
    { id: "networking", label: "Networking", cluster: "Network & Security", context: "Routing, switching, VPNs and segmentation — designing networks that are understandable at 3 a.m.", links: ["fortigate", "security", "azure", "vmware"] },
    { id: "fortigate", label: "FortiGate", cluster: "Network & Security", context: "Perimeter and firewall policy, site-to-site connectivity and secure access.", links: ["networking", "security"] },
    { id: "security", label: "Security", cluster: "Network & Security", context: "Least privilege, segmentation and visibility. Security as an architecture property, not an add-on.", links: ["fortigate", "networking", "monitoring", "cloud", "linux"] },
    { id: "monitoring", label: "Monitoring", cluster: "Operations", context: "If it isn't observed, it isn't running. Metrics, alerts and dashboards that people actually read.", links: ["devops", "security", "azure", "vmware"] },
    { id: "devops", label: "DevOps", cluster: "Operations", context: "Pipelines, infrastructure as code and repeatable releases so shipping is a non-event.", links: ["docker", "kubernetes", "monitoring", "cloud", "automation"] },
    { id: "automation", label: "Automation", cluster: "Operations", context: "The thread through everything I build: remove the repetitive step, then remove the next one.", links: ["python", "ai", "apis", "devops", "whatsapp"] },
    { id: "ai", label: "AI", cluster: "AI", context: "Building AI into products — chatbots, voice, agents and workflow automation that does real work.", links: ["openai", "automation", "python", "apis"] },
    { id: "openai", label: "OpenAI", cluster: "AI", context: "Language models as product components: prompts, tools, guardrails and evaluation.", links: ["ai", "apis", "typescript"] },
    { id: "apis", label: "APIs", cluster: "Code", context: "Every product I build is a set of integrations. Clean contracts between systems matter more than any single system.", links: ["whatsapp", "rcs", "openai", "typescript", "automation"] },
    { id: "whatsapp", label: "WhatsApp", cluster: "Messaging", context: "WhatsApp Business API — templates, conversations and automated customer journeys.", links: ["rcs", "apis", "automation"] },
    { id: "rcs", label: "RCS", cluster: "Messaging", context: "Rich business messaging beyond SMS: branded, interactive, verified.", links: ["whatsapp", "apis"] },
    { id: "python", label: "Python", cluster: "Code", context: "Automation, data, AI and trading experiments. The fastest path from idea to result.", links: ["ai", "automation", "linux"] },
    { id: "javascript", label: "JavaScript", cluster: "Code", context: "The web layer — interfaces, integrations and the experiences people touch.", links: ["typescript", "apis"] },
    { id: "typescript", label: "TypeScript", cluster: "Code", context: "JavaScript with guardrails, for products that need to last longer than the demo.", links: ["javascript", "apis", "openai"] },
  ] satisfies Tech[],

  systems: [
    {
      name: "Cloud Infrastructure",
      line: "Platforms that carry real workloads.",
      problems: ["Moving on-premise workloads to the cloud without downtime", "Designing landing zones, identity and network foundations", "Keeping cloud cost proportional to value"],
    },
    {
      name: "Enterprise IT",
      line: "The systems a business runs on every morning.",
      problems: ["Standardising messy, inherited environments", "Virtualization, storage and lifecycle planning", "Making support predictable instead of heroic"],
    },
    {
      name: "Networking",
      line: "Connectivity that is fast, segmented and understandable.",
      problems: ["Multi-site connectivity and VPNs", "Segmentation that limits blast radius", "Diagnosing the problem that 'isn't the network'"],
    },
    {
      name: "Security",
      line: "Defence designed in, not bolted on.",
      problems: ["Firewall policy and secure remote access", "Least-privilege access models", "Visibility: knowing what is happening, when"],
    },
    {
      name: "Automation",
      line: "Removing the step a human shouldn't be doing.",
      problems: ["Scripting repetitive operations away", "Event-driven workflows across systems", "Customer messaging that runs on its own"],
    },
    {
      name: "AI",
      line: "Models wired into products that do work.",
      problems: ["Conversational agents for customer channels", "Voice and chat automation", "Turning language models into dependable features"],
    },
    {
      name: "Product Development",
      line: "From an idea to something people use.",
      problems: ["Scoping the smallest useful version", "Building, launching and iterating with real users", "Connecting the product to a business model"],
    },
  ],

  /** Leave empty to show "CV on request" instead of a download. */
  cvUrl: "", // TODO: e.g. "/kishore-mohankumar-cv.pdf" (put the file in /public)

  now: {
    updated: "2026-10", // YYYY-MM — update when you change the lists below
    groups: [
      { label: "Building", items: ["AI products", "Automation platforms", "Enterprise technology", "New digital products"] },
      { label: "Exploring", items: ["AI agents", "Voice AI", "Autonomous workflows", "New SaaS ideas"] },
      { label: "Experimenting", items: ["Trading systems", "New business models", "3D web experiences", "Product concepts"] },
      { label: "Thinking about", items: ["Where agents fit in real businesses", "Infrastructure that runs itself", "Small teams, large leverage", "What to build next"] },
    ],
  },

  // Product Lab — concepts and experiments. These are ideas, not shipped products.
  lab: [
    {
      id: "infra-copilot",
      name: "Infra Copilot",
      idea: "An AI operator that reads alerts, correlates them and drafts the fix.",
      problem: "Small IT teams drown in alerts. The context needed to fix an issue lives in five different consoles.",
      solution: "An agent connected to monitoring, logs and runbooks that proposes a diagnosis and the next command — a human approves.",
      model: "Per-environment subscription for MSPs and in-house IT teams.",
      status: "Concept",
      tech: ["AI agents", "Monitoring", "Azure", "Automation"],
      next: "Prototype against a lab environment with real alert noise.",
      shape: "icosa",
    },
    {
      id: "voice-front-desk",
      name: "Voice Front Desk",
      idea: "A voice AI that answers the business phone — and actually books things.",
      problem: "Missed calls are missed revenue. Small businesses can't staff a phone line all day.",
      solution: "A natural voice agent that answers, qualifies, books and hands the conversation to WhatsApp with full context.",
      model: "Monthly plan per number, priced by minutes handled.",
      status: "Prototyping",
      tech: ["Voice AI", "Telephony", "WhatsApp", "APIs"],
      next: "Test with one real business for two weeks.",
      shape: "torus",
    },
    {
      id: "conversational-commerce",
      name: "Conversational Commerce Kit",
      idea: "Catalogue, checkout and follow-up inside the chat the customer already uses.",
      problem: "Local businesses sell over chat manually — screenshots, payment links and forgotten follow-ups.",
      solution: "WhatsApp and RCS storefronts with AI replies, payment links and automated re-engagement.",
      model: "Setup fee plus platform subscription.",
      status: "Researching",
      tech: ["WhatsApp", "RCS", "Payments", "AI"],
      next: "Map the five most common sales conversations.",
      shape: "cube",
    },
    {
      id: "strategy-journal",
      name: "Strategy Journal",
      idea: "A trading journal that explains why a strategy failed — not just that it did.",
      problem: "Traders log results, not reasons. Patterns in their own mistakes stay invisible.",
      solution: "Automatic trade capture, backtest comparison and an AI review of decisions against the plan.",
      model: "Freemium with paid analytics.",
      status: "Concept",
      tech: ["Python", "Market data", "AI"],
      next: "Use it on my own experiments first.",
      shape: "helix",
    },
    {
      id: "trip-composer",
      name: "Trip Composer",
      idea: "Turn a conversation into a bookable itinerary in minutes.",
      problem: "Travel agents spend hours turning a client's wishes into a priced package.",
      solution: "An assistant that drafts itineraries from a chat, prices them from supplier APIs and sends a proposal.",
      model: "Seat-based SaaS for travel agencies.",
      status: "Concept",
      tech: ["AI", "Travel APIs", "WhatsApp"],
      next: "Interview three agencies about their quoting workflow.",
      shape: "octa",
    },
    {
      id: "ops-twin",
      name: "Ops Twin",
      idea: "A live 3D map of an organisation's infrastructure.",
      problem: "Diagrams go stale the day they're drawn. Nobody can see the whole system at once.",
      solution: "Auto-discovered topology rendered in the browser, coloured by live health and cost.",
      model: "Add-on for managed service providers.",
      status: "Exploring",
      tech: ["WebGL", "Monitoring", "APIs", "Cloud"],
      next: "Render a real network from discovery data.",
      shape: "prism",
    },
  ] satisfies Idea[],

  beyond: [
    { word: "Ideas", line: "I keep a list. It only gets longer." },
    { word: "Business", line: "Technology is a tool. Value is the point." },
    { word: "Technology", line: "Still curious about how things work underneath." },
    { word: "Learning", line: "Every project is also a course I signed up for." },
    { word: "Experimentation", line: "Small bets, fast feedback." },
    { word: "Travel", line: "New places reset how I see old problems." },
    { word: "Design", line: "If it works but feels wrong, it isn't finished." },
    { word: "Building", line: "The thing I'd do even if nobody asked." },
  ],

  contact: {
    title: "Have something worth building?",
    text: "I'm always interested in ambitious ideas, difficult problems and things that shouldn't exist yet.",
    topics: ["a product", "an AI idea", "infrastructure", "a business", "something unusual"],
    intents: ["build it together", "talk it through", "get a second opinion", "hire you"],
  },

  social: {
    email: "", // TODO: e.g. "hello@yourdomain.com" — enables "Start a conversation" by email
    whatsapp: "", // TODO: international format without "+", e.g. "9198XXXXXXXX"
    linkedin: "", // TODO: e.g. "https://www.linkedin.com/in/your-handle"
    github: "https://github.com/kishore9490",
  },
};

export type Profile = typeof profile;
