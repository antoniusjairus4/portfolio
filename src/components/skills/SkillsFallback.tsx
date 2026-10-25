import { skillCategories } from '@/content/skills';

interface SkillsFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function SkillsFallback({ reason }: SkillsFallbackProps) {
  return (
    <div className="capability-fallback" data-fallback-reason={reason}>
      <header className="capability-fallback-card capability-fallback-intro">
        <span>00 / INTRODUCTION</span>
        <h2 id="skills-title">SKILLS</h2>
        <strong>CAPABILITY LANDSCAPE</strong>
        <p>Different disciplines. One connected system.</p>
      </header>
      {skillCategories.map((category, index) => (
        <section
          key={category.key}
          className={`capability-fallback-card ${index % 2 === 0 ? 'is-right' : 'is-left'}`}
        >
          <span>{category.index} / 06</span>
          <h3>{category.name}</h3>
          <ul>
            {category.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
