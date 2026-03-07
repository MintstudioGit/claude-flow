/**
 * Tests — Relationship Insight Generator
 */

// Jest globals are auto-injected
import { InsightGenerator, generateInsight, generateNotification } from '../../src/insights/generator.js';
import { INSIGHT_TEMPLATES, ACTION_TEMPLATES, MODE_TRANSLATIONS } from '../../src/insights/templates.js';
import type { UserInsightContext, RelationshipMode, BehaviorState } from '../../src/insights/types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeContext = (
  overrides: Partial<UserInsightContext> = {}
): UserInsightContext => ({
  userId: 'user-001',
  mode: 'female',
  activeStates: ['emotionally_sensitive', 'conflict_sensitive'],
  recentInsights: [],
  ...overrides,
});

const fixedDate = new Date('2024-03-15T12:00:00Z');

// ─── Template Data Tests ──────────────────────────────────────────────────────

describe('Template Data', () => {
  it('has insight templates for all 12 behavior states', () => {
    const states: BehaviorState[] = [
      'emotionally_sensitive', 'conflict_sensitive', 'low_energy',
      'seeking_space', 'seeking_connection', 'anxious',
      'withdrawn', 'open_communicative', 'irritable',
      'reflective', 'high_energy', 'craving_validation',
    ];
    for (const state of states) {
      const templates = INSIGHT_TEMPLATES.filter((t) => t.state === state);
      expect(templates.length, `Missing templates for ${state}`).toBeGreaterThan(0);
    }
  });

  it('each insight template has at least 5 variations', () => {
    for (const template of INSIGHT_TEMPLATES) {
      expect(
        template.templates.length,
        `${template.state}/${template.type} has too few templates`
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('has action templates for all 12 behavior states', () => {
    const states: BehaviorState[] = [
      'emotionally_sensitive', 'conflict_sensitive', 'low_energy',
      'seeking_space', 'seeking_connection', 'anxious',
      'withdrawn', 'open_communicative', 'irritable',
      'reflective', 'high_energy', 'craving_validation',
    ];
    for (const state of states) {
      const template = ACTION_TEMPLATES.find((t) => t.state === state);
      expect(template, `Missing action template for ${state}`).toBeDefined();
      expect(template!.actions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('has mode translations for all 12 behavior states', () => {
    const states: BehaviorState[] = [
      'emotionally_sensitive', 'conflict_sensitive', 'low_energy',
      'seeking_space', 'seeking_connection', 'anxious',
      'withdrawn', 'open_communicative', 'irritable',
      'reflective', 'high_energy', 'craving_validation',
    ];
    for (const state of states) {
      const translation = MODE_TRANSLATIONS.find((t) => t.state === state);
      expect(translation, `Missing mode translation for ${state}`).toBeDefined();
      expect(translation!.female.length).toBeGreaterThanOrEqual(2);
      expect(translation!.male.length).toBeGreaterThanOrEqual(2);
      expect(translation!.couple.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all insight templates are non-empty strings', () => {
    for (const template of INSIGHT_TEMPLATES) {
      for (const text of template.templates) {
        expect(typeof text).toBe('string');
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Generator Core ───────────────────────────────────────────────────────────

describe('InsightGenerator.generate()', () => {
  let generator: InsightGenerator;

  beforeEach(() => {
    generator = new InsightGenerator();
  });

  it('returns a valid GeneratedInsight object', () => {
    const insight = generator.generate(makeContext(), fixedDate);
    expect(insight).toMatchObject({
      states: expect.any(Array),
      insight: expect.any(String),
      supportingInsight: expect.any(String),
      action: expect.any(String),
      mode: expect.any(String),
      type: expect.any(String),
      generatedAt: expect.any(Date),
    });
  });

  it('insight and action are non-empty strings', () => {
    const insight = generator.generate(makeContext(), fixedDate);
    expect(insight.insight.trim().length).toBeGreaterThan(0);
    expect(insight.action.trim().length).toBeGreaterThan(0);
  });

  it('is deterministic — same output for same user + date', () => {
    const ctx = makeContext();
    const a = generator.generate(ctx, fixedDate);
    const b = generator.generate(ctx, fixedDate);
    expect(a.insight).toBe(b.insight);
    expect(a.action).toBe(b.action);
    expect(a.type).toBe(b.type);
  });

  it('produces different output for different dates', () => {
    const ctx = makeContext();
    const date1 = new Date('2024-03-15');
    const date2 = new Date('2024-03-16');
    const a = generator.generate(ctx, date1);
    const b = generator.generate(ctx, date2);
    // Different dates → different seeds → statistically different output
    // (could be same by coincidence but very unlikely with this many templates)
    const isDifferent = a.insight !== b.insight || a.action !== b.action;
    expect(isDifferent).toBe(true);
  });

  it('produces different output for different users on same date', () => {
    const ctx1 = makeContext({ userId: 'user-001' });
    const ctx2 = makeContext({ userId: 'user-002' });
    const a = generator.generate(ctx1, fixedDate);
    const b = generator.generate(ctx2, fixedDate);
    const isDifferent = a.insight !== b.insight || a.action !== b.action;
    expect(isDifferent).toBe(true);
  });

  it('throws when no active states provided', () => {
    const ctx = makeContext({ activeStates: [] });
    expect(() => generator.generate(ctx, fixedDate)).toThrow();
  });

  it('respects maxStates config — uses at most N states', () => {
    const gen = new InsightGenerator({ maxStates: 2 });
    const ctx = makeContext({
      activeStates: ['emotionally_sensitive', 'conflict_sensitive', 'low_energy', 'anxious'],
    });
    const insight = gen.generate(ctx, fixedDate);
    expect(insight.states.length).toBeLessThanOrEqual(2);
  });

  it('works with a single active state', () => {
    const ctx = makeContext({ activeStates: ['low_energy'] });
    const insight = generator.generate(ctx, fixedDate);
    expect(insight.states).toEqual(['low_energy']);
    expect(insight.supportingInsight).toBe('');
  });
});

// ─── Relationship Mode Translation ───────────────────────────────────────────

describe('Mode Translation', () => {
  const modes: RelationshipMode[] = ['female', 'male', 'couple'];
  const generator = new InsightGenerator();

  for (const mode of modes) {
    it(`generates valid insight for ${mode} mode`, () => {
      const ctx = makeContext({ mode });
      const insight = generator.generate(ctx, fixedDate);
      expect(insight.mode).toBe(mode);
      expect(insight.insight.trim().length).toBeGreaterThan(0);
    });
  }

  it('produces different insight text for female vs male mode on same state+date', () => {
    const date = new Date('2024-06-01');
    const female = generator.generate(makeContext({ mode: 'female', userId: 'u1' }), date);
    const male = generator.generate(makeContext({ mode: 'male', userId: 'u1' }), date);
    // Translations are mode-specific — insights should differ
    expect(female.insight).not.toBe(male.insight);
  });
});

// ─── Insight Type Rotation ────────────────────────────────────────────────────

describe('Insight Type Rotation', () => {
  it('rotates through awareness / relationship / action types', () => {
    const generator = new InsightGenerator({ rotateInsightTypes: true });
    const types = new Set<string>();

    for (let day = 0; day < 20; day++) {
      const date = new Date('2024-03-01');
      date.setDate(date.getDate() + day);
      const insight = generator.generate(makeContext(), date);
      types.add(insight.type);
    }

    // Over 20 days we expect all three types to appear
    expect(types.has('awareness')).toBe(true);
    expect(types.has('relationship')).toBe(true);
    expect(types.has('action')).toBe(true);
  });

  it('does not rotate when rotateInsightTypes is false', () => {
    const generator = new InsightGenerator({ rotateInsightTypes: false });
    const types = new Set<string>();

    for (let day = 0; day < 10; day++) {
      const date = new Date('2024-03-01');
      date.setDate(date.getDate() + day);
      const insight = generator.generate(makeContext(), date);
      types.add(insight.type);
    }

    expect(types.has('awareness')).toBe(true);
    // Only awareness type when rotation is off
    expect(types.size).toBe(1);
  });
});

// ─── Batch Generation ─────────────────────────────────────────────────────────

describe('generateBatch()', () => {
  it('generates the requested number of insights', () => {
    const generator = new InsightGenerator();
    const insights = generator.generateBatch(makeContext(), 7);
    expect(insights.length).toBe(7);
  });

  it('each day produces a different insight', () => {
    const generator = new InsightGenerator();
    const insights = generator.generateBatch(makeContext(), 14);
    const insightTexts = insights.map((i) => i.insight);
    // At least 80% should be unique
    const uniqueCount = new Set(insightTexts).size;
    expect(uniqueCount / insightTexts.length).toBeGreaterThanOrEqual(0.8);
  });

  it('each day produces a different action', () => {
    const generator = new InsightGenerator();
    const insights = generator.generateBatch(makeContext(), 14);
    const actions = insights.map((i) => i.action);
    const uniqueCount = new Set(actions).size;
    expect(uniqueCount / actions.length).toBeGreaterThanOrEqual(0.6);
  });
});

// ─── Notification Text ────────────────────────────────────────────────────────

describe('generateNotification()', () => {
  it('returns a multi-line string with insight and action', () => {
    const ctx = makeContext();
    const text = generateNotification(ctx, fixedDate);
    expect(typeof text).toBe('string');
    expect(text).toContain('\n');
    const lines = text.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[0].trim().length).toBeGreaterThan(0);
    expect(lines[1].trim().length).toBeGreaterThan(0);
  });
});

// ─── Diversity Score ──────────────────────────────────────────────────────────

describe('diversityScore()', () => {
  const generator = new InsightGenerator();

  it('returns 1.0 when no history exists', () => {
    const ctx = makeContext();
    const candidate = generator.generate(ctx, fixedDate);
    expect(generator.diversityScore(candidate, [])).toBe(1.0);
  });

  it('returns lower score when insight is repeated in history', () => {
    const ctx = makeContext();
    const insight = generator.generate(ctx, fixedDate);
    const score = generator.diversityScore(insight, [insight]);
    expect(score).toBeLessThan(1.0);
  });
});

// ─── Convenience Exports ──────────────────────────────────────────────────────

describe('Convenience exports', () => {
  it('generateInsight() produces valid output', () => {
    const result = generateInsight(makeContext(), fixedDate);
    expect(result.insight.length).toBeGreaterThan(0);
    expect(result.action.length).toBeGreaterThan(0);
  });

  it('generateNotification() produces push-ready text', () => {
    const text = generateNotification(makeContext(), fixedDate);
    expect(text.length).toBeGreaterThan(0);
    expect(text.split('\n').length).toBe(2);
  });
});

// ─── All 12 States Smoke Test ─────────────────────────────────────────────────

describe('All behavior states produce valid insights', () => {
  const generator = new InsightGenerator();
  const states: BehaviorState[] = [
    'emotionally_sensitive', 'conflict_sensitive', 'low_energy',
    'seeking_space', 'seeking_connection', 'anxious',
    'withdrawn', 'open_communicative', 'irritable',
    'reflective', 'high_energy', 'craving_validation',
  ];

  for (const state of states) {
    it(`state: ${state}`, () => {
      const ctx = makeContext({ activeStates: [state] });
      const insight = generator.generate(ctx, fixedDate);
      expect(insight.insight.trim().length).toBeGreaterThan(0);
      expect(insight.action.trim().length).toBeGreaterThan(0);
      expect(insight.states).toContain(state);
    });
  }
});

// ─── Combination States ───────────────────────────────────────────────────────

describe('State combinations', () => {
  const generator = new InsightGenerator();

  const combinations: BehaviorState[][] = [
    ['emotionally_sensitive', 'conflict_sensitive'],
    ['low_energy', 'seeking_space'],
    ['seeking_connection', 'anxious'],
    ['irritable', 'craving_validation'],
    ['reflective', 'open_communicative'],
    ['high_energy', 'seeking_connection'],
  ];

  for (const combo of combinations) {
    it(`[${combo.join(' + ')}] produces valid insight`, () => {
      const ctx = makeContext({ activeStates: combo });
      const insight = generator.generate(ctx, fixedDate);
      expect(insight.insight.trim().length).toBeGreaterThan(0);
      expect(insight.supportingInsight.trim().length).toBeGreaterThan(0);
      expect(insight.action.trim().length).toBeGreaterThan(0);
    });
  }
});
