---
type: community
cohesion: 0.42
members: 10
---

# Project & Join-Code Data Layer

**Cohesion:** 0.42 - moderately connected
**Members:** 10 nodes

## Members
- [[JoinProjectModal.jsx]] - code - src/components/dashboard/JoinProjectModal.jsx
- [[createProject()]] - code - src/lib/projects.js
- [[generateJoinCode()]] - code - src/lib/joinCode.js
- [[joinCode.js]] - code - src/lib/joinCode.js
- [[joinCodeRef()]] - code - src/lib/projects.js
- [[joinProject()]] - code - src/lib/projects.js
- [[lookupJoinCode()]] - code - src/lib/projects.js
- [[projectRef()]] - code - src/lib/projects.js
- [[projects.js]] - code - src/lib/projects.js
- [[reserveUniqueCode()]] - code - src/lib/projects.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Project__Join-Code_Data_Layer
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Dashboard & Project UI]]
- 3 edges to [[_COMMUNITY_Auth & Firebase Init]]
- 2 edges to [[_COMMUNITY_App Shell & Page Components]]

## Top bridge nodes
- [[projects.js]] - degree 15, connects to 3 communities
- [[JoinProjectModal.jsx]] - degree 8, connects to 2 communities
- [[createProject()]] - degree 4, connects to 1 community
- [[projectRef()]] - degree 3, connects to 1 community