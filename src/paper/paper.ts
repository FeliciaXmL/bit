import commander from 'commander';
import { splitWhen, equals } from 'ramda';
import { Command } from './command';
import CommandRegistry from './registry';
import { register } from '../cli/command-registry';
import { AlreadyExistsError } from './exceptions/already-exists';
import { Help } from './commands/help.cmd';

export default class Paper {
  readonly groups: { [k: string]: string } = {};
  constructor(
    /**
     * paper's command registry
     */
    private registry: CommandRegistry
  ) {}

  private setDefaults(command: Command) {
    const defaults = {
      alias: '',
      description: '',
      shortDescription: '',
      group: 'extensions',
      options: [],
      private: false,
      loader: false,
      commands: []
    };
    return Object.assign({}, defaults, command);
  }
  /**
   * registers a new command in to `Paper`.
   */
  register(command: Command) {
    const commandWithDefaults = this.setDefaults(command);
    this.registry.register(commandWithDefaults);
    return this;
  }

  /**
   * list of all registered commands.
   */
  get commands() {
    return this.registry.commands;
  }

  /**
   * execute commands registered to `Paper` and the legacy bit cli.
   *
   */
  async run() {
    const args = process.argv.slice(2);
    if ((args[0] && ['-h', '--help'].includes(args[0])) || process.argv.length === 2) {
      Help()(this.commands, this.groups);
      return;
    }
    /* eslint-disable */
    Object.entries(this.commands).reduce(function(acc, [_key, paperCommand]) {
      register(paperCommand as any, acc);
      return acc;
    }, commander);

    const [params, packageManagerArgs] = splitWhen(equals('--'), process.argv);
    commander.packageManagerArgs = packageManagerArgs;
    await commander.parseAsync(params);
    return;
  }

  registerGroup(name: string, description: string) {
    if (this.groups[name]) {
      throw new AlreadyExistsError('group', name);
    }
    this.groups[name] = description;
  }
}
