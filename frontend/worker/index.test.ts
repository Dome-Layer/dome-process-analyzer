import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, isNoindexHost, isProxied, makeNonce, shellFor } from './index'

describe('tool Worker', () => {
  it('builds the CSP production sent, with the nonce in script-src and Mermaid\'s unsafe-eval kept', () => {
    const csp = contentSecurityPolicy('abc')
    expect(csp.startsWith("default-src 'self'; script-src 'self' 'nonce-abc' 'strict-dynamic' 'unsafe-eval'; ")).toBe(true)
    expect(csp).toContain("connect-src 'self' https://*.ingest.de.sentry.io;")
    expect(csp).not.toContain('{NONCE}')
  })

  it('makes a fresh 128-bit nonce each time', () => {
    const a = makeNonce()
    expect(atob(a)).toHaveLength(16)
    expect(makeNonce()).not.toBe(a)
  })

  it('serves every saved analysis from the one prebuilt shell, payloads included', () => {
    expect(shellFor('/saved/7c1e-analysis')).toBe('/saved/_')
    expect(shellFor('/saved/7c1e-analysis.txt')).toBe('/saved/_.txt')
    expect(shellFor('/saved/7c1e/__next._tree.txt')).toBe('/saved/_/__next._tree.txt')
    expect(shellFor('/saved')).toBeUndefined()
  })

  it('proxies the API and nothing else', () => {
    expect(isProxied('/api/v1/analysis')).toBe(true)
    expect(isProxied('/saved')).toBe(false)
    expect(isProxied('/apidocs')).toBe(false)
  })

  it('marks staging and workers.dev noindex, never production', () => {
    expect(isNoindexHost('analyzer.domelayer.com', { DOME_NOINDEX: 'true' } as never)).toBe(true)
    expect(isNoindexHost('dome-process-analyzer.x.workers.dev', {} as never)).toBe(true)
    expect(isNoindexHost('analyzer.domelayer.com', {} as never)).toBe(false)
  })
})
