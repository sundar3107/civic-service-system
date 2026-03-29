import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ComplaintStatus } from "@civic/types";

export class UpdateComplaintStatusDto {
  @IsEnum(ComplaintStatus)
  status!: ComplaintStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

