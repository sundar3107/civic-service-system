import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CompleteProfileDto } from "./dto/complete-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existing) {
      throw new NotFoundException("User not found.");
    }

    if (!existing.emailVerifiedAt) {
      throw new BadRequestException("Email must be verified first.");
    }

    if (existing.profileCompletedAt) {
      throw new BadRequestException("Profile has already been completed.");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        passwordHash: await argon2.hash(dto.password),
        profileCompletedAt: new Date(),
        profile: {
          create: {
            fullName: dto.fullName,
            age: dto.age,
            phoneNumber: dto.phoneNumber,
            addressLine: dto.addressLine,
            pincode: dto.pincode
          }
        }
      },
      include: {
        profile: true
      }
    });
  }
}

