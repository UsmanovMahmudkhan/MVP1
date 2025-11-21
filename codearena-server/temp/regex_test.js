const code = `
class Solution {
    public int optimalBookReadingTime(int[] readingTimes, int[] scores, int timeLimit) {
        return 0;
    }
}
`;

const methodMatches = [...code.matchAll(/public\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/g)];
console.log('Matches found:', methodMatches.length);

for (const match of methodMatches) {
    const returnType = match[1];
    const methodName = match[2];
    const paramsStr = match[3];

    console.log(`Method: ${methodName}, Return: ${returnType}`);
    console.log(`Params String: "${paramsStr}"`);

    const params = paramsStr.split(',').map(p => {
        const parts = p.trim().split(/\s+/);
        return parts[parts.length - 1]; // The last part is the name
    });

    console.log('Param Names:', params);
}
