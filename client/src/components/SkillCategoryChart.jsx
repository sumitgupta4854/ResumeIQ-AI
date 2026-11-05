import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

export default function SkillCategoryChart({ byCategory = {} }) {
  const data = Object.entries(byCategory).map(([name, skills]) => ({ name, count: (skills || []).length }));
  if (!data.length) return <p className="muted">No skills detected yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" allowDecimals={false} stroke="var(--muted)" />
        <YAxis type="category" dataKey="name" width={110} fontSize={12} stroke="var(--muted)" />
        <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
