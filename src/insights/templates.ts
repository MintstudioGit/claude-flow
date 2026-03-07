/**
 * Relationship Insight Generator — Template Data
 * 20–30 variations per state × 12 states = thousands of combinations
 */

import type {
  BehaviorState,
  InsightTemplate,
  ActionTemplate,
  ModeTranslation,
} from './types.js';

// ─── Insight Templates ────────────────────────────────────────────────────────

export const INSIGHT_TEMPLATES: InsightTemplate[] = [
  // emotionally_sensitive
  {
    state: 'emotionally_sensitive',
    type: 'awareness',
    templates: [
      'Tone may matter more than words today.',
      'You might feel more reactive to small things.',
      'Conversations may feel heavier than usual.',
      'You may notice subtle emotional shifts throughout the day.',
      'Emotions may feel closer to the surface right now.',
      'Small comments may land differently than intended.',
      'You could be picking up on things others may not even notice.',
      'Today feelings may arrive faster than thoughts.',
      'Your emotional radar is heightened right now.',
      'Little things may carry more weight than usual.',
      'Sensitivity can be a gift — it also needs space.',
      'Today you may feel what is usually easy to let go of.',
      'Emotional signals will be louder today — listen carefully.',
      'The way things are said may matter more than what is said.',
      'You may need more gentleness from others today.',
      'Processing emotions may take a little longer.',
      'Small misunderstandings could feel more personal.',
      'You might find yourself reading between the lines more.',
      'Your inner world may feel busier than your outer world.',
      'Today could be a day where space helps more than conversation.',
    ],
  },
  {
    state: 'emotionally_sensitive',
    type: 'relationship',
    templates: [
      'Small misunderstandings may feel bigger today.',
      'Your partner may not realize how their tone is landing.',
      'Slowing conversations down may protect the connection today.',
      'Gentleness from both sides will matter today.',
      'A small act of kindness could mean a great deal right now.',
      'You may need your partner to choose their words carefully.',
      'Connection today may feel deeper if given the right conditions.',
      'Feeling seen today matters more than being right.',
    ],
  },

  // conflict_sensitive
  {
    state: 'conflict_sensitive',
    type: 'awareness',
    templates: [
      'Small disagreements could escalate faster today.',
      'Timing will matter more than the topic in discussions.',
      'Pausing before reacting may save a lot today.',
      'The urge to defend may feel stronger than usual.',
      'You may feel more guarded in conversations.',
      'Today arguments may start small and grow quickly.',
      'Friction that is usually easy to brush off may stick.',
      'Difficult conversations are best saved for later today.',
      'You might notice an edge in your patience right now.',
      'The tone of conversations will set everything.',
      'Small provocations may feel like big ones today.',
      'It may be harder to let things go without addressing them.',
      'You may feel a need to protect yourself in exchanges.',
      'Conflict today is not about being right — it is about timing.',
      'Stepping back may feel harder but will help most.',
      'Your nervous system may be primed for conflict today.',
      'Listening carefully before speaking will defuse a lot.',
      'Today choosing peace is stronger than winning.',
      'Emotional triggers are closer to the surface right now.',
      'The safest conversations today are calm and short.',
    ],
  },
  {
    state: 'conflict_sensitive',
    type: 'relationship',
    templates: [
      'Today may require softer language to avoid escalation.',
      'Your partner may not understand why small things feel big.',
      'Disagreements need extra care in how they start today.',
      'Timing of conversations matters more than their content today.',
      'Choosing not to fight today is an act of love.',
      'Patience in communication will protect the relationship today.',
    ],
  },

  // low_energy
  {
    state: 'low_energy',
    type: 'awareness',
    templates: [
      'Your energy may need protecting today.',
      'Rest is a form of self-care, not avoidance.',
      'Low energy days do not require high-effort conversations.',
      'Your body may be asking for more than your mind wants to give.',
      'Today gentleness with yourself matters.',
      'Even small efforts may feel bigger today.',
      'It is okay to do less and feel okay about it.',
      'Reserve your energy for what really matters today.',
      'Quiet moments may restore you more than active ones.',
      'Your needs are valid even when they are simple.',
      'You may feel slower to start today — and that is fine.',
      'Giving yourself permission to rest removes guilt.',
      'Energy will return — today is just about maintaining.',
      'Less is more today in every area.',
      'Your capacity today may be smaller and that is okay.',
      'Recharging quietly is productive in its own way.',
      'Being kind to your energy is being kind to yourself.',
      'Today is a recovery day even if nothing major happened.',
      'Low energy is a signal worth listening to.',
      'Some of the best decisions are made when we slow down.',
    ],
  },
  {
    state: 'low_energy',
    type: 'relationship',
    templates: [
      'Your partner may need to carry more of the weight today.',
      'Low energy days are best met with presence, not pressure.',
      'Simple connection matters more than deep conversation today.',
      'Asking for what you need is easier than hinting at it.',
      'Even quiet time together can be deeply connecting.',
      'Today just being nearby may be enough.',
    ],
  },

  // seeking_space
  {
    state: 'seeking_space',
    type: 'awareness',
    templates: [
      'You may need room to breathe today.',
      'Wanting space is not the same as wanting distance.',
      'Your inner world may need quiet to process right now.',
      'Time alone today may help more than time together.',
      'Needing space is a sign you know what you need.',
      'Solitude today is not withdrawal — it is recharging.',
      'The urge to be alone deserves respect, not guilt.',
      'Your thoughts may need space to settle today.',
      'What feels like distance may just be self-preservation.',
      'Being alone with your thoughts can bring unexpected clarity.',
      'Today the best conversations may be internal ones.',
      'Space is not rejection — it is self-regulation.',
      'It is healthy to need quiet after a full week.',
      'Today solitude may speak louder than company.',
      'Giving yourself space gives others space too.',
      'Introversion today is not a problem to solve.',
      'Space today may prevent friction tomorrow.',
      'Your nervous system may be asking to decompress.',
      'Going inward is not the same as shutting others out.',
      'Today quiet time may be the most productive kind.',
    ],
  },
  {
    state: 'seeking_space',
    type: 'relationship',
    templates: [
      'Your partner may need to understand you need breathing room today.',
      'Communicating your need for space protects the relationship.',
      'Healthy space is a form of respect in relationships.',
      'Being honest about needing alone time avoids misreading.',
      'Space today will help you show up better tomorrow.',
    ],
  },

  // seeking_connection
  {
    state: 'seeking_connection',
    type: 'awareness',
    templates: [
      'You may be craving closeness more than usual today.',
      'The need for connection is one of the most human needs.',
      'Today reaching out may feel easier than usual.',
      'Something in you wants to feel less alone right now.',
      'Connection does not need to be deep to be meaningful.',
      'Small moments of belonging matter greatly today.',
      'You may want to feel seen and understood today.',
      'Warmth from others will land deeply right now.',
      'You may be more open to intimacy than usual.',
      'Today vulnerability might feel like a superpower.',
      'Reaching for connection today is a sign of strength.',
      'Your need to bond today is worth honoring.',
      'Even simple shared experiences feel meaningful today.',
      'You may want more emotional presence from those around you.',
      'Connection today could come from unexpected places.',
      'Being emotionally open today will draw others in.',
      'Today you may feel the need to bridge distance.',
      'Small gestures of affection will mean a lot today.',
      'You may crave quality time over quantity today.',
      'Being truly heard today would restore something in you.',
    ],
  },
  {
    state: 'seeking_connection',
    type: 'relationship',
    templates: [
      'Today is a good day to reach for closeness.',
      'Your partner may not know how much you need them right now.',
      'Simple moments of togetherness will feel especially meaningful.',
      'Asking for connection is easier than waiting for it.',
      'Today is a day for warmth, not logistics.',
      'Emotional presence from your partner matters more than words.',
    ],
  },

  // anxious
  {
    state: 'anxious',
    type: 'awareness',
    templates: [
      'Your mind may be running a little faster than usual today.',
      'Worry thoughts may feel more convincing than they really are.',
      'The future may feel closer and more uncertain today.',
      'Anxiety can make small things feel like big threats.',
      'Grounding yourself in the present helps today.',
      'What you feel is real — but it is not always the truth.',
      'Your nervous system may be in high-alert today.',
      'Breathing deliberately may calm more than thinking through.',
      'Today overthinking may be the main obstacle.',
      'You may be anticipating problems that have not arrived yet.',
      'Anxious energy can be channeled — choose where carefully.',
      'Your body may be holding tension you have not fully noticed.',
      'Today is a day to reduce inputs and simplify.',
      'When anxious, shorter conversations tend to go better.',
      'You may feel the need to resolve things that cannot be rushed.',
    ],
  },
  {
    state: 'anxious',
    type: 'relationship',
    templates: [
      'Your partner may sense something is off — openness helps.',
      'Anxiety can make you misread neutral situations as threats.',
      'Communicating your anxiety disarms it.',
      'Today reassurance from your partner could go a long way.',
      'Sharing your worry reduces its power.',
    ],
  },

  // withdrawn
  {
    state: 'withdrawn',
    type: 'awareness',
    templates: [
      'You may be pulling inward today without fully knowing why.',
      'Withdrawal can be a form of self-protection.',
      'Today being quiet is not the same as being distant.',
      'Something may be processing under the surface right now.',
      'You may need patience from others while you come back to yourself.',
      'It is okay not to explain why you need quiet today.',
      'Withdrawn moments can carry hidden insight.',
      'You may be reflecting more deeply than usual.',
      'Rest and quiet are valid responses to feeling overwhelmed.',
      'Today just maintaining equilibrium is enough.',
    ],
  },
  {
    state: 'withdrawn',
    type: 'relationship',
    templates: [
      'Your partner may worry — a small reassurance helps.',
      'Being withdrawn does not mean something is wrong with the relationship.',
      'Today a brief "I just need quiet" goes further than silence.',
      'Let your partner know you are okay — even in few words.',
    ],
  },

  // open_communicative
  {
    state: 'open_communicative',
    type: 'awareness',
    templates: [
      'Today words may come more easily than usual.',
      'You may feel ready to address things that have been sitting.',
      'Conversations started today have good energy behind them.',
      'Your openness today is an asset — use it well.',
      'This is a good day to share something you have been holding.',
      'You may find it easier to express how you really feel.',
      'Today honesty feels less scary than usual.',
      'Your communication energy is high — lead with kindness.',
    ],
  },
  {
    state: 'open_communicative',
    type: 'relationship',
    templates: [
      'Today may be the right moment for a conversation you have been avoiding.',
      'Your openness today can help your partner open up too.',
      'Hard topics approached now have a better chance of landing well.',
      'Use today\'s clarity to strengthen the foundation.',
    ],
  },

  // irritable
  {
    state: 'irritable',
    type: 'awareness',
    templates: [
      'Small things may annoy you more than they usually would.',
      'Your patience may have a shorter runway today.',
      'Irritability is often a signal from something deeper.',
      'Today what irritates you may not be the real issue.',
      'You may find yourself reacting before you can think.',
      'The smallest thing could tip your mood today.',
      'Irritation often means a need is not being met.',
      'Today taking space before engaging will save you.',
      'Notice the irritation — but don't let it steer.',
      'You may feel short-fused today without a clear reason.',
      'Irritability is a language — what is it saying?',
      'Today less conversation, more breathing.',
      'Behind irritation is usually something that needs attention.',
      'Give yourself permission to feel it without acting on it.',
      'Today even well-meaning things may land wrong.',
    ],
  },
  {
    state: 'irritable',
    type: 'relationship',
    templates: [
      'Your partner may accidentally step into your triggers today.',
      'Being upfront about feeling irritable prevents misunderstandings.',
      'Today your partner needs your honesty more than your patience.',
      'Irritability can make love feel further away than it is.',
      'Saying "I'm off today" is more connecting than silence.',
    ],
  },

  // reflective
  {
    state: 'reflective',
    type: 'awareness',
    templates: [
      'You may feel drawn inward in a thoughtful way today.',
      'This is a good day to understand something about yourself.',
      'Reflection today could unlock something you have been carrying.',
      'Your past may feel close — use that insight gently.',
      'Quiet reflection today may answer questions words cannot.',
      'Today depth matters more than distraction.',
      'You may feel contemplative in ways that feel meaningful.',
      'Journaling or quiet time today may be clarifying.',
      'Something wants to be understood today — let it be.',
    ],
  },
  {
    state: 'reflective',
    type: 'relationship',
    templates: [
      'Today you may understand your relationship patterns more clearly.',
      'Reflection can be a gift if you share what you discover.',
      'Use today\'s clarity to offer something true to your partner.',
    ],
  },

  // high_energy
  {
    state: 'high_energy',
    type: 'awareness',
    templates: [
      'You may feel more motivated and alive today.',
      'Today has good energy — use it on what matters.',
      'High energy days are rare — make them count.',
      'You may be quicker to act and decide today.',
      'Enthusiasm today could be contagious in the best way.',
      'Today is good for starting things you have been putting off.',
    ],
  },
  {
    state: 'high_energy',
    type: 'relationship',
    templates: [
      'Your energy today can lift your partner\'s mood too.',
      'Plan something small and meaningful — today you have the drive.',
      'Use today\'s momentum to invest in the relationship.',
    ],
  },

  // craving_validation
  {
    state: 'craving_validation',
    type: 'awareness',
    templates: [
      'You may need to feel appreciated more than usual today.',
      'The need to be seen is deeply human — yours matters.',
      'Today small recognitions will land deeply.',
      'You may be more sensitive to feeling overlooked.',
      'Validation today does not have to come from big words.',
      'You may find yourself waiting to feel acknowledged.',
      'Feeling unseen today could make everything else feel harder.',
      'Today one genuine word of appreciation could change everything.',
      'It is okay to need your efforts to be noticed.',
    ],
  },
  {
    state: 'craving_validation',
    type: 'relationship',
    templates: [
      'Your partner may not know how much a kind word means today.',
      'Asking for appreciation is valid — it is not needy.',
      'Today expressing what you need will help both of you.',
      'Your partner\'s acknowledgment today could restore a lot.',
    ],
  },
];

