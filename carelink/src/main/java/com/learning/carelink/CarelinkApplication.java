package com.learning.carelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication() // Provides : @EnableAutoConfiguration @ ComponentScan @SpringBootConfiguration
public class CarelinkApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarelinkApplication.class, args);
	}

}
