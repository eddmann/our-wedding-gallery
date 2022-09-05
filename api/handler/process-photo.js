'use strict';

const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');

const getCurrentDate = () => {
  const date = new Date();

  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  let month = date.getMonth() + 1;
  month = month > 9 ? month : `0${month}`;
  const year = date.getFullYear();

  return { day, month, year };
};

module.exports.handler = async event => {
  const s3 = new AWS.S3({
    s3ForcePathStyle: process.env.IS_OFFLINE,
    endpoint: process.env.S3_ENDPOINT || undefined,
  });

  const { key } = event.Records[0].s3.object;

  const object = await s3
    .getObject({
      Bucket: event.Records[0].s3.bucket.name,
      Key: key,
    })
    .promise();

  const photo = sharp(object.Body);
  const metadata = await photo.metadata();

  const { name } = path.parse(key);
  const { day, month, year } = getCurrentDate();

  const thumbnailKey = `${process.env.PHOTO_BUCKET_PREFIX}/thumbnail/${year}/${month}/${day}/${name}.webp`;
  const webKey = `${process.env.PHOTO_BUCKET_PREFIX}/web/${year}/${month}/${day}/${name}.webp`;
  const originalKey = `${process.env.PHOTO_BUCKET_PREFIX}/original/${year}/${month}/${day}/${key}`;

  await Promise.all([
    photo
      .resize(metadata.width > 400 ? 400 : metadata.width)
      .webp()
      .toBuffer()
      .then(output =>
        s3
          .putObject({
            Key: thumbnailKey,
            Bucket: process.env.PHOTO_BUCKET_NAME,
            Body: output,
          })
          .promise()
      ),

    photo
      .resize(metadata.width > 1080 ? 1080 : metadata.width)
      .webp()
      .toBuffer()
      .then(output =>
        s3
          .putObject({
            Key: webKey,
            Bucket: process.env.PHOTO_BUCKET_NAME,
            Body: output,
          })
          .promise()
      ),

    s3
      .putObject({
        Key: originalKey,
        Bucket: process.env.PHOTO_BUCKET_NAME,
        Body: object.Body,
      })
      .promise(),
  ]);

  const client = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  });

  const processedAt = `${new Date().getTime()}`;

  await client
    .put({
      TableName: process.env.PHOTO_TABLE_NAME,
      Item: {
        PK: `image#${name}`,
        SK: processedAt,
        GSI1PK: 'list',
        GSI1SK: processedAt,
        thumbnail: `s3://${process.env.PHOTO_BUCKET_NAME}/${thumbnailKey}`,
        web: `s3://${process.env.PHOTO_BUCKET_NAME}/${webKey}`,
        original: `s3://${process.env.PHOTO_BUCKET_NAME}/${originalKey}`,
      },
    })
    .promise();

  await s3
    .deleteObject({
      Bucket: event.Records[0].s3.bucket.name,
      Key: key,
    })
    .promise();
};
