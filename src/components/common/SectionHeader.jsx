export default function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="section-header">
      <div>
        <div className="eyebrow">
          PMR SMANEL
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}