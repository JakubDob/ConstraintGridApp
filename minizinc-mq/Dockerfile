FROM alpine:latest AS BuildEnv

COPY MinizincMQ /opt/MinizincMQ

RUN apk update && apk add \
    ca-certificates \
    build-base \
    cmake \
    git \
    python3 \
    wget \
    linux-headers

RUN cd /opt && \
    git clone https://github.com/apache/qpid-proton.git && \
    cd qpid-proton && \
    cmake -S . -B build \
    -DBUILD_TESTING=OFF && \
    cmake --build build --config=Release && \
    cmake --install build

RUN cd /opt && \
    wget --quiet \
    https://boostorg.jfrog.io/artifactory/main/release/1.79.0/source/boost_1_79_0.tar.gz && \
    tar xzf ./boost_1_79_0.tar.gz && \
    cd ./boost_1_79_0 && \
    ./bootstrap.sh && \
    ./b2 variant=release link=static threading=multi --with-filesystem install

RUN cd /opt/MinizincMQ && \
    cmake -S . -B build && \
    cmake --build build --config=Release

#build the main executable and copy runtime dependencies to the location expected by the binary
RUN mkdir -p /opt/deps && \
    cd /opt/MinizincMQ/build && \
    ldd MinizincMq | grep '=>' | awk '{print $3}' | xargs -I '{}' cp -v '{}' /opt/deps && \
    objdump -p MinizincMq | grep 'RPATH' | awk '{print $2}' > /opt/deps/runpath && \
    find /opt/deps -name '*.so*' -exec basename {} \; > /opt/deps/lib_list

FROM minizinc/minizinc:latest-alpine AS RuntimeEnv
COPY --from=BuildEnv /opt/MinizincMQ/build/MinizincMq /bin/
COPY --from=BuildEnv /opt/deps /opt/deps
RUN cd /opt/deps && \
    mkdir -p `cat runpath` && \
    cat lib_list | xargs -I '{}' cp -v '/opt/deps/''{}' `cat runpath` && \
    rm -rf /opt/deps

ENTRYPOINT [ "MinizincMq" ]
#name of the broker to connect to within the network, model message queue, solution message queue
CMD [ "Artemis:61616", "SolverAddress::solutions", "SolverAddress::models" ]