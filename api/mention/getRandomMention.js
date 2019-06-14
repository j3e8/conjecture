const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_FACETS_URL,
});

module.exports = function () {
  return client.search({
    index: 'compact_social_activity_2019.02.11',
    type: 'compact_social_activity',
    body: {
      sort: {
        _script: {
          script: Math.random(),
          type: "number",
          order: "asc",
        },
      },
    },
  })
    .then(response => response.hits.hits[0])
    .catch(err => console.error(err));
}
