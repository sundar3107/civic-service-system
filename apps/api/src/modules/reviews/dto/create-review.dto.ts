import { IsInt, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @IsString()
  complaintId!: string;

  @IsInt()
  @Min(0)
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(100)
  body!: string;
}

