import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Role } from "@civic/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Roles, RolesGuard } from "../../common/guards/roles.guard";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintStatusDto } from "./dto/update-complaint-status.dto";
import { ComplaintsService } from "./complaints.service";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  listCitizenFeed() {
    return this.complaintsService.listCitizenFeed();
  }

  @Get("authority/assigned")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHORITY, Role.ADMIN)
  listAuthorityComplaints(@CurrentUser() user: { userId: string }) {
    return this.complaintsService.listAuthorityComplaints(user.userId);
  }

  @Get(":id")
  getComplaint(@Param("id") complaintId: string) {
    return this.complaintsService.getComplaint(complaintId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("photo"))
  createComplaint(
    @CurrentUser() user: { userId: string },
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const dto: CreateComplaintDto = {
      issueCategoryCode: body.issueCategoryCode,
      description: body.description,
      creditName: body.creditName,
      location: body.location ? JSON.parse(body.location) : undefined,
      categoryFields: body.categoryFields ? JSON.parse(body.categoryFields) : []
    };

    return this.complaintsService.createComplaint(user.userId, dto, file);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHORITY, Role.ADMIN)
  updateStatus(
    @CurrentUser() user: { userId: string },
    @Param("id") complaintId: string,
    @Body() dto: UpdateComplaintStatusDto
  ) {
    return this.complaintsService.updateStatus(user.userId, complaintId, dto.status, dto.note);
  }
}
