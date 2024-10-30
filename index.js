const inquirer = require('inquirer');
const chalk = require('chalk');
const clipboardy = require('clipboardy');

// Password generation function
function generatePassword(length, hasUpper, hasLower, hasNumbers, hasSymbols) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (hasUpper) chars += uppercase;
  if (hasLower) chars += lowercase;
  if (hasNumbers) chars += numbers;
  if (hasSymbols) chars += symbols;

  if (chars === '') chars = lowercase; // Default to lowercase if nothing selected

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

// Store passwords temporarily (will be cleared when program exits)
let passwordHistory = [];

async function main() {
  console.clear();
  console.log(chalk.blue.bold('Password Generator\n'));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Generate New Password',
          'View Password History',
          'Exit'
        ]
      }
    ]);

    if (action === 'Exit') {
      // Clear password history for security
      passwordHistory = [];
      console.log(chalk.yellow('\nPassword history cleared. Goodbye!'));
      process.exit(0);
    }

    if (action === 'View Password History') {
      console.clear();
      if (passwordHistory.length === 0) {
        console.log(chalk.red('No passwords generated yet!\n'));
      } else {
        console.log(chalk.green('Password History:'));
        passwordHistory.forEach((pwd, index) => {
          console.log(chalk.white(`${index + 1}. ${pwd}`));
        });
        console.log('\n');
      }
      continue;
    }

    const options = await inquirer.prompt([
      {
        type: 'number',
        name: 'length',
        message: 'Password length:',
        default: 12,
        validate: (input) => input >= 4 || 'Length must be at least 4 characters'
      },
      {
        type: 'confirm',
        name: 'hasUpper',
        message: 'Include uppercase letters?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hasLower',
        message: 'Include lowercase letters?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hasNumbers',
        message: 'Include numbers?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hasSymbols',
        message: 'Include symbols?',
        default: true
      }
    ]);

    const password = generatePassword(
      options.length,
      options.hasUpper,
      options.hasLower,
      options.hasNumbers,
      options.hasSymbols
    );

    // Save to history
    passwordHistory.push(password);

    // Copy to clipboard
    clipboardy.writeSync(password);

    console.log(chalk.green('\nGenerated Password: ') + chalk.white.bold(password));
    console.log(chalk.yellow('Password copied to clipboard!\n'));
  }
}

// Start the program
main().catch(err => {
  console.error(chalk.red('An error occurred:'), err);
  process.exit(1);
});

// Clear passwords on exit
process.on('SIGINT', () => {
  passwordHistory = [];
  console.log(chalk.yellow('\nPassword history cleared. Goodbye!'));
  process.exit(0);
});