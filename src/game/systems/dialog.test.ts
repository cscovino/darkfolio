import { describe, expect, it } from 'vitest';
import {
  AUTO_DISMISS_MS,
  CHAR_MS,
  READ_HOLD_MS,
  SLIDE_IN_MS,
  SLIDE_OUT_MS,
  actionDuringTyping,
  revealCount,
  stateAfterTyping,
} from './dialog';

const TEXT = 'This computer contains my portfolio.';

describe('dialog constants', () => {
  it('pins the typewriter, read-hold and slide timings', () => {
    expect(CHAR_MS).toBe(25);
    expect(AUTO_DISMISS_MS).toBe(1500);
    expect(READ_HOLD_MS).toBe(1500);
    expect(SLIDE_IN_MS).toBe(250);
    expect(SLIDE_OUT_MS).toBe(200);
  });
});

describe('revealCount', () => {
  it('reveals nothing at 0ms', () => {
    expect(revealCount(0, TEXT.length)).toBe(0);
  });

  it('reveals nothing while the dialog box is still sliding in', () => {
    expect(revealCount(-1, TEXT.length)).toBe(0);
    expect(revealCount(-SLIDE_IN_MS, TEXT.length)).toBe(0);
  });

  it('reveals one character per CHAR_MS tick', () => {
    expect(revealCount(CHAR_MS, TEXT.length)).toBe(1);
    expect(revealCount(CHAR_MS * 2 - 1, TEXT.length)).toBe(1);
    expect(revealCount(CHAR_MS * 2, TEXT.length)).toBe(2);
  });

  it('clamps to the text length once typing is due', () => {
    expect(revealCount(TEXT.length * CHAR_MS, TEXT.length)).toBe(TEXT.length);
    expect(revealCount(TEXT.length * CHAR_MS + 10000, TEXT.length)).toBe(
      TEXT.length,
    );
  });

  it('handles empty text', () => {
    expect(revealCount(1000, 0)).toBe(0);
  });
});

describe('stateAfterTyping', () => {
  it('hands off to the overlay when the object hosts a page', () => {
    expect(stateAfterTyping(true)).toBe('handoff');
  });

  it('pauses for auto-dismiss when dialog-only', () => {
    expect(stateAfterTyping(false)).toBe('paused');
  });
});

describe('actionDuringTyping', () => {
  it('cancels on ESC even when E is also pressed', () => {
    expect(actionDuringTyping(true, true)).toBe('cancel');
    expect(actionDuringTyping(false, true)).toBe('cancel');
  });

  it('skips the reveal on E when ESC is not pressed', () => {
    expect(actionDuringTyping(true, false)).toBe('skip');
  });

  it('does nothing without a key press', () => {
    expect(actionDuringTyping(false, false)).toBe('none');
  });
});
