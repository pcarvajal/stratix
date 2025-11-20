import type { RedisConnection } from '../RedisConnection.js';

/**
 * Sorted set member with score
 */
export interface ScoredMember {
    member: string;
    score: number;
}

/**
 * Redis Sorted Set
 *
 * Implements leaderboards, rankings, and priority queues.
 *
 * @example
 * ```typescript
 * const leaderboard = new RedisSortedSet(connection);
 *
 * await leaderboard.add('scores', 100, 'player1');
 * await leaderboard.add('scores', 200, 'player2');
 *
 * const top10 = await leaderboard.getTopN('scores', 10);
 * const rank = await leaderboard.getRank('scores', 'player1');
 * ```
 */
export class RedisSortedSet {
    constructor(private readonly connection: RedisConnection) { }

    async add(key: string, score: number, member: string): Promise<number> {
        const client = this.connection.getClient();
        return await client.zAdd(key, { score, value: member });
    }

    async addMany(key: string, members: ScoredMember[]): Promise<number> {
        const client = this.connection.getClient();
        return await client.zAdd(key, members.map(m => ({ score: m.score, value: m.member })));
    }

    async remove(key: string, member: string): Promise<number> {
        const client = this.connection.getClient();
        return await client.zRem(key, member);
    }

    async getTopN(key: string, n: number): Promise<ScoredMember[]> {
        const client = this.connection.getClient();
        const results = await client.zRangeWithScores(key, 0, n - 1, { REV: true });

        return results.map(r => ({ member: r.value, score: r.score }));
    }

    async getBottomN(key: string, n: number): Promise<ScoredMember[]> {
        const client = this.connection.getClient();
        const results = await client.zRangeWithScores(key, 0, n - 1);

        return results.map(r => ({ member: r.value, score: r.score }));
    }

    async getRank(key: string, member: string): Promise<number | null> {
        const client = this.connection.getClient();
        const rank = await client.zRevRank(key, member);
        return rank !== null ? rank + 1 : null;
    }

    async getScore(key: string, member: string): Promise<number | null> {
        const client = this.connection.getClient();
        return await client.zScore(key, member);
    }

    async incrementScore(key: string, member: string, increment: number): Promise<number> {
        const client = this.connection.getClient();
        return await client.zIncrBy(key, increment, member);
    }

    async count(key: string): Promise<number> {
        const client = this.connection.getClient();
        return await client.zCard(key);
    }

    async countByScore(key: string, min: number, max: number): Promise<number> {
        const client = this.connection.getClient();
        return await client.zCount(key, min, max);
    }
}
