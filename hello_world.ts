import ioRedis from 'ioredis'
const redis = new ioRedis(6379, "127.0.0.1");

async function main() {
    console.log("salve")

    const items = await redis.lrange('items', 0, -1)

    console.log({ items })

    await redis.set('nosql-database', 'redis!!!')

    const data = await redis.get('nosql-database');

    console.log('"nosql-database" content: ', { data })

    console.log("want more? ok")
}

main();