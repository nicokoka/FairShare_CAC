#!/usr/bin/env python3
"""Generate a standalone 3D force-directed ("spider web") view of the graphify graph.

Reads graph.json + .graphify_labels.json from the same directory and writes
graph-3d.html with the data embedded inline (so it opens by double-click, no
server needed). The 2D graph.html is left untouched.

Re-run after `/graphify . --update` to refresh: python3 make_graph_3d.py
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent


def main() -> None:
    graph = json.loads((HERE / "graph.json").read_text())
    labels = json.loads((HERE / ".graphify_labels.json").read_text())

    # Degree (undirected) for node sizing.
    degree: dict[str, int] = {n["id"]: 0 for n in graph["nodes"]}
    for link in graph.get("links", []):
        degree[link["source"]] = degree.get(link["source"], 0) + 1
        degree[link["target"]] = degree.get(link["target"], 0) + 1

    nodes = [
        {
            "id": n["id"],
            "label": n.get("label", n["id"]),
            "community": n.get("community", -1),
            "fileType": n.get("file_type", "unknown"),
            "sourceFile": n.get("source_file", ""),
            "sourceLocation": n.get("source_location", ""),
            "deg": degree.get(n["id"], 0),
        }
        for n in graph["nodes"]
    ]
    links = [
        {
            "source": l["source"],
            "target": l["target"],
            "relation": l.get("relation", ""),
            "confidence": l.get("confidence", ""),
        }
        for l in graph.get("links", [])
    ]

    payload = json.dumps(
        {"nodes": nodes, "links": links, "labels": labels},
        ensure_ascii=False,
        separators=(",", ":"),
    )

    html = HTML_TEMPLATE.replace("__DATA__", payload).replace(
        "__NCOUNT__", str(len(nodes))
    ).replace("__LCOUNT__", str(len(links)))
    out = HERE / "graph-3d.html"
    out.write_text(html)
    print(f"wrote {out} ({len(nodes)} nodes, {len(links)} links)")


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>graphify - 3D web</title>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script src="https://unpkg.com/3d-force-graph@1.73.4/dist/3d-force-graph.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { background: #0f0f1a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; overflow: hidden; }
  #graph { flex: 1; min-width: 0; position: relative; }
  #hint { position: absolute; top: 12px; left: 12px; font-size: 11px; color: #667; background: rgba(15,15,26,0.6); padding: 6px 10px; border-radius: 6px; pointer-events: none; z-index: 5; }
  #sidebar { width: 300px; flex-shrink: 0; background: #1a1a2e; border-left: 1px solid #2a2a4e; display: flex; flex-direction: column; overflow: hidden; }
  #search-wrap { padding: 12px; border-bottom: 1px solid #2a2a4e; }
  #search { width: 100%; background: #0f0f1a; border: 1px solid #3a3a5e; color: #e0e0e0; padding: 7px 10px; border-radius: 6px; font-size: 13px; outline: none; }
  #search:focus { border-color: #4E79A7; }
  #search-results { max-height: 150px; overflow-y: auto; padding: 4px 12px; display: none; border-bottom: 1px solid #2a2a4e; }
  .search-item { padding: 4px 6px; cursor: pointer; border-radius: 4px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .search-item:hover { background: #2a2a4e; }
  #info-panel { padding: 14px; border-bottom: 1px solid #2a2a4e; min-height: 150px; }
  #info-panel h3 { font-size: 12px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  #info-content { font-size: 13px; color: #ccc; line-height: 1.6; word-break: break-word; }
  #info-content .field { margin-bottom: 5px; }
  #info-content .field b { color: #e0e0e0; }
  #info-content .empty { color: #555; font-style: italic; }
  .neighbor-link { display: block; padding: 2px 6px; margin: 2px 0; border-radius: 3px; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 3px solid #333; }
  .neighbor-link:hover { background: #2a2a4e; }
  #neighbors-list { max-height: 170px; overflow-y: auto; margin-top: 4px; }
  #legend-wrap { flex: 1; overflow-y: auto; padding: 12px; }
  #legend-wrap h3 { font-size: 12px; color: #aaa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .legend-item { display: flex; align-items: center; gap: 8px; padding: 4px 2px; cursor: pointer; border-radius: 4px; font-size: 12px; }
  .legend-item:hover { background: #2a2a4e; }
  .legend-item.dimmed { opacity: 0.32; }
  .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .legend-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .legend-count { color: #666; font-size: 11px; }
  #controls { display: flex; gap: 8px; margin-bottom: 10px; }
  #controls button { flex: 1; background: #0f0f1a; border: 1px solid #3a3a5e; color: #bbb; padding: 6px; border-radius: 6px; font-size: 11px; cursor: pointer; }
  #controls button:hover { border-color: #4E79A7; color: #e0e0e0; }
  #stats { padding: 10px 14px; border-top: 1px solid #2a2a4e; font-size: 11px; color: #555; }
</style>
</head>
<body>
<div id="graph"><div id="hint">drag = rotate · scroll = zoom · right-drag = pan · click a node to focus</div></div>
<div id="sidebar">
  <div id="search-wrap">
    <input id="search" type="text" placeholder="Search nodes..." autocomplete="off">
    <div id="search-results"></div>
  </div>
  <div id="info-panel">
    <h3>Selection</h3>
    <div id="info-content"><span class="empty">Click or search a node.</span></div>
    <div id="neighbors-list"></div>
  </div>
  <div id="legend-wrap">
    <div id="controls">
      <button id="btn-all">Show all</button>
      <button id="btn-fit">Reset view</button>
    </div>
    <h3>Communities</h3>
    <div id="legend"></div>
  </div>
  <div id="stats">__NCOUNT__ nodes · __LCOUNT__ links</div>
</div>
<script>
const DATA = __DATA__;
const PALETTE = ["#4E79A7","#F28E2B","#E15759","#76B7B2","#59A14F","#EDC948","#B07AA1","#FF9DA7","#9C755F","#BAB0AC","#86BCB6","#D37295","#FABFD2","#B6992D","#8CD17D","#499894","#D4A6C8"];
const color = c => PALETTE[((c % PALETTE.length) + PALETTE.length) % PALETTE.length] || "#888";

const byId = new Map(DATA.nodes.map(n => [n.id, n]));
const adj = new Map(DATA.nodes.map(n => [n.id, new Set()]));
DATA.links.forEach(l => {
  const s = typeof l.source === "object" ? l.source.id : l.source;
  const t = typeof l.target === "object" ? l.target.id : l.target;
  adj.get(s) && adj.get(s).add(t);
  adj.get(t) && adj.get(t).add(s);
});

const hidden = new Set();          // hidden community ids
let selectedId = null;
let highlightNodes = new Set();
let highlightLinks = new Set();

const elem = document.getElementById("graph");
const Graph = ForceGraph3D()(elem)
  .width(elem.clientWidth)
  .height(elem.clientHeight)
  .backgroundColor("#0f0f1a")
  .graphData(DATA)
  .nodeId("id")
  .nodeLabel(n => `${n.label}  ·  ${DATA.labels[n.community] || "?"}`)
  .nodeVal(n => 1 + n.deg)
  .nodeColor(n => {
    if (hidden.has(n.community)) return "rgba(40,40,60,0.15)";
    if (selectedId && !highlightNodes.has(n.id)) return "rgba(120,120,140,0.25)";
    return color(n.community);
  })
  .nodeOpacity(0.95)
  .linkColor(l => {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (hidden.has(byId.get(s).community) || hidden.has(byId.get(t).community)) return "rgba(40,40,60,0.05)";
    if (selectedId) return highlightLinks.has(l) ? "rgba(255,255,255,0.55)" : "rgba(120,120,140,0.06)";
    return "rgba(160,160,190,0.18)";
  })
  .linkWidth(l => (selectedId && highlightLinks.has(l)) ? 1.2 : 0.4)
  .linkDirectionalParticles(l => (selectedId && highlightLinks.has(l)) ? 2 : 0)
  .linkDirectionalParticleWidth(1.4)
  .onNodeClick(n => selectNode(n.id, true))
  .onBackgroundClick(() => selectNode(null));

Graph.d3Force("charge").strength(-80);

function selectNode(id, fly) {
  selectedId = id;
  highlightNodes = new Set();
  highlightLinks = new Set();
  if (id) {
    highlightNodes.add(id);
    adj.get(id).forEach(x => highlightNodes.add(x));
    DATA.links.forEach(l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      if (s === id || t === id) highlightLinks.add(l);
    });
    if (fly) {
      const n = byId.get(id);
      if (n && n.x !== undefined) {
        const dist = 90;
        const len = Math.hypot(n.x, n.y, n.z) || 1;
        const k = 1 + dist / len;
        Graph.cameraPosition({ x: n.x * k, y: n.y * k, z: n.z * k }, n, 800);
      }
    }
  }
  Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor()).linkWidth(Graph.linkWidth()).linkDirectionalParticles(Graph.linkDirectionalParticles());
  renderInfo(id);
}

function renderInfo(id) {
  const box = document.getElementById("info-content");
  const nb = document.getElementById("neighbors-list");
  if (!id) { box.innerHTML = '<span class="empty">Click or search a node.</span>'; nb.innerHTML = ""; return; }
  const n = byId.get(id);
  box.innerHTML =
    `<div class="field"><b>${escapeHtml(n.label)}</b></div>` +
    `<div class="field">community: ${escapeHtml(DATA.labels[n.community] || "?")}</div>` +
    `<div class="field">type: ${escapeHtml(n.fileType)}</div>` +
    (n.sourceFile ? `<div class="field">file: ${escapeHtml(n.sourceFile)}${n.sourceLocation ? " " + escapeHtml(n.sourceLocation) : ""}</div>` : "") +
    `<div class="field">connections: ${n.deg}</div>`;
  const neigh = [...adj.get(id)].map(x => byId.get(x)).sort((a, b) => b.deg - a.deg);
  nb.innerHTML = neigh.map(m =>
    `<div class="neighbor-link" style="border-left-color:${color(m.community)}" data-id="${m.id}">${escapeHtml(m.label)}</div>`
  ).join("");
  nb.querySelectorAll(".neighbor-link").forEach(el =>
    el.addEventListener("click", () => selectNode(el.dataset.id, true)));
}

// ---- search ----
const search = document.getElementById("search");
const results = document.getElementById("search-results");
search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  if (!q) { results.style.display = "none"; return; }
  const hits = DATA.nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0, 40);
  results.innerHTML = hits.map(n =>
    `<div class="search-item" style="color:${color(n.community)}" data-id="${n.id}">${escapeHtml(n.label)}</div>`
  ).join("") || '<div class="search-item empty">no matches</div>';
  results.style.display = "block";
  results.querySelectorAll(".search-item[data-id]").forEach(el =>
    el.addEventListener("click", () => { selectNode(el.dataset.id, true); results.style.display = "none"; search.value = byId.get(el.dataset.id).label; }));
});

// ---- legend ----
const counts = {};
DATA.nodes.forEach(n => counts[n.community] = (counts[n.community] || 0) + 1);
const legend = document.getElementById("legend");
Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach(c => {
  const row = document.createElement("div");
  row.className = "legend-item";
  row.innerHTML = `<span class="legend-dot" style="background:${color(+c)}"></span><span class="legend-label">${escapeHtml(DATA.labels[c] || ("Community " + c))}</span><span class="legend-count">${counts[c]}</span>`;
  row.addEventListener("click", () => {
    if (hidden.has(+c)) hidden.delete(+c); else hidden.add(+c);
    row.classList.toggle("dimmed");
    Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor());
  });
  legend.appendChild(row);
});

document.getElementById("btn-all").addEventListener("click", () => {
  hidden.clear();
  document.querySelectorAll(".legend-item").forEach(el => el.classList.remove("dimmed"));
  Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor());
});
document.getElementById("btn-fit").addEventListener("click", () => { selectNode(null); Graph.zoomToFit(700, 40); });

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function fit() { Graph.width(elem.clientWidth).height(elem.clientHeight); }
window.addEventListener("resize", fit);
requestAnimationFrame(fit);
setTimeout(() => { fit(); Graph.zoomToFit(800, 80); }, 2500);
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
