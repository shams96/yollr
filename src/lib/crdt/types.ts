/**
 * CRDT (Conflict-free Replicated Data Type) types for Yollr feed
 * Enables real-time collaborative updates without conflicts
 */

export interface CRDTMetadata {
  /** Unique identifier for the replica/source */
  replicaId: string;
  /** Logical timestamp for ordering */
  timestamp: number;
  /** Wall clock time for human readability */
  wallClock: string;
}

export interface CRDTValue<T> {
  value: T;
  metadata: CRDTMetadata;
}

/**
 * LWW (Last-Write-Wins) Register for simple field updates
 * Uses timestamp to resolve conflicts, replicaId as tiebreaker
 */
export class LWWRegister<T> {
  private current: CRDTValue<T>;

  constructor(initialValue: T, replicaId: string) {
    this.current = {
      value: initialValue,
      metadata: {
        replicaId,
        timestamp: Date.now(),
        wallClock: new Date().toISOString(),
      },
    };
  }

  set(value: T, metadata: CRDTMetadata): void {
    // Merge: newer timestamp wins, replicaId breaks ties
    if (
      metadata.timestamp > this.current.metadata.timestamp ||
      (metadata.timestamp === this.current.metadata.timestamp &&
        metadata.replicaId > this.current.metadata.replicaId)
    ) {
      this.current = { value, metadata };
    }
  }

  get(): T {
    return this.current.value;
  }

  getWithMetadata(): CRDTValue<T> {
    return this.current;
  }

  merge(other: LWWRegister<T>): void {
    this.set(other.current.value, other.current.metadata);
  }
}

/**
 * G-Counter (Grow-only Counter) for monotonic counts
 * Perfect for likes, reactions, vote counts
 */
export class GCounter {
  private counters: Map<string, number> = new Map();

  constructor(replicaId: string, initialValue: number = 0) {
    this.counters.set(replicaId, initialValue);
  }

  increment(replicaId: string, delta: number = 1): void {
    const current = this.counters.get(replicaId) || 0;
    this.counters.set(replicaId, current + delta);
  }

  get value(): number {
    return Array.from(this.counters.values()).reduce((sum, count) => sum + count, 0);
  }

  merge(other: GCounter): void {
    for (const [replicaId, count] of other.counters) {
      const current = this.counters.get(replicaId) || 0;
      this.counters.set(replicaId, Math.max(current, count));
    }
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  static fromJSON(data: Record<string, number>): GCounter {
    const counter = new GCounter('default');
    counter.counters = new Map(Object.entries(data));
    return counter;
  }
}

/**
 * PN-Counter (Positive-Negative Counter) for net counts
 * Useful for tracking changes that can go up and down
 */
export class PNCounter {
  private positive: GCounter;
  private negative: GCounter;

  constructor(replicaId: string) {
    this.positive = new GCounter(replicaId);
    this.negative = new GCounter(replicaId);
  }

  increment(replicaId: string, delta: number = 1): void {
    if (delta >= 0) {
      this.positive.increment(replicaId, delta);
    } else {
      this.negative.increment(replicaId, -delta);
    }
  }

  get value(): number {
    return this.positive.value - this.negative.value;
  }

  merge(other: PNCounter): void {
    this.positive.merge(other.positive);
    this.negative.merge(other.negative);
  }

  toJSON(): {
    positive: Record<string, number>;
    negative: Record<string, number>;
  } {
    return {
      positive: this.positive.toJSON(),
      negative: this.negative.toJSON(),
    };
  }

  static fromJSON(data: {
    positive: Record<string, number>;
    negative: Record<string, number>;
  }): PNCounter {
    const counter = new PNCounter('default');
    counter.positive = GCounter.fromJSON(data.positive);
    counter.negative = GCounter.fromJSON(data.negative);
    return counter;
  }
}

/**
 * OR-Set (Observed-Removed Set) for managing collections
 * Perfect for poll options, reactions, squad members
 */
export interface ORSetElement<T> {
  element: T;
  added: Set<string>; // replicaIds that have added this element
  removed: Set<string>; // replicaIds that have removed this element
}

export class ORSet<T extends string | number> {
  private elements: Map<T, ORSetElement<T>> = new Map();

