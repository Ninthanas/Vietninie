package com.vietninie.api.config;

import com.fasterxml.jackson.core.StreamReadConstraints;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JsonConfig {
  @Bean
  Jackson2ObjectMapperBuilderCustomizer jsonLimits() {
    return builder ->
        builder.postConfigurer(
            mapper ->
                mapper
                    .getFactory()
                    .setStreamReadConstraints(
                        StreamReadConstraints.builder()
                            .maxStringLength(150000)
                            .maxNestingDepth(30)
                            .maxNumberLength(50)
                            .build()));
  }
}
