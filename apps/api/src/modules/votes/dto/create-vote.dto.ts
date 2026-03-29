import { IsString } from "class-validator";

export class CreateVoteDto {
  @IsString()
  complaintId!: string;
}