// ─── Action Templates ─────────────────────────────────────────────────────────

export const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    state: 'emotionally_sensitive',
    actions: [
      'Try slowing conversations down today.',
      'Give yourself extra grace in how you respond.',
      'Before reacting, take one slow breath.',
      'Let yourself feel it — then choose how to respond.',
      'Ask for gentleness from those around you.',
    ],
  },
  {
    state: 'conflict_sensitive',
    actions: [
      'Pause before entering any difficult conversation.',
      'If tension rises, suggest continuing later.',
      'Choose one word of patience before responding.',
      'Let go of one thing that does not need addressing today.',
      'Ask a question instead of making a statement.',
    ],
  },
  {
    state: 'low_energy',
    actions: [
      'Protect at least 20 minutes of real rest today.',
      'Say no to one thing that is not essential.',
      'Eat something nourishing and drink water.',
      'Let yourself move slowly — do not fight it.',
      'Do one small thing that restores rather than drains.',
    ],
  },
  {
    state: 'seeking_space',
    actions: [
      'Give yourself at least 30 minutes alone today.',
      'Let your partner know you need a little space — briefly.',
      'Find one quiet place and just breathe.',
      'Decline one obligation that is not necessary.',
      'Protect your alone time without guilt.',
    ],
  },
  {
    state: 'seeking_connection',
    actions: [
      'Reach out to someone you have been meaning to contact.',
      'Ask your partner one genuine question tonight.',
      'Tell your partner one appreciation you have been holding.',
      'Plan something small but shared today.',
      'Share how you are actually feeling instead of "I\'m fine."',
    ],
  },
  {
    state: 'anxious',
    actions: [
      'Write down three things that are actually okay right now.',
      'Take five slow breaths before any big decision.',
      'Share your worry with one person you trust.',
      'Reduce inputs — less phone, more presence.',
      'Do one physical thing to ground your body.',
    ],
  },
  {
    state: 'withdrawn',
    actions: [
      'Send one message to let someone know you are okay.',
      'Give yourself permission to be quiet — no explanation needed.',
      'Do one small thing that connects you to yourself.',
      'Let your partner know you just need some time.',
      'Find comfort in a simple familiar routine.',
    ],
  },
  {
    state: 'open_communicative',
    actions: [
      'Share one thing you have been holding back.',
      'Start a conversation you have been avoiding.',
      'Use today\'s clarity to say something true.',
      'Write down what you want to express before speaking.',
      'Check in with your partner on something meaningful.',
    ],
  },
  {
    state: 'irritable',
    actions: [
      'Say "I\'m a little off today" to those closest to you.',
      'Take a walk before a difficult conversation.',
      'Identify one unmet need behind the irritation.',
      'Give yourself space before engaging.',
      'Breathe out longer than you breathe in.',
    ],
  },
  {
    state: 'reflective',
    actions: [
      'Write down one thing you have been trying to understand.',
      'Spend 10 minutes in silence before the day starts.',
      'Share one insight with your partner tonight.',
      'Let today\'s reflection lead to one small change.',
      'Honor what came up — write it down.',
    ],
  },
  {
    state: 'high_energy',
    actions: [
      'Start something meaningful you have been putting off.',
      'Surprise your partner with a small thoughtful gesture.',
      'Use today\'s energy to move your relationship forward.',
      'Do the thing you have been waiting to feel ready for.',
      'Share your energy — it is contagious.',
    ],
  },
  {
    state: 'craving_validation',
    actions: [
      'Tell your partner one thing you need to hear today.',
      'Acknowledge your own effort — out loud or in writing.',
      'Ask for appreciation directly — it is not a weakness.',
      'Notice and receive any kindness offered today.',
      'Give yourself one genuine compliment.',
    ],
  },
];

