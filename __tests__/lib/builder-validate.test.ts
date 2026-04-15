import { validateBuilderFiles } from '@/app/lib/builder-validate';

describe('validateBuilderFiles', () => {
  const good = {
    'CLAUDE.md':
      '# H\n## Routing Rules\n1. If A, then call research_agent.\n2. If B, then call content_agent.\n## Work Rules\nDo the thing, follow tone.',
    '/agents/research_agent.md': '# R\nrole: gather sources\ntools: web_search\noutput: summary.md',
    '/agents/content_agent.md': '# C\nrole: draft content\ntools: notion\noutput: drafts.md',
    'README.md': '# readme\nwhat this is and how to use it, see QUICKSTART.md',
  };

  it('passes a valid file map', () => {
    const r = validateBuilderFiles(good);
    expect(r.ok).toBe(true);
  });

  it('fails when CLAUDE.md is missing', () => {
    const { ['CLAUDE.md']: _, ...rest } = good;
    const r = validateBuilderFiles(rest);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/CLAUDE\.md/);
  });

  it('fails when no Routing Rules section in CLAUDE.md', () => {
    const r = validateBuilderFiles({
      ...good,
      'CLAUDE.md': '# H\nno routing here at all\n## Work Rules\nDo the thing and follow tone carefully.',
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Routing Rules/);
  });

  it('fails with fewer than 2 sub-agent files', () => {
    const { ['/agents/content_agent.md']: _, ...rest } = good;
    const r = validateBuilderFiles(rest);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/sub-agent/);
  });

  it('fails when any file is under 50 characters (empty placeholder)', () => {
    const r = validateBuilderFiles({ ...good, 'README.md': 'tiny' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/too short|README\.md/);
  });
});
