export default function Card({
  title,
  children,
}) {
  return (
    <div className="card">

      {title && (
        <div className="card-title">
          {title}
        </div>
      )}

      {children}

    </div>
  );
}


function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="section-header">

      <div>

        <div className="eyebrow">
          PMR SMANEL
        </div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>

    </div>
  );
}