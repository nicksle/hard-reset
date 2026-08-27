# HARD RESET

Landing site for the HARD RESET party series.

## Layout

- `index.html` — the shipping site. Single self-contained file; this is what deploys.
- `docs/` — reference pages: the project hub, design system, slide map, section
  anatomy, carousel and talent docs.
- `assets/` — source art (SVG logos and wordmarks).
- `labs/` — standalone HTML experiments. Gitignored: several are multi-megabyte
  and are scratch work, not deliverables.

## Workflow

Experiments start in `labs/`. When a lab graduates, its markup is folded into
`index.html` and committed.

## Related

The live visuals engine is a separate project: `../visualizer`
(github.com/nicksle/visualizer).
