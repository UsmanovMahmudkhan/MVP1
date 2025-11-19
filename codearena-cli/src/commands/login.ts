import { Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';
import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Login extends Command {
  static description = 'Login to CodeArena';

  static flags = {
    email: Flags.string({ char: 'e', description: 'Email' }),
    password: Flags.string({ char: 'p', description: 'Password' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let { email, password } = flags;

    if (!email || !password) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Enter your email:',
          when: !email,
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:',
          when: !password,
        },
      ]);
      email = email || answers.email;
      password = password || answers.password;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      config.set('token', token);
      config.set('user', user);

      this.log(`Successfully logged in as ${user.username}!`);
    } catch (error: any) {
      if (error.response) {
        this.error(`Login failed: ${error.response.data.error}`);
      } else {
        this.error(`Login failed: ${error.message}`);
      }
    }
  }
}
