import { Command } from "commander";

import authTokenManagement from './authTokenDatabase'

const program = new Command();

program.version('1.0.0').description('Auth token generator (mocked)')

program.command('add [quantity]').description("Add a number of mocked users on redis").action((quantity => {
    authTokenManagement.addNumberOfUsers(quantity);
}))
program.command('list').description("List all logged users").action(authTokenManagement.listMockedUsers)

program.parse(process.argv);

// Encerre a conexão Redis após a execução dos comandos
process.on('exit', () => {
    authTokenManagement.exitRedis();
});