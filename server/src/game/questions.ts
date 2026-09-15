import { QuestionPair } from '../types.js';

export const QUESTION_PAIRS: QuestionPair[] = [
  // --- SURVIVAL & CRISIS ---
  {
    id: 'surv-1',
    category: 'survival',
    trueQuestion: 'Who is most likely to survive a zombie apocalypse?',
    imposterQuestion: 'Who is most likely to be the first person infected in a zombie apocalypse?'
  },
  {
    id: 'surv-2',
    category: 'survival',
    trueQuestion: 'Who is most likely to successfully survive stranded alone on a deserted island?',
    imposterQuestion: 'Who is most likely to drink seawater within the first 2 hours on a deserted island?'
  },
  {
    id: 'surv-3',
    category: 'survival',
    trueQuestion: 'Who is most likely to lead the group to safety during a natural disaster?',
    imposterQuestion: 'Who is most likely to accidentally cause a natural disaster?'
  },
  {
    id: 'surv-4',
    category: 'survival',
    trueQuestion: 'Who is most likely to be an undercover secret agent?',
    imposterQuestion: 'Who is most likely to blow their cover within 5 minutes of a spy mission?'
  },
  {
    id: 'surv-5',
    category: 'survival',
    trueQuestion: 'Who is most likely to successfully escape from a high-security prison?',
    imposterQuestion: 'Who is most likely to end up in jail for something completely absurd?'
  },
  {
    id: 'surv-6',
    category: 'survival',
    trueQuestion: 'Who is most likely to successfully land an airplane in an emergency?',
    imposterQuestion: 'Who is most likely to open the emergency exit door mid-flight because they felt stuffy?'
  },
  {
    id: 'surv-7',
    category: 'survival',
    trueQuestion: 'Who is most likely to win The Hunger Games?',
    imposterQuestion: 'Who is most likely to accidentally poison themselves in The Hunger Games on day 1?'
  },

  // --- MONEY & AMBITION ---
  {
    id: 'amb-1',
    category: 'ambition',
    trueQuestion: 'Who is most likely to become a self-made billionaire?',
    imposterQuestion: 'Who is most likely to lose their entire life savings to an obvious cryptocurrency scam?'
  },
  {
    id: 'amb-2',
    category: 'ambition',
    trueQuestion: 'Who is most likely to negotiate a 50% raise on their first day of work?',
    imposterQuestion: 'Who is most likely to accidentally reply-all with an insulting meme about their boss?'
  },
  {
    id: 'amb-3',
    category: 'ambition',
    trueQuestion: 'Who is most likely to run for President of the United States?',
    imposterQuestion: 'Who is most likely to start an accidental cult in their garage?'
  },
  {
    id: 'amb-4',
    category: 'ambition',
    trueQuestion: 'Who is most likely to donate millions to charity anonymously?',
    imposterQuestion: 'Who is most likely to spend $50,000 on a fake NFT of a pixelated rock?'
  },
  {
    id: 'amb-5',
    category: 'ambition',
    trueQuestion: 'Who is most likely to write a bestselling novel or memoir?',
    imposterQuestion: 'Who is most likely to have a 400-page diary filled entirely with petty grudges?'
  },
  {
    id: 'amb-6',
    category: 'ambition',
    trueQuestion: 'Who is most likely to invent a revolutionary tech gadget?',
    imposterQuestion: 'Who is most likely to call tech support because their computer monitor was simply unplugged?'
  },

  // --- SOCIAL & PARTY ---
  {
    id: 'party-1',
    category: 'party',
    trueQuestion: 'Who is most likely to stay calm, collected, and sober at a wild party?',
    imposterQuestion: 'Who is most likely to dance on a table and break a chandelier at a party?'
  },
  {
    id: 'party-2',
    category: 'party',
    trueQuestion: 'Who is most likely to throw the most elegant dinner party?',
    imposterQuestion: 'Who is most likely to order McDonald\'s delivery to a fancy 5-star restaurant?'
  },
  {
    id: 'party-3',
    category: 'party',
    trueQuestion: 'Who is most likely to show up 30 minutes early to every event?',
    imposterQuestion: 'Who is most likely to show up 2 hours late with an iced coffee and no explanation?'
  },
  {
    id: 'party-4',
    category: 'party',
    trueQuestion: 'Who is most likely to remember everyone’s birthday without looking at a calendar?',
    imposterQuestion: 'Who is most likely to forget their own age or birthday?'
  },
  {
    id: 'party-5',
    category: 'party',
    trueQuestion: 'Who is most likely to be the mom/dad of the group keeping everyone out of trouble?',
    imposterQuestion: 'Who is most likely to convince everyone to do something illegal or reckless at 2 AM?'
  },
  {
    id: 'party-6',
    category: 'party',
    trueQuestion: 'Who is most likely to know the lyrics to every single song on the radio?',
    imposterQuestion: 'Who is most likely to confidently sing completely made-up lyrics at karaoke?'
  },
  {
    id: 'party-7',
    category: 'party',
    trueQuestion: 'Who is most likely to win a high-stakes poker tournament with a straight poker face?',
    imposterQuestion: 'Who is most likely to start crying immediately when someone accuses them in a game?'
  },

  // --- DATING & RELATIONSHIPS (SPICY) ---
  {
    id: 'spicy-1',
    category: 'spicy',
    trueQuestion: 'Who is most likely to propose to someone on the very first date?',
    imposterQuestion: 'Who is most likely to ghost someone after three years of talking every day?'
  },
  {
    id: 'spicy-2',
    category: 'spicy',
    trueQuestion: 'Who is most likely to marry for pure love, regardless of wealth?',
    imposterQuestion: 'Who is most likely to marry an 85-year-old billionaire strictly for the inheritance?'
  },
  {
    id: 'spicy-3',
    category: 'spicy',
    trueQuestion: 'Who is most likely to be a hopeless romantic who writes love poetry?',
    imposterQuestion: 'Who is most likely to accidentally swipe right on their ex\'s parent on Tinder?'
  },
  {
    id: 'spicy-4',
    category: 'spicy',
    trueQuestion: 'Who is most likely to stay best friends with all of their exes?',
    imposterQuestion: 'Who is most likely to fake their own death to get out of an awkward conversation?'
  },
  {
    id: 'spicy-5',
    category: 'spicy',
    trueQuestion: 'Who is most likely to accidentally reveal someone\'s deep secret in front of everyone?',
    imposterQuestion: 'Who is most likely to take a friend\'s deepest secret to their grave?'
  },

  // --- CHAOS & ABSURD ---
  {
    id: 'chaos-1',
    category: 'chaos',
    trueQuestion: 'Who is most likely to adopt 10 stray animals without asking their roommates?',
    imposterQuestion: 'Who is most likely to be terrified of a harmless golden retriever puppy?'
  },
  {
    id: 'chaos-2',
    category: 'chaos',
    trueQuestion: 'Who is most likely to go viral on TikTok for doing something incredibly talented?',
    imposterQuestion: 'Who is most likely to go viral on TikTok for tripping and falling into a public fountain?'
  },
  {
    id: 'chaos-3',
    category: 'chaos',
    trueQuestion: 'Who is most likely to successfully befriend a wild raccoon or bear?',
    imposterQuestion: 'Who is most likely to scream bloody murder at a tiny garden snail?'
  },
  {
    id: 'chaos-4',
    category: 'chaos',
    trueQuestion: 'Who is most likely to sleep peacefully through an active fire alarm in their room?',
    imposterQuestion: 'Who is most likely to wake up at 5:00 AM on vacation to do extreme yoga?'
  },
  {
    id: 'chaos-5',
    category: 'chaos',
    trueQuestion: 'Who is most likely to spend 8 hours arguing with strangers in YouTube comments?',
    imposterQuestion: 'Who is most likely to never check or reply to their unread text messages for 3 months?'
  },
  {
    id: 'chaos-6',
    category: 'chaos',
    trueQuestion: 'Who is most likely to accidentally start a kitchen fire trying to boil plain water?',
    imposterQuestion: 'Who is most likely to win MasterChef with a gourmet 7-course meal?'
  },
  {
    id: 'chaos-7',
    category: 'chaos',
    trueQuestion: 'Who is most likely to get lost inside an IKEA store for 3 days?',
    imposterQuestion: 'Who is most likely to assemble a 200-piece IKEA wardrobe in under 15 minutes without instructions?'
  },
  {
    id: 'chaos-8',
    category: 'chaos',
    trueQuestion: 'Who is most likely to believe in wild alien conspiracy theories?',
    imposterQuestion: 'Who is most likely to be an alien studying human behavior?'
  },
  {
    id: 'chaos-9',
    category: 'chaos',
    trueQuestion: 'Who is most likely to laugh at the most inappropriate moment at a serious funeral?',
    imposterQuestion: 'Who is most likely to burst into tears during an animated Pixar movie intro?'
  },
  {
    id: 'chaos-10',
    category: 'chaos',
    trueQuestion: 'Who is most likely to move to a foreign country tomorrow on a complete whim?',
    imposterQuestion: 'Who is most likely to order the exact same dish at every single restaurant for the rest of their life?'
  },
  {
    id: 'chaos-11',
    category: 'chaos',
    trueQuestion: 'Who is most likely to get kicked out of an all-you-can-eat buffet for eating too much?',
    imposterQuestion: 'Who is most likely to survive solely on protein shakes and cold brew for a week?'
  },
  {
    id: 'chaos-12',
    category: 'chaos',
    trueQuestion: 'Who is most likely to accidentally lock themselves out of their own house completely naked?',
    imposterQuestion: 'Who is most likely to have a pristine 5-lock security system on their front door?'
  }
];

export function getRandomQuestionPair(excludeIds: string[] = [], categories?: string[]): QuestionPair {
  let pool = QUESTION_PAIRS;
  if (categories && categories.length > 0) {
    pool = pool.filter(p => categories.includes(p.category));
  }
  const available = pool.filter(p => !excludeIds.includes(p.id));
  const finalPool = available.length > 0 ? available : pool;
  const randomIndex = Math.floor(Math.random() * finalPool.length);
  return finalPool[randomIndex];
}

