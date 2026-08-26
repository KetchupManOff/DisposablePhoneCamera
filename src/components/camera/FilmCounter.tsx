import { useStore } from '../../store/useStore';

export function FilmCounter() {
  const project = useStore((s) => s.currentProject());
  const maxPoses = project?.maxPoses ?? 0;
  const photosCount = project?.photos.length ?? 0;
  const remaining = Math.max(0, maxPoses - photosCount);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 shrink-0">
      <span className="text-vintage-accent font-mono text-sm tracking-wider">
        {remaining}
      </span>
      <span className="text-vintage-muted text-[11px] font-mono">
        / {maxPoses}
      </span>
      <span className="text-vintage-muted text-[11px] ml-0.5">📸</span>
    </div>
  );
}