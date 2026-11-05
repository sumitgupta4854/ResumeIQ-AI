export default function LoadingSkeleton({ lines = 4 }) {
  return (<div className="grid">{Array.from({ length: lines }).map((_, i) => (<div key={i} className="skeleton" style={{ height: 22 }} />))}</div>);
}
