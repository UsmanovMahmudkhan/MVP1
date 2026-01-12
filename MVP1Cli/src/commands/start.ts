import { Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';
import axios from 'axios';
import Conf from 'conf';
import * as fs from 'fs';
import * as path from 'path';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Start extends Command {
  static description = 'Start a new coding challenge';

  static flags = {
    difficulty: Flags.string({ char: 'd', description: 'Difficulty (easy, medium, hard)' }),
    language: Flags.string({ char: 'l', description: 'Language (javascript, java)' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Start);
    const user = config.get('user');

    if (!user) {
      this.error('You must be logged in to start a challenge. Run "codearena login" first.');
    }

    let { difficulty, language } = flags;

    if (!difficulty || !language) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'difficulty',
          message: 'Select difficulty:',
          choices: ['easy', 'medium', 'hard'],
          when: !difficulty,
        },
        {
          type: 'list',
          name: 'language',
          message: 'Select language:',
          choices: ['javascript', 'java'],
          when: !language,
        },
      ]);
      difficulty = difficulty || answers.difficulty;
      language = language || answers.language;
    }

    this.log(`Generating ${difficulty} ${language} challenge... (This may take a moment)`);

    try {
      const response = await axios.post('http://localhost:3000/challenges/generate', {
        difficulty,
        language,
      });

      const challenge = response.data;

      this.log('\n' + '='.repeat(50));
      this.log(`Challenge: ${challenge.title}`);
      this.log('='.repeat(50));
      this.log(challenge.description);
      this.log('='.repeat(50));

      const fileName = `solution.${language === 'javascript' ? 'js' : 'java'}`;
      const filePath = path.join(process.cwd(), fileName);

      fs.writeFileSync(filePath, challenge.template);

      // Save challenge ID for submission
      config.set('currentChallengeId', challenge.id);

      this.log(`\nStarter code written to ${fileName}`);
      this.log(`Run "codearena submit ${fileName}" when you are ready!`);

    } catch (error: any) {
      if (error.response) {
        this.error(`Failed to generate challenge: ${error.response.data.error}`);
      } else {
        this.error(`Failed to generate challenge: ${error.message}`);
      }
    }
  }
}
