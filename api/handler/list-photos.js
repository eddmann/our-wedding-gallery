'use strict';

const AWS = require('aws-sdk');

const toPublicReadUrl = url =>
  process.env.PHOTO_BUCKET_PUBLIC_READ_URL.replace('{path}', new URL(url).pathname);

module.exports.handler = async event => {
  const { next } = event.queryStringParameters || {};

  const client = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  });

  const params = {
    TableName: process.env.PHOTO_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk and GSI1SK < :sk',
    ExpressionAttributeValues: {
      ':pk': 'list',
      ':sk': next || `${new Date().getTime()}`,
    },
    ScanIndexForward: false,
    Limit: process.env.PHOTOS_PER_BATCH,
  };

  const records = await client.query(params).promise();
  const nextPointer = records.LastEvaluatedKey?.GSI1SK;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify(
      {
        _links: {
          self: { href: process.env.HOST },
          ...(nextPointer ? { next: { href: `${process.env.HOST}?next=${nextPointer}` } } : {}),
          request: { href: `${process.env.HOST}/request` },
        },
        photos: records.Items.map(record => ({
          id: record.PK,
          thumbnail: toPublicReadUrl(record.thumbnail),
          web: toPublicReadUrl(record.web),
          original: toPublicReadUrl(record.original),
        })),
      },
      null,
      2
    ),
  };
};
