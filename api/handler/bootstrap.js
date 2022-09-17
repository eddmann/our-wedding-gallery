'use strict';

module.exports.handler = async event => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/hal+json',
    },
    body: JSON.stringify(
      {
        _links: {
          self: { href: `${process.env.HOST}/api` },
          list: { href: `${process.env.HOST}/api/list` },
          request: { href: `${process.env.HOST}/api/request` },
        },
        maxPhotosPerRequest: +process.env.MAX_PHOTOS_PER_REQUEST,
      },
      null,
      2
    ),
  };
};
