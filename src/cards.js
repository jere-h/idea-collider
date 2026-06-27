// Curated collision pool — the v2 BRAND/INDUSTRY seed set.
// Shipped as an ES module (not a fetched cards.json) so the app runs from
// file:// with no server — same schema, same contract.
//
// v2 redesign (from simulated user testing): abstract academic collisions like
// "Coral reef × Product onboarding" tested as homework — the spark only arrived
// if the user did the work. Concrete brand/industry collisions ("IKEA × gyms",
// "Liquid Death × banks") land in under a second because recognition does the
// bridging for you, and each card now SEEDS the payoff with a one-line `reveal`
// (the surprising shared mechanism) instead of asking the user to manufacture it.
//
// Each card:
//   id      — stable; used for seen/saved sets + telemetry
//   a, b    — the two colliding sides. `title` is a brand OR a generic archetype
//             (a budget airline, a buffet, the DMV) so the deck travels and
//             degrades gracefully when a brand dates or goes radioactive.
//             `domain` is the industry/category tag (from domains.js) — hidden
//             on the card face, shown after reveal, and drives industries-bridged.
//   reveal  — the payoff: one sentence (~12-26 words) naming the non-obvious
//             shared MECHANISM. Must surprise then click. Never a smug "lesson",
//             never a strained pun. (Test: would someone screenshot it?)
//             Sentence STRUCTURE is varied on purpose — a deck of 8 that all open
//             "Both X..." makes the rug-pull predictable (a Round-2 testing note).
//
// The two `domain`s of every card MUST differ (content lint enforces it).
//
// "The Catch" (docs/trd-the-catch.md) — a SUBSET of cards also carry a provocation,
// all-or-nothing (content lint enforces the trio):
//   verb     — short kebab mechanism tag (e.g. `credit-shifting`): the clustering key
//              for the soft "You keep catching X" mirror. Display verbatim.
//   grammar  — the question's shape: 'point' | 'inversion' | 'dare'. ('accusation' was
//              cut in user testing — scolding/ESL-hostile — and is lint-banned.)
//   question — ONE hand-written, second-person open question pointed at the user's own
//              life. A single interrogative (exactly one `?`), so it never trips the
//              one-sentence `reveal` lint. Provokes the bridge in the user's head; the
//              app does NOT collect an answer. Authored on back-of-deck cards only.

