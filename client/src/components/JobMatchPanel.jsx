import SkillBadge from './SkillBadge.jsx';

export default function JobMatchPanel({ match }) {
  if (!match) return null;
  return (
    <div className="card">
      <h3>Alignment: {match.matchScore}%</h3>
      <p><strong>Matched:</strong></p><div>{(match.matchedSkills || []).map((s) => <SkillBadge key={s} skill={s} />)}</div>
      <p><strong>Missing:</strong></p><div>{(match.missingSkills || []).map((s) => <SkillBadge key={s} skill={s} />)}</div>
      <h4>Recommendations</h4><ol>{(match.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}</ol>
    </div>
  );
}
