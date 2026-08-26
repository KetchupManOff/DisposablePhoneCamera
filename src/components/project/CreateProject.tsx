import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/db';
import { PROFILES } from '../../lib/colorProfiles';
import type { Project, AspectRatio, ColorProfile } from '../../types';

const POSE_OPTIONS = [12, 24, 36];

const TAKING_QUICK = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 heure', minutes: 60 },
  { label: '2 heures', minutes: 120 },
  { label: 'Pas de limite', minutes: 0 },
];

const DEV_QUICK = [
  { label: 'Instantané', hours: 0 },
  { label: '1 heure', hours: 1 },
  { label: '3 heures', hours: 3 },
  { label: '6 heures', hours: 6 },
  { label: 'Ce soir 20h', targetHour: 20 },
  { label: 'Demain 9h', targetHour: 9, nextDay: true },
];

const RATIO_OPTIONS: { value: AspectRatio; label: string; desc: string }[] = [
  { value: '1:1', label: '1:1', desc: 'Carré — style Polaroid' },
  { value: '3:2', label: '3:2', desc: 'Classique 35 mm' },
  { value: '4:3', label: '4:3', desc: 'Standard numérique' },
  { value: '16:9', label: '16:9', desc: 'Cinéma panoramique' },
];

function getTargetTimestamp(targetHour: number, nextDay = false): number {
  const d = new Date();
  if (nextDay) d.setDate(d.getDate() + 1);
  d.setHours(targetHour, 0, 0, 0);
  if (!nextDay && d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

interface CreateProjectProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateProject({ onCreated, onCancel }: CreateProjectProps) {
  const addProject = useStore((s) => s.addProject);
  const projectCount = useStore((s) => s.projects.length);

  const [colorProfile, setColorProfile] = useState<ColorProfile>('kodak-gold');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:2');
  const [maxPoses, setMaxPoses] = useState(24);
  const [takingMinutes, setTakingMinutes] = useState(0);
  const [takingCustomH, setTakingCustomH] = useState('1');
  const [takingCustomM, setTakingCustomM] = useState('0');
  const [devOption, setDevOption] = useState<{ hours?: number; targetHour?: number; nextDay?: boolean } | null>(null);
  const [devCustomH, setDevCustomH] = useState('3');
  const [devCustomM, setDevCustomM] = useState('0');

  const name = `Pellicule ${projectCount + 1}`;

  const handleCreate = useCallback(async () => {
    const now = Date.now();

    let takingDeadline: number | null = null;
    if (takingMinutes > 0) {
      takingDeadline = now + takingMinutes * 60 * 1000;
    }

    let unlockAt: number | null = null;
    if (devOption) {
      if (devOption.hours !== undefined && devOption.hours === 0) {
        unlockAt = null;
      } else if (devOption.targetHour !== undefined) {
        unlockAt = getTargetTimestamp(devOption.targetHour, devOption.nextDay);
      } else if (devOption.hours) {
        unlockAt = now + devOption.hours * 3600 * 1000;
      }
    }

    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      colorProfile,
      aspectRatio,
      maxPoses,
      photos: [],
      takingDeadline,
      unlockAt,
      createdAt: now,
      isUnlocked: unlockAt === null,
    };

    await db.projects.put({
      id: project.id,
      name: project.name,
      colorProfile: project.colorProfile,
      aspectRatio: project.aspectRatio,
      maxPoses: project.maxPoses,
      takingDeadline: project.takingDeadline,
      unlockAt: project.unlockAt,
      createdAt: project.createdAt,
      isUnlocked: project.isUnlocked,
    });

    addProject(project);
    onCreated();
  }, [name, colorProfile, aspectRatio, maxPoses, takingMinutes, devOption, addProject, onCreated]);

  const handleQuickDev = (opt: (typeof DEV_QUICK)[number]) => {
    setDevOption(opt);
  };

  const handleCustomDev = () => {
    const h = parseInt(devCustomH, 10) || 0;
    const m = parseInt(devCustomM, 10) || 0;
    const totalHours = h + m / 60;
    if (totalHours <= 0) {
      setDevOption({ hours: 0 });
    } else {
      setDevOption({ hours: totalHours });
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6 border-b border-vintage-border/30 sticky top-0 bg-vintage-bg z-10">
        <h2 className="text-lg font-display text-vintage-text">Nouvelle pellicule</h2>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 pb-8">
        {/* Nom auto */}
        <div className="p-3 rounded-xl bg-vintage-surface/30 border border-vintage-border/20">
          <p className="text-xs font-mono text-vintage-muted mb-1">Nom</p>
          <p className="text-vintage-text font-display">{name}</p>
</div>

        {/* Choix du film (LUT) */}
        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">Film (LUT)</p>
          <div className="space-y-2">
            {Object.values(PROFILES).map((profile) => (
              <button
                key={profile.id}
                onClick={() => setColorProfile(profile.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  colorProfile === profile.id
                    ? 'border-vintage-accent bg-vintage-accent/10'
                    : 'border-vintage-border/30 bg-vintage-surface/20 hover:border-vintage-border/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{profile.emoji}</span>
                  <div>
                    <p className="font-display text-vintage-text text-sm">{profile.label}</p>
                    <p className="text-xs text-vintage-muted">{profile.description}</p>
                  </div>
                  {colorProfile === profile.id && (<span className="ml-auto text-vintage-accent">✓</span>)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ratio */}
        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">Ratio</p>
          <div className="grid grid-cols-2 gap-2">
            {RATIO_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setAspectRatio(r.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  aspectRatio === r.value
                    ? 'border-vintage-accent bg-vintage-accent/10'
                    : 'border-vintage-border/30 bg-vintage-surface/20 hover:border-vintage-border/60'
                }`}
              >
                <p className="font-display text-vintage-text">{r.label}</p>
                <p className="text-xs text-vintage-muted">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Nombre de poses */}
        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">Nombre de poses</p>
          <div className="flex gap-2">
            {POSE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setMaxPoses(n)}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition-all font-mono text-vintage-text ${
                  maxPoses === n
                    ? 'border-vintage-accent bg-vintage-accent/10'
                    : 'border-vintage-border/30 bg-vintage-surface/20 hover:border-vintage-border/60'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
{/* Fenêtre de prise de vue */}
        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">
            ⏱ Temps pour prendre les photos
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {TAKING_QUICK.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setTakingMinutes(opt.minutes)}
                className={`p-3 rounded-xl border text-sm transition-all font-mono ${
                  takingMinutes === opt.minutes
                    ? 'border-vintage-accent bg-vintage-accent/10 text-vintage-text'
                    : 'border-vintage-border/40 bg-vintage-surface/20 text-vintage-text hover:border-vintage-border/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-vintage-muted font-mono">Personnalisé :</span>
            <input type="number" min="0" max="72" value={takingCustomH}
              onChange={(e) => { setTakingCustomH(e.target.value); const h = parseInt(e.target.value,10)||0; const m = parseInt(takingCustomM,10)||0; setTakingMinutes(h*60+m); }}
              className="w-14 p-2 rounded-lg bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-sm focus:border-vintage-accent outline-none" />
            <span className="text-xs text-vintage-muted font-mono">h</span>
            <input type="number" min="0" max="59" value={takingCustomM}
              onChange={(e) => { setTakingCustomM(e.target.value); const h = parseInt(takingCustomH,10)||0; const m = parseInt(e.target.value,10)||0; setTakingMinutes(h*60+m); }}
              className="w-14 p-2 rounded-lg bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-sm focus:border-vintage-accent outline-none" />
            <span className="text-xs text-vintage-muted font-mono">m</span>
          </div>
        </div>

        {/* Délai de développement */}
        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">
            🧪 Développement (quand les photos seront visibles)
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {DEV_QUICK.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleQuickDev(opt)}
                className={`p-3 rounded-xl border text-sm transition-all font-mono ${
                  devOption &&
                  ((opt.hours !== undefined && devOption.hours === opt.hours) ||
                   (opt.targetHour !== undefined && devOption.targetHour === opt.targetHour))
                    ? 'border-vintage-accent bg-vintage-accent/10 text-vintage-text'
                    : 'border-vintage-border/40 bg-vintage-surface/20 text-vintage-text hover:border-vintage-border/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-vintage-muted font-mono">Personnalisé :</span>
            <input type="number" min="0" max="168" value={devCustomH}
              onChange={(e) => setDevCustomH(e.target.value)}
              className="w-14 p-2 rounded-lg bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-sm focus:border-vintage-accent outline-none" />
            <span className="text-xs text-vintage-muted font-mono">h</span>
            <input type="number" min="0" max="59" value={devCustomM}
              onChange={(e) => setDevCustomM(e.target.value)}
              className="w-14 p-2 rounded-lg bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-sm focus:border-vintage-accent outline-none" />
            <span className="text-xs text-vintage-muted font-mono">m</span>
            <button
              onClick={handleCustomDev}
              className="p-2 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-vintage-accent font-mono text-xs hover:bg-vintage-accent/30"
            >
              OK
            </button>
          </div>
        </div>

        {/* Bouton Créer */}
        <button
          onClick={handleCreate}
          disabled={!devOption}
          className={`w-full p-4 rounded-xl font-display text-lg transition-all ${
            devOption
              ? 'bg-vintage-accent text-black hover:bg-vintage-accent/90'
              : 'bg-vintage-border/40 text-vintage-muted cursor-not-allowed'
          }`}
        >
          📸 Créer la pellicule
        </button>
      </div>
    </div>
  );
}