export default function Tag({
  on,
  text,
}) {
  return (
    <span
      className={`tag ${
        on ? 'on' : ''
      }`}
    >
      {text}
    </span>
  );
}