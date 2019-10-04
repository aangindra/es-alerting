const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch.softwaresekolah.co.id' });
const dayjs = require("dayjs");

const start = async () => {
  try {
    const nowDate = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs("2019-10-02").hour(20);

    // const result = await client.search({
    //  index: 'schooltalk-adminlogin-errorreporting-2019-10-02',
    //  body: {
    //   query: {
    //     match: { message: 'null' }
    //   }
    // }
    // });

    const results = await client.search({
      index: `schooltalk-adminlogin-errorreporting-${dayjs().format("YYYY-MM-DD")}`,
      body: {
        query: {
          "range": {
            "@timestamp": {
              "gte": dayjs().subtract(5, 'hour').toISOString(),
              "lte": dayjs().toISOString(),
              "boost": 2.0
            }
          }
        }
      }
    });

    // console.log(dayjs("2019-10-02").hour(20).toISOString())
    // console.log(dayjs(yesterday).subtract(1, 'hour').toISOString())

    //2019-10-02T12:13:32.385Z
    const totalCount = results.body.hits.total.value;
    //console.log(results.body.hits.hits);
    console.log(totalCount);
    if(totalCount > 100){
      console.log("Jumlah error ",totalCount);
    }
    //console.log(results.body.hits.hits.length)
  } catch (err) {
    console.log(err.meta.body)
  }
}
start();
