import { useEffect, useRef, useState } from 'react';
import HeroVideo from './HeroVideo.jsx';
import SceneOverlay from './SceneOverlay.jsx';

const clamp = (number, min, max) => Math.min(max, Math.max(min, number));

export default function ScrollExperience({
  introVideo,
  scrollVideo,
  introPoster,
  scrollPoster,
  introTitle,
  introSubtitle,
  scrollHint,
  scenes,
  cta,
  objectPositionDesktop,
  objectPositionMobile,
}) {
  const worldRef = useRef(null);
  const stageRef = useRef(null);
  const introRef = useRef(null);
  const scrollRef = useRef(null);
  const taglineRef = useRef(null);
  const [activeScene, setActiveScene] = useState(-1);
  const tagline = scenes[1]?.subheadline;

  useEffect(() => {
    const world = worldRef.current;
    const stage = stageRef.current;
    const intro = introRef.current;
    const scroll = scrollRef.current;
    if (!world || !stage || !intro || !scroll) return;

    let disposed = false;
    let trigger;
    let progress = 0;
    let duration = Number.isFinite(scroll.duration) ? scroll.duration : 0;
    let desiredTime = 0;
    let renderedScene = -1;
    let visible = true;
    let revealRequest = 0;
    let mediaFailed = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = navigator.connection?.saveData === true;
    const staticMode = reduceMotion.matches || saveData;

    function setScene(index) {
      if (renderedScene !== index) {
        renderedScene = index;
        setActiveScene(index);
      }
    }

    function showIntro() {
      cancelAnimationFrame(revealRequest);
      if (!staticMode && visible && document.visibilityState === 'visible') {
        intro.play().catch(() => {});
      }
      stage.dataset.mode = staticMode ? 'static-intro' : 'intro';
      setScene(-1);
    }

    function showScroll() {
      if (
        disposed ||
        progress <= 0 ||
        staticMode ||
        mediaFailed ||
        scroll.seeking ||
        scroll.readyState < 2 ||
        Math.abs(scroll.currentTime - desiredTime) >= 1 / 48
      ) return;
      stage.dataset.mode = 'scroll';
      updateScene();
    }

    function onFadeEnd(event) {
      if (event.propertyName === 'opacity' && stage.dataset.mode === 'scroll') {
        intro.pause();
      }
    }

    function updateScene() {
      if (progress <= 0) {
        setScene(-1);
        return;
      }
      const index = scenes.findIndex((scene) => progress * 100 >= scene.start && progress * 100 < scene.end);
      setScene(index < 0 && progress === 1 ? scenes.length - 1 : index);
    }

    function seek() {
      if (!duration || !progress || staticMode || mediaFailed || disposed) return;
      // The final presentation timestamp is before duration, never exactly at it.
      desiredTime = clamp(progress * duration, 0, Math.max(0, duration - 1 / 24));
      if (scroll.seeking) return;
      if (Math.abs(scroll.currentTime - desiredTime) < 1 / 48 && scroll.readyState >= 2) {
        showScroll();
        return;
      }
      try {
        scroll.currentTime = desiredTime;
      } catch {
        // Keep the ambient video visible until the decoder accepts a seek.
      }
    }

    function onSeeked() {
      if (disposed || !progress || staticMode) return;
      if (Math.abs(scroll.currentTime - desiredTime) >= 1 / 48) {
        seek();
      } else {
        // A seek can complete before the new frame is painted. Do not reveal it earlier.
        revealRequest = requestAnimationFrame(showScroll);
      }
    }

    function onMetadata() {
      duration = Number.isFinite(scroll.duration) ? scroll.duration : 0;
      scroll.pause();
      if (progress > 0) seek();
    }

    function onError() {
      mediaFailed = true;
      if (progress > 0) {
        stage.dataset.mode = 'static-scroll';
        intro.pause();
        updateScene();
      }
    }

    function render(self) {
      progress = clamp(self.progress, 0, 1);
      stage.style.setProperty('--flight-progress', progress);
      if (tagline) {
        const scene = scenes[1];
        const start = (scene.start + (scene.end - scene.start) * 0.48) / 100;
        const end = scene.end / 100;
        const isTagline = progress >= start && progress < end;
        stage.dataset.tagline = isTagline ? 'on' : 'off';
        const words = taglineRef.current?.children || [];
        const illuminated = clamp(Math.ceil(((progress - start) / (end - start)) * words.length), 0, words.length);
        for (let index = 0; index < words.length; index++) {
          words[index].classList.toggle('is-lit', index < illuminated);
        }
      }
      if (mediaFailed && !staticMode && progress <= 0) {
        showIntro();
      } else if (staticMode || mediaFailed) {
        stage.dataset.mode = progress ? 'static-scroll' : 'static-intro';
        updateScene();
      } else if (progress <= 0) {
        showIntro();
      } else {
        seek();
        if (stage.dataset.mode === 'scroll') updateScene();
      }
    }

    function onVisibility() {
      if (document.visibilityState !== 'visible' || !visible || progress > 0 || staticMode) {
        intro.pause();
      } else {
        intro.play().catch(() => {});
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      onVisibility();
    });
    observer.observe(world);
    scroll.addEventListener('loadedmetadata', onMetadata);
    scroll.addEventListener('error', onError);
    scroll.addEventListener('seeked', onSeeked);
    scroll.addEventListener('transitionend', onFadeEnd);
    document.addEventListener('visibilitychange', onVisibility);
    if (scroll.readyState >= 1) onMetadata();
    if (scroll.error) onError();
    if (staticMode) {
      intro.pause();
      scroll.pause();
    }

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, scrollModule]) => {
      if (disposed) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: world,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: render,
        onRefresh: render,
      });
      render(trigger);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(revealRequest);
      observer.disconnect();
      scroll.removeEventListener('loadedmetadata', onMetadata);
      scroll.removeEventListener('error', onError);
      scroll.removeEventListener('seeked', onSeeked);
      scroll.removeEventListener('transitionend', onFadeEnd);
      document.removeEventListener('visibilitychange', onVisibility);
      trigger?.kill();
      intro.pause();
      scroll.pause();
    };
  }, [introVideo, scrollVideo, scenes]);

  return (
    <div
      className="flight-experience"
      id="inicio"
      ref={worldRef}
      style={{ '--flight-focus-desktop': objectPositionDesktop, '--flight-focus-mobile': objectPositionMobile }}
    >
      <div className="flight-markers" aria-hidden="true">
        <span id="recorrido" style={{ top: `${(scenes[0]?.start || 5) * 5.5}svh` }} />
        <span id="destino" style={{ top: `${(scenes.at(-1)?.start || 65) * 5.5}svh` }} />
      </div>
      <div className="flight-stage" ref={stageRef} data-mode="intro">
        <HeroVideo
          introVideo={introVideo}
          scrollVideo={scrollVideo}
          introPoster={introPoster}
          scrollPoster={scrollPoster}
          introRef={introRef}
          scrollRef={scrollRef}
        />
        <nav className="flight-nav" aria-label="Etapas del viaje">
          <a href="#inicio" aria-current={activeScene === -1 ? 'location' : undefined}>Inicio</a>
          <a href="#recorrido" aria-current={activeScene >= 0 && activeScene < scenes.length - 1 ? 'location' : undefined}>Recorrido</a>
          <a href="#destino" aria-current={activeScene === scenes.length - 1 ? 'location' : undefined}>Destino</a>
        </nav>
        <div className="flight-intro" aria-hidden={activeScene !== -1}>
          <p className="flight-eyebrow">Una nueva perspectiva</p>
          <h1>{introTitle}</h1>
          <p className="flight-intro-copy">{introSubtitle}</p>
        </div>
        <div className="flight-scenes">
          {scenes.map((scene, index) => (
            <SceneOverlay
              key={scene.id || index}
              scene={index === 1 && tagline ? { ...scene, subheadline: '' } : scene}
              active={activeScene === index}
              cta={index === scenes.length - 1 ? cta : undefined}
            />
          ))}
        </div>
        {tagline && (
          <p className="flight-tagline" aria-label={tagline}>
            <span ref={taglineRef} aria-hidden="true">
              {tagline.split(/\s+/).map((word, index) => (
                <span className="flight-tagline-word" key={`${index}-${word}`}>{word} </span>
              ))}
            </span>
          </p>
        )}
        <div className="flight-progress" aria-hidden="true"><span /></div>
        <p className="flight-scroll-hint">{scrollHint}</p>
      </div>
    </div>
  );
}
