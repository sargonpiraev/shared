# HeadHunter API Client

> Home: [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) → `packages/hh-api-client`

![npm version](https://img.shields.io/npm/v/@sargonpiraev/hh-api-client)
![npm downloads](https://img.shields.io/npm/dw/@sargonpiraev/hh-api-client)
![license](https://img.shields.io/github/license/sargonpiraev/shared)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

A TypeScript client for the HeadHunter API, generated from the official OpenAPI specification.

## Features

- 🔥 **TypeScript first** - Full type safety with generated types
- 🚀 **Modern SDK** - Built with `@hey-api/openapi-ts`
- 📝 **Complete API coverage** - All HeadHunter API endpoints
- 🛡️ **Built-in validation** - Request/response validation
- 🎯 **Tree-shakeable** - Import only what you need
- 📚 **Well documented** - JSDoc comments for all methods

## Installation

```bash
npm install @sargonpiraev/hh-api-client
```

## Get Your Credentials

Before installation, you'll need HeadHunter API credentials:

1. Visit [HeadHunter Developer Portal](https://dev.hh.ru/)
2. Create an application to get client credentials
3. For authenticated requests, implement OAuth flow to get access token
4. Set up proper User-Agent format: `"AppName/Version (contact@example.com)"`

## Requirements

- Node.js >= v18.0.0
- HeadHunter API credentials (User-Agent required, access token optional)
- npm >= 8.0.0

## Quick Start

```typescript
import {
  createHeadHunterClient,
  getVacancies,
  getAreas,
  type GetVacanciesData,
} from '@sargonpiraev/hh-api-client'

// Create a configured client
const client = createHeadHunterClient({
  userAgent: 'MyApp/1.0.0 (contact@example.com)',
  accessToken: 'your-access-token', // optional
})

// Search for vacancies
const searchParams: GetVacanciesData = {
  query: {
    text: 'JavaScript developer',
    area: '1', // Moscow
    per_page: 50,
  },
}

const vacancies = await getVacancies({
  client,
  ...searchParams,
})

console.log(`Found ${vacancies.data.found} vacancies`)

// Get dictionaries
const areas = await getAreas({ client })
console.log('Available areas:', areas.data)
```

## Usage Examples

### Search Vacancies

```typescript
import { getVacancies, type GetVacanciesData } from '@sargonpiraev/hh-api-client'

const searchParams: GetVacanciesData = {
  query: {
    text: 'Frontend Developer',
    area: '1', // Moscow
    professional_role: '96', // Developer role
    experience: 'between1And3',
    employment: 'full',
    schedule: 'remote',
    salary_from: 100000,
    currency: 'RUR',
    only_with_salary: true,
  },
}

const result = await getVacancies({ client, ...searchParams })
```

### Get Vacancy Details

```typescript
import { getVacancy } from '@sargonpiraev/hh-api-client'

const vacancy = await getVacancy({
  client,
  path: { vacancy_id: '12345' },
})

console.log(vacancy.data.name)
console.log(vacancy.data.description)
```

### Apply to Vacancy

```typescript
import { applyToVacancy } from '@sargonpiraev/hh-api-client'

await applyToVacancy({
  client,
  path: { vacancy_id: '12345' },
  body: {
    resume_id: 'resume-id',
    message: 'I am interested in this position...',
  },
})
```

### Work with Dictionaries

```typescript
import {
  getAreas,
  getIndustries,
  getSkills,
  getProfessionalRolesDictionary,
} from '@sargonpiraev/hh-api-client'

// Get all areas (cities/regions)
const areas = await getAreas({ client })

// Get industries
const industries = await getIndustries({ client })

// Get skills
const skills = await getSkills({ client })

// Get professional roles
const roles = await getProfessionalRolesDictionary({ client })
```

### User Information

```typescript
import { getCurrentUserInfo, editCurrentUserInfo } from '@sargonpiraev/hh-api-client'

// Get current user info
const user = await getCurrentUserInfo({ client })

// Update user info
await editCurrentUserInfo({
  client,
  body: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
  },
})
```

## Configuration

### Required User-Agent

HeadHunter API requires a specific User-Agent format:

```
ApplicationName/Version (contact@example.com)
```

Example:

```typescript
const client = createHeadHunterClient({
  userAgent: 'JobSearchApp/1.0.0 (support@jobsearch.com)',
})
```

### Authentication

For protected endpoints, provide an access token:

```typescript
const client = createHeadHunterClient({
  userAgent: 'MyApp/1.0.0 (contact@example.com)',
  accessToken: 'your-oauth-token',
})
```

### Custom Base URL

For testing or custom environments:

```typescript
const client = createHeadHunterClient({
  userAgent: 'MyApp/1.0.0 (contact@example.com)',
  baseURL: 'https://api.hh.ru', // default
})
```

## API Reference

### Most Used Functions

- `getVacancies()` - Search vacancies
- `getVacancy()` - Get vacancy details
- `getAreas()` - Get areas/cities
- `getIndustries()` - Get industries
- `getCurrentUserInfo()` - Get user info
- `applyToVacancy()` - Apply to vacancy

### All Available Functions

The client exports all generated SDK functions. See the [HeadHunter API documentation](https://api.hh.ru/openapi/redoc) for complete reference.

```typescript
// Import everything
import * as HHApi from '@sargonpiraev/hh-api-client'

// Or import specific functions
import {
  getVacancies,
  getNegotiations,
  createResume,
  // ... etc
} from '@sargonpiraev/hh-api-client'
```

## TypeScript Support

Full TypeScript support with generated types:

```typescript
import type {
  GetVacanciesData,
  GetVacanciesResponses,
  Vacancy,
  Area,
  Industry,
} from '@sargonpiraev/hh-api-client'

const handleVacancy = (vacancy: Vacancy) => {
  console.log(vacancy.name)
  console.log(vacancy.salary?.from)
}
```

## Error Handling

```typescript
try {
  const result = await getVacancies({ client, query: { text: 'Developer' } })
  console.log(result.data)
} catch (error) {
  if (error.status === 400) {
    console.error('Bad request:', error.data)
  } else if (error.status === 403) {
    console.error('Forbidden:', error.data)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Roadmap

**Coming Soon** 🚀

- [ ] **Enhanced Type Safety**: Additional validation and type guards
- [ ] **Response Caching**: Intelligent caching for frequently accessed data
- [ ] **Batch Operations**: Support for bulk API operations
- [ ] **Rate Limiting**: Built-in rate limiting and retry logic
- [ ] **Offline Support**: Offline-first capabilities with sync
- [ ] **React Hooks**: React hooks package for easier integration

**Completed** ✅

- [x] **Full API Coverage**: Complete HeadHunter API integration
- [x] **Type Generation**: Automated TypeScript types from OpenAPI
- [x] **Error Handling**: Comprehensive error management
- [x] **Tree Shaking**: Optimized bundle size with selective imports

**Community Requests** 💭

Have an idea for HeadHunter API Client? [Open an issue](https://github.com/sargonpiraev/hh-api-client/issues) or contribute to our roadmap!

## Support This Project

Hi! I'm Sargon Piraev, a software engineer passionate about API integrations and developer tools. I create open-source API clients to help developers integrate with their favorite services more easily.

Your support helps me continue developing and maintaining these tools, and motivates me to create new integrations that make developer workflows even more efficient! 🚀

[![Support on Boosty](https://img.shields.io/badge/Support-Boosty-orange?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)](https://boosty.to/sargonpiraev)

## Connect with Author

- 🌐 Visit [sargonpiraev.com](https://sargonpiraev.com)
- 📧 Email: [sargonpiraev@gmail.com](mailto:sargonpiraev@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/sargonpiraev](https://linkedin.com/in/sargonpiraev)

## Release

Published from the [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) monorepo via Trusted Publishing (`on-push-main.yml`).

Release lane: Trusted Publisher on `on-push-main.yml`.
