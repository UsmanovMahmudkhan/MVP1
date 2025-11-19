import { Command } from '@oclif/core';
import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Stats extends Command {
  static description = 'View your coding stats and progress';

  async run(): Promise<void> {
    const user = config.get('user');
    const token = config.get('token');

    if (!user || !token) {
      this.error('You must be logged in to view stats. Run "codearena login" first.');
    }

    try {
      const response = await axios.get('http://localhost:3000/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stats = response.data;

      this.log('\n📊  CodeArena Stats  📊');
      this.log('=======================');
      this.log(`👤  User:       ${stats.username}`);
      this.log(`⭐  Level:      ${stats.level}`);
      this.log(`✨  XP:         ${stats.xp}`);
      this.log('-----------------------');
      this.log(`📝  Total Submissions:  ${stats.totalSubmissions}`);
      this.log(`✅  Passed Submissions: ${stats.passedSubmissions}`);
      this.log(`🏆  Challenges Solved:  ${stats.challengesSolved}`);
      this.log('=======================\n');

    } catch (error: any) {
      if (error.response) {
        this.error(`Failed to fetch stats: ${JSON.stringify(error.response.data)}`);
      } else {
        this.error(`Failed to fetch stats: ${error.message}`);
      }
    }
  }
}
