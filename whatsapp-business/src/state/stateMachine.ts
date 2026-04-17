import type {
  CategoryCode,
  ConversationState,
  Language
} from "../types/domain";

/**
 * Pure state-machine logic. Given the current conversation state and the
 * classified inbound intent, decide what the bot should do next.
 *
 * The machine is intentionally narrow: it never performs I/O; it is trivial
 * to unit-test and reason about.
 */

export type BotAction =
  | { kind: "send_welcome"; language: Language | null }
  | { kind: "send_invalid_option"; language: Language | null }
  | { kind: "send_acknowledgement"; category: CategoryCode; language: Language | null }
  | { kind: "send_handoff_notice"; language: Language | null }
  | { kind: "collect_more"; category: CategoryCode; language: Language | null };

export interface TransitionInput {
  currentState: ConversationState;
  currentCategory: CategoryCode | null;
  isNewContact: boolean;
  classifiedCategory: CategoryCode | null;
  needsHuman: boolean;
  language: Language | null;
}

export interface TransitionOutput {
  nextState: ConversationState;
  category: CategoryCode | null;
  needsHuman: boolean;
  actions: BotAction[];
  tags: string[];
}

function categoryToCollectingState(cat: CategoryCode): ConversationState {
  switch (cat) {
    case "hotel_booking":
      return "collecting_hotel";
    case "retail_leasing":
      return "collecting_retail";
    case "vendor":
      return "collecting_vendor";
    case "general_inquiry":
      return "collecting_general";
  }
}

export function transition(input: TransitionInput): TransitionOutput {
  const {
    currentState,
    currentCategory,
    isNewContact,
    classifiedCategory,
    needsHuman,
    language
  } = input;

  const actions: BotAction[] = [];
  const tags: string[] = [];

  // 1. Explicit human handoff takes priority regardless of state.
  if (needsHuman) {
    actions.push({ kind: "send_handoff_notice", language });
    const cat = classifiedCategory ?? currentCategory;
    if (cat) tags.push(cat);
    tags.push("needs_human");
    return {
      nextState: "handed_off",
      category: cat,
      needsHuman: true,
      actions,
      tags
    };
  }

  // 2. Brand new or 'new' conversations: greet + ask for category.
  if (isNewContact || currentState === "new") {
    // If the first message already has a category intent, skip the menu and route.
    if (classifiedCategory) {
      actions.push({
        kind: "send_acknowledgement",
        category: classifiedCategory,
        language
      });
      tags.push(classifiedCategory);
      return {
        nextState: categoryToCollectingState(classifiedCategory),
        category: classifiedCategory,
        needsHuman: false,
        actions,
        tags
      };
    }
    actions.push({ kind: "send_welcome", language });
    return {
      nextState: "awaiting_category",
      category: null,
      needsHuman: false,
      actions,
      tags
    };
  }

  // 3. Awaiting category selection.
  if (currentState === "awaiting_category") {
    if (!classifiedCategory) {
      actions.push({ kind: "send_invalid_option", language });
      return {
        nextState: "awaiting_category",
        category: null,
        needsHuman: false,
        actions,
        tags
      };
    }
    actions.push({
      kind: "send_acknowledgement",
      category: classifiedCategory,
      language
    });
    tags.push(classifiedCategory);
    return {
      nextState: categoryToCollectingState(classifiedCategory),
      category: classifiedCategory,
      needsHuman: false,
      actions,
      tags
    };
  }

  // 4. Currently collecting details for a specific category.
  if (currentCategory) {
    // User might have pivoted to a different category — respect their latest intent.
    if (classifiedCategory && classifiedCategory !== currentCategory) {
      actions.push({
        kind: "send_acknowledgement",
        category: classifiedCategory,
        language
      });
      tags.push(classifiedCategory);
      return {
        nextState: categoryToCollectingState(classifiedCategory),
        category: classifiedCategory,
        needsHuman: false,
        actions,
        tags
      };
    }
    // Continue collecting — just keep the state.
    tags.push(currentCategory);
    return {
      nextState: currentState,
      category: currentCategory,
      needsHuman: false,
      actions,
      tags
    };
  }

  // 5. Fallback: behave like a fresh conversation.
  actions.push({ kind: "send_welcome", language });
  return {
    nextState: "awaiting_category",
    category: null,
    needsHuman: false,
    actions,
    tags
  };
}
