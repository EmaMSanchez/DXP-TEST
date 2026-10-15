export default function SceneOverlay({ scene, active, cta }) {
  return (
    <div
      className={`flight-scene flight-scene--${scene.position} flight-scene--${scene.theme}${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      inert={!active}
      {...scene.editorAttrs}
    >
      <h2>{scene.headline}</h2>
      {scene.subheadline && <p>{scene.subheadline}</p>}
      {cta?.href && cta?.text && (
        <a className="flight-cta" href={cta.href} rel={cta.external ? 'noopener noreferrer' : undefined}>
          {cta.text}
        </a>
      )}
    </div>
  );
}
