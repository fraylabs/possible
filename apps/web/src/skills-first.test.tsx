import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OutcomesPage } from './catalog';
import { AgentProfilePage, AgentsPage } from './agents';
import { findAgentProfile } from './agents-data';
import paymentLinks from './payment-links.json' with { type: 'json' };

describe('skills shop', () => {
  it('renders portfolio previews in initial HTML without client fetches', () => {
    const staticPortfolio = [{ slug: 'possible-launch-film', title: 'Possible Launch Film', path: '/results/possible-launch-film/', src: 'https://example.com/poster.png' }];
    const motion = findAgentProfile('motion-designer')!;
    for (const html of [renderToStaticMarkup(<OutcomesPage staticPortfolio={staticPortfolio} />), renderToStaticMarkup(<AgentsPage staticPortfolio={staticPortfolio} />), renderToStaticMarkup(<AgentProfilePage agent={motion} staticPortfolio={staticPortfolio} />)]) {
      expect(html).toContain('https://example.com/poster.png');
      expect(html).toContain('Possible Launch Film result');
    }
  });
  it('shows both actions and the bundle price on the home screen', () => {
    render(<OutcomesPage outcomesFixture={[]} />);
    expect(screen.getByRole('heading', { name: 'Skills our agents run. Yours can too.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'See the skills' }).getAttribute('href')).toBe('/skills/');
    expect(screen.getByRole('link', { name: 'Buy every skill on sale' }).getAttribute('href')).toBe(paymentLinks.all);
    expect(screen.getAllByText(/US\$49/).length).toBeGreaterThan(0);
  });
  it('keeps legacy route redirects', () => {
    const redirects = readFileSync('public/_redirects', 'utf8');
    for (const line of ['/agents /skills/ 301', '/agents/* /skills/:splat 301', '/outcomes /results/ 301', '/outcomes/* /results/:splat 301']) expect(redirects).toContain(line);
  });
});
