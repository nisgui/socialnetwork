package com.projeto;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Projeto1Application implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(Projeto1Application.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("Iniciando o run");
		int valor = 4;
		System.out.println("o valor é " + valor);
		System.out.println("Finalizando o run");
		
	}

}
