/**
 * Relationship Insight Generator — Type Definitions
 * Connects behavior states → insight templates → mode translation → micro actions
 */

export type BehaviorState =
  | 'emotionally_sensitive'
  | 'low_energy'
  | 'seeking_space'
  | 'conflict_sensitive'
  | 'seeking_connection'
  | 'high_energy'
  | 'anxious'
  | 'withdrawn'
  | 'open_communicative'
  | 'irritable'
  | 'reflective'
  | 'craving_validation';

export type RelationshipMode = 'female' | 'male' | 'couple';

export type InsightType = 'awareness' | 'relationship' | 'action';

export interface InsightTemplate {
  state: BehaviorState;
  type: InsightType;
  templates: string[];
}

export interface ActionTemplate {
  state: BehaviorState;
  actions: string[];
}

export interface ModeTranslation {
  state: BehaviorState;
  female: string[];
  male: string[];
  couple: string[];
}

export interface SEOTag {
  articleSlug: string;
  states: BehaviorState[];
}

export interface GeneratedInsight {
  states: BehaviorState[];
  insight: string;
  supportingInsight: string;
  action: string;
  mode: RelationshipMode;
  type: InsightType;
  generatedAt: Date;
}

export interface InsightGeneratorConfig {
  maxStates: number;           // 2–3 states per day
  rotateInsightTypes: boolean; // rotate awareness/relationship/action
  historyWindow: number;       // days to track for non-repetition
}

export interface UserInsightContext {
  userId: string;
  mode: RelationshipMode;
  activeStates: BehaviorState[];
  recentInsights: GeneratedInsight[];
}
