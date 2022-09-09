FROM public.ecr.aws/lambda/nodejs:16

ENV WEBP_VERSION=1.2.4
ENV LIBDE265_VERSION=1.0.8
ENV LIBHEIF_VERSION=1.12.0
ENV VIPS_VERSION=8.12.2
ENV SHARP_VERSION=0.30.7
ENV PREFIX_PATH=/opt
ENV PKG_CONFIG_PATH=/opt/lib/pkgconfig

RUN yum install -y yum-plugin-ovl \
 && yum groupinstall -y "Development Tools" --setopt=group_package_types=mandatory,default \
 && yum install -y \
    glib2-devel \
    expat-devel \
    libjpeg-devel \
    libjpeg-turbo-devel \
    libpng-devel \
    giflib-devel \
    libexif-devel \
    librsvg2-devel \
    libtiff-devel

# libde265
RUN curl -L https://github.com/strukturag/libde265/releases/download/v${LIBDE265_VERSION}/libde265-${LIBDE265_VERSION}.tar.gz | tar zx \
 && cd libde265-${LIBDE265_VERSION} \
 && ./autogen.sh \
 && ./configure --disable-dec265 --disable-sherlock265 --prefix=${PREFIX_PATH} \
 && make V=0 \
 && make install

# libheif
RUN curl -L https://github.com/strukturag/libheif/releases/download/v${LIBHEIF_VERSION}/libheif-${LIBHEIF_VERSION}.tar.gz | tar zx \
 && cd libheif-${LIBHEIF_VERSION} \
 && ./autogen.sh \
 && ./configure --prefix=${PREFIX_PATH} \
 && make V=0 \
 && make install

# libwebp
RUN curl -L https://github.com/webmproject/libwebp/archive/v${WEBP_VERSION}.tar.gz | tar zx \
 && cd libwebp-${WEBP_VERSION} \
 && ./autogen.sh \
 && ./configure --enable-libwebpmux --prefix=${PREFIX_PATH} \
 && make V=0 \
 && make install

# sharp
RUN mkdir -p "/opt/nodejs" "/opt/lib" \
 && LD_LIBRARY_PATH=${PREFIX_PATH}/lib npm --prefix "/opt/nodejs/" install sharp@${SHARP_VERSION} \
 && LD_LIBRARY_PATH=${PREFIX_PATH}/lib ldd /opt/nodejs/node_modules/sharp/build/Release/sharp-linux-x64.node | sed -nE "s/^[^\/\n]*(\/[^ ]+)(.*)/\1/p" | xargs cp -t /opt/lib
