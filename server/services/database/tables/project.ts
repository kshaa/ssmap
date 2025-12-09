import { UnderlyingDatabase } from "@src/services/database/initDatabase";

export interface Project {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectTable {
    create: (project: Project) => Promise<void>;
    get: (id: string) => Promise<Project | null>;
}

const create = async (underlying: UnderlyingDatabase, project: Project) => {
    await underlying.db.run(`INSERT INTO project (id, created_at, updated_at) VALUES (?, ?, ?)`, [project.id, project.createdAt, project.updatedAt]);
}

const get = async (underlying: UnderlyingDatabase, id: string) => {
    const result = await underlying.db.get(`SELECT * FROM project WHERE id = ?`, [id]);
    return result ? {
        id: result.id,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
    } : null;
}

export const createProjectTable = (underlying: UnderlyingDatabase): ProjectTable => {
    // Partially applied, curried functions
    return {
        create: create.bind(null, underlying),
        get: get.bind(null, underlying),
    }
}
