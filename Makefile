SHELL := /bin/bash

#
# API
#

API_DEV_DYNAMODB_CONTAINER_NAME := our-wedding-gallery-dynamodb
API_DEV_ENV_VARS := AWS_ACCESS_KEY_ID=S3RVER AWS_SECRET_ACCESS_KEY=S3RVER

.PHONY: api/dev/start
api/dev/start: api/dev/s3 api/dev/dynamodb
	@cd api \
	&& ${API_DEV_ENV_VARS} ./node_modules/.bin/serverless offline --region eu-west-1 --stage dev

.PHONY: api/dev/dynamodb
api/dev/dynamodb:
	@cd api \
	&& docker stop ${API_DEV_DYNAMODB_CONTAINER_NAME} || true \
	&& docker rm ${API_DEV_DYNAMODB_CONTAINER_NAME} || true \
	&& docker run -d -p 8123:8000 --name ${API_DEV_DYNAMODB_CONTAINER_NAME} docker.io/amazon/dynamodb-local:1.18.0 -jar DynamoDBLocal.jar -inMemory -sharedDb \
	&& ${API_DEV_ENV_VARS} ./node_modules/.bin/serverless dynamodb migrate --region eu-west-1 --stage dev

.PHONY: api/dev/s3
api/dev/s3:
	@rm -fr api/dev/s3 && mkdir -p api/dev/s3

.PHONY: api/deploy
api/deploy: _require_AWS_ACCESS_KEY_ID _require_AWS_SECRET_ACCESS_KEY _require_STAGE
	cd api \
	&& yarn \
	&& ./node_modules/.bin/serverless deploy --stage ${STAGE} --region eu-west-1 --verbose --conceal

#
# Client
#

.PHONY: client/dev/start
client/dev/start:
	@cd client \
	&& PORT=4000 REACT_APP_API_BOOTSTRAP_URL=http://localhost:3000/api yarn start

_require_%:
	@_=$(or $($*),$(error "`$*` env var required"))
