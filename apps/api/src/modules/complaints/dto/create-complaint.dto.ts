import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

class CategoryFieldDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

class LocationDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  formattedAddress?: string;
}

export class CreateComplaintDto {
  @IsString()
  issueCategoryCode!: string;

  @IsString()
  @MaxLength(200)
  description!: string;

  @IsString()
  creditName!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryFieldDto)
  categoryFields!: CategoryFieldDto[];
}

