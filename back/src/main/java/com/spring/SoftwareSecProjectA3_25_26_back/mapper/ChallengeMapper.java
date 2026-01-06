package com.spring.SoftwareSecProjectA3_25_26_back.mapper;

import com.spring.SoftwareSecProjectA3_25_26_back.dal.model.postgres.Challenge;
import com.spring.SoftwareSecProjectA3_25_26_back.dto.ChallengeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface ChallengeMapper {

    ChallengeMapper INSTANCE = Mappers.getMapper(ChallengeMapper.class);

    ChallengeDto toDto(Challenge challenge);

    Challenge toEntity(ChallengeDto dto);
}
