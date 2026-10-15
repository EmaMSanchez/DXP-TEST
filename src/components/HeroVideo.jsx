export default function HeroVideo({ introVideo, scrollVideo, introPoster, scrollPoster, introRef, scrollRef }) {
  return (
    <div className="flight-media" aria-hidden="true">
      <img className="flight-poster" src={introPoster} alt="" fetchPriority="high" />
      <video
        ref={introRef}
        className="flight-intro-video"
        src={introVideo}
        poster={introPoster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />
      <img className="flight-scroll-poster" src={scrollPoster} alt="" loading="eager" decoding="async" />
      <video
        ref={scrollRef}
        className="flight-scroll-video"
        src={scrollVideo}
        poster={scrollPoster}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />
    </div>
  );
}
