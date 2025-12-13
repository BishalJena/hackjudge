'use client';


interface AsciiArtProps {
    className?: string;
}

const ART = `
        .           .
      /' \         / \`
     /   | .---.  |   \
    |    |/  _  \|    |
    |    |\`  _  /|    |
     \   | '---'  |   /
      \ /         \ /
       |           |
       |           |
       |           |
      /             \
     /               \
`;

export function AsciiArt({ className = '' }: AsciiArtProps) {
    return (
        <div className={`font-mono text-xs leading-none whitespace-pre text-terminal-green opacity-80 ${className}`}>
            {ART}
        </div>
    );
}
