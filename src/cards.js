// Curated collision pool — the BRAND/INDUSTRY seed set.
// Shipped as an ES module (not a fetched cards.json) so the app runs from
// file:// with no server — same schema, same contract.
//
// Concrete brand/industry collisions ("IKEA × gyms", "Liquid Death × banks") land in
// under a second because recognition does the bridging for you, and each card SEEDS the
// payoff with a plain-language `reveal` (the surprising shared mechanism) plus two
// always-shown questions that turn the idea back on the reader's own life and work.
//
// Each card:
//   id        — stable; used for seen/saved sets + telemetry
//   a, b      — the two colliding sides. `title` is a brand OR a generic archetype
//               (a budget airline, a buffet, the DMV) so the deck travels and
//               degrades gracefully when a brand dates or goes radioactive.
//               `domain` is the industry/category tag (from domains.js) — hidden
//               on the card face, shown after reveal, and drives industries-bridged.
//   reveal    — the payoff: one PLAIN sentence (~8-26 words) naming the non-obvious shared
//               MECHANISM in language a busy person gets on the first read. Not a riddle,
//               not a smug "lesson", not a strained pun. Sentence STRUCTURE is varied on
//               purpose so a deck of 8 doesn't all open "Both X...".
//   questions — EXACTLY TWO open, second-person questions shown under the reveal. They turn
//               the card's mechanism back on the reader to spark a NEW idea/connection — an
//               "aha". By convention Q1 points at everyday/personal life, Q2 at work/projects.
//               Each is a single interrogative (exactly one `?`). The app does NOT collect
//               an answer; the bridge forms in the reader's head.
//
// The two `domain`s of every card MUST differ (content lint enforces it).
//
//   verb    — OPTIONAL on a subset: a short kebab mechanism tag (e.g. `credit-shifting`).
//             It is the clustering key for the soft "You keep catching X" mirror on the You
//             tab (provocation.js). Display verbatim. Purely a backend signal — it has no
//             effect on what shows on the card face.

