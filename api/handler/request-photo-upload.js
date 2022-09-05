'use strict';

const AWS = require('aws-sdk');

module.exports.handler = async event => {
  const photos = JSON.parse(JSON.parse(event.body)?.photos) || [];

  const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT || undefined,
  });

  if (photos.length < 1 && photos.length > 10) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Expected between 1 and 10 photos' }, null, 2),
    };
  }

  const urls = photos.map(name =>
    s3.createPresignedPost({
      Bucket: process.env.UPLOAD_BUCKET_NAME,
      Fields: {
        key: `${Math.random().toString(36).substring(2)}.${name.split('.').pop()}`,
      },
      Expires: photos.length * 300,
    })
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify(
      {
        _links: {
          self: { href: `${process.env.HOST}/request` },
          list: { href: process.env.HOST },
        },
        urls,
      },
      null,
      2
    ),
  };
};
