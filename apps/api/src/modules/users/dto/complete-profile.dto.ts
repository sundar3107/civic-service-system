import { IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CompleteProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @IsInt()
  @Min(18)
  @Max(120)
  age!: number;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber!: string;

  @IsString()
  @MaxLength(200)
  addressLine!: string;

  @Matches(/^\d{6}$/)
  pincode!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/)
  password!: string;
}

