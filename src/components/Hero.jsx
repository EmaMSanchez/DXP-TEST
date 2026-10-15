import ScrollExperience from './ScrollExperience.jsx';
import '../styles/hero.css';

export default function Hero({ content }) {
  return (
    <ScrollExperience
      {...content}
    />
  );
}
