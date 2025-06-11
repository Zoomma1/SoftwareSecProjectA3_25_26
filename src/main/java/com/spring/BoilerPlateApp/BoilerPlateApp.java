package com.spring.BoilerPlateApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BoilerPlateApp {

	public static void main(String[] args) {
		SpringApplication.run(BoilerPlateApp.class, args);
	}

}
