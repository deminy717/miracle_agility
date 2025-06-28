package com.miracle.agility;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.miracle.agility.mapper")
public class MiracleAgilityApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiracleAgilityApplication.class, args);
    }

} 