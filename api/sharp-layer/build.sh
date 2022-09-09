#!/bin/bash
set +x
IMAGE=sharp-0.30.7-node-16
BUILD_DIR=$(pwd)/build
rm -rf "${BUILD_DIR}" && mkdir -p "${BUILD_DIR}"
cat Dockerfile | docker build -t "${IMAGE}" -
docker run --rm --entrypoint tar "${IMAGE}" -ch -C /opt . | tar -x -C "${BUILD_DIR}"
