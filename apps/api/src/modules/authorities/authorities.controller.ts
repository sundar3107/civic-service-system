import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthoritiesService } from "./authorities.service";

@Controller("authorities")
@UseGuards(JwtAuthGuard)
export class AuthoritiesController {
  constructor(private readonly authoritiesService: AuthoritiesService) {}

  @Get("me")
  getAssignedRegion(@CurrentUser() user: { userId: string }) {
    return this.authoritiesService.getAssignedRegion(user.userId);
  }
}

