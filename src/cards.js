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
    {
      id: 'averifiedcheck-auniversitydip',
      a: { title: 'A verified checkmark', domain: 'Software' },
      b: { title: 'A university diploma', domain: 'Education apps' },
      reveal: 'Both let you buy a status badge that stands in for real ability, so people often pay for the symbol instead of the skill.',
      questions: [
        'Which badge are you paying for mainly so strangers take you seriously?',
        'Does your product deliver real results or just hand customers a credibility badge?',
      ],
      verb: 'status-badge',
    },
    {
      id: 'appstorereview-atoysafetyseal',
      a: { title: 'App store reviews', domain: 'Software' },
      b: { title: 'A toy safety seal', domain: 'Toys & games' },
      reveal: 'Both replaced slow official inspection with crowd signals, so a flood of quick ratings now decides what feels safe to buy.',
      questions: [
        'When did you last trust a wall of ratings instead of checking something yourself?',
        'Do you ship your work on crowd buzz or on real verification first?',
      ],
      verb: 'crowd-verification',
    },
    {
      id: 'snapchatstreak-afitnessapp',
      a: { title: 'Snapchat streaks', domain: 'Dating apps' },
      b: { title: 'A fitness app', domain: 'Fitness' },
      reveal: 'Both turn a number you built up into something you fear losing, so you keep showing up mainly to stop it resetting to zero.',
      questions: [
        'What daily streak do you keep alive even when you no longer enjoy it?',
        'Which number in your product pulls users back through fear of losing progress?',
      ],
      verb: 'loss-aversion-streak',
    },
    {
      id: 'airlineelitest-amobilegamebat',
      a: { title: 'airline elite status', domain: 'Airlines' },
      b: { title: 'a mobile game battle pass', domain: 'Toys & games' },
      reveal: 'Both wipe your hard-won rank at the end of each season so the only way to stay on top is to keep grinding on time.',
      questions: [
        'What status do you chase each year that quietly expires the moment you pause?',
        'Could your renewal cycle reward loyal users without punishing the ones who take a break?',
      ],
      verb: 'status-reset',
    },
    {
      id: 'abarshappyhour-aroundupsaving',
      a: { title: "a bar's happy hour", domain: 'Hospitality' },
      b: { title: 'a round-up savings app', domain: 'Banking' },
      reveal: 'Both bolt a new behavior onto something you already do at a set time, so it happens without a fresh decision.',
      questions: [
        'What existing daily routine could you piggyback a habit onto so you never have to decide again?',
        'Which action your users already repeat could you attach your feature to so adoption needs no extra effort?',
      ],
      verb: 'habit-anchoring',
    },
    {
      id: 'aweighinmeetin-asprintstandup',
      a: { title: 'a weigh-in meeting', domain: 'Fitness' },
      b: { title: 'a sprint stand-up', domain: 'Software' },
      reveal: 'Both make you report progress out loud to a group, so dread of looking idle pushes you to do the work between sessions.',
      questions: [
        'What weekly check-in makes you scramble beforehand just so you have something to show?',
        "Would announcing your team's goals in public meetings move the work faster than quiet deadlines?",
      ],
      verb: 'accountability-ritual',
    },
    {
      id: 'agiftcard-atransitcard',
      a: { title: 'A gift card', domain: 'Coffee' },
      b: { title: 'A transit card', domain: 'Government' },
      reveal: 'Both collect your money upfront and quietly keep the slivers you never spend, turning forgotten balances into free profit.',
      questions: [
        'How much money do you have frozen on cards and apps you forgot about?',
        'Could your product hold customer balances that mostly sit unspent and unredeemed?',
      ],
      verb: 'breakage',
    },
    {
      id: 'supreme-atastingmenure',
      a: { title: 'Supreme', domain: 'E-commerce' },
      b: { title: 'a tasting-menu restaurant', domain: 'Hospitality' },
      reveal: 'Both keep batches tiny on purpose so demand always outruns supply and the wait itself becomes the status you pay for.',
      questions: [
        'Where do you stand in a line mainly because the line itself feels worth it to you?',
        'Could you raise demand for your work by capping how much you supply instead of making more?',
      ],
      verb: 'manufactured-scarcity',
    },
    {
      id: 'playstation-keurig',
      a: { title: 'PlayStation', domain: 'Toys & games' },
      b: { title: 'Keurig', domain: 'Coffee' },
      reveal: 'Each sells the machine near cost to lock you into a closed system where the real money is games and pods only they license.',
      questions: [
        'What cheap device did you buy that quietly committed you to its pricey refills for years?',
        'Where could you sell your product near cost so you own every refill or upgrade after?',
      ],
      verb: 'razor-and-blades',
    },
    {
      id: 'astreamingserv-atimesharereso',
      a: { title: 'A streaming service', domain: 'Streaming' },
      b: { title: 'A timeshare resort', domain: 'Hospitality' },
      reveal: 'Both make signing up a single tap but turn quitting into a maze of calls and screens so most people just stay.',
      questions: [
        'What are you still paying for because canceling felt like more hassle than it was worth?',
        'Does your product make leaving as easy as joining, or does it quietly trap people?',
      ],
      verb: 'easy-in-hard-out',
    },
    {
      id: 'anationalfuner-aretailbank',
      a: { title: 'a national funeral chain', domain: 'Funerals' },
      b: { title: 'a retail bank', domain: 'Banking' },
      reveal: "Both turn a rare, emotional event into a fixed script so stressed people don't have to make hard choices.",
      questions: [
        'When has a ready-made checklist spared you from deciding during a stressful life moment?',
        'Where could a clear default path calm your most anxious customers?',
      ],
      verb: 'scripted-calm',
    },
    {
      id: 'ascratchofflot-afitnessstreak',
      a: { title: 'A scratch-off lottery ticket', domain: 'Government' },
      b: { title: 'A fitness streak app', domain: 'Fitness' },
      reveal: 'Both engineer near-misses so almost winning stings more than plainly losing, which is exactly what keeps you coming back to try again.',
      questions: [
        'Where does an almost-win keep pulling you back after you swore you would quit?',
        'How could a near-miss in your product nudge users toward one more attempt?',
      ],
      verb: 'near-miss',
    },
    {
      id: 'acasinocomppro-abankcreditcar',
      a: { title: 'A casino comp program', domain: 'Hospitality' },
      b: { title: 'A bank credit-card rewards tier', domain: 'Banking' },
      reveal: 'Both hand out small perks the more you spend, so heavy spending feels like winning prizes instead of losing money.',
      questions: [
        'What small perks make you feel rewarded for spending more than you planned?',
        'How could your product reframe a customer spending more as them winning something?',
      ],
      verb: 'drip-reward',
    },
    {
      id: 'amobilegame-aridehailingap',
      a: { title: 'A mobile game', domain: 'Software' },
      b: { title: 'A ride-hailing app', domain: 'E-commerce' },
      reveal: 'Both let you start almost free, then charge the most at the exact moment you are too impatient to wait.',
      questions: [
        'When do you happily pay extra just because you cannot stand to wait any longer?',
        'Where in your product could you charge more for speed instead of charging one flat rate?',
      ],
      verb: 'urgency-pricing',
    },
    {
      id: 'aweddingregist-aholidaysaving',
      a: { title: 'A wedding registry', domain: 'E-commerce' },
      b: { title: 'A holiday savings club', domain: 'Banking' },
      reveal: 'Both collect your money months before anything is delivered, so they earn interest on cash that is technically still yours.',
      questions: [
        'Where in your life are you paying for something long before you actually receive it?',
        'Could your business collect payment earlier and earn on the cash before you deliver?',
      ],
      verb: 'customer-float',
    },
    {
      id: 'asecuritydepos-areturnablebot',
      a: { title: 'A security deposit', domain: 'Hospitality' },
      b: { title: 'A returnable bottle scheme', domain: 'Beverages' },
      reveal: 'Both take a refundable deposit up front, then quietly keep the cash from everyone who never bothers to claim it back.',
      questions: [
        'How much money are you sitting on in deposits you never bothered to reclaim?',
        'Where could your business take a refundable deposit and profit from the ones customers forget to collect?',
      ],
      verb: 'deposit-breakage',
    },
    {
      id: 'innout-vinylrecords',
      a: { title: 'In-N-Out', domain: 'Fast food' },
      b: { title: 'Vinyl records', domain: 'Streaming' },
      reveal: 'Both stay regional or analog on purpose so that loving them marks you as a knowing insider rather than a tourist.',
      questions: [
        'What niche taste do you bring up to signal that you are quietly in the know?',
        'Where could staying deliberately small or old-fashioned make your customers feel like proud discoverers?',
      ],
      verb: 'insider-signaling',
    },
    {
      id: 'ablindboxtoyli-ahiddenbanktie',
      a: { title: 'A blind-box toy line', domain: 'Toys & games' },
      b: { title: 'A hidden bank tier', domain: 'Banking' },
      reveal: 'Both dangle a rare top prize behind many tries so the slim chance of winning it keeps you coming back.',
      questions: [
        'What unlikely payoff keeps you buying or playing long after the odds turned against you?',
        'Could a scarce hidden tier push your best customers to chase status they can rarely reach?',
      ],
      verb: 'scarcity-loop',
    },
    {
      id: 'mccainfrozenfr-avaccinemaker',
      a: { title: 'McCain frozen fries', domain: 'Fast food' },
      b: { title: 'a vaccine maker', domain: 'Government' },
      reveal: 'Both win by owning the unbroken cold chain end to end, so rivals without that refrigerated network simply cannot deliver the product.',
      questions: [
        'What boring piece of infrastructure quietly keeps your daily routine running that you never maintain on purpose?',
        'Could owning the unglamorous handoffs in your work block competitors more than any new feature would?',
      ],
      verb: 'cold-chain',
    },
    {
      id: 'ahotelchain-arestaurantres',
      a: { title: 'a hotel chain', domain: 'Hospitality' },
      b: { title: 'a restaurant reservation app', domain: 'Software' },
      reveal: 'Both own the booking layer that independent restaurants and hotels must join, then skim a fee off demand those operators earned themselves.',
      questions: [
        'Which app or service quietly takes a cut whenever you book your own favorite spots?',
        'Does your team own the demand customers bring, or just the rails that route it?',
      ],
      verb: 'reservation-rails',
    },
    {
      id: 'afurnitureflat-amealkitcompan',
      a: { title: 'a furniture flat-pack giant', domain: 'Furniture' },
      b: { title: 'a meal-kit company', domain: 'Grocery' },
      reveal: 'Both hand you the final assembly, which strips labor and shipping out of their costs so they can undercut everyone on price.',
      questions: [
        'What tasks do you now do yourself at home that a service once handled for you?',
        'Which step of your product could customers finish themselves so you can charge less than rivals?',
      ],
      verb: 'fulfillment-default',
    },
    {
      id: 'acasinosfreeco-awarehouseclub',
      a: { title: "a casino's free concert", domain: 'Hospitality' },
      b: { title: "a warehouse club's food court", domain: 'Warehouse retail' },
      reveal: 'Both offer a cheap crowd-pleasing attraction to pull you in so you spend on the high-margin thing nearby.',
      questions: [
        'What cheap perk regularly lures you in and leaves you spending far more than planned?',
        'What inexpensive draw could you offer to get people in front of your real product?',
      ],
      verb: 'loss-leader-draw',
    },
    {
      id: 'datingapp-uber',
      a: { title: 'A dating app', domain: 'Dating apps' },
      b: { title: 'Uber', domain: 'E-commerce' },
      reveal: 'Both are useless in an empty town and unbeatable in a crowded one, so each fights to dominate one city before expanding.',
      questions: [
        'Where in your life are you waiting for a crowd that has not shown up yet?',
        'Which single market could your product win completely before you expand anywhere else?',
      ],
      verb: 'liquidity-tipping',
    },
    {
      id: 'linkedin-anairlinestatu',
      a: { title: 'LinkedIn', domain: 'Software' },
      b: { title: 'An airline status tier', domain: 'Airlines' },
      reveal: 'Both make leaving painful by locking your earned standing inside their walls, so the longer you stay the more it costs to leave.',
      questions: [
        'What earned status are you secretly afraid to walk away from in your own life?',
        "How are you turning customers' built-up history into a reason they can never leave?",
      ],
      verb: 'status-lock-in',
    },
    {
      id: 'twitch-acollegecampus',
      a: { title: 'Twitch', domain: 'Streaming' },
      b: { title: 'A college campus', domain: 'Education apps' },
      reveal: 'Both grow by stacking two sides at once, since top performers show up where the crowd is and the crowd shows up for top performers.',
      questions: [
        'What community do you keep going back to mainly because the most talented people are already there?',
        'How do you bootstrap a platform when neither the talent nor the audience will arrive first?',
      ],
      verb: 'two-sided-magnet',
    },
    {
      id: 'epicgames-anationalidsys',
      a: { title: 'Epic Games', domain: 'Toys & games' },
      b: { title: 'A national ID system', domain: 'Government' },
      reveal: 'Both grow more valuable as everyone signs in with the same account, until that login becomes infrastructure no one can afford to leave.',
      questions: [
        'Which single account have you wired into so much that leaving it now feels impossible?',
        'Could your product become the login others quietly build their own services on top of?',
      ],
      verb: 'login-lock-in',
    },
    {
      id: 'toyota-acommunitycoll',
      a: { title: 'Toyota', domain: 'Motorsport' },
      b: { title: 'a community college', domain: 'Education apps' },
      reveal: 'Both write down every step so an ordinary person reliably gets a good result, instead of depending on one irreplaceable star.',
      questions: [
        'Where do you lean on your own talent instead of steps anyone could follow?',
        'Could writing down how you work let normal teammates match your best output?',
      ],
      verb: 'process-over-stars',
    },
    {
      id: 'adatingapp-acreditscore',
      a: { title: 'a dating app', domain: 'Dating apps' },
      b: { title: 'a credit score', domain: 'Banking' },
      reveal: 'Both squeeze your whole reputation into one number that strangers use to decide whether you are worth the risk.',
      questions: [
        'Which single score are you quietly optimizing to make strangers swipe toward you?',
        'How does your product flatten a real person into one risk number?',
      ],
      verb: 'risk-score',
    },
    {
      id: 'arailroadcompa-ausbcablemaker',
      a: { title: 'a railroad company', domain: 'Government' },
      b: { title: 'a USB-cable maker', domain: 'E-commerce' },
      reveal: 'Both locked in a connector standard early, so every later product had to fit the size and spacing they chose first.',
      questions: [
        'What early habit or choice now quietly shapes how every part of your day fits together?',
        'Where could you set the standard first so partners and customers build around your way of working?',
      ],
      verb: 'standard-lock-in',
    },
    {
      id: 'aflatpackfurni-ataxfilingapp',
      a: { title: 'A flat-pack furniture store', domain: 'Furniture' },
      b: { title: 'A tax-filing app', domain: 'Software' },
      reveal: 'Both hand you a confusing free do-it-yourself path, then sell a paid shortcut to undo the confusion they designed.',
      questions: [
        'What have you recently paid someone to finish because the free option was made needlessly painful?',
        'Where in your product does a paid upgrade quietly rescue users from friction you built into the free tier?',
      ],
      verb: 'sell-the-shortcut',
    },
    {
      id: 'innout-asinglefeature',
      a: { title: 'In-N-Out', domain: 'Fast food' },
      b: { title: 'a single-feature app', domain: 'Software' },
      reveal: 'Both win by offering so few choices that every option is good and customers never freeze deciding.',
      questions: [
        'Where in your daily routine would fewer choices actually leave you happier and faster?',
        'Which features could you cut so the few that remain get obviously better for users?',
      ],
      verb: 'tight-assortment',
    },
    {
      id: 'aphonecarrier-arenttoownfurn',
      a: { title: 'A phone carrier', domain: 'Software' },
      b: { title: 'A rent-to-own furniture store', domain: 'Furniture' },
      reveal: 'Both hide a high price inside small monthly payments so the true total feels painless until you add it up.',
      questions: [
        'What have you bought in monthly installments without ever totaling the real cost?',
        "Where could you split your product's price into installments to make it feel cheaper than it is?",
      ],
      verb: 'installment-masking',
    },
  ],
};
