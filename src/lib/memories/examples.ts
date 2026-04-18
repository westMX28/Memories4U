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
  homepageUsage: string;
  curationNote: string;
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
      'The strongest current public-proof image: emotionally warm, clearly birthday-specific, and credible enough to lead the first proof pass.',
    whyItPasses: [
      'strongest emotional warmth of the current cleared set',
      'identity holds for both people',
      'birthday cues read clearly without becoming gimmicky',
      'the overlay now feels editorial rather than operator-generated',
    ],
    homepageUsage: 'dominant homepage proof image',
    curationNote:
      'Approved for both homepage and examples-page use. This is the preferred lead image for the public proof surface.',
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
      'A supporting proof asset that expands the emotional range without pretending the catalog is broad yet.',
    whyItPasses: [
      'recognizability remains strong',
      'sunset and balloon cues create a clear celebratory feel',
      'the short overlay no longer leaks QA or operator wording',
    ],
    homepageUsage: 'supporting proof only',
    curationNote:
      'Approved for the examples page and lower-page support blocks, but intentionally not the lead homepage treatment.',
  },
];
