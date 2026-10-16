import { skillCategories } from '@/content/skills';

interface SkillsFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function SkillsFallback({ reason }: SkillsFallbackProps) {
  return (
    <div className="skills-fallback" data-fallback-reason={reason}>
      <div className="skills-fallback-axis" aria-hidden="true" />
      <div className="skills-fallback-categories">
        {skillCategories.map((category) => (
          <section key={category.key} className="skills-fallback-category">
            <span>{category.index} / 06</span>
            <h3>{category.name}</h3>
            <p>{category.statement}</p>
            <ul>
              {category.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
