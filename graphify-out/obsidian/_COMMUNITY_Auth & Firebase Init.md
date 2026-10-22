---
type: community
cohesion: 0.24
members: 10
---

# Auth & Firebase Init

**Cohesion:** 0.24 - loosely connected
**Members:** 10 nodes

## Members
- [[AuthContext]] - code - src/hooks/useAuth.jsx
- [[AuthProvider()]] - code - src/hooks/useAuth.jsx
- [[REQUIRED]] - code - src/lib/firebase.js
- [[app]] - code - src/lib/firebase.js
- [[auth]] - code - src/lib/firebase.js
- [[db]] - code - src/lib/firebase.js
- [[firebase.js]] - code - src/lib/firebase.js
- [[firebaseConfig]] - code - src/lib/firebase.js
- [[googleProvider]] - code - src/lib/firebase.js
- [[useAuth.jsx]] - code - src/hooks/useAuth.jsx

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Auth__Firebase_Init
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_App Shell & Page Components]]
- 4 edges to [[_COMMUNITY_Dashboard & Project UI]]
- 3 edges to [[_COMMUNITY_Project & Join-Code Data Layer]]
- 1 edge to [[_COMMUNITY_Build Config & Dependencies]]

## Top bridge nodes
- [[useAuth.jsx]] - degree 13, connects to 3 communities
- [[firebase.js]] - degree 9, connects to 2 communities
- [[AuthProvider()]] - degree 2, connects to 1 community
- [[db]] - degree 2, connects to 1 community