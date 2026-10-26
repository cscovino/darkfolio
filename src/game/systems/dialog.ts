export const CHAR_MS = 25;
export const AUTO_DISMISS_MS = 1500;
export const READ_HOLD_MS = 1500;
export const SLIDE_IN_MS = 250;
export const SLIDE_OUT_MS = 200;

export function revealCount(elapsedMs: number, textLength: number): number {
  return Math.max(0, Math.min(textLength, Math.floor(elapsedMs / CHAR_MS)));
}

export function stateAfterTyping(isHost: boolean): 'handoff' | 'paused' {
  return isHost ? 'handoff' : 'paused';
}

export type TypingAction = 'cancel' | 'skip' | 'none';

/** ESC backs out of the dialog the way the overlay footer promises; E skips. */
export function actionDuringTyping(
  eDown: boolean,
  escDown: boolean,
): TypingAction {
  if (escDown) return 'cancel';
  if (eDown) return 'skip';
  return 'none';
}
