package app.qpid;

import org.springframework.beans.factory.BeanCreationException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class QpidConfiguration {

	@Bean
	public QpidClient qpidClient() {
		if(QpidClient.getInstance().connect()) {
			return QpidClient.getInstance();			
		}
		else {
			throw new BeanCreationException("Cannot connect to the message queue");
		}
	}
}
