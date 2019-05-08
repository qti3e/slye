/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

const ID_GEN_MAGIC = 802702;

const e = eval;
const g = e("this");
if (!g.SLYE_ID_GEN_LAST_ID) g.SLYE_ID_GEN_LAST_ID = ID_GEN_MAGIC;

export function shortId(): string {
  const grow = Math.floor(Math.random() * 17) + 1;
  return (g.SLYE_ID_GEN_LAST_ID += grow).toString(36);
}

export function useId(id: string): void {
  const n = parseInt(id, 36);
  const grow = Math.floor(Math.random() * 17);
  if (n >= g.SLYE_ID_GEN_LAST_ID) {
    g.SLYE_ID_GEN_LAST_ID = n + grow;
  } else {
    // It should never happen.
    throw new Error(
      "[Slye ID GEN]: Duplicate id.\nThis error is very " +
        "unexpected and should never occurs, please file a bug."
    );
  }
}

export function resetIdGen(): void {
  g.SLYE_ID_GEN_LAST_ID = ID_GEN_MAGIC;
}
