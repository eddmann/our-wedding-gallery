SHELL := /bin/bash

#
# API
#

API_DEV_DYNAMODB_CONTAINER_NAME := our-wedding-gallery-dynamodb
API_DEV_ENV_VARS := AWS_ACCESS_KEY_ID=S3RVER AWS_SECRET_ACCESS_KEY=S3RVER

.PHONY: api/install
api/install:
	@yarn --cwd api

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
	@rm -fr api/s3 && mkdir -p api/s3

.PHONY: api/deploy
api/deploy: _require_AWS_ACCESS_KEY_ID _require_AWS_SECRET_ACCESS_KEY _require_STAGE
	@cd api \
	&& yarn \
	&& ./node_modules/.bin/serverless deploy --stage ${STAGE} --region eu-west-1 --verbose --conceal

#
# Client
#

.PHONY: client/install
client/install:
	@yarn --cwd client

.PHONY: client/dev/start
client/dev/start:
	@cd client \
	&& PORT=4000 REACT_APP_API_BOOTSTRAP_URL=http://localhost:3000/api yarn start

.PHONY: client/deploy
client/deploy: _require_AWS_ACCESS_KEY_ID _require_AWS_SECRET_ACCESS_KEY _require_STAGE
	@HOST=$$(docker run --rm \
	  -e AWS_ACCESS_KEY_ID \
	  -e AWS_SECRET_ACCESS_KEY \
	  docker.io/amazon/aws-cli:2.4.6 ssm get-parameter --region=eu-west-1 --name /our-wedding/${STAGE}/apps/gallery/host --query Parameter.Value --output text) \
	&& cd client \
	&& yarn \
	&& REACT_APP_API_BOOTSTRAP_URL=https://$${HOST}/api yarn build \
	&& docker run --rm \
	  -v $(PWD)/client/build:/build \
	  -e AWS_ACCESS_KEY_ID \
	  -e AWS_SECRET_ACCESS_KEY \
	  --entrypoint= \
	  docker.io/amazon/aws-cli:2.4.6 \
	    bash -c "CLIENT_S3_BUCKET_NAME=\$$(aws ssm get-parameter --region=eu-west-1 --name /our-wedding/${STAGE}/apps/gallery/client-s3-bucket-name --query Parameter.Value --output text); \
	             aws s3 sync --region=eu-west-1 /build "s3://\$${CLIENT_S3_BUCKET_NAME}" --quiet --delete --sse AES256"

_require_%:
	@_=$(or $($*),$(error "`$*` env var required"))
