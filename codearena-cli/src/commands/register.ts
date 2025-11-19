import { Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';
import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'codearena-cli' });

export default class Register extends Command {
  static description = 'Register a new user';

  static flags = {
    username: Flags.string({ char: 'u', description: 'Username' }),
    email: Flags.string({ char: 'e', description: 'Email' }),
    password: Flags.string({ char: 'p', description: 'Password' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Register);

    let { username, email, password } = flags;

    if (!username || !email || !password) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Enter your username:',
          when: !username,
        },
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
      username = username || answers.username;
      email = email || answers.email;
      password = password || answers.password;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/register', {
        username,
        email,
        password,
      });

      const { token, user } = response.data;
      config.set('token', token);
      config.set('user', user);

      this.log(`Successfully registered as ${user.username}!`);
    } catch (error: any) {
      if (error.response) {
        this.error(`Registration failed: ${error.response.data.error}`);
      } else {
        this.error(`Registration failed: ${error.message}`);
      }
    }
  }
}
