import { Command, Args } from '@oclif/core';
import axios from 'axios';
import Conf from 'conf';
import * as fs from 'fs';
import * as path from 'path';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Submit extends Command {
  static description = 'Submit a solution for evaluation';

  static args = {
    file: Args.string({ description: 'Path to solution file', required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Submit);
    const user = config.get('user');
    const token = config.get('token');
    const challengeId = config.get('currentChallengeId');

    if (!user || !token) {
      this.error('You must be logged in to submit. Run "codearena login" first.');
    }

    if (!challengeId) {
      this.error('No active challenge found. Run "codearena start" first.');
    }

    const filePath = path.resolve(process.cwd(), args.file);
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${args.file}`);
    }

    const code = fs.readFileSync(filePath, 'utf-8');
    const language = path.extname(filePath) === '.js' ? 'javascript' : 'java';

    this.log('Submitting solution for evaluation...');

    try {
      const response = await axios.post(
        'http://localhost:3000/submissions',
        {
          challengeId,
          code,
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const submission = response.data;

      if (submission.status === 'passed') {
        this.log('\n✅ Solution PASSED!');
      } else if (submission.status === 'failed') {
        this.log('\n❌ Solution FAILED.');
      } else {
        this.log(`\n⚠️  Status: ${submission.status}`);
      }

      this.log('\nOutput:');
      this.log(submission.output);

    } catch (error: any) {
      if (error.response) {
        this.error(`Submission failed: ${JSON.stringify(error.response.data)}`);
      } else {
        this.error(`Submission failed: ${error.message}`);
      }
    }
  }
}