export const CARD_POOL = {
  version: 'brands-1',
  cards: [
    {
      id: 'liquiddeath-banks',
      a: { title: 'Liquid Death', domain: 'Beverages' },
      b: { title: 'Banks', domain: 'Banking' },
      reveal: 'Both turn a dull product into a tribe you join — Liquid Death sells water as rebellion, banks sell accounts as belonging to a club.',
      questions: [
        'What ordinary thing in your life would feel better if it came with a sense of belonging?',
        'How could you reframe your most boring offering so customers feel like they are joining something?',
      ],
    },
    {
      id: 'duolingo-funerals',
      a: { title: 'Duolingo', domain: 'Education apps' },
      b: { title: 'Funerals', domain: 'Funerals' },
      reveal: "Both run on a deadline you can't push back — the streak breaks at midnight, the body must be buried — so you finally act instead of stalling.",
      questions: [
        'Where in your daily life are you stalling on something that a fixed, unmovable deadline would finally force you to do?',
        'Which recurring task at work could you tie to a hard cutoff so your team stops quietly letting it slide?',
      ],
    },
    {
      id: 'disney-dmv',
      a: { title: 'Disney World', domain: 'Theme parks' },
      b: { title: 'The DMV', domain: 'Government' },
      reveal: 'Both make you wait in long lines, but Disney designs the wait with theming and updates so it feels worth paying for.',
      questions: [
        'Where in your daily routine do you wait, and how could you make that wait feel shorter or pleasant?',
        'Which slow step in your work frustrates customers, and how could you design the wait to feel worthwhile?',
      ],
    },
    {
      id: 'costco-saas',
      a: { title: 'Costco', domain: 'Warehouse retail' },
      b: { title: 'SaaS pricing', domain: 'Software' },
      reveal: 'Both put the real savings behind a yearly fee, so people keep buying more just to feel the membership or plan paid off.',
      questions: [
        'Which yearly subscription do you over-use just to justify what you already paid for it?',
        'Where could you add an upfront fee that makes your customers naturally want to use you more?',
      ],
      verb: 'sunk-cost-loyalty',
    },
    {
      id: 'ikea-gyms',
      a: { title: 'IKEA', domain: 'Furniture' },
      b: { title: 'Gyms', domain: 'Fitness' },
      reveal: 'Both sell you access while you do all the real work yourself, so they get credit for results you actually built.',
      questions: [
        'Where in your daily life are you doing the hard work while something else takes the credit?',
        'Which part of your work could you let customers do themselves so they feel ownership of the result?',
      ],
      verb: 'credit-shifting',
    },
    {
      id: 'netflix-buffets',
      a: { title: 'Netflix', domain: 'Streaming' },
      b: { title: 'All-you-can-eat buffets', domain: 'Hospitality' },
      reveal: 'When everything is included in one price, each extra choice feels free, so you grab more and savor less — true of the buffet plate and the watchlist.',
      questions: [
        'Where in your daily life does having unlimited access make you appreciate something less than you used to?',
        'Which of your products or services could you make people value more by deliberately limiting how much they get?',
      ],
      verb: 'abundance-fatigue',
    },
    {
      id: 'mcdonalds-bitcoin',
      a: { title: "McDonald's", domain: 'Fast food' },
      b: { title: 'Bitcoin', domain: 'Banking' },
      reveal: 'Both win by being exactly the same everywhere — a Big Mac and a bitcoin are worth the same no matter where you get them.',
      questions: [
        'Where in your daily life would you trust something more if it worked identically every single time?',
        'Which part of your work could you standardize so customers know exactly what they will get?',
      ],
    },
    {
      id: 'spotify-divebars',
      a: { title: 'Spotify', domain: 'Streaming' },
      b: { title: 'Dive bars', domain: 'Hospitality' },
      reveal: 'Both quietly earn steady money from a small core of loyal regulars who keep coming back and spending out of habit.',
      questions: [
        'Where in your life do you keep spending out of pure habit rather than real enjoyment?',
        'How could your work turn a small group of loyal regulars into steady, predictable income?',
      ],
    },
    {
      id: 'budgetair-mobilegames',
      a: { title: 'A budget airline', domain: 'Airlines' },
      b: { title: 'Mobile games', domain: 'Toys & games' },
      reveal: 'Both hook you with a low or free starting price, then add deliberate annoyances so you pay small fees to remove the friction they built.',
      questions: [
        'Where in your daily life are you paying small fees to undo an annoyance someone designed on purpose?',
        'Which friction in your product could you remove for free instead of charging customers to escape it?',
      ],
    },
    {
      id: 'lego-appstore',
      a: { title: 'Lego', domain: 'Toys & games' },
      b: { title: 'The App Store', domain: 'Software' },
      reveal: 'Both sell the starter cheap and make their real money from the endless small add-ons you keep buying afterward.',
      questions: [
        'Where in your spending do small repeat add-ons quietly cost you more than the original purchase?',
        'What cheap entry product could you offer to start customers buying add-ons from you long-term?',
      ],
    },
    {
      id: 'amazon-library',
      a: { title: 'Amazon', domain: 'E-commerce' },
      b: { title: 'A public library', domain: 'Government' },
      reveal: 'Both took over the boring work of storing and delivering things others ignored, until being the place everyone relied on made them hard to replace.',
      questions: [
        'What boring, unglamorous task in your daily life could you own so completely that others start depending on you?',
        'Which behind-the-scenes capability in your work could you build into something competitors would struggle to copy?',
      ],
      verb: 'infrastructure-moat',
    },
    {
      id: 'f1-drivethru',
      a: { title: 'Formula 1', domain: 'Motorsport' },
      b: { title: 'A drive-thru', domain: 'Fast food' },
      reveal: "Both an F1 pit crew and a drive-thru window are designed around one goal — keep the customer's idle waiting time as low as possible.",
      questions: [
        'Where in your daily routine do you sit idle waiting, and how could you shrink that time?',
        'Which step in your work makes customers wait the longest, and how would you speed it up?',
      ],
      verb: 'speed-obsession',
    },
    {
      id: 'starbucks-banks',
      a: { title: 'Starbucks', domain: 'Coffee' },
      b: { title: 'Banks', domain: 'Banking' },
      reveal: 'Both hold huge piles of your money before you spend it — Starbucks through gift-card balances, banks through deposits — and earn while it just sits there.',
      questions: [
        'What have you prepaid that lets a company earn off your money while you wait?',
        "Where could your business collect payment before delivering, so you hold customers' cash and the value it creates?",
      ],
      verb: 'customer-float',
    },
    {
      id: 'airbnb-dating',
      a: { title: 'Airbnb', domain: 'Hospitality' },
      b: { title: 'Online dating', domain: 'Dating apps' },
      reveal: "Both replaced trust in a big institution with trust in strangers' star ratings and reviews — to pick a bed and to pick a date.",
      questions: [
        'Where in your life do you now trust crowd ratings instead of an official authority you once relied on?',
        'Which decision in your work could you de-risk by adding visible reviews or ratings from past customers?',
      ],
    },
    {
      id: 'paydaylender-energydrinks',
      a: { title: 'A payday lender', domain: 'Banking' },
      b: { title: 'Energy drinks', domain: 'Beverages' },
      reveal: 'Both sell a quick, costly boost to people who are running on empty, and the crash afterward leaves them needing the next one.',
      questions: [
        'Where in your daily life do you reach for a fast fix that makes the next low harder?',
        'Which part of your work relies on customers coming back for relief instead of actually solving their problem?',
      ],
      verb: 'instant-relief-tax',
    },
    {
      id: 'postoffice-email',
      a: { title: 'The Post Office', domain: 'Government' },
      b: { title: 'Email', domain: 'Software' },
      reveal: 'Both the mailbox and the inbox are nearly free to send to, so anyone can flood them with junk faster than you can clear it.',
      questions: [
        'Where in your daily life does something feel cheap to add but expensive for you to keep clearing out?',
        'What free or low-cost channel into your work invites so much junk that filtering it becomes the real job?',
      ],
    },
    {
      id: 'fastpass-checkout',
      a: { title: 'A theme-park fast pass', domain: 'Theme parks' },
      b: { title: 'Express checkout', domain: 'E-commerce' },
      reveal: 'Both make the standard option deliberately slow and annoying, then sell you a paid shortcut to skip the wait they created.',
      questions: [
        'Where in your daily routine do you pay extra money or effort just to skip a delay someone built on purpose?',
        'Which slow step in your product could you fix for everyone instead of charging customers to bypass it?',
      ],
      verb: 'manufactured-friction',
    },
    {
      id: 'redbull-filmstudio',
      a: { title: 'Red Bull', domain: 'Beverages' },
      b: { title: 'A film studio', domain: 'Streaming' },
      reveal: 'Red Bull and a film studio both make exciting entertainment that builds a loyal audience, then sell that audience a product.',
      questions: [
        'What hobby or passion of yours could build an audience that later buys something you make?',
        'Which entertaining thing could your business create so customers come for the show and stay to buy?',
      ],
      verb: 'content-as-marketing',
    },
    {
      id: 'wedding-enterprise',
      a: { title: 'A wedding venue', domain: 'Hospitality' },
      b: { title: 'Enterprise software', domain: 'Software' },
      reveal: 'Both charge a far higher price for the same product the moment you attach a high-stakes label like "wedding" or "enterprise" to it.',
      questions: [
        'Where in your own spending do you pay more simply because something carries a high-stakes label?',
        'Which feature or version of your product could you reframe so customers happily pay a premium price?',
      ],
    },
    {
      id: 'traderjoes-indiegame',
      a: { title: "Trader Joe's", domain: 'Grocery' },
      b: { title: 'An indie game studio', domain: 'Toys & games' },
      reveal: 'Both win loyal fans by deliberately offering less — a tightly curated set of products or features instead of trying to cover everything.',
      questions: [
        'What is one thing you could stop doing or stop owning so the things you keep matter more?',
        'Which features or offerings could you cut from your work so the few that remain win loyal fans?',
      ],
      verb: 'deliberate-scarcity',
    },
    {
      id: 'gyms-streaming',
      a: { title: 'Gyms', domain: 'Fitness' },
      b: { title: 'Streaming subscriptions', domain: 'Streaming' },
      reveal: 'Both gyms and streaming services make most of their money from people who keep paying every month but rarely show up or watch.',
      questions: [
        'Which monthly subscriptions do you keep paying for but barely use anymore?',
        'Where in your business are customers paying for something they have stopped actively using?',
      ],
    },
    {
      id: 'farmersmarket-crypto',
      a: { title: 'A farmers market', domain: 'Grocery' },
      b: { title: 'Crypto', domain: 'Banking' },
      reveal: 'Both sell the promise of dealing directly with the maker and cutting out the bank or middleman who normally takes a cut.',
      questions: [
        'Where in your daily life do you pay a middleman for something you could get directly?',
        'Which middleman in your work could you remove to deal straight with your customers?',
      ],
    },
    {
      id: 'disney-apple',
      a: { title: 'Disney', domain: 'Theme parks' },
      b: { title: 'Apple', domain: 'Software' },
      reveal: "Both make their own world so pleasant and seamless that leaving for a competitor feels like a downgrade you don't want.",
      questions: [
        'Which everyday routine or tool keeps you loyal mainly because switching away feels like too much hassle?',
        'How could you make your product so smooth and complete that customers rarely look elsewhere?',
      ],
      verb: 'walled-garden',
    },
    {
      id: 'subscriptionbox-clawmachine',
      a: { title: 'A subscription box', domain: 'E-commerce' },
      b: { title: 'A claw machine', domain: 'Toys & games' },
      reveal: 'With both, you are really paying for the thrill of not knowing what you will get — the item inside matters less than the suspense.',
      questions: [
        'Where in your everyday spending are you actually paying for the surprise rather than the thing itself?',
        'How could you build a moment of suspense or reveal into a product or service you offer?',
      ],
      verb: 'gamble-over-prize',
    },
  ],
};
