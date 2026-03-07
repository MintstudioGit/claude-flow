/**
 * Relationship Insight Generator — Core Algorithm
 *
 * Algorithm:
 *   states = top_states(user)           // 2-3 states per day
 *   templates = get_templates(states)   // 20-30 per state
 *   insight = combine_templates(...)    // merge + deduplicate
 *   action = get_action(states)         // one micro action
 *   mode = user.mode                    // female | male | couple
 *   insight = translate_for_mode(...)   // perspective shift
 */

import type {
  BehaviorState,
  RelationshipMode,
  InsightType,
  GeneratedInsight,
  UserInsightContext,
  InsightGeneratorConfig,
} from './types.js';

import {
  INSIGHT_TEMPLATES,
  ACTION_TEMPLATES,
  MODE_TRANSLATIONS,
} from './templates.js';

// ─── Default Config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: InsightGeneratorConfig = {
  maxStates: 3,
  rotateInsightTypes: true,
  historyWindow: 7,
};

// ─── Seeded Pseudo-random (deterministic per user-day) ───────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickIndex(rand: () => number, length: number): number {
  return Math.floor(rand() * length);
}

function pickFrom<T>(rand: () => number, arr: T[]): T {
  return arr[pickIndex(rand, arr.length)];
}

function dateSeed(date: Date, userId: string): number {
  const dateStr = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
  let hash = 0;
  for (const char of userId + dateStr) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  return hash;
}

// ─── Core Generator ───────────────────────────────────────────────────────────

export class InsightGenerator {
  private config: InsightGeneratorConfig;

  constructor(config: Partial<InsightGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a daily insight for a user.
   * Deterministic for a given user + date — same result if called multiple times.
   */
  generate(context: UserInsightContext, date: Date = new Date()): GeneratedInsight {
    const states = context.activeStates.slice(0, this.config.maxStates);
    if (states.length === 0) {
      throw new Error('At least one active state is required.');
    }

    const rand = seededRandom(dateSeed(date, context.userId));

    // Determine insight type rotation
    const insightType = this.selectInsightType(context, rand);

    // Gather all matching templates for the primary state
    const primaryState = states[0];
    const primaryTemplates = INSIGHT_TEMPLATES.filter(
      (t) => t.state === primaryState && t.type === insightType
    );

    // Fall back to 'awareness' if no match for chosen type
    const templatePool =
      primaryTemplates.length > 0
        ? primaryTemplates
        : INSIGHT_TEMPLATES.filter(
            (t) => t.state === primaryState && t.type === 'awareness'
          );

    const chosenTemplate = pickFrom(rand, templatePool);
    const primaryInsight = pickFrom(rand, chosenTemplate.templates);

    // Secondary insight from second state if available
    let supportingInsight = '';
    if (states.length > 1) {
      const secondaryState = states[1];
      const secondaryTemplates = INSIGHT_TEMPLATES.filter(
        (t) => t.state === secondaryState
      );
      if (secondaryTemplates.length > 0) {
        const secTemplate = pickFrom(rand, secondaryTemplates);
        supportingInsight = pickFrom(rand, secTemplate.templates);
      }
    }

    // Mode translation — replace generic insight with mode-specific framing
    const modeInsight = this.translateForMode(
      primaryState,
      context.mode,
      rand
    );
    const finalInsight = modeInsight || primaryInsight;

    // Micro action — weighted across all active states
    const action = this.selectAction(states, rand);

    const result: GeneratedInsight = {
      states,
      insight: finalInsight,
      supportingInsight,
      action,
      mode: context.mode,
      type: insightType,
      generatedAt: date,
    };

    return result;
  }

  /**
   * Generate a batch of insights (e.g. next N days)
   */
  generateBatch(context: UserInsightContext, days: number): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    const base = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      insights.push(this.generate(context, date));
    }
    return insights;
  }

  /**
   * Generate a push notification summary (shorter form)
   */
  generateNotificationText(context: UserInsightContext, date?: Date): string {
    const insight = this.generate(context, date);
    return `${insight.insight}\n${insight.action}`;
  }

  /**
   * Score diversity — returns 0.0–1.0 uniqueness vs recent history
   */
  diversityScore(candidate: GeneratedInsight, history: GeneratedInsight[]): number {
    if (history.length === 0) return 1.0;
    const dupes = history.filter(
      (h) =>
        h.insight === candidate.insight ||
        h.action === candidate.action
    );
    return 1 - dupes.length / history.length;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private selectInsightType(
    context: UserInsightContext,
    rand: () => number
  ): InsightType {
    if (!this.config.rotateInsightTypes) {
      return 'awareness';
    }

    const recent = context.recentInsights.slice(-3).map((i) => i.type);
    const types: InsightType[] = ['awareness', 'relationship', 'action'];

    // Avoid repeating the last type
    const lastType = recent[recent.length - 1];
    const candidates = lastType
      ? types.filter((t) => t !== lastType)
      : types;

    return pickFrom(rand, candidates);
  }

  private translateForMode(
    state: BehaviorState,
    mode: RelationshipMode,
    rand: () => number
  ): string | null {
    const translation = MODE_TRANSLATIONS.find((t) => t.state === state);
    if (!translation) return null;
    const pool = translation[mode];
    if (!pool || pool.length === 0) return null;
    return pickFrom(rand, pool);
  }

  private selectAction(states: BehaviorState[], rand: () => number): string {
    // Gather actions from all active states, weighted toward first state
    const actionPools = states.flatMap((state, i) => {
      const template = ACTION_TEMPLATES.find((a) => a.state === state);
      if (!template) return [];
      // Primary state actions appear twice → more likely to be picked
      return i === 0 ? [...template.actions, ...template.actions] : template.actions;
    });

    if (actionPools.length === 0) {
      return 'Take one slow breath before responding today.';
    }

    return pickFrom(rand, actionPools);
  }
}

// ─── Convenience Export ───────────────────────────────────────────────────────

export const defaultGenerator = new InsightGenerator();

/**
 * Quick-generate for a single user context.
 */
export function generateInsight(
  context: UserInsightContext,
  date?: Date
): GeneratedInsight {
  return defaultGenerator.generate(context, date);
}

/**
 * Quick-generate notification text.
 */
export function generateNotification(
  context: UserInsightContext,
  date?: Date
): string {
  return defaultGenerator.generateNotificationText(context, date);
}
