/**
 * Unit Tests: GitHub Utilities
 */

import {
    isValidGitHubUrl,
    parseGitHubUrl,
    getAuthUrl,
} from '@/lib/github';

describe('GitHub Utilities', () => {
    describe('isValidGitHubUrl', () => {
        it('should return true for valid HTTPS GitHub URLs', () => {
            expect(isValidGitHubUrl('https://github.com/owner/repo')).toBe(true);
            expect(isValidGitHubUrl('https://github.com/owner/repo.git')).toBe(true);
            expect(isValidGitHubUrl('https://github.com/owner/repo/')).toBe(true);
        });

        it('should return true for valid SSH GitHub URLs', () => {
            expect(isValidGitHubUrl('git@github.com:owner/repo.git')).toBe(true);
        });

        it('should return false for invalid URLs', () => {
            expect(isValidGitHubUrl('')).toBe(false);
            expect(isValidGitHubUrl('not-a-url')).toBe(false);
            expect(isValidGitHubUrl('https://gitlab.com/owner/repo')).toBe(false);
            expect(isValidGitHubUrl('https://github.com/')).toBe(false);
            expect(isValidGitHubUrl('https://github.com/owner')).toBe(false);
        });
    });

    describe('parseGitHubUrl', () => {
        it('should parse HTTPS URLs correctly', () => {
            const result = parseGitHubUrl('https://github.com/facebook/react');
            expect(result).toEqual({ owner: 'facebook', repo: 'react' });
        });

        it('should parse URLs with .git extension', () => {
            const result = parseGitHubUrl('https://github.com/facebook/react.git');
            expect(result).toEqual({ owner: 'facebook', repo: 'react' });
        });

        it('should parse SSH URLs correctly', () => {
            const result = parseGitHubUrl('git@github.com:facebook/react.git');
            expect(result).toEqual({ owner: 'facebook', repo: 'react' });
        });

        it('should return null for invalid URLs', () => {
            expect(parseGitHubUrl('')).toBeNull();
            expect(parseGitHubUrl('invalid')).toBeNull();
            expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
        });
    });

    describe('getAuthUrl', () => {
        it('should generate a valid OAuth URL with state', () => {
            const url = getAuthUrl('random-state');
            expect(url).toContain('https://github.com/login/oauth/authorize');
            expect(url).toContain('client_id=');
            expect(url).toContain('state=random-state');
            expect(url).toContain('scope=read%3Auser%2Crepo');
        });
    });

    describe('parseGitHubUrl edge cases', () => {
        it('should handle URLs with trailing slashes', () => {
            const result = parseGitHubUrl('https://github.com/owner/repo/');
            expect(result).toEqual({ owner: 'owner', repo: 'repo' });
        });

        it('should handle complex repo names', () => {
            const result = parseGitHubUrl('https://github.com/my-org/my-complex-repo-name');
            expect(result).toEqual({ owner: 'my-org', repo: 'my-complex-repo-name' });
        });

        it('should handle numeric-like names', () => {
            const result = parseGitHubUrl('https://github.com/user123/repo456');
            expect(result).toEqual({ owner: 'user123', repo: 'repo456' });
        });
    });

    describe('isValidGitHubUrl edge cases', () => {
        it('should handle edge case URLs', () => {
            // API URLs are not valid repo URLs
            expect(isValidGitHubUrl('https://api.github.com/repos/owner/repo')).toBe(false);

            // Raw URLs are not valid
            expect(isValidGitHubUrl('https://raw.githubusercontent.com/owner/repo/main/file.txt')).toBe(false);

            // Subpaths should still be valid (repo with extra path)
            expect(isValidGitHubUrl('https://github.com/owner/repo/tree/main')).toBe(true);
        });
    });
});
