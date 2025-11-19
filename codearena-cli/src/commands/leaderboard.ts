import { Command } from '@oclif/core';
import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Leaderboard extends Command {
    static description = 'View the global leaderboard';

    async run(): Promise<void> {
        const user = config.get('user');
        const token = config.get('token');

        if (!user || !token) {
            this.error('You must be logged in to view the leaderboard. Run "codearena login" first.');
        }

        try {
            const response = await axios.get('http://localhost:3000/stats/leaderboard', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const leaderboard = response.data;

            this.log('\n🏆  CodeArena Leaderboard  🏆');
            this.log('=============================');
            this.log('Rank  User             Level  XP');
            this.log('-----------------------------');

            leaderboard.forEach((entry: any, index: number) => {
                const rank = (index + 1).toString().padEnd(4);
                const username = entry.username.padEnd(16);
                const level = entry.level.toString().padEnd(6);
                const xp = entry.xp.toString();

                // Highlight current user
                const prefix = entry.username === (user as any).username ? '👉 ' : '   ';

                this.log(`${prefix}${rank}${username}${level}${xp}`);
            });
            this.log('=============================\n');

        } catch (error: any) {
            if (error.response) {
                this.error(`Failed to fetch leaderboard: ${error.response.data.error}`);
            } else {
                this.error(`Failed to fetch leaderboard: ${error.message}`);
            }
        }
    }
}
