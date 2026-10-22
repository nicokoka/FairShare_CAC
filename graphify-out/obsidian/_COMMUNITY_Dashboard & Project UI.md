---
type: community
cohesion: 0.20
members: 17
---

# Dashboard & Project UI

**Cohesion:** 0.20 - loosely connected
**Members:** 17 nodes

## Members
- [[AppHeader()]] - code - src/components/layout/AppHeader.jsx
- [[AppHeader.jsx]] - code - src/components/layout/AppHeader.jsx
- [[Avatar()]] - code - src/components/layout/AppHeader.jsx
- [[CreateProjectModal()]] - code - src/components/dashboard/CreateProjectModal.jsx
- [[CreateProjectModal.jsx]] - code - src/components/dashboard/CreateProjectModal.jsx
- [[Dashboard()]] - code - src/components/dashboard/Dashboard.jsx
- [[Dashboard.jsx]] - code - src/components/dashboard/Dashboard.jsx
- [[EmptyState()]] - code - src/components/dashboard/Dashboard.jsx
- [[JoinProjectModal()]] - code - src/components/dashboard/JoinProjectModal.jsx
- [[MemberAvatar()]] - code - src/components/dashboard/ProjectCard.jsx
- [[ProjectCard()]] - code - src/components/dashboard/ProjectCard.jsx
- [[ProjectCard.jsx]] - code - src/components/dashboard/ProjectCard.jsx
- [[byNewestFirst()]] - code - src/hooks/useProjects.jsx
- [[projectsCollection]] - code - src/lib/projects.js
- [[useAuth()]] - code - src/hooks/useAuth.jsx
- [[useProjects()]] - code - src/hooks/useProjects.jsx
- [[useProjects.jsx]] - code - src/hooks/useProjects.jsx

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Dashboard__Project_UI
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_App Shell & Page Components]]
- 7 edges to [[_COMMUNITY_Project & Join-Code Data Layer]]
- 4 edges to [[_COMMUNITY_Auth & Firebase Init]]

## Top bridge nodes
- [[Dashboard.jsx]] - degree 15, connects to 3 communities
- [[useAuth()]] - degree 13, connects to 3 communities
- [[CreateProjectModal.jsx]] - degree 6, connects to 2 communities
- [[AppHeader.jsx]] - degree 6, connects to 2 communities
- [[useProjects.jsx]] - degree 5, connects to 1 community