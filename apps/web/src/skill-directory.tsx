"use client";

import { useState } from "react";
import { getSkillOutcomes, publishedSkills, skillHref } from "./public-content";
import { SiteShell } from "./shared";

export function SkillsPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const skills = publishedSkills.filter((skill) => !normalizedQuery || [skill.name, skill.repository, skill.directory].join(" ").toLowerCase().includes(normalizedQuery));

  return (
    <SiteShell className="products-page skills-page">
      <section className="products-directory" aria-labelledby="skills-directory-heading">
        <header className="product-categories">
          <span id="skills-directory-heading">SKILLS</span>
          <p>Capabilities used by published Outcomes.</p>
        </header>
        <label className="product-directory-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills" aria-label="Search skills" />
          <small>{skills.length} RESULT{skills.length === 1 ? "" : "S"}</small>
        </label>
        <div className="products-grid" aria-live="polite">
          {skills.map((skill) => {
            const outcomes = getSkillOutcomes(skill.id);
            return (
              <a className="product-directory-card skill-directory-card" href={skillHref(skill)} key={skill.id}>
                <header><span className="skill-directory-mark">SK</span><div><h2>{skill.name}</h2><span>{skill.repository}</span></div><i>↗</i></header>
                <p>{skill.directory}</p>
                <div className="product-directory-meta"><span>Skill</span><span>{outcomes.length} {outcomes.length === 1 ? "Outcome" : "Outcomes"}</span></div>
              </a>
            );
          })}
        </div>
        {!skills.length ? <p className="products-empty">No Skills match this search.</p> : null}
      </section>
    </SiteShell>
  );
}
