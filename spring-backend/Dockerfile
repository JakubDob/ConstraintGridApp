FROM maven:3.8.5-eclipse-temurin-18-alpine as BuildEnv
COPY MinizincBackend /opt/MinizincBackend
RUN cd /opt/MinizincBackend && mvn package

FROM alpine:latest
EXPOSE 4444
WORKDIR /opt/java
COPY --from=BuildEnv /opt/MinizincBackend/target/MinizincBackend-1.0-SNAPSHOT.jar .
ENV JAVA_HOME=/opt/java/current
ENV PATH=$PATH:$JAVA_HOME/bin

RUN wget https://github.com/AdoptOpenJDK/openjdk16-binaries/releases/download/jdk-16.0.1%2B9/OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz && \
	tar xfz OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz && \
	rm -f OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz && \
	ln -s /opt/java/jdk-16.0.1+9-jre /opt/java/current
	
ENTRYPOINT ["java", "-jar", "MinizincBackend-1.0-SNAPSHOT.jar"]