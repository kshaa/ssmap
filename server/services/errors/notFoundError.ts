import { BaseError } from "./base";

interface NotFoundInfo {
    entity: string;
    id: string;
    secondaryEntity?: string;
    secondaryId?: string;
}

export class NotFoundError extends BaseError {
    constructor(info: NotFoundInfo) {
        super(`${info.entity} ${info.id} ${info.secondaryEntity ? `${info.secondaryEntity} ${info.secondaryId}` : ''} not found`, undefined, info);
        this.name = 'NotFoundError';
        this.code = 404;
    }
}
