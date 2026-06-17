# FRONTEND MODULES KNOWLEDGE BASE

**Generated:** 2026-01-29
**Pattern:** Feature Slices

## OVERVIEW
The `modules/` directory implements the "Feature Sliced" design pattern. Each folder represents a self-contained feature or domain of the application, containing its UI, logic, and types.

## STRUCTURE
```
jitu-frontend/modules/
├── LoginModule/           # Feature Name
│   ├── index.tsx          # Main UI Component (Entry Point)
│   ├── interface.ts       # Local Types/Interfaces
│   └── components/        # Sub-components (optional)
├── DashboardModule/
└── ...
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Feature Entry** | `Module/index.tsx` | The main export used by `app/` |
| **Types** | `Module/interface.ts` | Props and data shapes |
| **Sub-components** | `Module/components/` | Private components |

## CONVENTIONS
- **Encapsulation**: Modules should be self-contained.
- **Exports**: `index.tsx` should export the main component (default or named).
- **API**: Modules import API clients from `../../lib/api`, they do NOT define API calls internally.

## ANTI-PATTERNS
- **Cross-Module Imports**: Avoid deep imports into other modules.
- **Global State**: Try to keep state local or pass via props unless global store is needed.
