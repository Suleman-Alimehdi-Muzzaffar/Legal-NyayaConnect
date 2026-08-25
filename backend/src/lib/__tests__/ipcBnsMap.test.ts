import { describe, it, expect } from 'vitest';
import { translateIpcMentions } from '../ipcBnsMap';

describe('ipcBnsMap', () => {
  it('translates IPC 302 to BNS 103', () => {
    expect(translateIpcMentions('IPC 302 kya hai?')).toContain('BNS 103');
  });
  it('translates CrPC 438 to BNSS 482', () => {
    expect(translateIpcMentions('CrPC 438')).toContain('BNSS 482');
  });
  it('translates Evidence 65B to BSA 63', () => {
    expect(translateIpcMentions('Evidence 65B')).toContain('BSA 63');
  });
  it('returns null for no IPC', () => {
    expect(translateIpcMentions('hello')).toBeNull();
  });
});
