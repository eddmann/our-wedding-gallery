'use strict';

const { S3Client } = require('@aws-sdk/client-s3');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');

module.exports.handler = async event => {
  const photos = JSON.parse(JSON.parse(event.body)?.photos) || [];

  if (photos.length < 1 && photos.length > process.env.MAX_PHOTOS_PER_REQUEST) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        { error: `Expected between 1 and ${process.env.MAX_PHOTOS_PER_REQUEST} photos` },
        null,
        2
      ),
    };
  }

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
  });

  const urls = await Promise.all(
    photos.map(name =>
      createPresignedPost(s3, {
        Bucket: process.env.UPLOAD_BUCKET_NAME,
        Key: `${Math.random().toString(36).substring(2)}.${name.split('.').pop()}`,
        Expires: photos.length * 300,
      })
    )
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify(
      {
        _links: {
          self: { href: `${process.env.HOST}/api/request` },
          list: { href: `${process.env.HOST}/api/list` },
          bootstrap: { href: `${process.env.HOST}/api` },
        },
        urls,
      },
      null,
      2
    ),
  };
};
