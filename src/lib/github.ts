/**
 * GitHub API Helper Functions
 */

const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubRepoInfo {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    htmlUrl: string;
    description: string | null;
    defaultBranch: string;
    language: string | null;
    updatedAt: string;
    stargazersCount: number;
    forksCount: number;
}

export interface GitHubUser {
    login: string;
    id: number;
    avatarUrl: string;
    name: string | null;
    email: string | null;
}

// Internal interface for GitHub API response
interface GitHubApiRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    default_branch: string;
    language: string | null;
    updated_at: string;
    stargazers_count: number;
    forks_count: number;
}

/**
 * Parse GitHub URL to extract owner and repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
        /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(\.git)?$/,
        /^git@github\.com:([^\/]+)\/([^\/]+?)(\.git)?$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return { owner: match[1], repo: match[2] };
        }
    }

    return null;
}

/**
 * Validate GitHub URL format
 */
export function isValidGitHubUrl(url: string): boolean {
    return parseGitHubUrl(url) !== null;
}

/**
 * Fetch repository information from GitHub API
 */
export async function getRepoInfo(
    owner: string,
    repo: string,
    token?: string
): Promise<GitHubRepoInfo | null> {
    try {
        const headers: HeadersInit = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
            headers,
        });

        if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            fullName: data.full_name,
            private: data.private,
            htmlUrl: data.html_url,
            description: data.description,
            defaultBranch: data.default_branch,
            language: data.language,
            updatedAt: data.updated_at,
            stargazersCount: data.stargazers_count,
            forksCount: data.forks_count,
        };
    } catch (error) {
        console.error('Error fetching repo info:', error);
        return null;
    }
}

/**
 * Fetch user's repositories
 */
export async function getUserRepos(
    token: string,
    options: { sort?: 'updated' | 'created' | 'pushed'; per_page?: number } = {}
): Promise<GitHubRepoInfo[]> {
    try {
        const { sort = 'updated', per_page = 30 } = options;

        const response = await fetch(
            `${GITHUB_API_BASE}/user/repos?sort=${sort}&per_page=${per_page}`,
            {
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.error(`GitHub API error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        return data.map((repo: GitHubApiRepo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            htmlUrl: repo.html_url,
            description: repo.description,
            defaultBranch: repo.default_branch,
            language: repo.language,
            updatedAt: repo.updated_at,
            stargazersCount: repo.stargazers_count,
            forksCount: repo.forks_count,
        }));
    } catch (error) {
        console.error('Error fetching user repos:', error);
        return [];
    }
}

/**
 * Fetch repository branches
 */
export async function getRepoBranches(
    owner: string,
    repo: string,
    token?: string
): Promise<string[]> {
    try {
        const headers: HeadersInit = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`,
            { headers }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.map((branch: { name: string }) => branch.name);
    } catch (error) {
        console.error('Error fetching branches:', error);
        return [];
    }
}

/**
 * Get authenticated user info
 */
export async function getAuthenticatedUser(token: string): Promise<GitHubUser | null> {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return {
            login: data.login,
            id: data.id,
            avatarUrl: data.avatar_url,
            name: data.name,
            email: data.email,
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