export const CARD_POOL = {
  version: 'brands-1',
  cards: [
    {
      id: 'liquiddeath-banks',
      a: { title: 'Liquid Death', domain: 'Beverages' },
      b: { title: 'Banks', domain: 'Banking' },
      reveal: 'Make a boring product feel like a rebellion and people line up to join it — that trick sells canned water and checking accounts alike.',
    },
    {
      id: 'duolingo-funerals',
      a: { title: 'Duolingo', domain: 'Education apps' },
      b: { title: 'Funerals', domain: 'Funerals' },
      reveal: 'Show up or feel the guilt — both run on the quiet dread of what happens to you if you skip the appointment.',
    },
    {
      id: 'disney-dmv',
      a: { title: 'Disney World', domain: 'Theme parks' },
      b: { title: 'The DMV', domain: 'Government' },
      reveal: 'Both sell the exact same product — a very long line — but only one convinces you it was worth $150.',
    },
    {
      id: 'costco-saas',
      a: { title: 'Costco', domain: 'Warehouse retail' },
      b: { title: 'SaaS pricing', domain: 'Software' },
      reveal: 'Lock the real discount behind an annual fee and members keep over-buying just to prove the membership paid for itself.',
      verb: 'sunk-cost-loyalty',
      grammar: 'point',
      question: 'Where are you over-buying just to prove a subscription you already pay for was worth it?',
    },
    {
      id: 'ikea-gyms',
      a: { title: 'IKEA', domain: 'Furniture' },
      b: { title: 'Gyms', domain: 'Fitness' },
      reveal: 'You do the hard part yourself and they take the credit, so when it falls apart you blame yourself, not the flat-pack.',
      verb: 'credit-shifting',
      grammar: 'inversion',
      question: 'Who is taking the credit for the hard part you actually did this week?',
    },
    {
      id: 'netflix-buffets',
      a: { title: 'Netflix', domain: 'Streaming' },
      b: { title: 'All-you-can-eat buffets', domain: 'Hospitality' },
      reveal: 'When the next thing is always already paid for, you stop valuing any of it — the buffet and the watchlist train the same shrug.',
      verb: 'abundance-fatigue',
      grammar: 'point',
      question: 'What have you stopped valuing simply because you already paid for unlimited access to it?',
    },
    {
      id: 'mcdonalds-bitcoin',
      a: { title: "McDonald's", domain: 'Fast food' },
      b: { title: 'Bitcoin', domain: 'Banking' },
      reveal: 'Being identical and predictable in every country is worth more here than being good anywhere — true for the fries and the coins.',
    },
    {
      id: 'spotify-divebars',
      a: { title: 'Spotify', domain: 'Streaming' },
      b: { title: 'Dive bars', domain: 'Hospitality' },
      reveal: 'The real money comes from regulars who pay to walk in and then barely consume a thing.',
    },
    {
      id: 'budgetair-mobilegames',
      a: { title: 'A budget airline', domain: 'Airlines' },
      b: { title: 'Mobile games', domain: 'Toys & games' },
      reveal: 'The entry price is cheap on purpose; the real bill is the forty tiny upgrades you buy to undo the misery they designed in.',
    },
    {
      id: 'lego-appstore',
      a: { title: 'Lego', domain: 'Toys & games' },
      b: { title: 'The App Store', domain: 'Software' },
      reveal: 'The base set is nearly free because the money was always in the add-on pieces you keep buying forever.',
    },
    {
      id: 'amazon-library',
      a: { title: 'Amazon', domain: 'E-commerce' },
      b: { title: 'A public library', domain: 'Government' },
      reveal: 'Quietly run the boring logistics nobody else wanted, and one day owning the shelves becomes the entire moat.',
      verb: 'infrastructure-moat',
      grammar: 'point',
      question: 'What boring, unglamorous job are you doing that could quietly become your whole moat?',
    },
    {
      id: 'f1-drivethru',
      a: { title: 'Formula 1', domain: 'Motorsport' },
      b: { title: 'A drive-thru', domain: 'Fast food' },
      reveal: 'One hidden number rules both pit crews and drive-thru windows: how few seconds a customer can spend sitting still.',
      verb: 'speed-obsession',
      grammar: 'dare',
      question: 'Can you name the one wait your customers would pay you to delete?',
    },
    {
      id: 'starbucks-banks',
      a: { title: 'Starbucks', domain: 'Coffee' },
      b: { title: 'Banks', domain: 'Banking' },
      reveal: 'Starbucks sits on billions in prepaid gift-card cash — it is a bank that happens to sell coffee.',
      verb: 'customer-float',
      grammar: 'inversion',
      question: 'Whose money could you be holding before you ever deliver them anything?',
    },
    {
      id: 'airbnb-tinder',
      a: { title: 'Airbnb', domain: 'Hospitality' },
      b: { title: 'Tinder', domain: 'Dating apps' },
      reveal: "Somehow we all swapped \"trust the institution\" for \"trust a stranger's star rating\" — for a bed and for a date alike.",
    },
    {
      id: 'paydaylender-energydrinks',
      a: { title: 'A payday lender', domain: 'Banking' },
      b: { title: 'Energy drinks', domain: 'Beverages' },
      reveal: 'Sell an expensive jolt of "right now" to the people who can least afford the crash that follows it.',
      verb: 'instant-relief-tax',
      grammar: 'point',
      question: 'Who are you selling instant relief to that can least afford the crash afterward?',
    },
    {
      id: 'postoffice-email',
      a: { title: 'The Post Office', domain: 'Government' },
      b: { title: 'Email', domain: 'Software' },
      reveal: 'Everyone leans on it and nobody wants to pay for it, so the inbox and the mailbox both slowly fill with junk to survive.',
    },
    {
      id: 'fastpass-checkout',
      a: { title: 'A theme-park fast pass', domain: 'Theme parks' },
      b: { title: 'Express checkout', domain: 'E-commerce' },
      reveal: 'You will pay extra not for anything better, just to skip the suffering they deliberately built into the free version.',
      verb: 'manufactured-friction',
      grammar: 'point',
      question: 'Where in your product are people paying to escape pain you deliberately built in?',
    },
    {
      id: 'redbull-filmstudio',
      a: { title: 'Red Bull', domain: 'Beverages' },
      b: { title: 'A film studio', domain: 'Streaming' },
      reveal: 'Red Bull makes more races, films, and magazines than drinks — the can is really just an ad for the content.',
      verb: 'content-as-marketing',
      grammar: 'inversion',
      question: 'What if your product is really just an ad for something else you should be making?',
    },
    {
      id: 'wedding-enterprise',
      a: { title: 'A wedding venue', domain: 'Hospitality' },
      b: { title: 'Enterprise software', domain: 'Software' },
      reveal: 'Say the magic word — "wedding" or "enterprise" — and the identical product instantly triples in price.',
    },
    {
      id: 'traderjoes-indiegame',
      a: { title: "Trader Joe's", domain: 'Grocery' },
      b: { title: 'An indie game studio', domain: 'Toys & games' },
      reveal: 'Refusing to carry everything is the whole strategy — the deliberate scarcity is exactly what turns customers into evangelists.',
      verb: 'deliberate-scarcity',
      grammar: 'dare',
      question: 'What could you refuse to offer that would make your fans love you more?',
    },
    {
      id: 'gyms-streaming',
      a: { title: 'Gyms', domain: 'Fitness' },
      b: { title: 'Streaming subscriptions', domain: 'Streaming' },
      reveal: 'The best customer is the one who pays every month and never shows up — gyms and streaming services quietly bank on it.',
    },
    {
      id: 'farmersmarket-crypto',
      a: { title: 'A farmers market', domain: 'Grocery' },
      b: { title: 'Crypto', domain: 'Banking' },
      reveal: 'Both run on the same fantasy: you are buying straight from the source and cutting out the villain in the middle.',
    },
    {
      id: 'disney-apple',
      a: { title: 'Disney', domain: 'Theme parks' },
      b: { title: 'Apple', domain: 'Software' },
      reveal: 'Build a wall so beautiful that people thank you for keeping them inside it.',
      verb: 'walled-garden',
      grammar: 'inversion',
      question: 'What wall could you build so good that customers thank you for being kept inside?',
    },
    {
      id: 'subscriptionbox-clawmachine',
      a: { title: 'A subscription box', domain: 'E-commerce' },
      b: { title: 'A claw machine', domain: 'Toys & games' },
      reveal: 'You are paying for the gamble, not the prize — the fun is the reveal and the stuff inside is almost beside the point.',
      verb: 'gamble-over-prize',
      grammar: 'dare',
      question: 'Could you sell the thrill of the reveal instead of the thing inside your box?',
    },
  ],
};