  add(element: T, replicaId: string): void {
    if (!this.elements.has(element)) {
      this.elements.set(element, {
        element,
        added: new Set(),
        removed: new Set(),
      });
    }
    this.elements.get(element)!.added.add(replicaId);
  }

  remove(element: T, replicaId: string): void {
    if (this.elements.has(element)) {
      this.elements.get(element)!.removed.add(replicaId);
    }
  }

  has(element: T): boolean {
    const elem = this.elements.get(element);
    if (!elem) return false;
    
    // Element exists if added by at least one replica and not removed by all
    const addedBy = Array.from(elem.added);
    const removedBy = Array.from(elem.removed);
    
    return addedBy.some(replica => !removedBy.includes(replica));
  }

  get values(): T[] {
    return Array.from(this.elements.keys()).filter(elem => this.has(elem));
  }

  merge(other: ORSet<T>): void {
    for (const [element, otherElem] of other.elements) {
      if (!this.elements.has(element)) {
        this.elements.set(element, {
          element,
          added: new Set(),
          removed: new Set(),
        });
      }

      const thisElem = this.elements.get(element)!;
      otherElem.added.forEach(replicaId => thisElem.added.add(replicaId));
      otherElem.removed.forEach(replicaId => thisElem.removed.add(replicaId));
    }
  }

  toJSON(): Array<{
    element: T;
    added: string[];
    removed: string[];
  }> {
    return Array.from(this.elements.entries()).map(([element, data]) => ({
      element,
      added: Array.from(data.added),
      removed: Array.from(data.removed),
    }));
  }

  static fromJSON<T extends string | number>(
    data: Array<{
      element: T;
      added: string[];
      removed: string[];
    }>
  ): ORSet<T> {
    const set = new ORSet<T>();
    for (const item of data) {
      set.elements.set(item.element, {
        element: item.element,
        added: new Set(item.added),
        removed: new Set(item.removed),
      });
    }
    return set;
  }
}

/**
 * MV-Register (Multi-Value Register) for concurrent edits
 * Keeps all concurrent values, letting the application resolve conflicts
 */
export class MVRegister<T> {
  private values: Map<string, CRDTValue<T>> = new Map();

  set(value: T, metadata: CRDTMetadata): void {
    this.values.set(metadata.replicaId, { value, metadata });
  }

  get(): T[] {
    if (this.values.size === 0) return [];
    
    // Find the maximum timestamp
    const maxTimestamp = Math.max(
      ...Array.from(this.values.values()).map(v => v.metadata.timestamp)
    );
    
    // Return all values with the maximum timestamp
    return Array.from(this.values.values())
      .filter(v => v.metadata.timestamp === maxTimestamp)
      .map(v => v.value);
  }

  getAll(): Array<CRDTValue<T>> {
    return Array.from(this.values.values());
  }

  merge(other: MVRegister<T>): void {
    for (const [replicaId, value] of other.values) {
      const current = this.values.get(replicaId);
      if (!current || value.metadata.timestamp > current.metadata.timestamp) {
        this.values.set(replicaId, value);
      }
    }
  }

  toJSON(): Array<{
    replicaId: string;
    value: T;
    timestamp: number;
    wallClock: string;
  }> {
    return Array.from(this.values.values()).map(v => ({
      replicaId: v.metadata.replicaId,
      value: v.value,
      timestamp: v.metadata.timestamp,
      wallClock: v.metadata.wallClock,
    }));
  }

  static fromJSON<T>(
    data: Array<{
      replicaId: string;
      value: T;
      timestamp: number;
      wallClock: string;
    }>
  ): MVRegister<T> {
    const register = new MVRegister<T>();
    for (const item of data) {
      register.values.set(item.replicaId, {
        value: item.value,
        metadata: {
          replicaId: item.replicaId,
          timestamp: item.timestamp,
          wallClock: item.wallClock,
        },
      });
    }
    return register;
  }
}