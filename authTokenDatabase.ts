import { faker } from '@faker-js/faker';
import ioRedis from 'ioredis';

/**
 * - simulando decisão técnica
 *
 * Vamos deixar o nosso servidor redis responsável por anexar
 * alguns dados a mais do que o básico.
 *
 * Vamos anexar mais do que isso, visando deixar o redis
 * responsável por "cachear" algumas informações a mais do
 * usuário.
 *
 * isso, com objetivo de poupar processamento dos nossos containers
 * de backend.
 *
 */

import database from './database.config.json';

const EXPIRATION_INTERVAL_MINUTES = 10;
const EXPIRATION_INTERVAL_SECONDS = EXPIRATION_INTERVAL_MINUTES * 60;

const REDIS_HOST = database.HOST;
const REDIS_PORT = database.PORT;
const REDIS_PREFIX = database.PREFIX;

const redis = new ioRedis(REDIS_PORT, REDIS_HOST);

function generateUserToken() {
    return faker.string.uuid();
}

function generateMockedUser() {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + EXPIRATION_INTERVAL_MINUTES);

    return {
        avatar: faker.image.avatar(),
        userId: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        expiration: expirationDate.toISOString(),
    };
}

function addNumberOfUsers(quantity?: number) {

    const defaultQuantityOrParam = quantity ?? 1;

    if(!quantity) console.warn(`adicionando ${defaultQuantityOrParam} usuários mocados`);

    for (let i = 0; i < defaultQuantityOrParam; i++) {
        addMockedUserToRedis();
    }
}

function addMockedUserToRedis() {
    const token = generateUserToken();
    const user = generateMockedUser();

    const key = `${REDIS_PREFIX}:${token}`;

    // Usando hmset para definir múltiplos campos no hash
    redis.hmset(key, user);

    console.warn('mocked user created:', { user })

    // Define tempo de expiração em segundos
    redis.expire(key, EXPIRATION_INTERVAL_SECONDS);
}

async function getRegisteredTokens() {
    // Use o comando KEYS para obter todas as chaves de hash que começam com o prefixo
    const keys = await redis.keys(`${REDIS_PREFIX}:*`);

    return keys;
}

async function getTokenContent(token: string) {
    return await redis.hgetall(token);
}

async function listMockedUsers() {
    try {
        const tokens = await getRegisteredTokens()
        if (!tokens.length) return console.warn("Não há tokens registrados:", { tokens });

        const numberOfLoggedUsers = tokens.length;
        console.warn(`${numberOfLoggedUsers} users currently logged`)
        const tokenContents = await Promise.all(tokens.map(getTokenContent));
        tokenContents.forEach((content, index) => {
            console.log({
                key: tokens[index],
                token: content,
            });
        });
    } catch (error) {
        console.error('Erro ao listar tokens:', error);
    }
}

function exitRedis() {
    redis.quit();
}

export default {
    addMockedUserToRedis,
    addNumberOfUsers,
    listMockedUsers,
    exitRedis,
}