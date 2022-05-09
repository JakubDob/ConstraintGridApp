package app.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import app.solver.ModelParser;

@Configuration
public class AppConfig {
	
	@Bean
	public ModelParser modelParser() {
		return new ModelParser();
	}
}
