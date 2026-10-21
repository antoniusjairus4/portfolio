import { skillCategories } from '@/content/skills';

function atlasPosition(domain: number, skill: number) {
  const index =
    skillCategories
      .slice(0, domain)
      .reduce((total, category) => total + category.skills.length, 0) + skill;
  return `${((index % 4) / 3) * 100}% ${(Math.floor(index / 4) / 7) * 100}%`;
}

interface SkillsFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function SkillsFallback({ reason }: SkillsFallbackProps) {
  return (
    <div className="skills-fallback" data-fallback-reason={reason}>
      <div className="skills-fallback-axis" aria-hidden="true" />
      <div className="skills-fallback-categories">
        {skillCategories.map((category, domain) => (
          <section key={category.key} className="skills-fallback-category">
            <span>{category.index} / 06</span>
            <h3>{category.name}</h3>
            <p>{category.statement}</p>
            <ul>
              {category.skills.map((skill, index) => (
                <li key={skill}>
                  <span
                    className="skills-fallback-mark"
                    aria-hidden="true"
                    style={{
                      backgroundPosition: atlasPosition(domain, index),
                    }}
                  />
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
