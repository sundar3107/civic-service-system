import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RequestEmailDto } from "./dto/request-email.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("citizen/request-email")
  requestCitizenEmail(@Body() dto: RequestEmailDto) {
    return this.authService.requestCitizenEmail(dto.email);
  }

  @Post("verify-email")
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.verifyEmail(dto.token);
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    return {
      verified: result.verified,
      email: result.email
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    return result.user;
  }
}
