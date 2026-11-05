const PALETTE = [
  ['#7c3aed', '#f5f3ff'],
  ['#ec4899', '#fdf2f8'],
  ['#06b6d4', '#ecfeff'],
  ['#10b981', '#ecfdf5'],
  ['#f59e0b', '#fffbeb'],
  ['#6366f1', '#eef2ff']
];

function pick(skill = '') {
  let h = 0;
  for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function SkillBadge({ skill }) {
  const [fg, bg] = pick(String(skill));
  return (
    <span className="badge" style={{ color: fg, background: bg, border: `1px solid ${fg}33` }}>
      {skill}
    </span>
  );
}

export default SkillBadge;
