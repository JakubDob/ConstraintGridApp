FROM alpine:latest

ARG ARTEMIS_VERSION=2.22.0
ENV JAVA_HOME=/opt/java/current
ENV PATH=$PATH:$JAVA_HOME/bin

WORKDIR /opt/java
RUN wget "https://github.com/AdoptOpenJDK/openjdk16-binaries/releases/download/jdk-16.0.1%2B9/OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz" && \
	tar xfz OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz && \
	rm -f OpenJDK16U-jre_x64_alpine-linux_hotspot_16.0.1_9.tar.gz && \
	ln -s /opt/java/jdk-16.0.1+9-jre /opt/java/current
	
#Install artemis
WORKDIR /opt
RUN wget "https://repository.apache.org/content/repositories/releases/org/apache/activemq/apache-artemis/${ARTEMIS_VERSION}/apache-artemis-${ARTEMIS_VERSION}-bin.tar.gz" && \
	tar xfz "apache-artemis-${ARTEMIS_VERSION}-bin.tar.gz" && \
	ln -s "/opt/apache-artemis-${ARTEMIS_VERSION}" "/opt/apache-artemis" && \
	rm -f "apache-artemis-${ACTIVEMQ_ARTEMIS_VERSION}-bin.tar.gz"
	
#Create broker instance
WORKDIR /var/lib
RUN "/opt/apache-artemis/bin/artemis" create artemis \
	--home /opt/apache-artemis \
	--user admin \
	--password admin \
	--role amq \
	--require-login \
	--cluster-user adminCluster \
	--cluster-password adminCluster

COPY broker.xml /var/lib/artemis/etc/broker.xml

EXPOSE 8161
EXPOSE 61616

VOLUME ["/var/lib/artemis/bin"]
VOLUME ["/var/lib/artemis/data"]
VOLUME ["/var/lib/artemis/etc"]

WORKDIR /var/lib/artemis/bin

ENTRYPOINT [ "sh", "artemis", "run" ]