// ─── Mode Translations ────────────────────────────────────────────────────────

export const MODE_TRANSLATIONS: ModeTranslation[] = [
  {
    state: 'emotionally_sensitive',
    female: [
      'You may feel more sensitive to tone and energy today.',
      'Small things may move you more than usual — that\'s okay.',
      'Today your emotional depth is heightened.',
    ],
    male: [
      'She may react more strongly to how things are said today.',
      'Gentle communication will land better than explanations.',
      'Today tone matters more than logic.',
    ],
    couple: [
      'Today may require softer conversations between you.',
      'Understanding each other matters more than winning.',
      'Choose gentleness over being right today.',
    ],
  },
  {
    state: 'conflict_sensitive',
    female: [
      'You may find yourself more easily hurt by tension today.',
      'Avoid starting hard conversations — timing matters.',
      'Today protecting your peace is the priority.',
    ],
    male: [
      'She may be more sensitive to disagreements today.',
      'Avoid unnecessary friction — choose calm over correctness.',
      'Today de-escalation is the most powerful move.',
    ],
    couple: [
      'Today careful communication will protect the relationship.',
      'Disagreements need extra gentleness today.',
      'Choosing calm together is a form of love.',
    ],
  },
  {
    state: 'low_energy',
    female: [
      'Today your body may be asking for more rest than usual.',
      'Low energy today is not failure — it\'s honesty.',
      'Give yourself permission to do less.',
    ],
    male: [
      'She may have less capacity than usual today.',
      'Support her by requiring less and offering more.',
      'Simple presence is the most helpful thing today.',
    ],
    couple: [
      'Today is a day to meet each other gently.',
      'Low energy shared is still connection.',
      'Simplify expectations and enjoy quiet together.',
    ],
  },
  {
    state: 'seeking_space',
    female: [
      'Today you may need room to breathe on your own.',
      'Needing space is self-awareness, not distance.',
      'Honor your need for quiet without guilt.',
    ],
    male: [
      'She may need space today — it\'s not about you.',
      'Give her room without making it a topic.',
      'Respecting her space now strengthens connection later.',
    ],
    couple: [
      'Today some breathing room for both of you may help.',
      'Healthy space within connection is a good sign.',
      'Let each other recharge without interpretation.',
    ],
  },
  {
    state: 'seeking_connection',
    female: [
      'Today you may crave closeness more than usual.',
      'Reaching for connection today is brave and valid.',
      'Let yourself want to be close.',
    ],
    male: [
      'She may want more closeness and warmth from you today.',
      'Small acts of affection will mean a great deal.',
      'Be present — it is more than enough today.',
    ],
    couple: [
      'Today is a good day to move toward each other.',
      'Simple togetherness will feel especially meaningful.',
      'Reach for each other — today the connection is available.',
    ],
  },
  {
    state: 'anxious',
    female: [
      'Your mind may be running faster than usual today.',
      'What you feel is real — but it may not be the full truth.',
      'Grounding yourself in the present will help.',
    ],
    male: [
      'She may be overthinking more than usual today.',
      'Reassurance and calm presence matter most right now.',
      'Don\'t try to solve it — just stay close.',
    ],
    couple: [
      'Today anxiety in one partner affects both.',
      'Calm, steady presence from each other helps.',
      'Name what you\'re feeling — it reduces the power of worry.',
    ],
  },
  {
    state: 'withdrawn',
    female: [
      'You may be pulling inward without fully knowing why.',
      'This is okay — give yourself the quiet you need.',
      'Withdrawal is sometimes the body\'s wisdom.',
    ],
    male: [
      'She may be quieter than usual — give her space without distance.',
      'A gentle "I\'m here" is better than pushing for conversation.',
      'Don\'t interpret silence as rejection.',
    ],
    couple: [
      'One of you may need more quiet today.',
      'Respecting that need is an act of love.',
      'Stay close without requiring engagement.',
    ],
  },
  {
    state: 'open_communicative',
    female: [
      'Today words may come easier than usual.',
      'This is a good day to say something you have been holding.',
      'Your clarity today is a gift — use it.',
    ],
    male: [
      'She may be more open to real conversation today.',
      'This is a good moment to address something important.',
      'Meet her openness with honesty.',
    ],
    couple: [
      'Today honest conversation has a natural opening.',
      'Use this window to strengthen the foundation.',
      'Both of you may find it easier to be real today.',
    ],
  },
  {
    state: 'irritable',
    female: [
      'Small things may get under your skin more than usual today.',
      'The irritation is a signal — what does it need?',
      'You don\'t have to act on every feeling today.',
    ],
    male: [
      'She may be more reactive to small things today.',
      'Don\'t take it personally — give her room.',
      'Today calm is more powerful than being right.',
    ],
    couple: [
      'Today both of you may need extra patience.',
      'Irritability is often about something underneath.',
      'Be kind to each other — today it costs more and matters more.',
    ],
  },
  {
    state: 'reflective',
    female: [
      'You may feel drawn to understanding something today.',
      'Today introspection is productive — let it happen.',
      'Quiet clarity may emerge if you give it space.',
    ],
    male: [
      'She may be in a thoughtful, reflective mood today.',
      'This is a good time to ask meaningful questions.',
      'Don\'t push for action — let her reflect.',
    ],
    couple: [
      'Today could bring meaningful understanding between you.',
      'Reflective conversations tend to go deeper.',
      'Something important may surface if you let it.',
    ],
  },
  {
    state: 'high_energy',
    female: [
      'You may feel more alive and motivated today.',
      'Use this energy on what genuinely matters to you.',
      'Today is a day to start something.',
    ],
    male: [
      'She may have extra energy and drive today.',
      'Match her momentum — it could be a great shared day.',
      'This is a good day to plan something together.',
    ],
    couple: [
      'Today\'s energy can bring you closer if you channel it.',
      'Plan something together — the motivation is there.',
      'Use today to invest in your shared life.',
    ],
  },
  {
    state: 'craving_validation',
    female: [
      'Today you may need to feel seen and appreciated.',
      'That need is valid — expressing it is strength.',
      'Small acknowledgments will land deeply today.',
    ],
    male: [
      'She may need more appreciation than usual today.',
      'Notice her efforts and say something specific.',
      'One genuine compliment today could shift everything.',
    ],
    couple: [
      'Today acknowledgment matters more than solutions.',
      'Tell each other one thing you appreciate.',
      'Being seen by your partner is its own kind of love.',
    ],
  },
];

// ─── SEO Tag Mappings ─────────────────────────────────────────────────────────

export const SEO_TAG_MAPPINGS: Record<string, BehaviorState[]> = {
  'why-small-things-trigger-arguments-before-period': ['emotionally_sensitive', 'conflict_sensitive'],
  'feeling-disconnected-from-partner-during-luteal': ['seeking_connection', 'withdrawn'],
  'how-to-communicate-during-pms': ['conflict_sensitive', 'irritable'],
  'why-i-need-alone-time-before-period': ['seeking_space', 'low_energy'],
  'anxiety-before-period-relationship-effects': ['anxious', 'conflict_sensitive'],
  'how-cycle-affects-relationship-patterns': ['emotionally_sensitive', 'reflective'],
  'low-libido-and-relationship-connection': ['low_energy', 'seeking_connection'],
  'why-i-feel-invisible-in-my-relationship': ['craving_validation', 'withdrawn'],
  'partner-not-understanding-pms-mood': ['irritable', 'craving_validation'],
  'high-energy-ovulation-relationship-intimacy': ['high_energy', 'open_communicative', 'seeking_connection'],
};
