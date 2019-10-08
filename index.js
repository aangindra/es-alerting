require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://elasticsearch.softwaresekolah.co.id"
});
const dayjs = require("dayjs");
const { initDiscordWebhook, sendReportResult } = require("./src/discord-hook");

const start = async () => {
  try {
    await initDiscordWebhook(process.env.WEBHOOK_URL);

    //  ===== Example ====
    // const nowDate = dayjs().format("YYYY-MM-DD");
    // const yesterday = dayjs("2019-10-02").hour(20);
    // ======================

    // const result = await client.search({
    //  index: 'schooltalk-adminlogin-errorreporting-2019-10-02',
    //  body: {
    //   query: {
    //     match: { message: 'null' }
    //   }
    // }
    // });

    const results = await client.search({
      index: `schooltalk-adminlogin-errorreporting-${dayjs().format(
        "YYYY-MM-DD"
      )}`,
      body: {
        query: {
          range: {
            "@timestamp": {
              gte: dayjs()
                .subtract(1, "hour")
                .toISOString(),
              lte: dayjs().toISOString(),
              boost: 2.0
            }
          }
        }
      }
    });

    const errorMessages = results.body.hits.hits.map(h => h._source.stack);

    let nullError = 0;
    let undefinedError = 0;
    for (const message of errorMessages) {
      let msg = message.toLowerCase();

      if (msg.indexOf("null") > -1) {
        nullError += 1;
      } else if (msg.indexOf("undefined") > -1) {
        undefinedError += 1;
      }
    }

    const totalCount = results.body.hits.total.value;

    if (totalCount >= 50 || nullError >= 10 || undefinedError >= 10) {
      await sendReportResult({
        totalErrorLastHour: totalCount,
        nullErrorLastHour: nullError,
        undefinedErrorLastHour: undefinedError
      });
    }

    // console.log(dayjs("2019-10-02").hour(20).toISOString())
    // console.log(dayjs(yesterday).subtract(1, 'hour').toISOString())

    //2019-10-02T12:13:32.385Z

    //console.log(results.body.hits.hits);
    console.log(totalCount);
    if (totalCount > 100) {
      console.log("Jumlah error ", totalCount);
    }
    //console.log(results.body.hits.hits.length)
  } catch (err) {
    console.log(err.meta.body);
  }
};
start();
