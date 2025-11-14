# Server

Koa backend server for SS Map application.

## Path Aliases

The server uses TypeScript path aliases for cleaner imports:

- `@src/*` - Points to the server root directory
- `@shared/*` - Points to the shared types folder

### Examples

```typescript
// Instead of:
import postRouter from './api/post/index.js';
import { Post } from '../../../shared/types.js';

// You can use:
import postRouter from '@src/api/post/index.js';
import { Post } from '@shared/types.js';
```

## Setup

Install dependencies:

```bash
npm install
```

## Development

```bash
npm run dev      # Build and start server
npm run build    # Build TypeScript to JavaScript
npm start        # Build and start production server
npm run debug    # Start with debugger attached
```

## Build Process

The build process consists of two steps:

1. **TypeScript Compilation** (`tsc`) - Compiles `.ts` files to `.js`
2. **Path Alias Resolution** (`tsc-alias`) - Transforms path aliases to relative paths

The compiled output is placed in the `dist/` folder.

## Environment Variables

- `PORT` - Server port (default: 3001)

## API Endpoints

### POST `/api/post`

Parse and extract information from an SS.com listing URL.

**Request Body:**
```json
{
  "url": "https://www.ss.com/..."
}
```

**Response:**
```json
{
  "status": "success",
  "url": "https://www.ss.com/...",
  "title": "Listing title",
  "price": "€ 150,000",
  "addressInfo": {
    "city": "Rīga",
    "street": "Brīvības iela 1",
    "coordinates": {
      "lat": 56.9496,
      "lng": 24.1052
    }
  },
  "genericInfo": {
    "Rooms": "3",
    "Area": "75 m²"
  }
}
```

