import { UnderlyingDatabase } from "@src/services/database/initDatabase";

export interface Post {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostTable {
    create: (post: Post) => Promise<void>;
    get: (id: string) => Promise<Post | null>;
}

const create = async (underlying: UnderlyingDatabase, post: Post) => {
    await underlying.db.run(`INSERT INTO post (id, created_at, updated_at) VALUES (?, ?, ?)`, [post.id, post.createdAt, post.updatedAt]);
}

const get = async (underlying: UnderlyingDatabase, id: string) => {
    const result = await underlying.db.get(`SELECT * FROM post WHERE id = ?`, [id]);
    return result ? {
        id: result.id,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
    } : null;
}

export const createPostTable = (underlying: UnderlyingDatabase): PostTable => {
    // Partially applied, curried functions
    return {
        create: create.bind(null, underlying),
        get: get.bind(null, underlying),
    }
}
