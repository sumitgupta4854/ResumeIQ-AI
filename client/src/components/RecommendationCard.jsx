export default function RecommendationCard({ title, items = [] }) {
  return (<div className="card"><h4>{title}</h4><ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>);
}
