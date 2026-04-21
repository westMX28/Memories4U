export type ApprovedExample = {
  slug: string;
  title: string;
  shortTitle: string;
  imagePath: string;
  label: 'hero-ready' | 'merch-ready';
  scenarioFamily: string;
  relationshipType: string;
  emotionalAngle: string;
  summary: string;
  whyItPasses: string[];
  homepageUsage: 'lead hero' | 'supporting only' | 'lower-page support only' | 'no';
  curationNote: string;
  editorialGroup: 'Romantic birthday moments' | 'Birthday circles' | 'Memory callbacks';
  editorialLead: string;
};

export const approvedExamples: ApprovedExample[] = [
  {
    slug: 'garden-party-short-copy',
    title: 'Garden party, short-copy rerun',
    shortTitle: 'Garden party',
    imagePath: '/examples/garden-party-short-copy.jpg',
    label: 'hero-ready',
    scenarioFamily: 'Couple, shared memory and celebration tone',
    relationshipType: 'couple',
    emotionalAngle: 'Warm candlelight, cake cues, and close birthday intimacy',
    summary:
      'The strongest current public-proof image: emotionally warm, clearly birthday-specific, and credible enough to lead the revised proof surface.',
    whyItPasses: [
      'strongest emotional warmth of the current cleared set',
      'identity holds for both people',
      'birthday cues read clearly without becoming gimmicky',
      'the overlay now feels editorial rather than operator-generated',
    ],
    homepageUsage: 'lead hero',
    curationNote:
      'Approved for both homepage and examples-page use. This remains the preferred lead image for the public proof surface.',
    editorialGroup: 'Romantic birthday moments',
    editorialLead: 'Warm candlelight and a restrained birthday line make this the clearest premium lead.',
  },
  {
    slug: 'beach-sunset-short-copy',
    title: 'Beach sunset, short-copy rerun',
    shortTitle: 'Beach sunset',
    imagePath: '/examples/beach-sunset-short-copy.jpg',
    label: 'merch-ready',
    scenarioFamily: 'Couple, shared memory and celebration tone',
    relationshipType: 'couple',
    emotionalAngle: 'Sunset celebration with a broad, readable birthday mood',
    summary:
      'A softer support image that expands the emotional range without competing with the homepage lead.',
    whyItPasses: [
      'recognizability remains strong',
      'sunset and balloon cues create a clear celebratory feel',
      'the short overlay no longer leaks QA or operator wording',
    ],
    homepageUsage: 'supporting only',
    curationNote:
      'Approved for the examples page and lower-page support blocks, but intentionally not the lead homepage treatment.',
    editorialGroup: 'Romantic birthday moments',
    editorialLead: 'This broadens the mood without fighting the main birthday-proof image.',
  },
  {
    slug: 'couple-celebration-01',
    title: 'Couple celebration 01',
    shortTitle: 'Evening celebration',
    imagePath: '/examples/couple-celebration-01.jpg',
    label: 'merch-ready',
    scenarioFamily: 'Couple, shared memory and celebration tone',
    relationshipType: 'couple',
    emotionalAngle: 'Evening skyline energy with polished birthday intimacy',
    summary:
      'The strongest evening treatment in the expanded pack, useful as supporting proof once the homepage lead has already established the birthday read.',
    whyItPasses: [
      'strongest premium evening treatment in the expanded pack',
      'skyline, candles, and body language create credible emotional proof',
      'the scene feels polished enough for public use while staying believable',
    ],
    homepageUsage: 'supporting only',
    curationNote:
      "The phrase 'A Toast to Us' leans romance-first and birthday-second, so keep it behind the lead proof rather than using it alone.",
    editorialGroup: 'Romantic birthday moments',
    editorialLead: 'Use as polished support, not as the main proof of the birthday-specific shift.',
  },
  {
    slug: 'friends-candid-01',
    title: 'Friends candid 01',
    shortTitle: 'Table laughter',
    imagePath: '/examples/friends-candid-01.jpg',
    label: 'merch-ready',
    scenarioFamily: 'Adult siblings or close friends, casual candid energy',
    relationshipType: 'friends',
    emotionalAngle: 'Casual laughter and birthday warmth that reads socially, not romantically',
    summary:
      'An essential non-romantic proof asset that makes the set feel broader and more believable for real birthday gifting contexts.',
    whyItPasses: [
      'gives the proof set an essential non-romantic social lane',
      'the laughter and table setting read naturally enough to feel like a real birthday moment',
      'the on-image line includes an explicit birthday cue without overwhelming the scene',
    ],
    homepageUsage: 'lower-page support only',
    curationNote:
      'The composition is more casual than premium-hero, so use it only away from the first homepage proof slot.',
    editorialGroup: 'Birthday circles',
    editorialLead: 'This broadens the proof set into close-friend and sibling energy without pretending the product is only for couples.',
  },
  {
    slug: 'memory-bridge-01',
    title: 'Memory bridge 01',
    shortTitle: 'Memory callback',
    imagePath: '/examples/memory-bridge-01.jpg',
    label: 'merch-ready',
    scenarioFamily: 'Childhood memory recreation or memory-bridge scene',
    relationshipType: 'family memory',
    emotionalAngle: 'Beach warmth and a memory callback that reads as reflective birthday storytelling',
    summary:
      'A memory-focused example that broadens the editorial set beyond dinner-date scenes while staying honest about softer relationship specificity.',
    whyItPasses: [
      'the set needs at least one memory-callback image and this one reads cleanly in public use',
      'the beach warmth and cupcake cue make the birthday context legible',
      'it broadens the examples surface beyond romance and candid-friends energy',
    ],
    homepageUsage: 'no',
    curationNote:
      "Frame this as a memory callback or family memory rather than a precise sibling claim because the relationship read stays broad.",
    editorialGroup: 'Memory callbacks',
    editorialLead: 'Use this to show reflective memory storytelling rather than a narrow relationship promise.',
  },
  {
    slug: 'distance-reunion-01',
    title: 'Distance reunion 01',
    shortTitle: 'Reunion arrival',
    imagePath: '/examples/distance-reunion-01.jpg',
    label: 'merch-ready',
    scenarioFamily: 'Distance / reunion / long-gap connection',
    relationshipType: 'reunion',
    emotionalAngle: 'Immediate reunion emotion with a birthday read outside dinner-date scenes',
    summary:
      'This expands the set into reunion emotion and proves the product can hold a birthday-specific tone outside the romantic dinner lane.',
    whyItPasses: [
      'reunion emotion reads immediately and gives the set meaningful emotional range',
      'contact, posture, and station context are coherent enough for public proof',
      'the image helps prove that the product can support birthday emotion outside dinner-date scenes',
    ],
    homepageUsage: 'supporting only',
    curationNote:
      "The line 'Back Together, Birthday Heart' is usable but still slightly copywritten, so keep it below the lead proof level.",
    editorialGroup: 'Birthday circles',
    editorialLead: 'Strong enough to support the homepage, but calmer as part of a broader emotional range.',
  },
];

export const leadHomepageExample = approvedExamples.find((example) => example.homepageUsage === 'lead hero')!;

export const homepageSupportExamples = approvedExamples.filter(
  (example) => example.homepageUsage === 'supporting only',
);

export const lowerHomepageExamples = approvedExamples.filter(
  (example) => example.homepageUsage === 'lower-page support only',
);

export const examplesEditorialGroups = [
  {
    title: 'Romantic birthday moments',
    description:
      'The most polished evening and golden-hour scenes in the approved set. Warm, celebratory, and still restrained enough to feel premium.',
  },
  {
    title: 'Birthday circles',
    description:
      'Proof that the product can hold birthday emotion outside a romantic lane, including close-friend energy and reunion context.',
  },
  {
    title: 'Memory callbacks',
    description:
      'Reflective examples that lean on remembrance and shared history rather than only on present-tense celebration.',
  },
] as const;
