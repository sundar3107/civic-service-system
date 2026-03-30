import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ComplaintStatus, GeoSource } from "@civic/types";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { buildComplaintNumber, severityFromVotes } from "../../common/utils/complaint.util";
import { AuditService } from "../audit/audit.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { DuplicateDetectionService } from "./duplicate-detection.service";
import { MediaService } from "./media.service";

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duplicateDetectionService: DuplicateDetectionService,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService
  ) {}

  async listCitizenFeed() {
    const complaints = await this.prisma.complaint.findMany({
      include: {
        issueCategory: true,
        citizen: true,
        location: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return complaints.map((complaint) => ({
      id: complaint.id,
      complaintNumber: complaint.complaintNumber,
      issueType: complaint.issueCategory.code,
      status: complaint.status,
      locationLabel: complaint.location?.formattedAddress ?? "Location not provided",
      createdAt: complaint.createdAt,
      creditedTo: complaint.creditName || complaint.citizen.username || complaint.citizen.email,
      voteCount: complaint.voteCount,
      severityLabel: severityFromVotes(complaint.voteCount)
    }));
  }

  async getComplaint(complaintId: string, currentUserId?: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        issueCategory: true,
        citizen: {
          include: {
            profile: true
          }
        },
        location: true,
        media: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc"
          }
        },
        reviews: {
          include: {
            user: true
          }
        },
        votes: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found.");
    }

    return {
      ...complaint,
      currentUserId: currentUserId ?? null,
      severityLabel: severityFromVotes(complaint.voteCount)
    };
  }

  async createComplaint(userId: string, dto: CreateComplaintDto, file?: Express.Multer.File) {
    const citizen = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!citizen || citizen.role !== Role.CITIZEN || !citizen.profileCompletedAt) {
      throw new BadRequestException("Citizen profile must be completed before complaint submission.");
    }

    const issueCategory = await this.prisma.issueCategory.findUnique({
      where: { code: dto.issueCategoryCode }
    });

    if (!issueCategory) {
      throw new NotFoundException("Issue category not found.");
    }

    if (!file) {
      throw new BadRequestException("Complaint photo is required.");
    }

    const media = await this.mediaService.saveComplaintPhoto(file);
    const exifLocation: { latitude: number; longitude: number; formattedAddress: string | null } | null =
      dto.location?.latitude ? null : await this.mediaService.extractExifLocation(file);
    const latitude = dto.location?.latitude ?? exifLocation?.latitude ?? null;
    const longitude = dto.location?.longitude ?? exifLocation?.longitude ?? null;
    const formattedAddress = dto.location?.formattedAddress ?? exifLocation?.formattedAddress ?? null;
    const geoSource = dto.location?.latitude
      ? GeoSource.MAP
      : exifLocation?.latitude
        ? GeoSource.EXIF
        : GeoSource.NONE;

    const duplicate = await this.duplicateDetectionService.findDuplicate(
      issueCategory.id,
      latitude ?? undefined,
      longitude ?? undefined
    );

    if (duplicate) {
      return {
        duplicateSuggestion: true,
        complaint: {
          id: duplicate.id,
          complaintNumber: duplicate.complaintNumber
        }
      };
    }

    const total = await this.prisma.complaint.count();
    const routedCity = await this.resolveCityFromLocation(formattedAddress);

    if (!routedCity) {
      throw new BadRequestException("Unable to determine district and city from the selected location.");
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        complaintNumber: buildComplaintNumber(total + 1),
        citizenId: userId,
        cityId: routedCity.id,
        issueCategoryId: issueCategory.id,
        description: dto.description,
        creditName: dto.creditName,
        detailsJson: dto.categoryFields as unknown as Prisma.InputJsonValue,
        status: ComplaintStatus.REMEDIAL_NOT_STARTED,
        geoSource,
        location: {
          create: {
            latitude,
            longitude,
            formattedAddress,
            source: geoSource
          }
        },
        media: {
          create: media
        },
        statusHistory: {
          create: {
            status: ComplaintStatus.REMEDIAL_NOT_STARTED,
            note: "Complaint created"
          }
        }
      },
      include: {
        location: true,
        issueCategory: true
      }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_CREATED",
      entityType: "Complaint",
      entityId: complaint.id,
      payload: {
        districtId: routedCity.districtId,
        cityId: routedCity.id,
        issueCategoryCode: dto.issueCategoryCode,
        categoryFields: dto.categoryFields
      } as unknown as Prisma.InputJsonValue
    });

    return complaint;
  }

  async listAuthorityComplaints(userId: string) {
    const authority = await this.prisma.authority.findUnique({
      where: { userId },
      include: { assignments: true }
    });

    if (!authority) {
      throw new NotFoundException("Authority account not found.");
    }

    const cityIds = authority.assignments.map((assignment) => assignment.cityId);

    return this.prisma.complaint.findMany({
      where: {
        cityId: {
          in: cityIds
        }
      },
      include: {
        issueCategory: true,
        location: true,
        citizen: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async updateStatus(userId: string, complaintId: string, status: ComplaintStatus, note?: string) {
    const authority = await this.prisma.authority.findUnique({
      where: { userId },
      include: { assignments: true }
    });

    if (!authority) {
      throw new NotFoundException("Authority account not found.");
    }

    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found.");
    }

    if (!authority.assignments.some((assignment) => assignment.cityId === complaint.cityId)) {
      throw new BadRequestException("You are not assigned to this complaint location.");
    }

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note
          }
        }
      },
      include: {
        statusHistory: true
      }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_STATUS_UPDATED",
      entityType: "Complaint",
      entityId: complaintId,
      payload: { status, note }
    });

    return updated;
  }

  async undoStatus(userId: string, complaintId: string) {
    const authority = await this.prisma.authority.findUnique({
      where: { userId },
      include: { assignments: true }
    });

    if (!authority) {
      throw new NotFoundException("Authority account not found.");
    }

    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        statusHistory: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found.");
    }

    if (!authority.assignments.some((assignment) => assignment.cityId === complaint.cityId)) {
      throw new BadRequestException("You are not assigned to this complaint location.");
    }

    if (complaint.statusHistory.length <= 1) {
      throw new BadRequestException("No authority action is available to undo.");
    }

    const previousStatus = complaint.statusHistory[complaint.statusHistory.length - 2]?.status ?? ComplaintStatus.REMEDIAL_NOT_STARTED;

    const latestHistory = complaint.statusHistory[complaint.statusHistory.length - 1];
    await this.prisma.complaintStatusHistory.delete({
      where: { id: latestHistory.id }
    });

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: previousStatus
      },
      include: {
        statusHistory: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_STATUS_UNDONE",
      entityType: "Complaint",
      entityId: complaintId,
      payload: { revertedTo: previousStatus }
    });

    return updated;
  }

  async deleteComplaint(userId: string, complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found.");
    }

    if (complaint.citizenId !== userId) {
      throw new BadRequestException("You can delete only complaints created by you.");
    }

    if (complaint.status !== ComplaintStatus.REMEDIAL_NOT_STARTED) {
      throw new BadRequestException("Complaint can be deleted only before authority acceptance.");
    }

    await this.prisma.complaint.delete({
      where: { id: complaintId }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_DELETED",
      entityType: "Complaint",
      entityId: complaintId
    });

    return {
      deleted: true
    };
  }

  private async resolveCityFromLocation(formattedAddress: string | null) {
    const cities = await this.prisma.city.findMany({
      include: {
        district: true
      }
    });

    if (!formattedAddress) {
      return this.findFallbackCity(cities);
    }

    const normalizedAddress = this.normalizeLocationText(formattedAddress);

    const cityMatches = cities
      .filter((city) => normalizedAddress.includes(this.normalizeLocationText(city.name)))
      .sort((left, right) => {
        const leftName = this.normalizeLocationText(left.name);
        const rightName = this.normalizeLocationText(right.name);
        const leftIndex = normalizedAddress.indexOf(leftName);
        const rightIndex = normalizedAddress.indexOf(rightName);

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return right.name.length - left.name.length;
      });

    if (cityMatches.length > 0) {
      return cityMatches[0];
    }

    const districtMatches = cities
      .filter((city) => normalizedAddress.includes(this.normalizeLocationText(city.district.name)))
      .sort((left, right) => right.district.name.length - left.district.name.length);

    if (districtMatches.length > 0) {
      return districtMatches[0];
    }

    return this.findFallbackCity(cities);
  }

  private normalizeLocationText(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  private findFallbackCity(
    cities: Array<{
      id: string;
      districtId: string;
      name: string;
      district: { name: string };
    }>
  ) {
    return (
      cities.find(
        (city) =>
          this.normalizeLocationText(city.district.name) === "vellore" &&
          this.normalizeLocationText(city.name) === "katpadi"
      ) ?? null
    );
  }
}
