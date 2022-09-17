'use strict';

const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const toPublicReadUrl = url =>
  process.env.PHOTO_BUCKET_PUBLIC_READ_URL.replace('{path}', new URL(url).pathname);

module.exports.handler = async event => {
  const { next } = event.queryStringParameters || {};

  const client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  });

  const params = {
    TableName: process.env.PHOTO_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk and GSI1SK < :sk',
    ExpressionAttributeValues: {
      ':pk': { S: 'list' },
      ':sk': { S: next || `${new Date().getTime()}` },
    },
    ScanIndexForward: false,
    Limit: +process.env.PHOTOS_PER_BATCH,
  };

  const records = await client.send(new QueryCommand(params));
  const nextPointer = records.LastEvaluatedKey?.GSI1SK?.S;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify(
      {
        _links: {
          self: {
            href: next
              ? `${process.env.HOST}/api/list?next=${next}`
              : `${process.env.HOST}/api/list`,
          },
          ...(nextPointer
            ? { next: { href: `${process.env.HOST}/api/list?next=${nextPointer}` } }
            : {}),
          request: { href: `${process.env.HOST}/api/request` },
          bootstrap: { href: `${process.env.HOST}/api` },
        },
        photos: records.Items.map(record => ({
          id: record.PK.S,
          thumbnail: toPublicReadUrl(record.thumbnail.S),
          web: toPublicReadUrl(record.web.S),
          original: toPublicReadUrl(record.original.S),
        })),
      },
      null,
      2
    ),
  };
};
